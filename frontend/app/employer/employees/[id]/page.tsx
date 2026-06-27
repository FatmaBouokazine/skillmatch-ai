'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '../../../../hooks/useRequireAuth';
import { getEmployee, sendInvite, getJobs } from '../../../../services/employerService';

export default function EmployeeDetailPage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const params = useParams();
  const employeeId = params?.id as string;
  const [employee, setEmployee] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user || !employeeId) return;
    Promise.all([getEmployee(employeeId), getJobs()])
      .then(([emp, jobList]) => {
        setEmployee(emp);
        setJobs(jobList.filter((j: any) => j.status === 'OPEN'));
        if (jobList.length > 0) setSelectedJob(jobList[0].id);
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
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to send invite.' });
    } finally {
      setSending(false);
    }
  };

  if (loading || !employee) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" /></div>;

  const score = employee.resumeScore ?? 0;
  const scoreColor = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-500' : 'text-zinc-400';

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/employer/jobs" className="text-zinc-400 hover:text-zinc-700 text-sm">← Jobs</Link>
        <span className="text-zinc-200">/</span>
        <span className="text-sm text-zinc-500">Candidate Profile</span>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xl font-bold shrink-0">
            {((employee.firstName?.[0] ?? '') + (employee.lastName?.[0] ?? '')).toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">
              {`${employee.firstName} ${employee.lastName}`.trim() || 'Unnamed Candidate'}
            </h1>
            <p className="text-sm text-zinc-500">{employee.title || 'No title set'}</p>
            {employee.location && <p className="text-xs text-zinc-400 mt-0.5">📍 {employee.location}</p>}
          </div>
          <div className="ml-auto text-right">
            <div className={`text-3xl font-bold ${scoreColor}`}>{score}<span className="text-sm text-zinc-400 font-normal">/100</span></div>
            <div className="text-xs text-zinc-500">Resume Score</div>
          </div>
        </div>

        {employee.bio && (
          <p className="text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-4">{employee.bio}</p>
        )}

        {/* Skills */}
        <div className="border-t border-zinc-100 pt-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Skills</p>
          {employee.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((s: any) => (
                <span key={s.id} className="text-sm bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full">{s.name}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No skills listed.</p>
          )}
        </div>

        {/* Resume */}
        {employee.resumeUrl && (
          <div className="border-t border-zinc-100 pt-4">
            <a
              href={`http://localhost:5050${employee.resumeUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 underline hover:text-zinc-900"
            >
              📄 View Resume PDF
            </a>
          </div>
        )}
      </div>

      {/* Send Invite */}
      {jobs.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-800 mb-4">Send a Job Invite</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">Select Job Post</label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-900 bg-white"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">Personal Message <span className="text-zinc-400 font-normal">(optional)</span></label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Hi! I think you'd be a great fit for this role…"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-900 resize-none"
              />
            </div>
            <button type="submit" disabled={sending} className="w-full py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50">
              {sending ? 'Sending…' : 'Send Invite'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
