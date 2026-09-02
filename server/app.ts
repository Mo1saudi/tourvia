import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';

import { authRouter } from './routes/auth';
import { tripsRouter } from './routes/trips';
import { publicRouter } from './routes/public';
import { aiRouter } from './routes/ai';
import { subscriptionsRouter } from './routes/subscriptions';
import { adminRouter } from './routes/admin';
import { analyticsRouter } from './routes/analytics';

/**
 * Creates the Express application with all API routes wired up.
 * Shared by the standalone dev server (server.ts) and the Vercel
 * serverless function (api/index.ts). Static / Vite serving is added
 * separately by the caller — this only sets up the API surface.
 */
export function createApiApp() {
  const app = express();

  // Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/trips', tripsRouter);
  app.use('/api/public', publicRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/subscriptions', subscriptionsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', analyticsRouter);

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'TOURVIA Full-Stack AI SaaS API',
      timestamp: new Date().toISOString(),
    });
  });

  // Global Error Handler for API routes
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled server error:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
    });
  });

  return app;
}
