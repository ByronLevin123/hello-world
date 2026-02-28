import { DashboardStats, ApplicationSummary, ApplicationDetail } from './types';

const BASE = '/api/staff';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export function fetchDashboardStats(): Promise<DashboardStats> {
  return request('/dashboard');
}

export function fetchApplications(params?: Record<string, string>): Promise<{ applications: ApplicationSummary[]; total: number }> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return request(`/applications${qs}`);
}

export function fetchApplicationDetail(id: string): Promise<ApplicationDetail> {
  return request(`/applications/${id}`);
}

export function updateApplication(id: string, data: Record<string, unknown>): Promise<ApplicationDetail> {
  return request(`/applications/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function addApplicationNote(id: string, author: string, role: string, content: string): Promise<void> {
  return request(`/applications/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ author, role, content }),
  });
}
