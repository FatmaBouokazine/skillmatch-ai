'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getAdminUsers, getAdminJobs, getAdminApplications, getAdminInvites } from '../../../services/adminService';

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, loading } = useRequireAuth('ADMIN');
  const [stats, setStats] = useState({
    employees: 0, employers: 0, admins: 0,
    openJobs: 0, closedJobs: 0,
    pendingApps: 0, totalApps: 0,
    pendingInvites: 0, totalInvites: 0,
  });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getAdminUsers(), getAdminJobs(), getAdminApplications(), getAdminInvites()])
      .then(([users, jobs, apps, invites]) => {
        setStats({
          employees: users.filter((u: any) => u.role === 'EMPLOYEE').length,
          employers: users.filter((u: any) => u.role === 'EMPLOYER').length,
          admins: users.filter((u: any) => u.role === 'ADMIN').length,
          openJobs: jobs.filter((j: any) => j.status === 'OPEN').length,
          closedJobs: jobs.filter((j: any) => j.status === 'CLOSED').length,
          pendingApps: apps.filter((a: any) => a.status === 'PENDING').length,
          totalApps: apps.length,
          pendingInvites: invites.filter((i: any) => i.status === 'PENDING').length,
          totalInvites: invites.length,
        });
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching) return <Spinner />;

  const cards = [
    { label: 'Candidates', value: stats.employees, sub: 'EMPLOYEE accounts', href: '/admin/users?role=EMPLOYEE', color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Recruiters', value: stats.employers, sub: 'EMPLOYER accounts', href: '/admin/users?role=EMPLOYER', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Admins', value: stats.admins, sub: 'ADMIN accounts', href: '/admin/users?role=ADMIN', color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Open Jobs', value: stats.openJobs, sub: `${stats.closedJobs} closed`, href: '/admin/jobs', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Applications', value: stats.totalApps, sub: `${stats.pendingApps} pending`, href: '/admin/applications', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Invites', value: stats.totalInvites, sub: `${stats.pendingInvites} pending`, href: '/admin/invites', color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Admin Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Platform overview — all users, jobs, and activity.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-sm transition group"
          >
            <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <span className={`text-lg font-bold ${c.color}`}>{c.value}</span>
            </div>
            <p className="text-sm font-semibold text-zinc-800 group-hover:text-zinc-900">{c.label}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{c.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/users" className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl hover:shadow-sm transition">
          <span className="text-sm font-semibold text-zinc-800">Manage Users</span>
          <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
        <Link href="/admin/jobs" className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl hover:shadow-sm transition">
          <span className="text-sm font-semibold text-zinc-800">Manage Job Posts</span>
          <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
        <Link href="/admin/applications" className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl hover:shadow-sm transition">
          <span className="text-sm font-semibold text-zinc-800">Manage Applications</span>
          <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  );
}
