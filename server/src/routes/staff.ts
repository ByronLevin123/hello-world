import { Router, Request, Response, NextFunction } from 'express';
import {
  getDashboardStats,
  listApplications,
  getApplicationDetail,
  updateApplicationStatus,
  addNote,
  addAuditEvent,
} from '../services/staffService';

export const staffRouter = Router();

staffRouter.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) { next(err); }
});

staffRouter.get('/applications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await listApplications({
      status: req.query.status as string,
      complianceStatus: req.query.complianceStatus as string,
      riskBand: req.query.riskBand as string,
      search: req.query.search as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    });
    res.json(result);
  } catch (err) { next(err); }
});

staffRouter.get('/applications/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const app = await getApplicationDetail(req.params.id);
    if (!app) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(app);
  } catch (err) { next(err); }
});

staffRouter.patch('/applications/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateApplicationStatus(req.params.id, req.body);

    // Create audit event
    const events: string[] = [];
    if (req.body.status) events.push(`Status changed to ${req.body.status}`);
    if (req.body.decision) events.push(`Decision: ${req.body.decision}`);
    if (req.body.complianceStatus) events.push(`Compliance status: ${req.body.complianceStatus}`);
    if (req.body.assignedTo) events.push(`Assigned to ${req.body.assignedTo}`);

    if (events.length > 0) {
      await addAuditEvent(
        req.params.id,
        req.body.decision ? 'decision_made' : 'status_changed',
        req.body.decisionBy || req.body.complianceReviewedBy || 'Staff',
        req.body.complianceStatus ? 'compliance' : 'underwriter',
        events.join('. ')
      );
    }

    const updated = await getApplicationDetail(req.params.id);
    res.json(updated);
  } catch (err) { next(err); }
});

staffRouter.post('/applications/:id/notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { author, role, content } = req.body;
    await addNote(req.params.id, author, role, content);
    await addAuditEvent(req.params.id, 'note_added', author, role, `Note added: ${content.substring(0, 50)}...`);
    res.status(201).json({ success: true });
  } catch (err) { next(err); }
});
