'use client';

import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getCompanyInvites, respondToCompanyInvite } from '../../../services/employeeService';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-[#e0f5f5] text-[#3e9999] border-[#76cdcd]/40',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DECLINED: 'bg-red-50 text-red-600 border-red-200',
  };
  const labels: Record<string, string> = { PENDING: 'Pending', ACCEPTED: 'Accepted', DECLINED: 'Declined' };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${map[status] ?? map.PENDING}`}>
      {labels[status] ?? status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return type === 'JOB' ? (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
      Job Invite
    </span>
  ) : (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
      Company
    </span>
  );
}

export default function EmployeeInvitesPage() {
  const { user, loading } = useRequireAuth('EMPLOYEE');
  const [invites, setInvites] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    getCompanyInvites()
      .then((data) => setInvites(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  const handleRespond = async (id: string, accept: boolean, type: string) => {
    setResponding(id);
    setMsg(null);
    try {
      await respondToCompanyInvite(id, accept);
      setInvites((prev) =>
        prev.map((inv) =>
          (inv._id || inv.id) === id ? { ...inv, status: accept ? 'ACCEPTED' : 'DECLINED' } : inv
        )
      );
      const successMsg =
        type === 'JOB'
          ? accept ? 'Job invite accepted!' : 'Job invite declined.'
          : accept ? 'You have joined the company!' : 'Invite declined.';
      setMsg({ type: 'success', text: successMsg });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to respond to invite.' });
    } finally {
      setResponding(null);
    }
  };

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-[#76cdcd] animate-spin" />
      </div>
    );
  }

  const pending = invites.filter((i) => i.status === 'PENDING');
  const resolved = invites.filter((i) => i.status !== 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Invites</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Job invites and company invitations from recruiters.
        </p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {invites.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-500 mb-1">No invites yet</p>
          <p className="text-xs text-zinc-400">Job invites and company invitations will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending invites */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                Pending · {pending.length}
              </h2>
              <div className="space-y-3">
                {pending.map((invite: any) => {
                  const id = invite._id || invite.id;
                  return (
                    <div key={id} className="bg-white border border-[#76cdcd]/40 rounded-2xl p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className="w-8 h-8 rounded-lg bg-[#e0f5f5] flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-[#5ab5b5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-zinc-900">
                                {invite.employerProfile?.companyName || 'Company'}
                              </p>
                              {invite.jobTitle && (
                                <p className="text-xs text-zinc-500">
                                  {invite.type === 'JOB' ? 'Job: ' : 'Position: '}{invite.jobTitle}
                                </p>
                              )}
                              {invite.jobLocation && (
                                <p className="text-xs text-zinc-400">{invite.jobLocation}</p>
                              )}
                            </div>
                            <TypeBadge type={invite.type} />
                          </div>
                          {invite.message && (
                            <p className="text-sm text-zinc-600 bg-zinc-50 rounded-xl px-3 py-2 mt-1 leading-relaxed">
                              &ldquo;{invite.message}&rdquo;
                            </p>
                          )}
                          {invite.createdAt && (
                            <p className="text-xs text-zinc-400 mt-2">
                              Received {new Date(invite.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={invite.status} />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleRespond(id, true, invite.type)}
                          disabled={responding === id}
                          className="flex-1 py-2 bg-[#76cdcd] text-white text-sm font-semibold rounded-xl hover:bg-[#5ab5b5] transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {responding === id && (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          )}
                          {invite.type === 'JOB' ? 'Accept Job Invite' : 'Accept Invite'}
                        </button>
                        <button
                          onClick={() => handleRespond(id, false, invite.type)}
                          disabled={responding === id}
                          className="flex-1 py-2 border border-zinc-200 text-zinc-600 text-sm font-semibold rounded-xl hover:bg-zinc-50 transition disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resolved invites */}
          {resolved.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                History · {resolved.length}
              </h2>
              <div className="space-y-2">
                {resolved.map((invite: any) => {
                  const id = invite._id || invite.id;
                  return (
                    <div key={id} className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-zinc-700 truncate">
                              {invite.employerProfile?.companyName || 'Company'}
                            </p>
                            <TypeBadge type={invite.type} />
                          </div>
                          {invite.jobTitle && (
                            <p className="text-xs text-zinc-400 truncate">{invite.jobTitle}</p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={invite.status} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
