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
      const body = await res.json();
      if (body.error?.message) message = body.error.message;
      else if (body.error) message = typeof body.error === 'string' ? body.error : message;
    } catch { /* response body not JSON */ }
    throw new Error(message);
  }

  const body = await res.json();
  return (body.data ?? body) as T;
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
