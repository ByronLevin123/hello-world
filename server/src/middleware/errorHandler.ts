import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { logger } from '../lib/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.requestId || 'unknown';

  if (err instanceof AppError) {
    logger.warn({ requestId, code: err.code, message: err.message, statusCode: err.statusCode }, 'Operational error');
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
        requestId,
      },
    });
    return;
  }

  logger.error({ requestId, err: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    },
  });
}
