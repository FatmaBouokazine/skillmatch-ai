'use client';

import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getJobMatches, applyForJob } from '../../../services/employeeService';

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  REMOTE: 'Remote',
};

function MatchBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? 'bg-violet-600' : pct >= 40 ? 'bg-violet-400' : 'bg-zinc-300';
  const textColor = pct >= 70 ? 'text-violet-700' : pct >= 40 ? 'text-violet-500' : 'text-zinc-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${textColor}`}>{pct}%</span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

export default function EmployeeJobsPage() {
  const { user, loading } = useRequireAuth('EMPLOYEE');
  const [jobs, setJobs] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');

  // Apply modal state
  const [applyJob, setApplyJob] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Expanded description
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getJobMatches()
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
      setTimeout(() => {
        setApplyJob(null);
        setCoverLetter('');
        setApplyMsg(null);
      }, 1500);
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

  const appliedCount = jobs.filter((j) => j.hasApplied).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Browse Jobs</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {jobs.length} open position{jobs.length !== 1 ? 's' : ''} matched to your skills
            {appliedCount > 0 && ` · ${appliedCount} applied`}
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
          placeholder="Search by title, company, location or skill…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
        />
      </div>

      {/* Empty state */}
      {jobs.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-500 mb-1">No open jobs yet</p>
          <p className="text-xs text-zinc-400">Add skills to your profile to improve your match rate.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center">
          <p className="text-sm text-zinc-400">No jobs match your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <div key={job.id} className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 hover:border-violet-200 transition">
              <div className="flex items-start justify-between gap-3">
                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-sm font-bold text-zinc-900 truncate">{job.title}</h2>
                    {job.hasApplied && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 shrink-0">
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
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

                {/* Apply Button */}
                <button
                  onClick={() => { setApplyJob(job); setCoverLetter(''); setApplyMsg(null); }}
                  disabled={job.hasApplied}
                  className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-xl transition ${
                    job.hasApplied
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  }`}
                >
                  {job.hasApplied ? 'Applied' : 'Apply Now'}
                </button>
              </div>

              {/* Match bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Skill Match</span>
                  {job.matchedSkills?.length > 0 && (
                    <span className="text-[10px] text-zinc-400">
                      {job.matchedSkills.length}/{(job.requiredSkills || []).length} skills matched
                    </span>
                  )}
                </div>
                <MatchBar pct={job.matchPercentage ?? 0} />
              </div>

              {/* Skills */}
              {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.map((skill: string) => {
                    const matched = (job.matchedSkills || []).includes(skill.toLowerCase());
                    return (
                      <span
                        key={skill}
                        className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                          matched
                            ? 'bg-violet-50 text-violet-700 border-violet-200'
                            : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                        }`}
                      >
                        {matched ? '✓ ' : ''}{skill}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Description */}
              {job.description && (
                <div>
                  <p className={`text-xs text-zinc-500 leading-relaxed ${expandedJob === job.id ? '' : 'line-clamp-2'}`}>
                    {job.description}
                  </p>
                  {job.description.length > 120 && (
                    <button
                      onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                      className="text-[11px] text-violet-500 hover:text-violet-700 hover:underline mt-0.5"
                    >
                      {expandedJob === job.id ? 'Show less ↑' : 'Show more ↓'}
                    </button>
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
          onClick={(e) => { if (e.target === e.currentTarget) { setApplyJob(null); } }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Apply for Position</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{applyJob.title} · {applyJob.employerProfile?.companyName || 'Company'}</p>
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

            {/* Modal Body */}
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
                <label htmlFor="coverLetter" className="text-xs font-semibold text-zinc-600">
                  Cover Letter <span className="font-normal text-zinc-400">(optional)</span>
                </label>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  placeholder="Briefly explain why you're a great fit for this role…"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 pb-4 flex gap-3">
              <button
                onClick={() => setApplyJob(null)}
                className="flex-1 py-2.5 border border-zinc-200 text-sm font-semibold text-zinc-600 rounded-xl hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {applying && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                {applying ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
