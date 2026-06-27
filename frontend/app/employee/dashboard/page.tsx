'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getResumeScore, getJobMatches } from '../../../services/employeeService';

export default function EmployeeDashboardPage() {
  const { user, loading } = useRequireAuth('EMPLOYEE');
  const [scoreData, setScoreData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getResumeScore(), getJobMatches()])
      .then(([score, jobs]) => {
        setScoreData(score);
        setMatches(jobs.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching) {
    return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" /></div>;
  }

  const score = scoreData?.resumeScore ?? 0;
  const hints: string[] = Array.isArray(scoreData?.resumeHints) ? scoreData.resumeHints : [];
  const scoreColor = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-red-500';
  const scoreBarColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Welcome back{user?.employeeProfile?.firstName ? `, ${user.employeeProfile.firstName}` : ''}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Resume Score Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Resume Score</span>
            <Link href="/employee/resume" className="text-xs text-zinc-400 hover:text-zinc-700 underline">Improve</Link>
          </div>
          <div className={`text-4xl font-bold ${scoreColor}`}>{score}<span className="text-lg text-zinc-400 font-normal">/100</span></div>
          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div className={`h-2 rounded-full transition-all duration-500 ${scoreBarColor}`} style={{ width: `${score}%` }} />
          </div>
        </div>

        {/* Skills summary */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block">Skills Listed</span>
          <div className="text-4xl font-bold text-zinc-900">
            {user?.employeeProfile?.skills?.length ?? 0}
          </div>
          <Link href="/employee/skills" className="text-xs text-zinc-500 hover:text-zinc-800 underline">Manage skills →</Link>
        </div>

        {/* Job matches */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block">Job Matches</span>
          <div className="text-4xl font-bold text-zinc-900">{matches.length}</div>
          <Link href="/employee/dashboard#matches" className="text-xs text-zinc-500 hover:text-zinc-800 underline">View matches →</Link>
        </div>
      </div>

      {/* Hints Panel */}
      {hints.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-amber-800 mb-3">💡 Resume Improvement Hints</h2>
          <ul className="space-y-2">
            {hints.map((h, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-700">
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-amber-200 text-amber-700 text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Matched Jobs */}
      <div id="matches" className="bg-white border border-zinc-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-800">Top Matched Jobs</h2>
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-zinc-400">No job matches yet. <Link href="/employee/skills" className="underline text-zinc-600">Add skills</Link> to improve matching.</p>
        ) : (
          <div className="space-y-3">
            {matches.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 transition">
                <div>
                  <p className="text-sm font-medium text-zinc-800">{job.title}</p>
                  <p className="text-xs text-zinc-500">{job.employerProfile?.companyName || 'Company'} · {job.location || 'Remote'}</p>
                </div>
                <span className={`text-sm font-bold ${job.matchPercentage >= 70 ? 'text-emerald-600' : job.matchPercentage >= 40 ? 'text-amber-600' : 'text-zinc-400'}`}>
                  {job.matchPercentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
