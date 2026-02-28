import { AffordabilityCheckResponse, CreateApplicationResponse, LoanType } from '../types/loan';

const BASE = '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch { /* response body not JSON */ }
    throw new Error(message);
  }

  return await res.json() as T;
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
