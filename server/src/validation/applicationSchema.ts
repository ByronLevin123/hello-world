import { z } from 'zod';

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const UK_PHONE_REGEX = /^(?:0|\+?44)\s?(?:\d\s?){9,10}$/;

const loanTypes = ['personal_loan', 'car_loan', 'home_improvement', 'debt_consolidation'] as const;
const employmentStatuses = ['employed', 'self_employed', 'part_time', 'retired', 'unemployed', 'student'] as const;

function isAtLeast18(dateStr: string): boolean {
  const dob = new Date(dateStr);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
}

export const createApplicationSchema = z.object({
  loanType: z.enum(loanTypes),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date').refine(isAtLeast18, 'Applicant must be at least 18 years old'),
  email: z.string().email(),
  phone: z.string().regex(UK_PHONE_REGEX, 'Invalid UK phone number'),
  addressLine1: z.string().min(1).max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  county: z.string().max(100).optional(),
  postcode: z.string().regex(UK_POSTCODE_REGEX, 'Invalid UK postcode'),
  employmentStatus: z.enum(employmentStatuses),
  employerName: z.string().max(255).optional(),
  annualIncome: z.number().positive('Annual income must be positive'),
  monthlyOutgoings: z.number().min(0, 'Monthly outgoings cannot be negative'),
  loanAmount: z.number().min(1000).max(25000),
  loanTermMonths: z.number().refine(val => [12, 24, 36, 48, 60].includes(val), 'Invalid loan term'),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms and conditions' }) }),
});

export const affordabilityCheckSchema = z.object({
  annualIncome: z.number().positive(),
  monthlyOutgoings: z.number().min(0),
  loanAmount: z.number().min(1000).max(25000),
  loanTermMonths: z.number().refine(val => [12, 24, 36, 48, 60].includes(val), 'Invalid loan term'),
  loanType: z.enum(loanTypes),
});
