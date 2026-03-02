import { describe, it, expect } from 'vitest';
import { updateApplicationSchema, addNoteSchema, listQuerySchema, uuidParamSchema } from '../validation/staffSchema';

describe('uuidParamSchema', () => {
  it('accepts valid UUIDs', () => {
    expect(uuidParamSchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
  });

  it('rejects invalid UUIDs', () => {
    expect(uuidParamSchema.safeParse('not-a-uuid').success).toBe(false);
    expect(uuidParamSchema.safeParse('').success).toBe(false);
    expect(uuidParamSchema.safeParse('12345').success).toBe(false);
  });
});

describe('updateApplicationSchema', () => {
  it('accepts valid status update', () => {
    const result = updateApplicationSchema.safeParse({ status: 'approved' });
    expect(result.success).toBe(true);
  });

  it('accepts valid decision with notes', () => {
    const result = updateApplicationSchema.safeParse({
      status: 'approved',
      decision: 'approved',
      decisionBy: 'John Smith',
      decisionNotes: 'All criteria met',
    });
    expect(result.success).toBe(true);
  });

  it('accepts compliance update', () => {
    const result = updateApplicationSchema.safeParse({
      complianceStatus: 'cleared',
      amlCheckPassed: true,
      kycCheckPassed: true,
      fraudCheckPassed: true,
      complianceReviewedBy: 'Compliance Officer',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty body', () => {
    const result = updateApplicationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid status values', () => {
    const result = updateApplicationSchema.safeParse({ status: 'invalid_status' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid decision values', () => {
    const result = updateApplicationSchema.safeParse({ decision: 'maybe' });
    expect(result.success).toBe(false);
  });

  it('rejects risk score out of range', () => {
    expect(updateApplicationSchema.safeParse({ riskScore: -1 }).success).toBe(false);
    expect(updateApplicationSchema.safeParse({ riskScore: 1000 }).success).toBe(false);
    expect(updateApplicationSchema.safeParse({ riskScore: 500 }).success).toBe(true);
  });

  it('rejects excessively long notes', () => {
    const result = updateApplicationSchema.safeParse({ decisionNotes: 'x'.repeat(1001) });
    expect(result.success).toBe(false);
  });
});

describe('addNoteSchema', () => {
  it('accepts valid note', () => {
    const result = addNoteSchema.safeParse({
      author: 'Jane Doe',
      role: 'compliance',
      content: 'AML check passed without issues.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    expect(addNoteSchema.safeParse({ author: 'Jane', role: 'staff', content: '' }).success).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(addNoteSchema.safeParse({ author: 'Jane' }).success).toBe(false);
    expect(addNoteSchema.safeParse({}).success).toBe(false);
  });

  it('rejects excessively long content', () => {
    const result = addNoteSchema.safeParse({ author: 'Jane', role: 'staff', content: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
  });
});

describe('listQuerySchema', () => {
  it('accepts valid query params', () => {
    expect(listQuerySchema.safeParse({ status: 'approved', limit: '10' }).success).toBe(true);
  });

  it('accepts empty query', () => {
    expect(listQuerySchema.safeParse({}).success).toBe(true);
  });

  it('rejects invalid status', () => {
    expect(listQuerySchema.safeParse({ status: 'bogus' }).success).toBe(false);
  });

  it('coerces limit/offset to numbers', () => {
    const result = listQuerySchema.safeParse({ limit: '25', offset: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
      expect(result.data.offset).toBe(10);
    }
  });

  it('rejects limit exceeding max', () => {
    expect(listQuerySchema.safeParse({ limit: '500' }).success).toBe(false);
  });
});
