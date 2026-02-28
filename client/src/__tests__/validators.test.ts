import { describe, it, expect } from 'vitest';
import { isValidPostcode, isValidPhone, isValidEmail, isAtLeast18 } from '../utils/validators';

describe('isValidPostcode', () => {
  it('accepts valid UK postcodes', () => {
    expect(isValidPostcode('SW1A 1AA')).toBe(true);
    expect(isValidPostcode('EC1A 1BB')).toBe(true);
    expect(isValidPostcode('M1 1AE')).toBe(true);
    expect(isValidPostcode('B1 1AA')).toBe(true);
    expect(isValidPostcode('W1A 0AX')).toBe(true);
    expect(isValidPostcode('CR2 6XH')).toBe(true);
  });

  it('accepts postcodes without spaces', () => {
    expect(isValidPostcode('SW1A1AA')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(isValidPostcode('sw1a 1aa')).toBe(true);
  });

  it('rejects invalid postcodes', () => {
    expect(isValidPostcode('12345')).toBe(false);
    expect(isValidPostcode('INVALID')).toBe(false);
    expect(isValidPostcode('')).toBe(false);
    expect(isValidPostcode('90210')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts valid UK phone numbers', () => {
    expect(isValidPhone('07700900123')).toBe(true);
    expect(isValidPhone('+447700900123')).toBe(true);
    expect(isValidPhone('07700 900 123')).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('abc')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });
});

describe('isAtLeast18', () => {
  it('returns true for someone over 18', () => {
    expect(isAtLeast18('1990-06-15')).toBe(true);
  });

  it('returns false for someone under 18', () => {
    const today = new Date();
    const underageDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    expect(isAtLeast18(underageDate.toISOString().split('T')[0])).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isAtLeast18('')).toBe(false);
  });

  it('returns false for invalid date', () => {
    expect(isAtLeast18('not-a-date')).toBe(false);
  });
});
