import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map(e => ({
          field: e.path.join('.'),
          code: e.code,
          message: e.message,
        }));
        return next(new ValidationError('Validation failed', details));
      }
      next(err);
    }
  };
}
