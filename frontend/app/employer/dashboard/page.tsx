'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getJobs, getEmployerProfile, getInvites } from '../../../services/employerService';

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

export default function EmployerDashboardPage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const [jobs, setJobs] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getJobs(), getEmployerProfile(), getInvites()])
      .then(([jobList, prof, inviteList]) => {
        setJobs(jobList);
        setProfile(prof);
        setInvites(inviteList);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching) return <Spinner />;

  const openJobs = jobs.filter((j) => j.status === 'OPEN');
  const closedJobs = jobs.filter((j) => j.status === 'CLOSED');
  const pendingInvites = invites.filter((i) => i.status === 'PENDING');
  const acceptedInvites = invites.filter((i) => i.status === 'ACCEPTED');
  const declinedInvites = invites.filter((i) => i.status === 'DECLINED');

  const stats = [
    {
      label: 'Open Positions',
      value: openJobs.length,
      href: '/employer/jobs',
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
      valueColor: 'text-violet-600',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Closed Positions',
      value: closedJobs.length,
      href: '/employer/jobs',
      iconColor: 'text-zinc-500',
      iconBg: 'bg-zinc-100',
      valueColor: 'text-zinc-600',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Pending Invites',
      value: pendingInvites.length,
      href: '/employer/invites',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      valueColor: 'text-amber-600',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Total Invites Sent',
      value: invites.length,
      href: '/employer/invites',
      iconColor: 'text-zinc-600',
      iconBg: 'bg-zinc-100',
      valueColor: 'text-zinc-800',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">
            {profile?.companyName ? `Welcome back, ${profile.companyName}` : 'Recruiter Dashboard'}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Here's an overview of your hiring activity.</p>
        </div>
        <Link
          href="/employer/jobs"
          className="shrink-0 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition"
        >
          + Post a Job
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, href, icon, iconColor, iconBg, valueColor }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 hover:shadow-sm transition group"
          >
            <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mb-3`}>
              {icon}
            </div>
            <div className={`text-3xl font-bold ${valueColor} mb-0.5`}>{value}</div>
            <div className="text-xs font-medium text-zinc-500 leading-snug">{label}</div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Job Posts — 2/3 width */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-800">Recent Job Posts</h2>
            <Link href="/employer/jobs" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition">
              Manage all →
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-400 mb-1">No job posts yet.</p>
              <Link href="/employer/jobs" className="text-sm font-semibold text-zinc-700 underline hover:text-zinc-900">
                Create your first job
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/60 transition"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-800 truncate">{job.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {job.type?.replace('_', ' ')} · {job.location || 'Remote'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        job.status === 'OPEN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                      }`}
                    >
                      {job.status}
                    </span>
                    <Link
                      href={`/employer/jobs/${job.id}/matches`}
                      className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 font-medium text-zinc-600 hover:bg-zinc-100 hover:border-zinc-300 transition"
                    >
                      Matches
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-zinc-800 mb-3">Quick Actions</h2>
            <div className="space-y-1.5">
              {[
                {
                  label: 'Post a new job',
                  href: '/employer/jobs',
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  ),
                },
                {
                  label: 'View all invites',
                  href: '/employer/invites',
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  label: 'Update company profile',
                  href: '/employer/profile',
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ),
                },
                {
                  label: 'Account settings',
                  href: '/account',
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
              ].map(({ label, href, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition text-sm font-medium text-zinc-700 group"
                >
                  <span className="text-zinc-400 group-hover:text-zinc-600 transition">{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Invite Status Breakdown */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-800">Invite Status</h2>
              <Link href="/employer/invites" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition">
                View all →
              </Link>
            </div>
            {invites.length === 0 ? (
              <p className="text-xs text-zinc-400 py-2 text-center">No invites sent yet.</p>
            ) : (
              <div className="space-y-2.5">
                {[
                  { label: 'Pending', count: pendingInvites.length, pill: 'bg-amber-50 text-amber-700 border border-amber-200' },
                  { label: 'Accepted', count: acceptedInvites.length, pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
                  { label: 'Declined', count: declinedInvites.length, pill: 'bg-red-50 text-red-500 border border-red-200' },
                ].map(({ label, count, pill }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600">{label}</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${pill}`}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
