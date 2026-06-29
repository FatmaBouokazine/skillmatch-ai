'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

export function useRequireAuth(role?: UserRole) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (role && user.role !== role) {
      if (user.role === 'EMPLOYEE') router.replace('/employee/dashboard');
      else if (user.role === 'EMPLOYER') router.replace('/employer/dashboard');
      else router.replace('/admin/dashboard');
    }
  }, [user, loading, router, role]);

  return { user, loading };
}
