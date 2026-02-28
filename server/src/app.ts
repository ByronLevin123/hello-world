import express from 'express';
import cors from 'cors';
import path from 'path';
import { applicationsRouter } from './routes/applications';
import { staffRouter } from './routes/staff';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', applicationsRouter);
app.use('/api/staff', staffRouter);

// Serve built frontend static files
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

// Client-side routing fallback — serve index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use(errorHandler);

export { app };
