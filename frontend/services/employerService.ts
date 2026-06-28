import { api } from './api';

export const getEmployerProfile = () => api.get<any>('/employer/profile');

export const updateEmployerProfile = (data: Record<string, unknown>) =>
  api.put<any>('/employer/profile', data);

export const createJob = (data: Record<string, unknown>) =>
  api.post<any>('/employer/jobs', data);

export const getJobs = () => api.get<any>('/employer/jobs');

export const updateJob = (id: string, data: Record<string, unknown>) =>
  api.put<any>(`/employer/jobs/${id}`, data);

export const deleteJob = (id: string) => api.delete<any>(`/employer/jobs/${id}`);

export const getJobMatches = (jobId: string) =>
  api.get<any>(`/employer/jobs/${jobId}/matches`);

export const getEmployee = (id: string) => api.get<any>(`/employer/employees/${id}`);

export const sendInvite = (data: {
  jobPostId: string;
  employeeProfileId: string;
  message?: string;
}) => api.post<any>('/employer/invites', data);

export const getInvites = () => api.get<any>('/employer/invites');

// Applications
export const getApplications = () => api.get<any>('/employer/applications');
export const updateApplication = (id: string, status: 'ACCEPTED' | 'DECLINED' | 'PENDING') =>
  api.put<any>(`/employer/applications/${id}`, { status });

// Company
export const getCompanyMembers = () => api.get<any>('/employer/company/members');
export const inviteToCompany = (data: { email: string; jobTitle?: string }) =>
  api.post<any>('/employer/company/invite', data);
export const removeCompanyMember = (id: string) =>
  api.delete<any>(`/employer/company/members/${id}`);

