'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import {
  getAdminApplications,
  updateAdminApplication,
  deleteAdminApplication,
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

export default function AdminApplicationsPage() {
  const { user, loading } = useRequireAuth('ADMIN');
  const [apps, setApps] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setFetching(true);
    getAdminApplications(statusFilter || undefined)
      .then(setApps)
      .catch(() => setError('Failed to load applications'))
      .finally(() => setFetching(false));
  }, [statusFilter]);

  useEffect(() => { if (user) load(); }, [user, load]);

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateAdminApplication(id, { status });
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to update application');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application? This cannot be undone.')) return;
    try {
      await deleteAdminApplication(id);
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to delete application');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Applications</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Review and manage all job applications.</p>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Applied</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {apps.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-zinc-400 text-sm">No applications found.</td></tr>
                )}
                {apps.map((a) => {
                  const candidate = a.employeeProfileId;
                  const candidateName = candidate
                    ? `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`.trim() || '—'
                    : '—';
                  const jobTitle = a.jobPostId?.title ?? '—';
                  const id = a._id || a.id;
                  return (
                    <tr key={id} className="hover:bg-zinc-50 transition">
                      <td className="px-4 py-3 font-medium text-zinc-800">{candidateName}</td>
                      <td className="px-4 py-3 text-zinc-600 max-w-[200px] truncate">{jobTitle}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[a.status] ?? 'bg-zinc-100 text-zinc-500'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {a.status !== 'ACCEPTED' && (
                            <button
                              onClick={() => handleStatus(id, 'ACCEPTED')}
                              className="text-xs px-2.5 py-1 border border-emerald-200 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            >
                              Accept
                            </button>
                          )}
                          {a.status !== 'DECLINED' && (
                            <button
                              onClick={() => handleStatus(id, 'DECLINED')}
                              className="text-xs px-2.5 py-1 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-100 transition"
                            >
                              Decline
                            </button>
                          )}
                          {a.status !== 'PENDING' && (
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
