'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getJobs, getEmployerProfile } from '../../../services/employerService';

export default function EmployerDashboardPage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const [jobs, setJobs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getJobs(), getEmployerProfile()])
      .then(([jobList, prof]) => { setJobs(jobList); setProfile(prof); })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" /></div>;

  const openJobs = jobs.filter((j) => j.status === 'OPEN');
  const closedJobs = jobs.filter((j) => j.status === 'CLOSED');

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {profile?.companyName ? `Welcome, ${profile.companyName}` : 'Welcome back.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Open Jobs', value: openJobs.length, href: '/employer/jobs', color: 'text-emerald-600' },
          { label: 'Closed Jobs', value: closedJobs.length, href: '/employer/jobs', color: 'text-zinc-400' },
          { label: 'Total Posts', value: jobs.length, href: '/employer/jobs', color: 'text-zinc-800' },
        ].map(({ label, value, href, color }) => (
          <Link key={label} href={href} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition space-y-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block">{label}</span>
            <span className={`text-4xl font-bold ${color}`}>{value}</span>
          </Link>
        ))}
      </div>

      {/* Recent job posts */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-800">Recent Job Posts</h2>
          <Link href="/employer/jobs" className="text-xs text-zinc-500 underline hover:text-zinc-800">Manage all →</Link>
        </div>
        {jobs.length === 0 ? (
          <p className="text-sm text-zinc-400">No job posts yet. <Link href="/employer/jobs" className="underline text-zinc-600">Create your first job</Link>.</p>
        ) : (
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 transition">
                <div>
                  <p className="text-sm font-medium text-zinc-800">{job.title}</p>
                  <p className="text-xs text-zinc-500">{job.type?.replace('_', ' ')} · {job.location || 'Remote'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                    {job.status}
                  </span>
                  <Link href={`/employer/jobs/${job.id}/matches`} className="text-xs text-zinc-500 underline hover:text-zinc-800">Matches</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
