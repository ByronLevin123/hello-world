import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { authenticate, authorize, AuthPayload } from '../middleware/auth';

function createMockReqRes(headers: Record<string, string> = {}) {
  const req = {
    headers,
    user: undefined,
  } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next: next as NextFunction & ReturnType<typeof vi.fn> };
}

function makeValidToken(payload: Partial<AuthPayload> = {}): string {
  return jwt.sign(
    {
      userId: '1',
      username: 'testuser',
      role: 'underwriter' as const,
      ...payload,
    },
    config.jwtSecret,
    { expiresIn: '1h' },
  );
}

describe('authenticate middleware', () => {
  it('rejects requests without Authorization header', () => {
    const { req, res, next } = createMockReqRes();
    authenticate(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.statusCode).toBe(401);
  });

  it('rejects requests with invalid Authorization format', () => {
    const { req, res, next } = createMockReqRes({ authorization: 'Basic abc123' });
    authenticate(req, res, next);
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  it('rejects requests with invalid JWT', () => {
    const { req, res, next } = createMockReqRes({ authorization: 'Bearer invalid.token.here' });
    authenticate(req, res, next);
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  it('accepts valid JWT and sets req.user', () => {
    const token = makeValidToken({ username: 'underwriter', role: 'underwriter' });
    const { req, res, next } = createMockReqRes({ authorization: `Bearer ${token}` });
    authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeDefined();
    expect(req.user!.username).toBe('underwriter');
    expect(req.user!.role).toBe('underwriter');
  });

  it('rejects expired JWT', () => {
    const token = jwt.sign(
      { userId: '1', username: 'test', role: 'branch' },
      config.jwtSecret,
      { expiresIn: '0s' },
    );
    const { req, res, next } = createMockReqRes({ authorization: `Bearer ${token}` });
    // Small delay to ensure expiry
    authenticate(req, res, next);
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });
});

describe('authorize middleware', () => {
  it('allows user with matching role', () => {
    const middleware = authorize('underwriter', 'compliance');
    const { req, res, next } = createMockReqRes();
    req.user = { userId: '1', username: 'underwriter', role: 'underwriter' };
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects user with non-matching role', () => {
    const middleware = authorize('underwriter', 'compliance');
    const { req, res, next } = createMockReqRes();
    req.user = { userId: '1', username: 'branch.user', role: 'branch' };
    middleware(req, res, next);
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });

  it('allows admin role to bypass authorization', () => {
    const middleware = authorize('underwriter');
    const { req, res, next } = createMockReqRes();
    req.user = { userId: '1', username: 'admin', role: 'admin' };
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects when no user on request', () => {
    const middleware = authorize('underwriter');
    const { req, res, next } = createMockReqRes();
    middleware(req, res, next);
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });
});
