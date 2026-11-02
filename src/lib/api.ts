const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('sb_token');
  const headers = new Headers(init.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return undefined as T;
}

export const api = {
  signup: (payload: { firstName: string; lastName: string; email: string; password: string; householdName: string }) =>
    request<{ token: string; user: any; household: any }>('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: any; household: any }>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request<any>('/api/auth/me'),
  dashboard: () => request<any>('/api/dashboard'),
  events: {
    list: () => request<any>('/api/events'),
    create: (payload: any) => request<any>('/api/events', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: any) => request<any>(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    remove: (id: string) => request<any>(`/api/events/${id}`, { method: 'DELETE' }),
  },
  tasks: {
    list: () => request<any>('/api/tasks'),
    create: (payload: any) => request<any>('/api/tasks', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: any) => request<any>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    remove: (id: string) => request<any>(`/api/tasks/${id}`, { method: 'DELETE' }),
  },
  children: {
    list: () => request<any>('/api/children'),
    create: (payload: any) => request<any>('/api/children', { method: 'POST', body: JSON.stringify(payload) }),
  },
  schools: {
    list: () => request<any>('/api/schools'),
    create: (payload: any) => request<any>('/api/schools', { method: 'POST', body: JSON.stringify(payload) }),
  },
  responsibilities: {
    list: () => request<any>('/api/responsibilities'),
    create: (payload: any) => request<any>('/api/responsibilities', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: any) => request<any>(`/api/responsibilities/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    remove: (id: string) => request<any>(`/api/responsibilities/${id}`, { method: 'DELETE' }),
  },
  household: {
    me: () => request<any>('/api/households/me'),
  },
};
