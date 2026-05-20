import compression from 'compression';
import { randomUUID } from 'crypto';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import apiRoutes from './routes/api';
import { errorHandler, notFoundHandler } from './utils/errors';
import { logger } from './utils/logger';
import { openApiSpec } from './openapi';

export const createApp = () => {
  const app = express();
  const allowedOrigins = (
    process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.headers['x-request-id']?.toString() || randomUUID(),
    }),
  );
  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
        },
      },
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`CORS origin denied: ${origin}`));
      },
    }),
  );
  app.use(express.json({ limit: '64kb' }));

  const apiLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    limit: Number(process.env.RATE_LIMIT_MAX || 60),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many weather requests. Please try again shortly.',
      },
    },
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.get('/api/openapi.json', (_req, res) => res.json(openApiSpec));
  app.use('/api/v1', apiLimiter, apiRoutes);
  app.use('/api', apiLimiter, apiRoutes);

  app.get('/', (_req, res) => {
    res.json({
      name: 'Weathering With You API',
      status: 'ok',
      frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
      endpoints: {
        health: '/health',
        docs: '/api/docs',
        openapi: '/api/openapi.json',
        currentWeather: '/api/v1/weather/current',
        forecast24h: '/api/v1/weather/forecast/24h',
      },
    });
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Atmospheric Intelligence API is running' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
