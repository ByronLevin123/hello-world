import { Request, Response, NextFunction } from 'express';
import { createApplication, getApplicationByReference, runAffordabilityCheck } from '../services/applicationService';
import { NotFoundError } from '../errors';

export async function submitApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await createApplication(req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function getApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const application = await getApplicationByReference(req.params.reference);
    if (!application) {
      throw new NotFoundError('Application', req.params.reference);
    }
    res.json({ data: application });
  } catch (err) {
    next(err);
  }
}

export function affordabilityCheck(req: Request, res: Response, next: NextFunction) {
  try {
    const result = runAffordabilityCheck(req.body);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}
