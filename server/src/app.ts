import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { applicationsRouter } from './routes/applications';
import { staffRouter } from './routes/staff';
import { authRouter } from './routes/auth';
import { docsRouter } from './openapi';
import { errorHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import { globalLimiter } from './middleware/rateLimiter';
import { config } from './config';
import { pool } from './db/connection';
import { logger } from './lib/logger';

const app = express();

// Trust proxy (needed when behind a reverse proxy)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
}));

// Request tracing
app.use(requestIdMiddleware);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
    }, 'request completed');
  });
  next();
});

// CORS
const allowedOrigins = config.allowedOrigins;
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting & parsing
app.use(globalLimiter);
app.use(express.json({ limit: '100kb' }));

// Health checks
app.get('/api/health/live', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// Legacy health check (backward compatible)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api', applicationsRouter);
app.use('/api/staff', staffRouter);
app.use('/api', docsRouter);

// Error handler must be registered before the wildcard static file route
app.use(errorHandler);

// Serve built frontend static files
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist, { maxAge: '1h' }));

// Client-side routing fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

export { app };
