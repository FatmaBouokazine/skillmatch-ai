import { api } from './api';

export interface AuthUser {
  id: string;
  email: string;
  role: 'EMPLOYEE' | 'EMPLOYER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const registerUser = (data: { email: string; password: string; role: string }) =>
  api.post<AuthResponse>('/auth/register', data);

export const loginUser = (data: { email: string; password: string }) =>
  api.post<AuthResponse>('/auth/login', data);

export const getMe = () => api.get<any>('/auth/me');

export const updateAccount = (data: Record<string, unknown>) =>
  api.put<any>('/account', data);

export const getAccount = () => api.get<any>('/account');

// Legacy dashboard helpers. The `api` helper attaches the auth token from
// localStorage automatically, so the trailing `_token` arg is kept only for
// backwards-compatible call signatures.
export const updateProfile = (
  userData: Record<string, unknown>,
  _token?: string
) => api.put<any>('/account', userData);

export const evaluateResume = (resumeText: string, _token?: string) =>
  api.post<any>('/employee/resume/extract', { resumeText });

export const changePassword = (
  currentPassword: string,
  newPassword: string,
  _token?: string
) => api.put<any>('/account', { currentPassword, newPassword });

export const getRecruiterJobs = (_token?: string) =>
  api.get<any>('/employer/jobs');

export const createJob = (
  jobData: Record<string, unknown>,
  _token?: string
) => api.post<any>('/employer/jobs', jobData);
