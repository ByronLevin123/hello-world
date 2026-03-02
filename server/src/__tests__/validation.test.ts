import { describe, it, expect } from 'vitest';
import { createApplicationSchema, affordabilityCheckSchema } from '../validation/applicationSchema';

const validApplication = {
  loanType: 'personal_loan',
  firstName: 'John',
  lastName: 'Smith',
  dateOfBirth: '1990-06-15',
  email: 'john.smith@example.com',
  phone: '07700900123',
  addressLine1: '10 Downing Street',
  city: 'London',
  postcode: 'SW1A 2AA',
  employmentStatus: 'employed',
  employerName: 'Acme Corp',
  annualIncome: 35000,
  monthlyOutgoings: 1500,
  loanAmount: 10000,
  loanTermMonths: 36,
  termsAccepted: true,
};

describe('createApplicationSchema', () => {
  it('accepts a valid application', () => {
    const result = createApplicationSchema.safeParse(validApplication);
    expect(result.success).toBe(true);
  });

  it('rejects invalid postcode', () => {
    const result = createApplicationSchema.safeParse({ ...validApplication, postcode: '12345' });
    expect(result.success).toBe(false);
  });

  it('accepts valid UK postcodes', () => {
    const postcodes = ['SW1A 1AA', 'EC1A 1BB', 'M1 1AE', 'B1 1AA', 'W1A 0AX'];
    for (const postcode of postcodes) {
      const result = createApplicationSchema.safeParse({ ...validApplication, postcode });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid phone numbers', () => {
    const result = createApplicationSchema.safeParse({ ...validApplication, phone: '12345' });
    expect(result.success).toBe(false);
  });

  it('accepts valid UK phone numbers', () => {
    const phones = ['07700900123', '+447700900123', '07700 900 123'];
    for (const phone of phones) {
      const result = createApplicationSchema.safeParse({ ...validApplication, phone });
      expect(result.success).toBe(true);
    }
  });

  it('rejects applicant under 18', () => {
    const today = new Date();
    const underageDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
    const result = createApplicationSchema.safeParse({
      ...validApplication,
      dateOfBirth: underageDate.toISOString().split('T')[0],
    });
    expect(result.success).toBe(false);
  });

  it('rejects when terms not accepted', () => {
    const result = createApplicationSchema.safeParse({ ...validApplication, termsAccepted: false });
    expect(result.success).toBe(false);
  });

  it('rejects invalid loan term', () => {
    const result = createApplicationSchema.safeParse({ ...validApplication, loanTermMonths: 18 });
    expect(result.success).toBe(false);
  });

  it('rejects loan amount out of range', () => {
    expect(createApplicationSchema.safeParse({ ...validApplication, loanAmount: 500 }).success).toBe(false);
    expect(createApplicationSchema.safeParse({ ...validApplication, loanAmount: 30000 }).success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const { firstName, ...incomplete } = validApplication;
    const result = createApplicationSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });
});

describe('affordabilityCheckSchema', () => {
  it('accepts a valid request', () => {
    const result = affordabilityCheckSchema.safeParse({
      annualIncome: 35000,
      monthlyOutgoings: 1500,
      loanAmount: 10000,
      loanTermMonths: 36,
      loanType: 'personal_loan',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative income', () => {
    const result = affordabilityCheckSchema.safeParse({
      annualIncome: -1000,
      monthlyOutgoings: 500,
      loanAmount: 5000,
      loanTermMonths: 24,
      loanType: 'car_loan',
    });
    expect(result.success).toBe(false);
  });
});
