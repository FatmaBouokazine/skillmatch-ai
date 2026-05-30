'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { getProfile } from '@/services/authService';

export default function DashboardPage() {

  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {

    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {

      try {

        const data = await getProfile(token);

        setUser(data);

      } catch (error) {

        console.log(error);

        router.push('/login');
      }
    };

    fetchProfile();

  }, []);

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Member';

  const roleRoute = user?.role ? user.role : 'candidate';

  const roleHighlights: Record<string, { title: string; note: string }[]> = {
    admin: [
      { title: 'Platform overview', note: 'Monitor user growth and access.' },
      { title: 'Security controls', note: 'Review sessions and audit trails.' },
      { title: 'Role management', note: 'Provision recruiter and admin access.' }
    ],
    recruiter: [
      { title: 'Pipeline health', note: 'Track active opportunities.' },
      { title: 'Candidate match', note: 'Review top matches quickly.' },
      { title: 'Profile branding', note: 'Showcase your hiring team.' }
    ],
    candidate: [
      { title: 'Match insights', note: 'See how you score with roles.' },
      { title: 'Application status', note: 'Track active processes.' },
      { title: 'Profile visibility', note: 'Update skills and portfolio.' }
    ]
  };

  const highlights = roleHighlights[user?.role || 'candidate'] || roleHighlights.candidate;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-6 py-12 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(87,132,186,0.2),_transparent_55%),linear-gradient(180deg,#f7f9ff_0%,#eef3fb_60%,#ffffff_100%)]" />
      <div className="absolute right-16 top-20 -z-10 h-48 w-48 rounded-full bg-[#5784BA] opacity-15 blur-[90px]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="w-fit rounded-full border border-[#5784BA]/30 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#5784BA]">
              {roleLabel} dashboard
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Welcome back, {user?.name || 'there'}
            </h1>
            <p className="max-w-xl text-base text-slate-600 sm:text-lg">
              Your role-specific workspace keeps the next steps clear and focused.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/${roleRoute}`}
              className="rounded-xl bg-[#5784BA] px-4 py-2 text-sm font-semibold text-white shadow-[0_15px_30px_-20px_rgba(87,132,186,0.9)] transition hover:bg-[#4a73a6]"
            >
              Open {roleLabel} dashboard
            </Link>
            <Link
              href={`/profile/${roleRoute}`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#5784BA]/50 hover:text-[#5784BA]"
            >
              View profile
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
            <h2 className="text-xl font-semibold">Quick stats</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
              <h3 className="text-lg font-semibold">Account details</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Name: {user?.name || 'Loading...'}</p>
                <p>Email: {user?.email || 'Loading...'}</p>
                <p>Role: {user?.role || 'Loading...'}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-[#5784BA]/20 bg-[#5784BA]/10 p-6 text-sm text-[#3d5f8a]">
              Add your profile details to improve matching quality.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}