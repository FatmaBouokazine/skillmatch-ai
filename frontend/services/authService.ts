const API_URL = 'http://localhost:5000/api/auth';

export const registerUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/register`, {
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
  const response = await fetch(`${API_URL}/login`, {
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
  const response = await fetch(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
};
