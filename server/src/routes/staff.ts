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
import { authenticate, authorize } from '../middleware/auth';
import { mutationLimiter } from '../middleware/rateLimiter';
import { NotFoundError, ValidationError } from '../errors';

export const staffRouter = Router();

// All staff routes require authentication
staffRouter.use(authenticate);

function validateUuidParam(req: Request, _res: Response, next: NextFunction) {
  const result = uuidParamSchema.safeParse(req.params.id);
  if (!result.success) {
    return next(new ValidationError('Invalid application ID format'));
  }
  next();
}

// Dashboard — all authenticated staff can view
staffRouter.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getDashboardStats();
    res.json({ data: stats });
  } catch (err) { next(err); }
});

// List applications — all authenticated staff can view
staffRouter.get('/applications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError('Invalid query parameters', parsed.error.errors);
    }
    const result = await listApplications(parsed.data);
    res.json({ data: result.applications, meta: { total: result.total } });
  } catch (err) { next(err); }
});

// Get application detail — all authenticated staff can view
staffRouter.get('/applications/:id', validateUuidParam, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const detail = await getApplicationDetail(req.params.id);
    if (!detail) throw new NotFoundError('Application', req.params.id);
    res.json({ data: detail });
  } catch (err) { next(err); }
});

// Update application — underwriter, compliance, admin only
staffRouter.patch(
  '/applications/:id',
  validateUuidParam,
  authorize('underwriter', 'compliance', 'admin'),
  mutationLimiter,
  validate(updateApplicationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const update = { ...req.body, decisionBy: req.body.decisionBy || user.username, complianceReviewedBy: req.body.complianceReviewedBy || user.username };
      await updateApplicationWithAudit(req.params.id, update, user.username, user.role);
      const updated = await getApplicationDetail(req.params.id);
      res.json({ data: updated });
    } catch (err) { next(err); }
  },
);

// Add note — all authenticated staff
staffRouter.post(
  '/applications/:id/notes',
  validateUuidParam,
  mutationLimiter,
  validate(addNoteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { content } = req.body;
      await addNoteWithAudit(req.params.id, user.username, user.role, content);
      res.status(201).json({ data: { success: true } });
    } catch (err) { next(err); }
  },
);
