import { describe, it, expect } from 'vitest';
import { calculateMonthlyRepayment, checkAffordability, runAffordabilityCheck } from '../services/applicationService';

describe('calculateMonthlyRepayment', () => {
  it('calculates correctly for a standard loan', () => {
    // £10,000 at 6.9% APR over 36 months
    const monthly = calculateMonthlyRepayment(10000, 6.9, 36);
    expect(monthly).toBeCloseTo(308.31, 0);
  });

  it('calculates correctly for 0% APR', () => {
    const monthly = calculateMonthlyRepayment(12000, 0, 12);
    expect(monthly).toBe(1000);
  });

  it('calculates correctly for different loan amounts', () => {
    // £5,000 at 5.9% over 24 months
    const monthly = calculateMonthlyRepayment(5000, 5.9, 24);
    expect(monthly).toBeGreaterThan(200);
    expect(monthly).toBeLessThan(250);
  });

  it('calculates correctly for longer terms', () => {
    // £15,000 at 4.5% over 60 months
    const monthly = calculateMonthlyRepayment(15000, 4.5, 60);
    expect(monthly).toBeGreaterThan(250);
    expect(monthly).toBeLessThan(300);
  });
});

describe('checkAffordability', () => {
  it('passes when disposable income exceeds threshold', () => {
    // £36,000/yr = £3,000/mo, outgoings £1,500, repayment £300
    // Disposable = £1,200 > 10% of £3,000 = £300
    const result = checkAffordability(36000, 1500, 300);
    expect(result.passed).toBe(true);
    expect(result.disposableIncome).toBe(1200);
  });

  it('fails when disposable income is below threshold', () => {
    // £24,000/yr = £2,000/mo, outgoings £1,700, repayment £200
    // Disposable = £100 < 10% of £2,000 = £200
    const result = checkAffordability(24000, 1700, 200);
    expect(result.passed).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('passes at exact threshold boundary', () => {
    // £30,000/yr = £2,500/mo, outgoings £2,000, repayment £250
    // Disposable = £250 = 10% of £2,500
    const result = checkAffordability(30000, 2000, 250);
    expect(result.passed).toBe(true);
  });
});

describe('runAffordabilityCheck', () => {
  it('returns full affordability response for a personal loan', () => {
    const result = runAffordabilityCheck({
      annualIncome: 40000,
      monthlyOutgoings: 1500,
      loanAmount: 10000,
      loanTermMonths: 36,
      loanType: 'personal_loan',
    });

    expect(result.representativeApr).toBe(6.9);
    expect(result.monthlyRepayment).toBeGreaterThan(0);
    expect(result.totalRepayable).toBeGreaterThan(10000);
    expect(result.affordabilityPassed).toBeDefined();
    expect(result.disposableIncome).toBeDefined();
  });

  it('uses correct APR for each loan type', () => {
    const base = { annualIncome: 50000, monthlyOutgoings: 1000, loanAmount: 5000, loanTermMonths: 24 };

    expect(runAffordabilityCheck({ ...base, loanType: 'personal_loan' }).representativeApr).toBe(6.9);
    expect(runAffordabilityCheck({ ...base, loanType: 'car_loan' }).representativeApr).toBe(5.9);
    expect(runAffordabilityCheck({ ...base, loanType: 'home_improvement' }).representativeApr).toBe(4.5);
    expect(runAffordabilityCheck({ ...base, loanType: 'debt_consolidation' }).representativeApr).toBe(7.9);
  });
});
