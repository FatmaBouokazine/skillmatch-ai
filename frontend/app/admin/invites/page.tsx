'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import {
  getAdminInvites,
  updateAdminInvite,
  deleteAdminInvite,
} from '../../../services/adminService';

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
  DECLINED: 'bg-red-100 text-red-600',
};

export default function AdminInvitesPage() {
  const { user, loading } = useRequireAuth('ADMIN');
  const [invites, setInvites] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setFetching(true);
    getAdminInvites(statusFilter || undefined)
      .then(setInvites)
      .catch(() => setError('Failed to load invites'))
      .finally(() => setFetching(false));
  }, [statusFilter]);

  useEffect(() => { if (user) load(); }, [user, load]);

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateAdminInvite(id, { status });
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to update invite');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invite? This cannot be undone.')) return;
    try {
      await deleteAdminInvite(id);
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to delete invite');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Invites</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Review and manage all recruiter invitations to candidates.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'ACCEPTED', 'DECLINED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              statusFilter === s
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {fetching ? (
        <Spinner />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Message</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Sent</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invites.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-zinc-400 text-sm">No invites found.</td></tr>
                )}
                {invites.map((inv) => {
                  const candidate = inv.employeeProfileId;
                  const candidateName = candidate
                    ? `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`.trim() || '—'
                    : '—';
                  const jobTitle = inv.jobPostId?.title ?? '—';
                  const id = inv._id || inv.id;
                  return (
                    <tr key={id} className="hover:bg-zinc-50 transition">
                      <td className="px-4 py-3 font-medium text-zinc-800">{candidateName}</td>
                      <td className="px-4 py-3 text-zinc-600 max-w-[180px] truncate">{jobTitle}</td>
                      <td className="px-4 py-3 text-zinc-500 max-w-[160px] truncate text-xs">
                        {inv.message || <span className="italic text-zinc-300">No message</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[inv.status] ?? 'bg-zinc-100 text-zinc-500'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status !== 'ACCEPTED' && (
                            <button
                              onClick={() => handleStatus(id, 'ACCEPTED')}
                              className="text-xs px-2.5 py-1 border border-emerald-200 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            >
                              Accept
                            </button>
                          )}
                          {inv.status !== 'DECLINED' && (
                            <button
                              onClick={() => handleStatus(id, 'DECLINED')}
                              className="text-xs px-2.5 py-1 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-100 transition"
                            >
                              Decline
                            </button>
                          )}
                          {inv.status !== 'PENDING' && (
                            <button
                              onClick={() => handleStatus(id, 'PENDING')}
                              className="text-xs px-2.5 py-1 border border-amber-200 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                            >
                              Reset
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(id)}
                            className="text-xs px-2.5 py-1 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
