const AUTH_URL = 'http://localhost:5000/api/auth';
const JOBS_URL = 'http://localhost:5000/api/jobs';

export const registerUser = async (userData: Record<string, unknown>) => {
  const response = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Register failed');
  }
  return response.json();
};

export const loginUser = async (userData: Record<string, unknown>) => {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Login failed');
  }
  return response.json();
};

export const getProfile = async (token: string) => {
  const response = await fetch(`${AUTH_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
};

export const updateProfile = async (userData: Record<string, unknown>, token: string) => {
  const response = await fetch(`${AUTH_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update profile');
  }
  return response.json();
};

export const evaluateResume = async (resumeText: string, token: string) => {
  const response = await fetch(`${AUTH_URL}/resume`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resumeText }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to evaluate resume');
  }
  return response.json();
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  token: string
) => {
  const response = await fetch(`${AUTH_URL}/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to change password');
  }
  return response.json();
};

export const getRecruiterJobs = async (token: string) => {
  const response = await fetch(`${JOBS_URL}/recruiter`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch recruiter jobs');
  }
  return response.json();
};

export const createJob = async (jobData: Record<string, unknown>, token: string) => {
  const response = await fetch(JOBS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jobData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to create job');
  }
  return response.json();
};
