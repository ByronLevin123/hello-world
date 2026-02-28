import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
} from '../errors';

describe('AppError', () => {
  it('creates error with all properties', () => {
    const err = new AppError('Test error', 500, 'TEST_ERROR', { field: 'value' });
    expect(err.message).toBe('Test error');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('TEST_ERROR');
    expect(err.isOperational).toBe(true);
    expect(err.details).toEqual({ field: 'value' });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('works without details', () => {
    const err = new AppError('No details', 400, 'NO_DETAILS');
    expect(err.details).toBeUndefined();
  });
});

describe('ValidationError', () => {
  it('returns 400 status code', () => {
    const err = new ValidationError('Invalid input');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Invalid input');
    expect(err).toBeInstanceOf(AppError);
  });

  it('accepts details', () => {
    const details = [{ field: 'email', message: 'Invalid email' }];
    const err = new ValidationError('Validation failed', details);
    expect(err.details).toEqual(details);
  });
});

describe('NotFoundError', () => {
  it('returns 404 with resource and id', () => {
    const err = new NotFoundError('Application', '123');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe("Application '123' not found");
  });

  it('returns 404 with resource only', () => {
    const err = new NotFoundError('User');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('User not found');
  });
});

describe('AuthenticationError', () => {
  it('returns 401 with default message', () => {
    const err = new AuthenticationError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTHENTICATION_REQUIRED');
    expect(err.message).toBe('Authentication required');
  });

  it('returns 401 with custom message', () => {
    const err = new AuthenticationError('Token expired');
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Token expired');
  });
});

describe('AuthorizationError', () => {
  it('returns 403 with default message', () => {
    const err = new AuthorizationError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
    expect(err.message).toBe('Insufficient permissions');
  });

  it('returns 403 with custom message', () => {
    const err = new AuthorizationError('Admin only');
    expect(err.message).toBe('Admin only');
  });
});

describe('ConflictError', () => {
  it('returns 409', () => {
    const err = new ConflictError('Duplicate entry');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
    expect(err.message).toBe('Duplicate entry');
  });
});
