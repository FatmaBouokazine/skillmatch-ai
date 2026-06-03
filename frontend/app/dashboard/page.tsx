'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!token || !user) {
        router.push('/login');
      } else {
        const role = user.role || 'candidate';
        router.push(`/dashboard/${role}`);
      }
    }
  }, [user, token, loading, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-zinc-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-zinc-950 animate-spin"></div>
        <span className="text-xs text-zinc-500 font-medium tracking-wide">Redirecting to workspace...</span>
      </div>
    </div>
  );
}
