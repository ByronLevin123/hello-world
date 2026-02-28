import { AffordabilityCheckResponse, CreateApplicationResponse, LoanType } from '../types/loan';

const BASE = '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export function checkAffordability(params: {
  annualIncome: number;
  monthlyOutgoings: number;
  loanAmount: number;
  loanTermMonths: number;
  loanType: LoanType;
}): Promise<AffordabilityCheckResponse> {
  return request<AffordabilityCheckResponse>('/api/affordability-check', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function submitApplication(data: Record<string, unknown>): Promise<CreateApplicationResponse> {
  return request<CreateApplicationResponse>('/api/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
