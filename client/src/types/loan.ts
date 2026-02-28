export type LoanType = 'personal_loan' | 'car_loan' | 'home_improvement' | 'debt_consolidation';

export type EmploymentStatus = 'employed' | 'self_employed' | 'part_time' | 'retired' | 'unemployed' | 'student';

export interface ApplicationFormData {
  // Step 1
  loanType: LoanType | null;
  // Step 2
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  // Step 3
  addressLine1: string;
  addressLine2: string;
  city: string;
  county: string;
  postcode: string;
  // Step 4
  employmentStatus: EmploymentStatus | null;
  employerName: string;
  annualIncome: number | null;
  monthlyOutgoings: number | null;
  // Step 5
  loanAmount: number | null;
  loanTermMonths: number | null;
  // Step 6
  monthlyRepayment: number | null;
  representativeApr: number | null;
  totalRepayable: number | null;
  affordabilityPassed: boolean | null;
  // Step 7
  termsAccepted: boolean;
  // Confirmation
  reference: string | null;
}

export interface AffordabilityCheckResponse {
  monthlyRepayment: number;
  representativeApr: number;
  totalRepayable: number;
  affordabilityPassed: boolean;
  disposableIncome: number;
  reason?: string;
}

export interface CreateApplicationResponse {
  reference: string;
  status: string;
  monthlyRepayment: number;
  representativeApr: number;
  totalRepayable: number;
  affordabilityPassed: boolean;
  createdAt: string;
}

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  personal_loan: 'Personal Loan',
  car_loan: 'Car Loan',
  home_improvement: 'Home Improvement',
  debt_consolidation: 'Debt Consolidation',
};

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  employed: 'Employed',
  self_employed: 'Self-employed',
  part_time: 'Part-time',
  retired: 'Retired',
  unemployed: 'Unemployed',
  student: 'Student',
};

export const REPRESENTATIVE_APRS: Record<LoanType, number> = {
  personal_loan: 6.9,
  car_loan: 5.9,
  home_improvement: 4.5,
  debt_consolidation: 7.9,
};
