import { DashboardStats, ApplicationSummary, ApplicationDetail } from './types';

const BASE = '/api/staff';

function getToken(): string | null {
  return sessionStorage.getItem('auth_token');
}

export function setToken(token: string) {
  sessionStorage.setItem('auth_token', token);
}

export function clearToken() {
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_user');
}

export function getStoredUser(): { username: string; role: string } | null {
  const raw = sessionStorage.getItem('auth_user');
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: { username: string; role: string }) {
  sessionStorage.setItem('auth_user', JSON.stringify(user));
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { headers, ...options });

  if (res.status === 401) {
    clearToken();
    throw new Error('SESSION_EXPIRED');
  }

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const body = await res.json();
      if (body.error?.message) message = body.error.message;
    } catch { /* response body not JSON */ }
    throw new Error(message);
  }

  const body = await res.json();
  return (body.data ?? body) as T;
}

export async function login(username: string, password: string): Promise<{ token: string; user: { username: string; role: string } }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    let message = 'Login failed';
    try {
      const body = await res.json();
      if (body.error?.message) message = body.error.message;
    } catch { /* not JSON */ }
    throw new Error(message);
  }

  const body = await res.json();
  const { token, user } = body.data;
  setToken(token);
  setStoredUser(user);
  return { token, user };
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

export function addApplicationNote(id: string, content: string): Promise<void> {
  return request(`/applications/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
