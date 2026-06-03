const AUTH_URL = 'http://localhost:5000/api/auth';
const JOBS_URL = 'http://localhost:5000/api/jobs';

// --- AUTHENTICATION & PROFILE SERVICES ---

export const registerUser = async (userData: any) => {
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

export const loginUser = async (userData: any) => {
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

export const updateProfile = async (userData: any, token: string) => {
  const response = await fetch(`${AUTH_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update profile');
  }
  return response.json();
};

// --- JOBS & MATCHING SERVICES ---

export const getJobs = async (token: string) => {
  const response = await fetch(JOBS_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
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

export const createJob = async (jobData: any, token: string) => {
  const response = await fetch(JOBS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(jobData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to create job');
  }
  return response.json();
};

export const applyJob = async (jobId: string, token: string) => {
  const response = await fetch(`${JOBS_URL}/${jobId}/apply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to apply for job');
  }
  return response.json();
};

export const getJobApplicants = async (jobId: string, token: string) => {
  const response = await fetch(`${JOBS_URL}/${jobId}/applicants`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch applicants');
  }
  return response.json();
};

export const updateApplicationStatus = async (jobId: string, candidateId: string, status: string, token: string) => {
  const response = await fetch(`${JOBS_URL}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ jobId, candidateId, status }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update status');
  }
  return response.json();
};

// --- ADMIN SERVICES ---

export const getAllUsers = async (token: string) => {
  const response = await fetch(`${AUTH_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

export const updateUserRole = async (userId: string, role: string, token: string) => {
  const response = await fetch(`${AUTH_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update user role');
  }
  return response.json();
};

export const deleteUser = async (userId: string, token: string) => {
  const response = await fetch(`${AUTH_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to delete user');
  }
  return response.json();
};
