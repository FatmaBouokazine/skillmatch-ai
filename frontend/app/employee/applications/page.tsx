'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getMyApplications } from '../../../services/employeeService';

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  REMOTE: 'Remote',
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DECLINED: 'bg-red-50 text-red-600 border-red-200',
    PENDING: 'bg-[#e0f5f5] text-[#3e9999] border-[#76cdcd]/40',
  };
  const label: Record<string, string> = {
    ACCEPTED: 'Accepted',
    DECLINED: 'Declined',
    PENDING: 'Pending',
  };
  const cls = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cls}`}>
      {status === 'ACCEPTED' && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === 'DECLINED' && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {label[status] ?? status}
    </span>
  );
}

export default function EmployeeApplicationsPage() {
  const { user, loading } = useRequireAuth('EMPLOYEE');
  const [applications, setApplications] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'DECLINED'>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getMyApplications()
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-[#76cdcd] animate-spin" />
      </div>
    );
  }

  const filtered = filter === 'ALL' ? applications : applications.filter((a) => a.status === filter);

  const counts = {
    ALL: applications.length,
    PENDING: applications.filter((a) => a.status === 'PENDING').length,
    ACCEPTED: applications.filter((a) => a.status === 'ACCEPTED').length,
    DECLINED: applications.filter((a) => a.status === 'DECLINED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">My Applications</h1>
        <p className="text-sm text-zinc-500 mt-1">Track the status of every job you&apos;ve applied to.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['ALL', 'PENDING', 'ACCEPTED', 'DECLINED'] as const).map((s) => {
          const colorMap: Record<string, string> = {
            ALL: 'text-zinc-900',
            PENDING: 'text-[#3e9999]',
            ACCEPTED: 'text-emerald-600',
            DECLINED: 'text-red-500',
          };
          const bgMap: Record<string, string> = {
            ALL: filter === 'ALL' ? 'border-[#76cdcd] bg-[#e0f5f5]/30' : 'border-zinc-200 hover:border-zinc-300',
            PENDING: filter === 'PENDING' ? 'border-[#76cdcd] bg-[#e0f5f5]/30' : 'border-zinc-200 hover:border-zinc-300',
            ACCEPTED: filter === 'ACCEPTED' ? 'border-emerald-300 bg-emerald-50/40' : 'border-zinc-200 hover:border-zinc-300',
            DECLINED: filter === 'DECLINED' ? 'border-red-300 bg-red-50/40' : 'border-zinc-200 hover:border-zinc-300',
          };
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`bg-white border rounded-xl p-4 text-left transition cursor-pointer ${bgMap[s]}`}
            >
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">{s === 'ALL' ? 'Total' : s.charAt(0) + s.slice(1).toLowerCase()}</p>
              <p className={`text-2xl font-bold ${colorMap[s]}`}>{counts[s]}</p>
            </button>
          );
        })}
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          {filter === 'ALL' ? (
            <>
              <p className="text-sm font-medium text-zinc-500 mb-1">No applications yet</p>
              <p className="text-xs text-zinc-400 mb-4">Apply to jobs to start tracking your progress here.</p>
              <Link
                href="/employee/jobs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#76cdcd] text-white text-sm font-semibold rounded-xl hover:bg-[#5ab5b5] transition"
              >
                Browse Jobs
              </Link>
            </>
          ) : (
            <p className="text-sm text-zinc-400">No {filter.toLowerCase()} applications.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app: any) => {
            const id = app._id || app.id;
            const isExpanded = expanded === id;
            const job = app.jobPost || {};
            return (
              <div key={id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 transition">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="text-sm font-bold text-zinc-900">{job.title || 'Job'}</h2>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        {job.employerProfile?.companyName && (
                          <span className="font-medium text-zinc-700">{job.employerProfile.companyName}</span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                        )}
                        {job.type && (
                          <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded-full text-[11px] font-medium">
                            {TYPE_LABELS[job.type] || job.type}
                          </span>
                        )}
                        {app.createdAt && (
                          <span className="text-zinc-400">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    {app.coverLetter && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : id)}
                        className="shrink-0 text-xs text-zinc-400 hover:text-zinc-700 transition flex items-center gap-1"
                      >
                        Cover letter
                        <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Required skills */}
                  {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.requiredSkills.map((skill: string) => (
                        <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cover letter drawer */}
                {isExpanded && app.coverLetter && (
                  <div className="border-t border-zinc-100 px-5 py-4 bg-zinc-50">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Your Cover Letter</p>
                    <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">{app.coverLetter}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
