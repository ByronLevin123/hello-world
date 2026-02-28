import express from 'express';
import cors from 'cors';
import { applicationsRouter } from './routes/applications';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', applicationsRouter);

app.use(errorHandler);

export { app };
