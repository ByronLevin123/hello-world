import { Router, Request, Response, NextFunction } from 'express';
import {
  getDashboardStats,
  listApplications,
  getApplicationDetail,
  updateApplicationWithAudit,
  addNoteWithAudit,
} from '../services/staffService';
import { validate } from '../middleware/validate';
import { updateApplicationSchema, addNoteSchema, listQuerySchema, uuidParamSchema } from '../validation/staffSchema';

export const staffRouter = Router();

function validateUuidParam(req: Request, res: Response, next: NextFunction) {
  const result = uuidParamSchema.safeParse(req.params.id);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid application ID format' });
    return;
  }
  next();
}

staffRouter.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) { next(err); }
});

staffRouter.get('/applications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.errors });
      return;
    }
    const result = await listApplications(parsed.data);
    res.json(result);
  } catch (err) { next(err); }
});

staffRouter.get('/applications/:id', validateUuidParam, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const detail = await getApplicationDetail(req.params.id);
    if (!detail) { res.status(404).json({ error: 'Application not found' }); return; }
    res.json(detail);
  } catch (err) { next(err); }
});

staffRouter.patch('/applications/:id', validateUuidParam, validate(updateApplicationSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateApplicationWithAudit(req.params.id, req.body);
    const updated = await getApplicationDetail(req.params.id);
    res.json(updated);
  } catch (err) { next(err); }
});

staffRouter.post('/applications/:id/notes', validateUuidParam, validate(addNoteSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { author, role, content } = req.body;
    await addNoteWithAudit(req.params.id, author, role, content);
    res.status(201).json({ success: true });
  } catch (err) { next(err); }
});
