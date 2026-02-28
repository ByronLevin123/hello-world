export type Role = 'branch' | 'underwriter' | 'compliance' | 'executive';

export const ROLE_LABELS: Record<Role, string> = {
  branch: 'Front Office',
  underwriter: 'Middle Office',
  compliance: 'Back Office',
  executive: 'Head of Lending',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  branch: 'Branch & Sales',
  underwriter: 'Underwriting & Risk',
  compliance: 'Compliance & AML',
  executive: 'Executive Dashboard',
};

export interface DashboardStats {
  totalApplications: number;
  submitted: number;
  underReview: number;
  approved: number;
  declined: number;
  referred: number;
  totalPipelineValue: number;
  avgLoanAmount: number;
  approvalRate: number;
  avgRiskScore: number;
  compliancePending: number;
  complianceFlagged: number;
  byLoanType: { loan_type: string; count: number; total_value: number }[];
  byRiskBand: { risk_band: string; count: number }[];
  byChannel: { source_channel: string; count: number }[];
  byMonth: { month: string; count: number; value: number }[];
}

export interface ApplicationSummary {
  id: string;
  reference: string;
  status: string;
  loan_type: string;
  loan_amount: number;
  loan_term_months: number;
  first_name: string;
  last_name: string;
  email: string;
  risk_score: number | null;
  risk_band: string | null;
  compliance_status: string;
  decision: string | null;
  assigned_to: string | null;
  source_channel: string;
  created_at: string;
}

export interface ApplicationDetail extends ApplicationSummary {
  representative_apr: number;
  monthly_repayment: number;
  date_of_birth: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  county: string | null;
  postcode: string;
  employment_status: string;
  employer_name: string | null;
  annual_income: number;
  monthly_outgoings: number;
  affordability_passed: boolean;
  terms_accepted: boolean;
  decision_by: string | null;
  decision_at: string | null;
  decision_notes: string | null;
  aml_check_passed: boolean | null;
  kyc_check_passed: boolean | null;
  fraud_check_passed: boolean | null;
  compliance_reviewed_by: string | null;
  compliance_reviewed_at: string | null;
  notes: { id: string; author: string; role: string; content: string; created_at: string }[];
  auditEvents: { id: string; event_type: string; performed_by: string; role: string; details: string; created_at: string }[];
}
