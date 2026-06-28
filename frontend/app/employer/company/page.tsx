'use client';

import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import {
  getEmployerProfile,
  updateEmployerProfile,
  getCompanyMembers,
  inviteToCompany,
  removeCompanyMember,
} from '../../../services/employerService';

type Tab = 'info' | 'members';

const MEMBER_STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  ACTIVE:  { label: 'Active',   classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  PENDING: { label: 'Pending',  classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
};

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

export default function EmployerCompanyPage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const [tab, setTab] = useState<Tab>('info');

  // Company info state
  const [form, setForm] = useState({ companyName: '', website: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Members state
  const [members, setMembers] = useState<any[]>([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTitle, setInviteTitle] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getEmployerProfile().then((p) => {
      setForm({
        companyName: p.companyName || '',
        website: p.website || '',
        description: p.description || '',
      });
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user || tab !== 'members') return;
    setFetchingMembers(true);
    getCompanyMembers()
      .then(setMembers)
      .catch(() => {})
      .finally(() => setFetchingMembers(false));
  }, [user, tab]);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setInfoMsg(null);
    try {
      await updateEmployerProfile(form);
      setInfoMsg({ type: 'success', text: 'Company profile updated successfully.' });
    } catch (err: any) {
      setInfoMsg({ type: 'error', text: err.message || 'Failed to update company profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      const result = await inviteToCompany({ email: inviteEmail.trim(), jobTitle: inviteTitle.trim() });
      setInviteMsg({ type: 'success', text: `Invitation sent to ${inviteEmail.trim()}.` });
      setInviteEmail('');
      setInviteTitle('');
      // Add the pending member to the list
      setMembers((prev) => [
        {
          id: result.id,
          email: result.email,
          status: 'PENDING',
          userRole: 'EMPLOYEE',
          role: 'EMPLOYEE',
          jobTitle: inviteTitle.trim(),
          createdAt: new Date().toISOString(),
          profile: null,
        },
        ...prev,
      ]);
    } catch (err: any) {
      setInviteMsg({ type: 'error', text: err.message || 'Failed to send invitation.' });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await removeCompanyMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch {
      // silently ignore
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <Spinner />;

  const initials = form.companyName
    ? form.companyName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const activeCount = members.filter((m) => m.status === 'ACTIVE').length;
  const pendingCount = members.filter((m) => m.status === 'PENDING').length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Company</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your company profile and team members.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-zinc-100 rounded-xl p-1 w-fit">
        {([
          { key: 'info', label: 'Company Info' },
          { key: 'members', label: `Members${members.length > 0 ? ` (${members.length})` : ''}` },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === key
                ? 'bg-white text-violet-600 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Company Info Tab ── */}
      {tab === 'info' && (
        <>
          {infoMsg && (
            <div className={`p-3 rounded-xl text-sm font-medium border ${
              infoMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {infoMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Preview Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-violet-600 text-white flex items-center justify-center text-2xl font-bold select-none">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{form.companyName || 'Company Name'}</p>
                  {form.website ? (
                    <a
                      href={form.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-violet-600 hover:underline truncate block mx-auto"
                    >
                      {form.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <p className="text-xs text-zinc-400">No website set</p>
                  )}
                </div>
              </div>

              {form.description ? (
                <p className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-100 pt-3 line-clamp-4">
                  {form.description}
                </p>
              ) : (
                <p className="text-xs text-zinc-400 border-t border-zinc-100 pt-3 text-center">No description yet</p>
              )}

              <div className="border-t border-zinc-100 pt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Visible to candidates
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleInfoSubmit} className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="companyName" className="text-xs font-semibold text-zinc-600">Company Name</label>
                  <input
                    id="companyName"
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleInfoChange}
                    placeholder="Acme Corp"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="website" className="text-xs font-semibold text-zinc-600">Website</label>
                  <input
                    id="website"
                    type="url"
                    name="website"
                    value={form.website}
                    onChange={handleInfoChange}
                    placeholder="https://acmecorp.com"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-xs font-semibold text-zinc-600">Company Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleInfoChange}
                    rows={5}
                    placeholder="Tell candidates about your company culture, mission, and what makes you unique…"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  {saving ? 'Saving…' : 'Save Company Info'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Members Tab ── */}
      {tab === 'members' && (
        <div className="space-y-6">

          {/* Stats Row */}
          {members.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-violet-600">{activeCount}</div>
                <div className="text-xs text-zinc-500 font-medium mt-0.5">Active Members</div>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                <div className="text-xs text-zinc-500 font-medium mt-0.5">Pending Invites</div>
              </div>
            </div>
          )}

          {/* Invite Form */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Invite to Company</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Enter the email address of a registered user to invite them. They will need to accept the invitation.
              </p>
            </div>

            {inviteMsg && (
              <div className={`p-3 rounded-xl text-sm font-medium border ${
                inviteMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {inviteMsg.text}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="inviteEmail" className="text-xs font-semibold text-zinc-600">Email Address *</label>
                  <input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    required
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="inviteTitle" className="text-xs font-semibold text-zinc-600">Job Title (optional)</label>
                  <input
                    id="inviteTitle"
                    type="text"
                    value={inviteTitle}
                    onChange={(e) => setInviteTitle(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {inviting && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                {inviting ? 'Sending…' : 'Send Invitation'}
              </button>
            </form>
          </div>

          {/* Members List */}
          {fetchingMembers ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-violet-600 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-500 mb-1">No members yet</p>
              <p className="text-xs text-zinc-400">Invite colleagues or accept job applications to build your team.</p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3 border-b border-zinc-100 bg-zinc-50">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Member</span>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden sm:block">Role</span>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</span>
                <span />
              </div>

              {members.map((member) => {
                const statusCfg = MEMBER_STATUS_CONFIG[member.status] ?? { label: member.status, classes: 'bg-zinc-100 text-zinc-500 border border-zinc-200' };
                const name = member.profile
                  ? `${member.profile.firstName || ''} ${member.profile.lastName || ''}`.trim() || member.email
                  : member.email;
                const memberInitials = name
                  ? name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                  : '?';

                return (
                  <div
                    key={member.id}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60 transition"
                  >
                    {/* Member info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white ${
                        member.role === 'EMPLOYER' ? 'bg-violet-600' : 'bg-zinc-700'
                      }`}>
                        {memberInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">{name}</p>
                        <p className="text-xs text-zinc-400 truncate">
                          {member.jobTitle || member.email}
                        </p>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="hidden sm:block">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        member.role === 'EMPLOYER'
                          ? 'bg-violet-50 text-violet-700 border border-violet-200'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}>
                        {member.role === 'EMPLOYER' ? 'Recruiter' : 'Employee'}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.classes}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Remove */}
                    <div>
                      <button
                        disabled={removingId === member.id}
                        onClick={() => handleRemove(member.id)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-40"
                      >
                        {removingId === member.id ? '…' : 'Remove'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
