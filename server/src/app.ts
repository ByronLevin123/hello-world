import express from 'express';
import cors from 'cors';
import path from 'path';
import { applicationsRouter } from './routes/applications';
import { staffRouter } from './routes/staff';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';

const app = express();

// Security & parsing
app.disable('x-powered-by');

const allowedOrigins = config.allowedOrigins;
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', applicationsRouter);
app.use('/api/staff', staffRouter);

// Error handler must be registered before the wildcard static file route
app.use(errorHandler);

// Serve built frontend static files
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist, { maxAge: '1h' }));

// Client-side routing fallback — serve index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

export { app };
