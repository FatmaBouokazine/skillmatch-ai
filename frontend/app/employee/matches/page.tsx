'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getAIJobMatches, applyForJob } from '../../../services/employeeService';

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME:  'Full Time',
  PART_TIME:  'Part Time',
  CONTRACT:   'Contract',
  REMOTE:     'Remote',
};

function MatchBadge({ pct }: { pct: number }) {
  const color =
    pct >= 85 ? 'bg-emerald-500 text-white' :
    pct >= 70 ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
    pct >= 55 ? 'bg-[#e0f5f5] text-[#3e9999] border border-[#76cdcd]/50' :
                'bg-amber-50 text-amber-600 border border-amber-200';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${color}`}>
      {pct}%
    </span>
  );
}

function MatchBar({ pct }: { pct: number }) {
  const bar =
    pct >= 85 ? 'bg-emerald-500' :
    pct >= 70 ? 'bg-emerald-400' :
    pct >= 55 ? 'bg-[#76cdcd]' :
                'bg-amber-300';
  return (
    <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function BreakdownBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-zinc-500 shrink-0">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-zinc-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right font-medium text-zinc-600">{value}%</span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-[#76cdcd] animate-spin" />
    </div>
  );
}

export default function AIMatchesPage() {
  const { user, loading } = useRequireAuth('EMPLOYEE');
  const [jobs, setJobs]     = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<string | null>(null);

  // Apply modal
  const [applyJob, setApplyJob]     = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying]     = useState(false);
  const [applyMsg, setApplyMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    getAIJobMatches()
      .then(setJobs)
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  const handleApply = async () => {
    if (!applyJob) return;
    setApplying(true);
    setApplyMsg(null);
    try {
      await applyForJob(applyJob.id, coverLetter.trim());
      setJobs((prev) => prev.map((j) => (j.id === applyJob.id ? { ...j, hasApplied: true } : j)));
      setApplyMsg({ type: 'success', text: 'Application submitted successfully!' });
      setTimeout(() => { setApplyJob(null); setCoverLetter(''); setApplyMsg(null); }, 1500);
    } catch (err: any) {
      setApplyMsg({ type: 'error', text: err.message || 'Failed to submit application.' });
    } finally {
      setApplying(false);
    }
  };

  if (loading || fetching) return <Spinner />;

  const filtered = jobs.filter((j) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      j.title?.toLowerCase().includes(q) ||
      j.employerProfile?.companyName?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q) ||
      (j.requiredSkills || []).some((s: string) => s.toLowerCase().includes(q))
    );
  });

  const perfectMatches  = jobs.filter((j) => j.matchPercentage >= 85).length;
  const strongMatches   = jobs.filter((j) => j.matchPercentage >= 70).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-[#76cdcd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h1 className="text-xl font-bold text-zinc-900">AI Job Matches</h1>
          </div>
          <p className="text-sm text-zinc-500">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} matched ≥ 50% · scored by skills, title, experience &amp; education
            {perfectMatches > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                ✦ {perfectMatches} perfect match{perfectMatches !== 1 ? 'es' : ''}
              </span>
            )}
            {strongMatches > 0 && strongMatches !== perfectMatches && (
              <span className="ml-1 inline-flex items-center gap-1 text-xs font-semibold text-[#3e9999] bg-[#e0f5f5] border border-[#76cdcd]/40 px-2 py-0.5 rounded-full">
                {strongMatches} strong match{strongMatches !== 1 ? 'es' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title, company, location or skill…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#76cdcd] focus:ring-2 focus:ring-[#e0f5f5] transition"
        />
      </div>

      {/* Empty state */}
      {jobs.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#e0f5f5] flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#76cdcd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-zinc-700 mb-1">No matches found yet</p>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Complete your profile — add your title, skills, experience and education so the AI can find the best job matches for you.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center">
          <p className="text-sm text-zinc-400">No jobs match your filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 hover:border-[#76cdcd]/40 transition"
            >
              {/* Top row: info + badge + apply */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Link
                      href={`/employee/jobs/${job.id}`}
                      className="text-sm font-bold text-zinc-900 hover:text-[#3e9999] hover:underline truncate"
                    >
                      {job.title}
                    </Link>
                    {job.hasApplied && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e0f5f5] text-[#3e9999] border border-[#76cdcd]/40 shrink-0">
                        Applied ✓
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                    {job.employerProfile?.companyName && (
                      <span className="font-medium text-zinc-700">{job.employerProfile.companyName}</span>
                    )}
                    {job.location && (
                      <span className="flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded-full text-[11px] font-medium">
                      {TYPE_LABELS[job.type] || job.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <MatchBadge pct={job.matchPercentage} />
                  <button
                    onClick={() => { setApplyJob(job); setCoverLetter(''); setApplyMsg(null); }}
                    disabled={job.hasApplied}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
                      job.hasApplied
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                        : 'bg-[#76cdcd] text-white hover:bg-[#5ab5b5]'
                    }`}
                  >
                    {job.hasApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* AI Match bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">AI Match</span>
                  {job.matchedSkills?.length > 0 && (
                    <span className="text-[10px] text-zinc-400">
                      {job.matchedSkills.length}/{(job.requiredSkills || []).length} skills matched
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <MatchBar pct={job.matchPercentage} />
                </div>
              </div>

              {/* Skills */}
              {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.map((skill: string) => {
                    const hit = (job.matchedSkills || []).includes(skill.toLowerCase());
                    return (
                      <span
                        key={skill}
                        className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                          hit
                            ? 'bg-[#e0f5f5] text-[#3e9999] border-[#76cdcd]/40'
                            : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                        }`}
                      >
                        {hit ? '✓ ' : ''}{skill}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Description */}
              {job.description && (
                <div>
                  <p className={`text-xs text-zinc-500 leading-relaxed ${expanded === job.id ? '' : 'line-clamp-2'}`}>
                    {job.description}
                  </p>
                  {job.description.length > 120 && (
                    <button
                      onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                      className="text-[11px] text-[#5ab5b5] hover:text-[#3e9999] hover:underline mt-0.5"
                    >
                      {expanded === job.id ? 'Show less ↑' : 'Show more ↓'}
                    </button>
                  )}
                </div>
              )}

              {/* Why this match breakdown */}
              {job.breakdown && (
                <div>
                  <button
                    onClick={() => setBreakdown(breakdown === job.id ? null : job.id)}
                    className="text-[11px] font-medium text-zinc-400 hover:text-[#76cdcd] transition flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {breakdown === job.id ? 'Hide breakdown ↑' : 'Why this match? ↓'}
                  </button>
                  {breakdown === job.id && (
                    <div className="mt-2 pt-2 border-t border-zinc-100 space-y-1.5">
                      <BreakdownBar value={job.breakdown.skillScore}  label="Skills"       color="bg-emerald-400" />
                      <BreakdownBar value={job.breakdown.titleScore}  label="Job Title"    color="bg-[#76cdcd]" />
                      <BreakdownBar value={job.breakdown.descScore}   label="Experience"   color="bg-violet-400" />
                      <BreakdownBar value={job.breakdown.eduScore}    label="Education"    color="bg-amber-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {applyJob && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setApplyJob(null); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Apply for Position</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {applyJob.title} · {applyJob.employerProfile?.companyName || 'Company'}
                </p>
              </div>
              <button
                onClick={() => setApplyJob(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {applyMsg && (
                <div className={`p-3 rounded-xl text-sm font-medium border ${
                  applyMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {applyMsg.text}
                </div>
              )}
              <div className="space-y-1.5">
                <label htmlFor="cover" className="text-xs font-semibold text-zinc-600">
                  Cover Letter <span className="font-normal text-zinc-400">(optional)</span>
                </label>
                <textarea
                  id="cover"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  placeholder="Tell the employer why you're a great fit…"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#76cdcd] focus:ring-2 focus:ring-[#e0f5f5] transition resize-none"
                />
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button
                onClick={() => setApplyJob(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-5 py-2 text-sm font-semibold bg-[#76cdcd] text-white rounded-xl hover:bg-[#5ab5b5] transition disabled:opacity-50"
              >
                {applying ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
