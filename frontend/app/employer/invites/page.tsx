'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getInvites } from '../../../services/employerService';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DECLINED: 'bg-red-50 text-red-600 border-red-200',
};

export default function EmployerInvitesPage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const [invites, setInvites] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    getInvites()
      .then(setInvites)
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Invites</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{invites.length} invite{invites.length !== 1 ? 's' : ''} sent</p>
      </div>

      {invites.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center">
          <p className="text-zinc-400 text-sm">No invites sent yet. <Link href="/employer/jobs" className="underline text-zinc-600">Browse job matches</Link> to invite candidates.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Candidate</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden md:table-cell">Job Post</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition">
                  <td className="px-5 py-4">
                    <div className="font-medium text-zinc-800">
                      {`${invite.employeeProfile?.firstName || ''} ${invite.employeeProfile?.lastName || ''}`.trim() || 'Unnamed'}
                    </div>
                    <div className="text-xs text-zinc-500">{invite.employeeProfile?.title || '—'}</div>
                  </td>
                  <td className="px-5 py-4 text-zinc-600 hidden md:table-cell">{invite.jobPost?.title || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[invite.status] || 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                      {invite.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-zinc-400 hidden sm:table-cell">
                    {new Date(invite.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/employer/employees/${invite.employeeProfile?.id}`} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 font-medium text-zinc-600">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
