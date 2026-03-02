import { describe, it, expect } from 'vitest';
import { formatGBP, formatGBPNoPence, calculateMonthlyRepayment } from '../utils/formatters';

describe('formatGBP', () => {
  it('formats positive amounts', () => {
    expect(formatGBP(1234.56)).toBe('£1,234.56');
  });

  it('formats zero', () => {
    expect(formatGBP(0)).toBe('£0.00');
  });

  it('formats small amounts', () => {
    expect(formatGBP(0.99)).toBe('£0.99');
  });

  it('formats large amounts', () => {
    expect(formatGBP(25000)).toBe('£25,000.00');
  });
});

describe('formatGBPNoPence', () => {
  it('formats without pence', () => {
    expect(formatGBPNoPence(5000)).toBe('£5,000');
  });
});

describe('calculateMonthlyRepayment', () => {
  it('calculates correctly for a standard loan', () => {
    const monthly = calculateMonthlyRepayment(10000, 6.9, 36);
    expect(monthly).toBeCloseTo(308.31, 0);
  });

  it('handles 0% APR', () => {
    expect(calculateMonthlyRepayment(12000, 0, 12)).toBe(1000);
  });
});
