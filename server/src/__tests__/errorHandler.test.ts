import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../middleware/errorHandler';
import { AppError, ValidationError, NotFoundError, AuthenticationError, AuthorizationError } from '../errors';

vi.mock('../lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

function createMockReq(requestId = 'test-request-id') {
  return { requestId } as unknown as Request;
}

describe('errorHandler', () => {
  it('handles ValidationError (400)', () => {
    const res = createMockRes();
    const req = createMockReq();
    const err = new ValidationError('Invalid input', [{ field: 'email' }]);

    errorHandler(err, req, res, vi.fn() as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: [{ field: 'email' }],
        requestId: 'test-request-id',
      },
    });
  });

  it('handles NotFoundError (404)', () => {
    const res = createMockRes();
    const err = new NotFoundError('Application', '123');

    errorHandler(err, createMockReq(), res, vi.fn() as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'NOT_FOUND' }),
      }),
    );
  });

  it('handles AuthenticationError (401)', () => {
    const res = createMockRes();
    const err = new AuthenticationError();

    errorHandler(err, createMockReq(), res, vi.fn() as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('handles AuthorizationError (403)', () => {
    const res = createMockRes();
    const err = new AuthorizationError();

    errorHandler(err, createMockReq(), res, vi.fn() as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('handles unknown errors as 500', () => {
    const res = createMockRes();
    const err = new Error('Something broke');

    errorHandler(err, createMockReq(), res, vi.fn() as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        requestId: 'test-request-id',
      },
    });
  });

  it('does not leak details for non-AppError errors', () => {
    const res = createMockRes();
    const err = new Error('Database connection failed: password=secret123');

    errorHandler(err, createMockReq(), res, vi.fn() as unknown as NextFunction);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.error.message).toBe('An unexpected error occurred');
    expect(jsonCall.error.message).not.toContain('secret123');
  });

  it('omits details when AppError has no details', () => {
    const res = createMockRes();
    const err = new AppError('Bad request', 400, 'BAD_REQUEST');

    errorHandler(err, createMockReq(), res, vi.fn() as unknown as NextFunction);

    const jsonCall = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(jsonCall.error.details).toBeUndefined();
  });
});
