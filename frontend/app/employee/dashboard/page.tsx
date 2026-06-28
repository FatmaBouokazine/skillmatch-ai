'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getResumeScore, getJobMatches, getMyApplications } from '../../../services/employeeService';

export default function EmployeeDashboardPage() {
  const { user, loading } = useRequireAuth('EMPLOYEE');
  const [scoreData, setScoreData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getResumeScore(), getJobMatches(), getMyApplications()])
      .then(([score, jobs, apps]) => {
        setScoreData(score);
        setMatches(jobs.slice(0, 5));
        setApplications(Array.isArray(apps) ? apps : []);
      })
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

  const score = scoreData?.resumeScore ?? 0;
  const hints: string[] = Array.isArray(scoreData?.resumeHints) ? scoreData.resumeHints : [];
  const skillCount = user?.employeeProfile?.skills?.length ?? 0;
  const firstName = user?.employeeProfile?.firstName || '';

  const scoreColor = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-500' : 'text-red-500';
  const scoreBarColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';
  const scoreLabel = score >= 70 ? 'Strong' : score >= 40 ? 'Moderate' : 'Needs work';

  const pendingApps = applications.filter((a) => a.status === 'PENDING').length;
  const acceptedApps = applications.filter((a) => a.status === 'ACCEPTED').length;

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Welcome back{firstName ? `, ${firstName}` : ''}!
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Here&apos;s your career snapshot today.</p>
        </div>
        <Link
          href="/employee/resume"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#76cdcd] text-white text-sm font-semibold hover:bg-[#5ab5b5] transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Resume
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Resume Score */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#e0f5f5] flex items-center justify-center">
              <svg className="w-4 h-4 text-[#5ab5b5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <Link href="/employee/resume" className="text-xs text-zinc-400 hover:text-[#5ab5b5] transition font-medium">
              Improve →
            </Link>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Resume Score</p>
            <div className={`text-3xl font-bold ${scoreColor}`}>
              {score}<span className="text-base text-zinc-400 font-normal">/100</span>
            </div>
            <p className={`text-xs font-medium mt-0.5 ${scoreColor}`}>{scoreLabel}</p>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${scoreBarColor}`} style={{ width: `${score}%` }} />
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#e0f5f5] flex items-center justify-center">
              <svg className="w-4 h-4 text-[#5ab5b5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <Link href="/employee/skills" className="text-xs text-zinc-400 hover:text-[#5ab5b5] transition font-medium">
              Manage →
            </Link>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Skills Listed</p>
            <div className="text-3xl font-bold text-zinc-900">{skillCount}</div>
            <p className="text-xs text-zinc-400 mt-0.5">{skillCount === 0 ? 'No skills yet' : `${skillCount} skill${skillCount !== 1 ? 's' : ''} on profile`}</p>
          </div>
        </div>

        {/* Job Matches */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#e0f5f5] flex items-center justify-center">
              <svg className="w-4 h-4 text-[#5ab5b5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <Link href="/employee/jobs" className="text-xs text-zinc-400 hover:text-[#5ab5b5] transition font-medium">
              Browse →
            </Link>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Job Matches</p>
            <div className="text-3xl font-bold text-zinc-900">{matches.length}</div>
            <p className="text-xs text-zinc-400 mt-0.5">Positions matched to skills</p>
          </div>
        </div>

        {/* Applications */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-[#e0f5f5] flex items-center justify-center">
              <svg className="w-4 h-4 text-[#5ab5b5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <Link href="/employee/applications" className="text-xs text-zinc-400 hover:text-[#5ab5b5] transition font-medium">
              View all →
            </Link>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Applications</p>
            <div className="text-3xl font-bold text-zinc-900">{applications.length}</div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {acceptedApps > 0 ? `${acceptedApps} accepted` : pendingApps > 0 ? `${pendingApps} pending` : 'No applications yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Resume hints */}
      {hints.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className="text-sm font-semibold text-amber-800">Resume Improvement Tips</h2>
          </div>
          <ul className="space-y-2">
            {hints.map((h, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-amber-700">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-amber-200 text-amber-700 text-[10px] flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Matched Jobs */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-800">Top Matched Jobs</h2>
            <Link href="/employee/jobs" className="text-xs text-[#5ab5b5] hover:text-[#3e9999] font-medium transition">
              See all →
            </Link>
          </div>
          {matches.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-400">No matches yet.</p>
              <Link href="/employee/skills" className="text-xs text-[#5ab5b5] hover:underline mt-1 inline-block">
                Add skills to improve matching
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {matches.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-[#76cdcd]/40 hover:bg-[#e0f5f5]/30 transition">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 truncate">{job.title}</p>
                    <p className="text-xs text-zinc-400 truncate">
                      {job.employerProfile?.companyName || 'Company'} · {job.location || 'Remote'}
                    </p>
                  </div>
                  <div className="shrink-0 ml-3 text-right">
                    <span className={`text-sm font-bold ${job.matchPercentage >= 70 ? 'text-emerald-600' : job.matchPercentage >= 40 ? 'text-amber-500' : 'text-zinc-400'}`}>
                      {job.matchPercentage}%
                    </span>
                    <p className="text-[10px] text-zinc-400">match</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-800">Recent Applications</h2>
            <Link href="/employee/applications" className="text-xs text-[#5ab5b5] hover:text-[#3e9999] font-medium transition">
              See all →
            </Link>
          </div>
          {applications.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-zinc-400">No applications yet.</p>
              <Link href="/employee/jobs" className="text-xs text-[#5ab5b5] hover:underline mt-1 inline-block">
                Browse open positions
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {applications.slice(0, 5).map((app: any) => {
                const status = app.status as string;
                const badgeClass =
                  status === 'ACCEPTED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : status === 'DECLINED'
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-[#e0f5f5] text-[#3e9999] border-[#76cdcd]/40';
                const badgeLabel = status === 'ACCEPTED' ? 'Accepted' : status === 'DECLINED' ? 'Declined' : 'Pending';
                return (
                  <div key={app._id || app.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 transition">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-800 truncate">{app.jobPost?.title || 'Job'}</p>
                      <p className="text-xs text-zinc-400 truncate">
                        {app.jobPost?.employerProfile?.companyName || app.jobPost?.location || '—'}
                      </p>
                    </div>
                    <span className={`shrink-0 ml-3 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                      {badgeLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-zinc-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { href: '/employee/resume', label: 'Upload Resume', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
            { href: '/employee/skills', label: 'Add Skills', d: 'M12 4v16m8-8H4' },
            { href: '/employee/jobs', label: 'Browse Jobs', d: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
            { href: '/employee/profile', label: 'Edit Profile', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          ] as { href: string; label: string; d: string }[]).map(({ href, label, d }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-[#76cdcd] hover:bg-[#e0f5f5]/40 transition group text-center"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-100 group-hover:bg-[#76cdcd] flex items-center justify-center transition">
                <svg className="w-4 h-4 text-zinc-500 group-hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
                </svg>
              </div>
              <span className="text-xs font-medium text-zinc-600 group-hover:text-zinc-900 transition">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
