'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '../../../../hooks/useRequireAuth';
import { getJobDetail, applyForJob } from '../../../../services/employeeService';

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT:  'Contract',
  REMOTE:    'Remote',
};

function MatchBar({ pct }: { pct: number }) {
  const bar =
    pct >= 85 ? 'bg-emerald-500' :
    pct >= 70 ? 'bg-emerald-400' :
    pct >= 55 ? 'bg-[#76cdcd]' :
                'bg-amber-300';
  const text =
    pct >= 85 ? 'text-emerald-600' :
    pct >= 70 ? 'text-emerald-500' :
    pct >= 55 ? 'text-[#3e9999]' :
    pct >= 50 ? 'text-amber-500' :
                'text-zinc-400';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-zinc-500 uppercase tracking-wide">AI Match Score</span>
        <span className={`font-bold text-base ${text}`}>{pct}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function BreakdownBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-24 text-zinc-500 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right font-semibold text-zinc-600">{value}%</span>
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

export default function JobDetailPage() {
  const { user, loading } = useRequireAuth('EMPLOYEE');
  const params   = useParams();
  const router   = useRouter();
  const jobId    = params?.id as string;

  const [job, setJob]         = useState<any | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Apply
  const [showApply, setShowApply]     = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying]       = useState(false);
  const [applyMsg, setApplyMsg]       = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasApplied, setHasApplied]   = useState(false);

  useEffect(() => {
    if (!user || !jobId) return;
    getJobDetail(jobId)
      .then((data) => {
        setJob(data);
        setHasApplied(data.hasApplied ?? false);
      })
      .catch((err) => {
        if (err?.status === 404 || err?.message?.includes('404')) setNotFound(true);
      })
      .finally(() => setFetching(false));
  }, [user, jobId]);

  const handleApply = async () => {
    setApplying(true);
    setApplyMsg(null);
    try {
      await applyForJob(jobId, coverLetter.trim());
      setHasApplied(true);
      setApplyMsg({ type: 'success', text: 'Application submitted successfully!' });
      setTimeout(() => { setShowApply(false); setCoverLetter(''); setApplyMsg(null); }, 1600);
    } catch (err: any) {
      setApplyMsg({ type: 'error', text: err.message || 'Failed to submit application.' });
    } finally {
      setApplying(false);
    }
  };

  if (loading || fetching) return <Spinner />;

  if (notFound || !job) {
    return (
      <div className="space-y-6">
        <Link href="/employee/jobs" className="text-xs font-medium text-zinc-400 hover:text-zinc-700 transition">
          ← Back to Jobs
        </Link>
        <div className="bg-white border border-zinc-200 rounded-2xl p-14 text-center">
          <p className="text-sm font-medium text-zinc-500">Job not found or no longer open.</p>
          <Link href="/employee/jobs" className="inline-block mt-4 text-xs text-[#5ab5b5] hover:underline">
            Browse all jobs →
          </Link>
        </div>
      </div>
    );
  }

  const pct = job.matchPercentage ?? 0;
  const badgeColor =
    pct >= 85 ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
    pct >= 70 ? 'bg-[#e0f5f5] text-[#3e9999] border-[#76cdcd]/50' :
    pct >= 50 ? 'bg-amber-50 text-amber-600 border-amber-200' :
                'bg-zinc-100 text-zinc-500 border-zinc-200';

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Back nav */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-700 transition"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Header card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-zinc-900 leading-tight">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-zinc-500">
              {job.employerProfile?.companyName && (
                <span className="font-semibold text-zinc-700">{job.employerProfile.companyName}</span>
              )}
              {job.location && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </span>
              )}
              {job.type && (
                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full text-xs font-medium">
                  {TYPE_LABELS[job.type] || job.type}
                </span>
              )}
              {job.createdAt && (
                <span className="text-zinc-400 text-xs">
                  Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Match badge */}
          {pct > 0 && (
            <span className={`shrink-0 text-sm font-bold px-3 py-1.5 rounded-full border ${badgeColor}`}>
              {pct}% match
            </span>
          )}
        </div>

        {/* Apply button */}
        <div className="flex items-center gap-3 pt-1">
          {hasApplied ? (
            <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Application Submitted
            </span>
          ) : (
            <button
              onClick={() => { setShowApply(true); setCoverLetter(''); setApplyMsg(null); }}
              className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-[#76cdcd] text-white hover:bg-[#5ab5b5] transition"
            >
              Apply Now
            </button>
          )}
          {job.employerProfile?.website && (
            <a
              href={job.employerProfile.website}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 text-sm font-medium rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition"
            >
              Company Website ↗
            </a>
          )}
        </div>
      </div>

      {/* AI Match card */}
      {pct > 0 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#76cdcd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Match Analysis
          </h2>
          <MatchBar pct={pct} />
          {job.breakdown && (
            <div className="pt-2 border-t border-zinc-100 space-y-2">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-2">Score Breakdown</p>
              <BreakdownBar value={job.breakdown.skillScore}  label="Skills"       color="bg-emerald-400" />
              <BreakdownBar value={job.breakdown.titleScore}  label="Job Title"    color="bg-[#76cdcd]" />
              <BreakdownBar value={job.breakdown.descScore}   label="Experience"   color="bg-violet-400" />
              <BreakdownBar value={job.breakdown.eduScore}    label="Education"    color="bg-amber-400" />
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {job.description && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-2">
          <h2 className="text-sm font-semibold text-zinc-800">Job Description</h2>
          <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>
      )}

      {/* Required Skills */}
      {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-800">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill: string) => {
              const hit = (job.matchedSkills || []).includes(skill.toLowerCase());
              return (
                <span
                  key={skill}
                  className={`text-sm px-3 py-1 rounded-full border font-medium ${
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
          {job.matchedSkills?.length > 0 && (
            <p className="text-xs text-zinc-400">
              You match <span className="font-semibold text-[#3e9999]">{job.matchedSkills.length}</span> of{' '}
              {job.requiredSkills.length} required skills.
              {job.matchedSkills.length < job.requiredSkills.length && (
                <> Consider adding the missing skills to your profile.</>
              )}
            </p>
          )}
        </div>
      )}

      {/* Company info */}
      {(job.employerProfile?.description || job.employerProfile?.website) && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-2">
          <h2 className="text-sm font-semibold text-zinc-800">About {job.employerProfile?.companyName || 'the Company'}</h2>
          {job.employerProfile.description && (
            <p className="text-sm text-zinc-600 leading-relaxed">{job.employerProfile.description}</p>
          )}
          {job.employerProfile.website && (
            <a
              href={job.employerProfile.website}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs text-[#5ab5b5] hover:underline"
            >
              {job.employerProfile.website} ↗
            </a>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {showApply && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowApply(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Apply for Position</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {job.title} · {job.employerProfile?.companyName || 'Company'}
                </p>
              </div>
              <button
                onClick={() => setShowApply(false)}
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
                onClick={() => setShowApply(false)}
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
