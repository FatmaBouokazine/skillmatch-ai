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
      { title: 'Role management', note: 'Provision recruiter and admin access.' },
    ],
    recruiter: [
      { title: 'Pipeline health', note: 'Track active opportunities.' },
      { title: 'Candidate match', note: 'Review top matches quickly.' },
      { title: 'Profile branding', note: 'Showcase your hiring team.' },
    ],
    candidate: [
      { title: 'Match insights', note: 'See how you score with roles.' },
      { title: 'Application status', note: 'Track active processes.' },
      { title: 'Profile visibility', note: 'Update skills and portfolio.' },
    ],
  };

  const highlights = roleHighlights[user?.role || 'candidate'] || roleHighlights.candidate;

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-[#b9e7e7] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#1f6d6d] shadow-sm">
            {roleLabel} dashboard
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            Welcome back, {user?.name || 'there'}
          </h1>
          <p className="max-w-xl text-base text-slate-600 sm:text-lg">
            Your role-specific workspace keeps the next steps clear and focused.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Role</p>
              <p className="mt-2 text-sm text-slate-600">{roleLabel}</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Account</p>
              <p className="mt-2 text-sm text-slate-600">{user?.email || 'Loading...'}</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Next step</p>
              <p className="mt-2 text-sm text-slate-600">Open profile, review matches, or update details.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/${roleRoute}`}
              className="rounded-md bg-[#76cdcd] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#63bcbc]"
            >
              Open {roleLabel} dashboard
            </Link>
            <Link
              href={`/profile/${roleRoute}`}
              className="rounded-md border border-[#b9e7e7] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]"
            >
              View profile
            </Link>
            <Link
              href="/solution"
              className="rounded-md border border-[#b9e7e7] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]"
            >
              Learn more
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <div className="rounded-xl border border-[#d7f1f1] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">What this page shows</p>
              <p className="mt-2 text-sm text-slate-600">A quick summary of the next steps for the current user role.</p>
            </div>
            <div className="rounded-xl border border-[#d7f1f1] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">What to do next</p>
              <p className="mt-2 text-sm text-slate-600">Open the role dashboard and complete the profile details.</p>
            </div>
            <div className="rounded-xl border border-[#d7f1f1] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Why it matters</p>
              <p className="mt-2 text-sm text-slate-600">Better profile data means better matches and clearer recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Quick stats</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-xl border border-[#d7f1f1] bg-white px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="mt-2 text-xs text-slate-500">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Account details</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Name: {user?.name || 'Loading...'}</p>
              <p>Email: {user?.email || 'Loading...'}</p>
              <p>Role: {user?.role || 'Loading...'}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 text-sm text-slate-700 shadow-sm">
            Add your profile details to improve matching quality.
          </div>
        </div>
      </div>
    </div>
  );
}
