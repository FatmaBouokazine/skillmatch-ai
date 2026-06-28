'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getApplications, updateApplication } from '../../../services/employerService';

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  PENDING:  { label: 'Pending',  classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
  ACCEPTED: { label: 'Accepted', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  DECLINED: { label: 'Declined', classes: 'bg-red-50 text-red-500 border border-red-200' },
};

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

export default function EmployerApplicationsPage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const [applications, setApplications] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'DECLINED'>('ALL');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!user) return;
    getApplications()
      .then(setApplications)
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  const handleStatusChange = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    setUpdating(id);
    try {
      await updateApplication(id, status);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch {
      // silently ignore
    } finally {
      setUpdating(null);
    }
  };

  if (loading || fetching) return <Spinner />;

  const filtered = filter === 'ALL' ? applications : applications.filter((a) => a.status === filter);
  const counts = {
    ALL:      applications.length,
    PENDING:  applications.filter((a) => a.status === 'PENDING').length,
    ACCEPTED: applications.filter((a) => a.status === 'ACCEPTED').length,
    DECLINED: applications.filter((a) => a.status === 'DECLINED').length,
  };

  const tabs: { key: typeof filter; label: string }[] = [
    { key: 'ALL',      label: 'All' },
    { key: 'PENDING',  label: 'Pending' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'DECLINED', label: 'Declined' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Applications</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {applications.length} application{applications.length !== 1 ? 's' : ''} received from candidates
          </p>
        </div>
      </div>

      {/* Summary Strip */}
      {applications.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pending',  count: counts.PENDING,  classes: 'bg-amber-50 border-amber-200 text-amber-700' },
            { label: 'Accepted', count: counts.ACCEPTED, classes: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
            { label: 'Declined', count: counts.DECLINED, classes: 'bg-red-50 border-red-200 text-red-500' },
          ].map(({ label, count, classes }) => (
            <div key={label} className={`rounded-xl border p-4 text-center ${classes}`}>
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs font-semibold mt-0.5 opacity-80">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      {applications.length > 0 && (
        <div className="flex gap-1.5 bg-zinc-100 rounded-xl p-1 w-fit">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setPage(0); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === key
                  ? 'bg-white text-violet-600 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {label}
              <span className="ml-1.5 text-[10px] opacity-70">({counts[key]})</span>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-500 mb-1">No applications yet</p>
          <p className="text-xs text-zinc-400 mb-4">Candidates who apply to your open jobs will appear here.</p>
          <Link
            href="/employer/jobs"
            className="inline-block px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition"
          >
            Manage Job Posts
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center">
          <p className="text-sm text-zinc-400">No {filter.toLowerCase()} applications.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 items-center px-5 py-3 border-b border-zinc-100 bg-zinc-50">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Applicant</span>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden md:block">Applied For</span>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</span>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden sm:block">Date</span>
            <span />
          </div>

          {/* Rows */}
          <div>
            {filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((app) => {
              const statusCfg = STATUS_CONFIG[app.status] ?? { label: app.status, classes: 'bg-zinc-100 text-zinc-500 border border-zinc-200' };
              const candidateName = `${app.employeeProfile?.firstName || ''} ${app.employeeProfile?.lastName || ''}`.trim() || 'Unnamed Candidate';

              return (
                <div key={app.id} className="border-b border-zinc-100 last:border-0">
                  <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-zinc-50/60 transition">
                    {/* Applicant */}
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {((app.employeeProfile?.firstName?.[0] ?? '') + (app.employeeProfile?.lastName?.[0] ?? '')).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-800 truncate">{candidateName}</p>
                          <p className="text-xs text-zinc-400 truncate">{app.employeeProfile?.title || 'â€”'}</p>
                          {app.coverLetter && (
                            <button
                              onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                              className="text-[10px] text-violet-500 hover:text-violet-700 hover:underline mt-0.5"
                            >
                              {expandedApp === app.id ? 'Hide cover letter â†‘' : 'View cover letter â†“'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Job Post */}
                    <div className="hidden md:block">
                      <p className="text-sm text-zinc-700 truncate font-medium">{app.jobPost?.title || 'â€”'}</p>
                      {app.jobPost?.type && (
                        <p className="text-xs text-zinc-400 truncate">{app.jobPost.type.replace('_', ' ')}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.classes}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="hidden sm:block">
                      <span className="text-xs text-zinc-400 whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/employer/employees/${app.employeeProfile?.id}`}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 font-medium text-zinc-600 hover:bg-zinc-100 transition whitespace-nowrap"
                      >
                        Profile
                      </Link>
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            disabled={updating === app.id}
                            onClick={() => handleStatusChange(app.id, 'ACCEPTED')}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 font-semibold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-40"
                          >
                            Accept
                          </button>
                          <button
                            disabled={updating === app.id}
                            onClick={() => handleStatusChange(app.id, 'DECLINED')}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-40"
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Cover letter expansion */}
                  {expandedApp === app.id && app.coverLetter && (
                    <div className="px-5 pb-3">
                      <div className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">Cover letter</p>
                        <p className="text-sm text-zinc-600 leading-relaxed">{app.coverLetter}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Showing {page * PAGE_SIZE + 1}â€“{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} applications
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50 transition"
            >
              â† Prev
            </button>
            <button
              disabled={(page + 1) * PAGE_SIZE >= filtered.length}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50 transition"
            >
              Next â†’
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

