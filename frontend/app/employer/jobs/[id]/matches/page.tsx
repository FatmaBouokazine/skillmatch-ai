'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '../../../../../hooks/useRequireAuth';
import { getJobMatches, sendInvite } from '../../../../../services/employerService';

export default function JobMatchesPage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const params = useParams();
  const jobId = params?.id as string;
  const [matches, setMatches] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [inviting, setInviting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      setMsg({ type: 'success', text: 'Invite sent successfully!' });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Failed to send invite.' });
    } finally {
      setInviting(null);
    }
  };

  if (loading || fetching) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/employer/jobs" className="text-zinc-400 hover:text-zinc-700 text-sm">← Jobs</Link>
        <span className="text-zinc-200">/</span>
        <h1 className="text-xl font-bold text-zinc-900">Matched Candidates</h1>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {matches.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center">
          <p className="text-zinc-400 text-sm">No candidates matched yet. Ensure this job has required skills set.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Candidate</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden sm:table-cell">Location</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden md:table-cell">Resume Score</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Match</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {matches.map((emp) => (
                <tr key={emp.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition">
                  <td className="px-5 py-4">
                    <div className="font-medium text-zinc-800">
                      {emp.firstName || emp.lastName ? `${emp.firstName} ${emp.lastName}`.trim() : 'Unnamed'}
                    </div>
                    <div className="text-xs text-zinc-500">{emp.title || '—'}</div>
                  </td>
                  <td className="px-5 py-4 text-zinc-500 hidden sm:table-cell">{emp.location || '—'}</td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className={`font-semibold ${emp.resumeScore >= 70 ? 'text-emerald-600' : emp.resumeScore >= 40 ? 'text-amber-500' : 'text-zinc-400'}`}>
                      {emp.resumeScore}/100
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-bold ${emp.matchPercentage >= 70 ? 'text-emerald-600' : emp.matchPercentage >= 40 ? 'text-amber-500' : 'text-zinc-400'}`}>
                      {emp.matchPercentage}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/employer/employees/${emp.id}`} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 font-medium text-zinc-600">
                        View
                      </Link>
                      <button
                        onClick={() => handleInvite(emp.id)}
                        disabled={inviting === emp.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition disabled:opacity-50"
                      >
                        {inviting === emp.id ? '…' : 'Invite'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
