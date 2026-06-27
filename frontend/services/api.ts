const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiRequest<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  isFormData = false
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: isFormData
      ? (body as FormData)
      : body !== undefined
      ? JSON.stringify(body)
      : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>('GET', endpoint),
  post: <T>(endpoint: string, body: unknown) => apiRequest<T>('POST', endpoint, body),
  put: <T>(endpoint: string, body: unknown) => apiRequest<T>('PUT', endpoint, body),
  delete: <T>(endpoint: string) => apiRequest<T>('DELETE', endpoint),
  upload: <T>(endpoint: string, formData: FormData) =>
    apiRequest<T>('POST', endpoint, formData, true),
};
