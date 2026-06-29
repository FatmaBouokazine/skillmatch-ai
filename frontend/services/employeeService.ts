import { api } from './api';

export const getEmployeeProfile = () => api.get<any>('/employee/profile');

export const updateEmployeeProfile = (data: Record<string, unknown>) =>
  api.put<any>('/employee/profile', data);

export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.upload<any>('/employee/resume', formData);
};

export const getResumeScore = () => api.get<any>('/employee/resume/score');

export const extractResume = () => api.post<any>('/employee/resume/extract', {});

export const addSkill = (name: string) => api.post<any>('/employee/skills', { name });

export const removeSkill = (id: string) => api.delete<any>(`/employee/skills/${id}`);

export const getJobMatches = () => api.get<any>('/employee/jobs/matches');

export const getAIJobMatches = () => api.get<any>('/employee/jobs/ai-matches');

export const getJobDetail = (id: string) => api.get<any>(`/employee/jobs/${id}`);

export const applyForJob = (jobId: string, coverLetter?: string) =>
  api.post<any>(`/employee/jobs/${jobId}/apply`, { coverLetter: coverLetter || '' });

export const getMyApplications = () => api.get<any>('/employee/applications');

export const getCompanyInvites = () => api.get<any>('/employee/company/invites');

export const respondToCompanyInvite = (id: string, accept: boolean) =>
  api.put<any>(`/employee/company/invites/${id}`, { accept });

