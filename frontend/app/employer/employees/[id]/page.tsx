'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '../../../../hooks/useRequireAuth';
import { getEmployee, sendInvite, getJobs } from '../../../../services/employerService';

function ScoreRing({ score }: { score: number }) {
  const capped = Math.min(100, Math.max(0, score));
  const color =
    capped >= 70 ? '#7c3aed' : capped >= 40 ? '#a78bfa' : '#a1a1aa';
  const label =
    capped >= 70 ? 'Great' : capped >= 40 ? 'Fair' : 'Low';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#f4f4f5" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${(capped / 100) * 94.2} 94.2`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-800">
          {capped}
        </span>
      </div>
      <span className="text-[10px] font-semibold text-zinc-500 mt-1 uppercase tracking-wide">{label}</span>
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

export default function EmployeeDetailPage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const params = useParams();
  const employeeId = params?.id as string;
  const [employee, setEmployee] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user || !employeeId) return;
    Promise.all([getEmployee(employeeId), getJobs()])
      .then(([emp, jobList]) => {
        setEmployee(emp);
        const openJobs = jobList.filter((j: any) => j.status === 'OPEN');
        setJobs(openJobs);
        if (openJobs.length > 0) setSelectedJob(openJobs[0].id);
      })
      .catch(() => {});
  }, [user, employeeId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setSending(true);
    setMsg(null);
    try {
      await sendInvite({ jobPostId: selectedJob, employeeProfileId: employeeId, message });
      setMsg({ type: 'success', text: 'Invite sent successfully!' });
      setMessage('');
      setInviteSent(true);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to send invite.' });
    } finally {
      setSending(false);
    }
  };

  if (loading || !employee) return <Spinner />;

  const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unnamed Candidate';
  const initials = ((employee.firstName?.[0] ?? '') + (employee.lastName?.[0] ?? '')).toUpperCase() || '?';
  const score = employee.resumeScore ?? 0;

  return (
    <div className="space-y-6 ">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/employer/jobs" className="text-xs font-medium text-zinc-400 hover:text-zinc-700 transition">
          ← Job Posts
        </Link>
        <span className="text-zinc-200">/</span>
        <span className="text-xs text-zinc-500">Candidate Profile</span>
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

      {/* Profile Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        {/* Top Strip */}
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center text-xl font-bold shrink-0 select-none">
              {initials}
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900">{fullName}</h1>
              <p className="text-sm text-zinc-500">{employee.title || 'No title set'}</p>
              {employee.location && (
                <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {employee.location}
                </p>
              )}
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center">
            <ScoreRing score={score} />
            <span className="text-[10px] text-zinc-400 mt-0.5">Resume</span>
          </div>
        </div>

        {/* Bio */}
        {employee.bio && (
          <div className="px-6 py-4 border-b border-zinc-100">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">About</p>
            <p className="text-sm text-zinc-600 leading-relaxed">{employee.bio}</p>
          </div>
        )}

        {/* Skills */}
        <div className="px-6 py-4 border-b border-zinc-100">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2.5">Skills</p>
          {employee.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((s: any) => (
                <span
                  key={s.id}
                  className="text-xs font-medium bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full border border-zinc-200"
                >
                  {s.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No skills listed.</p>
          )}
        </div>

        {/* Resume Link */}
        <div className="px-6 py-4">
          {employee.resumeUrl ? (
            <a
              href={`http://localhost:5050${employee.resumeUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition"
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Resume PDF
            </a>
          ) : (
            <p className="text-sm text-zinc-400">No resume uploaded.</p>
          )}
        </div>
      </div>

      {/* Send Invite Card */}
      {jobs.length > 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-800 mb-4">Send a Job Invite</h2>
          {inviteSent && (
            <p className="text-xs text-emerald-600 font-medium mb-3">
              Invite sent! You can send another invite for a different job post.
            </p>
          )}
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="invite-job" className="text-xs font-semibold text-zinc-600">Select Job Post</label>
              <select
                id="invite-job"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition bg-white"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="invite-message" className="text-xs font-semibold text-zinc-600">
                Personal Message{' '}
                <span className="font-normal text-zinc-400">(optional)</span>
              </label>
              <textarea
                id="invite-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Hi! I think you'd be a great fit for this role…"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {sending && (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              )}
              {sending ? 'Sending…' : 'Send Invite'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 text-center">
          <p className="text-sm text-zinc-400 mb-3">You have no open job posts to invite this candidate to.</p>
          <Link
            href="/employer/jobs"
            className="inline-block px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition"
          >
            Create a Job Post
          </Link>
        </div>
      )}
    </div>
  );
}