'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '../../../../../hooks/useRequireAuth';
import { getJobMatches, sendInvite } from '../../../../../services/employerService';

function MatchBar({ value }: { value: number }) {
  const capped = Math.min(100, Math.max(0, value));
  const color =
    capped >= 70 ? 'bg-violet-600' : capped >= 40 ? 'bg-violet-400' : 'bg-zinc-300';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${capped}%` }} />
      </div>
      <span
        className={`text-sm font-bold ${
          capped >= 70 ? 'text-violet-600' : capped >= 40 ? 'text-violet-400' : 'text-zinc-400'
        }`}
      >
        {capped}%
      </span>
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

export default function JobMatchesPage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const params = useParams();
  const jobId = params?.id as string;
  const [matches, setMatches] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [inviting, setInviting] = useState<string | null>(null);
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!user || !jobId) return;
    getJobMatches(jobId)
      .then(setMatches)
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user, jobId]);

  const handleInvite = async (employeeProfileId: string) => {
    setInviting(employeeProfileId);
    setMsg(null);
    try {
      await sendInvite({ jobPostId: jobId, employeeProfileId });
      setInvited((prev) => new Set(prev).add(employeeProfileId));
      setMsg({ type: 'success', text: 'Invite sent successfully!' });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Failed to send invite.' });
    } finally {
      setInviting(null);
    }
  };

  if (loading || fetching) return <Spinner />;

  const topMatches = matches.filter((m) => m.matchPercentage >= 70).length;
  const strongMatches = matches.filter((m) => m.matchPercentage >= 50).length;

  return (
    <div className="space-y-6 ">

      {/* Breadcrumb + Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/employer/jobs" className="text-xs font-medium text-zinc-400 hover:text-zinc-700 transition">
            ← Job Posts
          </Link>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">AI Matched Candidates</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {matches.length} candidate{matches.length !== 1 ? 's' : ''} ranked by AI · skills, title, experience &amp; education
              {topMatches > 0 && (
                <span className="ml-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {topMatches} strong match{topMatches !== 1 ? 'es' : ''}
                </span>
              )}
              {topMatches === 0 && strongMatches > 0 && (
                <span className="ml-2 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  {strongMatches} good match{strongMatches !== 1 ? 'es' : ''}
                </span>
              )}
            </p>
          </div>
          <Link
            href="/employer/invites"
            className="shrink-0 text-xs px-3 py-2 rounded-xl border border-zinc-200 font-medium text-zinc-600 hover:bg-zinc-50 transition"
          >
            View Invites →
          </Link>
        </div>
      </div>

      {/* Alert */}
      {msg && (
        <div
          className={`p-3 rounded-xl text-sm font-medium border ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-600 border-red-200'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Empty State */}
      {matches.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-500 mb-1">No candidates found</p>
          <p className="text-xs text-zinc-400">Add required skills, a job title, and a description to your job post so the AI can rank candidates for you.</p>
          <Link
            href="/employer/jobs"
            className="inline-block mt-4 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition"
          >
            Edit Job Post
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          {/* Column Headers */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 border-b border-zinc-100 bg-zinc-50">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Candidate</span>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden sm:block">Location</span>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden md:block">Resume Score</span>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">AI Match</span>
            <span />
          </div>

          {/* Rows */}
          <div className="divide-y divide-zinc-100">
            {matches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((emp) => {
              const name = emp.firstName || emp.lastName ? `${emp.firstName} ${emp.lastName}`.trim() : 'Unnamed';
              const initials = ((emp.firstName?.[0] ?? '') + (emp.lastName?.[0] ?? '')).toUpperCase() || '?';
              const score = emp.resumeScore ?? 0;
              const scoreColor = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-500' : 'text-zinc-400';
              const isInvited = invited.has(emp.id);
              const mp = emp.matchPercentage;
              const matchLabel = mp >= 70 ? { text: 'Strong', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
                : mp >= 50 ? { text: 'Good', cls: 'text-violet-700 bg-violet-50 border-violet-200' }
                : mp >= 30 ? { text: 'Fair', cls: 'text-amber-700 bg-amber-50 border-amber-200' }
                : { text: 'Low', cls: 'text-zinc-500 bg-zinc-50 border-zinc-200' };

              return (
                <div
                  key={emp.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-zinc-50/60 transition"
                >
                  {/* Candidate */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">{name}</p>
                      <p className="text-xs text-zinc-400 truncate">{emp.title || '—'}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="hidden sm:block">
                    <span className="text-sm text-zinc-500 whitespace-nowrap">{emp.location || '—'}</span>
                  </div>

                  {/* Resume Score */}
                  <div className="hidden md:block">
                    <span className={`text-sm font-bold ${scoreColor}`}>{score}</span>
                    <span className="text-xs text-zinc-400">/100</span>
                  </div>

                  {/* Match % with bar */}
                  <div className="flex flex-col items-end gap-1">
                    <MatchBar value={emp.matchPercentage} />
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${matchLabel.cls}`}>
                      {matchLabel.text}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/employer/employees/${emp.id}`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 font-medium text-zinc-600 hover:bg-zinc-100 transition whitespace-nowrap"
                    >
                      Profile
                    </Link>
                    {isInvited ? (
                      <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium whitespace-nowrap">
                        Invited ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInvite(emp.id)}
                        disabled={inviting === emp.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 transition disabled:opacity-50 whitespace-nowrap"
                      >
                        {inviting === emp.id ? '…' : 'Invite'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {matches.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, matches.length)} of {matches.length} candidates
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50 transition"
            >
              ← Prev
            </button>
            <button
              disabled={(page + 1) * PAGE_SIZE >= matches.length}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50 transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}