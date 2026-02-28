import { Request, Response, NextFunction } from 'express';
import { createApplication, getApplicationByReference, runAffordabilityCheck } from '../services/applicationService';

export async function submitApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await createApplication(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const application = await getApplicationByReference(req.params.reference);
    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    res.json(application);
  } catch (err) {
    next(err);
  }
}

export function affordabilityCheck(req: Request, res: Response, next: NextFunction) {
  try {
    const result = runAffordabilityCheck(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
