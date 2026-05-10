import { NextFunction, Request, Response } from 'express';

export const setCacheHeaders =
  (maxAgeSeconds: number) => (_req: Request, res: Response, next: NextFunction) => {
    res.set(
      'Cache-Control',
      `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=300`,
    );
    next();
  };
