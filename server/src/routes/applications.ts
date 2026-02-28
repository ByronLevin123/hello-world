import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createApplicationSchema, affordabilityCheckSchema } from '../validation/applicationSchema';
import { submitApplication, getApplication, affordabilityCheck } from '../controllers/applicationsController';

export const applicationsRouter = Router();

applicationsRouter.post('/applications', validate(createApplicationSchema), submitApplication);
applicationsRouter.get('/applications/:reference', getApplication);
applicationsRouter.post('/affordability-check', validate(affordabilityCheckSchema), affordabilityCheck);
