import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createApplicationSchema, affordabilityCheckSchema } from '../validation/applicationSchema';
import { submitApplication, getApplication, affordabilityCheck } from '../controllers/applicationsController';
import { mutationLimiter, affordabilityLimiter } from '../middleware/rateLimiter';

export const applicationsRouter = Router();

applicationsRouter.post('/applications', mutationLimiter, validate(createApplicationSchema), submitApplication);
applicationsRouter.get('/applications/:reference', getApplication);
applicationsRouter.post('/affordability-check', affordabilityLimiter, validate(affordabilityCheckSchema), affordabilityCheck);
