import { api } from './api';

// ─── Users ────────────────────────────────────────────────────────────────────

export const getAdminUsers = (role?: string) =>
  api.get<any[]>(`/admin/users${role ? `?role=${role}` : ''}`);

export const getAdminUser = (id: string) =>
  api.get<any>(`/admin/users/${id}`);

export const createAdminUser = (data: { email: string; password: string; role: string }) =>
  api.post<any>('/admin/users', data);

export const updateAdminUser = (id: string, data: {
  email?: string;
  password?: string;
  role?: string;
  profile?: Record<string, string>;
}) =>
  api.put<any>(`/admin/users/${id}`, data);

export const deleteAdminUser = (id: string) =>
  api.delete<any>(`/admin/users/${id}`);

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const getAdminJobs = (status?: string) =>
  api.get<any[]>(`/admin/jobs${status ? `?status=${status}` : ''}`);

export const updateAdminJob = (id: string, data: Partial<{ title: string; description: string; requiredSkills: string[]; location: string; type: string; status: string }>) =>
  api.put<any>(`/admin/jobs/${id}`, data);

export const deleteAdminJob = (id: string) =>
  api.delete<any>(`/admin/jobs/${id}`);

// ─── Applications ─────────────────────────────────────────────────────────────

export const getAdminApplications = (status?: string) =>
  api.get<any[]>(`/admin/applications${status ? `?status=${status}` : ''}`);

export const updateAdminApplication = (id: string, data: { status: string }) =>
  api.put<any>(`/admin/applications/${id}`, data);

export const deleteAdminApplication = (id: string) =>
  api.delete<any>(`/admin/applications/${id}`);

// ─── Invites ──────────────────────────────────────────────────────────────────

export const getAdminInvites = (status?: string) =>
  api.get<any[]>(`/admin/invites${status ? `?status=${status}` : ''}`);

export const updateAdminInvite = (id: string, data: { status: string }) =>
  api.put<any>(`/admin/invites/${id}`, data);

export const deleteAdminInvite = (id: string) =>
  api.delete<any>(`/admin/invites/${id}`);
