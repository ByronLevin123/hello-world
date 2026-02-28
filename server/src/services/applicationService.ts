import { pool } from '../db/connection';
import { generateReference } from './referenceGenerator';
import {
  CreateApplicationRequest,
  AffordabilityCheckRequest,
  AffordabilityCheckResponse,
  CreateApplicationResponse,
  REPRESENTATIVE_APRS,
  LoanType,
} from '../types/loan';

export function calculateMonthlyRepayment(principal: number, annualRate: number, termMonths: number): number {
  if (annualRate === 0) {
    return principal / termMonths;
  }
  const monthlyRate = annualRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function checkAffordability(
  annualIncome: number,
  monthlyOutgoings: number,
  monthlyRepayment: number
): { passed: boolean; disposableIncome: number; reason?: string } {
  const monthlyIncome = annualIncome / 12;
  const disposableIncome = monthlyIncome - monthlyOutgoings - monthlyRepayment;
  const minimumThreshold = monthlyIncome * 0.10;

  if (disposableIncome < minimumThreshold) {
    return {
      passed: false,
      disposableIncome: Math.round(disposableIncome * 100) / 100,
      reason: `Your estimated monthly disposable income after the repayment would be £${disposableIncome.toFixed(2)}, which is below the minimum threshold of £${minimumThreshold.toFixed(2)}.`,
    };
  }

  return { passed: true, disposableIncome: Math.round(disposableIncome * 100) / 100 };
}

export function runAffordabilityCheck(data: AffordabilityCheckRequest): AffordabilityCheckResponse {
  const apr = REPRESENTATIVE_APRS[data.loanType];
  const monthlyRepayment = calculateMonthlyRepayment(data.loanAmount, apr, data.loanTermMonths);
  const totalRepayable = monthlyRepayment * data.loanTermMonths;
  const result = checkAffordability(data.annualIncome, data.monthlyOutgoings, monthlyRepayment);

  return {
    monthlyRepayment: Math.round(monthlyRepayment * 100) / 100,
    representativeApr: apr,
    totalRepayable: Math.round(totalRepayable * 100) / 100,
    affordabilityPassed: result.passed,
    disposableIncome: result.disposableIncome,
    reason: result.reason,
  };
}

export async function createApplication(data: CreateApplicationRequest): Promise<CreateApplicationResponse> {
  const apr = REPRESENTATIVE_APRS[data.loanType];
  const monthlyRepayment = calculateMonthlyRepayment(data.loanAmount, apr, data.loanTermMonths);
  const totalRepayable = monthlyRepayment * data.loanTermMonths;
  const affordability = checkAffordability(data.annualIncome, data.monthlyOutgoings, monthlyRepayment);
  const reference = generateReference();

  const amountPence = Math.round(data.loanAmount * 100);
  const repaymentPence = Math.round(monthlyRepayment * 100);
  const incomePence = Math.round(data.annualIncome * 100);
  const outgoingsPence = Math.round(data.monthlyOutgoings * 100);

  const result = await pool.query(
    `INSERT INTO applications (
      reference, loan_type, loan_amount, loan_term_months, representative_apr, monthly_repayment,
      first_name, last_name, date_of_birth, email, phone,
      address_line_1, address_line_2, city, county, postcode,
      employment_status, employer_name, annual_income, monthly_outgoings,
      affordability_passed, terms_accepted
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11,
      $12, $13, $14, $15, $16,
      $17, $18, $19, $20,
      $21, $22
    ) RETURNING id, reference, status, created_at`,
    [
      reference, data.loanType, amountPence, data.loanTermMonths, apr, repaymentPence,
      data.firstName, data.lastName, data.dateOfBirth, data.email, data.phone,
      data.addressLine1, data.addressLine2 || null, data.city, data.county || null, data.postcode,
      data.employmentStatus, data.employerName || null, incomePence, outgoingsPence,
      affordability.passed, data.termsAccepted,
    ]
  );

  const row = result.rows[0];
  return {
    reference: row.reference,
    status: row.status,
    monthlyRepayment: Math.round(monthlyRepayment * 100) / 100,
    representativeApr: apr,
    totalRepayable: Math.round(totalRepayable * 100) / 100,
    affordabilityPassed: affordability.passed,
    createdAt: row.created_at,
  };
}

export async function getApplicationByReference(reference: string) {
  const result = await pool.query(
    'SELECT * FROM applications WHERE reference = $1',
    [reference]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    loanType: row.loan_type,
    loanAmount: row.loan_amount / 100,
    loanTermMonths: row.loan_term_months,
    representativeApr: parseFloat(row.representative_apr),
    monthlyRepayment: row.monthly_repayment / 100,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    email: row.email,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    county: row.county,
    postcode: row.postcode,
    employmentStatus: row.employment_status,
    employerName: row.employer_name,
    annualIncome: row.annual_income / 100,
    monthlyOutgoings: row.monthly_outgoings / 100,
    affordabilityPassed: row.affordability_passed,
    termsAccepted: row.terms_accepted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
