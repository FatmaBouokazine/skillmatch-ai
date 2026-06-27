'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '../services/authService';

export type UserRole = 'EMPLOYEE' | 'EMPLOYER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  employeeProfile?: any;
  employerProfile?: any;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      getMe()
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (newToken: string, role: UserRole) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setLoading(true);
    try {
      const userData = await getMe();
      setUser(userData);
      if (role === 'EMPLOYEE') router.push('/employee/dashboard');
      else if (role === 'EMPLOYER') router.push('/employer/dashboard');
      else router.push('/account');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const userData = await getMe();
      setUser(userData);
    } catch {
      // silently ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
