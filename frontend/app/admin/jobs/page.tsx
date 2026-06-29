'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getAdminJobs, updateAdminJob, deleteAdminJob } from '../../../services/adminService';

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-zinc-100 text-zinc-500',
};

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  REMOTE: 'Remote',
};

export default function AdminJobsPage() {
  const { user, loading } = useRequireAuth('ADMIN');
  const [jobs, setJobs] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setFetching(true);
    getAdminJobs(statusFilter || undefined)
      .then(setJobs)
      .catch(() => setError('Failed to load job posts'))
      .finally(() => setFetching(false));
  }, [statusFilter]);

  useEffect(() => { if (user) load(); }, [user, load]);

  const toggleStatus = async (id: string, current: string) => {
    const next = current === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await updateAdminJob(id, { status: next });
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to update job');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete job post "${title}"? This cannot be undone.`)) return;
    try {
      await deleteAdminJob(id);
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to delete job post');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Job Posts</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Review and manage all platform job listings.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'OPEN', 'CLOSED'].map((s) => (
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Posted</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {jobs.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-zinc-400 text-sm">No job posts found.</td></tr>
                )}
                {jobs.map((j) => (
                  <tr key={j._id || j.id} className="hover:bg-zinc-50 transition">
                    <td className="px-4 py-3 font-medium text-zinc-800 max-w-[180px] truncate">{j.title}</td>
                    <td className="px-4 py-3 text-zinc-600 max-w-[140px] truncate">
                      {j.employer?.companyName || '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{TYPE_LABELS[j.type] ?? j.type}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs max-w-[120px] truncate">{j.location || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[j.status] ?? 'bg-zinc-100 text-zinc-500'}`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {j.createdAt ? new Date(j.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(j._id || j.id, j.status)}
                          className="text-xs px-2.5 py-1 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-100 transition"
                        >
                          {j.status === 'OPEN' ? 'Close' : 'Reopen'}
                        </button>
                        <button
                          onClick={() => handleDelete(j._id || j.id, j.title)}
                          className="text-xs px-2.5 py-1 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
