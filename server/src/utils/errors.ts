import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from './logger';

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UPSTREAM_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  status: number;
  code: ErrorCode;
  details?: unknown;

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const toApiError = (error: unknown) => {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    return new ApiError(400, 'BAD_REQUEST', 'Invalid request input', error.flatten());
  }

  const message = error instanceof Error ? error.message : String(error);
  if (message.toLowerCase().includes('openweather')) {
    return new ApiError(502, 'UPSTREAM_UNAVAILABLE', 'Weather provider is temporarily unavailable');
  }

  return new ApiError(500, 'INTERNAL_ERROR', 'Unexpected server error');
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.path}`));
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  void next;
  const apiError = toApiError(error);
  const requestId = req.id;

  logger.error(
    {
      err: error,
      requestId,
      path: req.path,
      method: req.method,
      status: apiError.status,
      code: apiError.code,
    },
    apiError.message,
  );

  res.status(apiError.status).json({
    error: {
      code: apiError.code,
      message: apiError.message,
      requestId,
      ...(process.env.NODE_ENV !== 'production' && apiError.details
        ? { details: apiError.details }
        : {}),
    },
  });
};
