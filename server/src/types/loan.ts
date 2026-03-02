export type LoanType = 'personal_loan' | 'car_loan' | 'home_improvement' | 'debt_consolidation';

export type EmploymentStatus = 'employed' | 'self_employed' | 'part_time' | 'retired' | 'unemployed' | 'student';

export interface CreateApplicationRequest {
  loanType: LoanType;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county?: string;
  postcode: string;
  employmentStatus: EmploymentStatus;
  employerName?: string;
  annualIncome: number;
  monthlyOutgoings: number;
  loanAmount: number;
  loanTermMonths: number;
  termsAccepted: boolean;
}

export interface AffordabilityCheckRequest {
  annualIncome: number;
  monthlyOutgoings: number;
  loanAmount: number;
  loanTermMonths: number;
  loanType: LoanType;
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

export const REPRESENTATIVE_APRS: Record<LoanType, number> = {
  personal_loan: 6.9,
  car_loan: 5.9,
  home_improvement: 4.5,
  debt_consolidation: 7.9,
};
