'use client';

import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getEmployerProfile, updateEmployerProfile } from '../../../services/employerService';
import { useAuth } from '../../../context/AuthContext';

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

export default function EmployerPersonalProfilePage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', title: '', bio: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    getEmployerProfile().then((p) => {
      setForm({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        title: p.title || '',
        bio: p.bio || '',
        location: p.location || '',
      });
    }).catch(() => {});
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await updateEmployerProfile(form);
      await refreshUser();
      setMsg({ type: 'success', text: 'Profile saved successfully.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const initials = (
    (form.firstName?.[0] ?? '') + (form.lastName?.[0] ?? '')
  ).toUpperCase() || (user?.email?.[0]?.toUpperCase() ?? '?');

  const displayName = (form.firstName || form.lastName)
    ? `${form.firstName} ${form.lastName}`.trim()
    : user?.email ?? '';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900">My Profile</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Update your personal information.</p>
      </div>

      {/* Alert */}
      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium border ${
          msg.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-600 border-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left: Profile Preview */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-violet-600 text-white flex items-center justify-center text-2xl font-bold select-none">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{displayName || 'Your Name'}</p>
              {form.title ? (
                <p className="text-xs text-zinc-500 mt-0.5">{form.title}</p>
              ) : (
                <p className="text-xs text-zinc-400">No title set</p>
              )}
              {form.location && (
                <p className="text-xs text-zinc-400 mt-0.5 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {form.location}
                </p>
              )}
            </div>
          </div>

          {form.bio ? (
            <p className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-100 pt-3 line-clamp-4">
              {form.bio}
            </p>
          ) : (
            <p className="text-xs text-zinc-400 border-t border-zinc-100 pt-3 text-center">No bio yet</p>
          )}

          <div className="border-t border-zinc-100 pt-3">
            <p className="text-[10px] text-zinc-400 text-center">{user?.email}</p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-xs font-semibold text-zinc-600">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Jane"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-xs font-semibold text-zinc-600">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Smith"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="title" className="text-xs font-semibold text-zinc-600">Job Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Senior Recruiter"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="location" className="text-xs font-semibold text-zinc-600">Location</label>
              <input
                id="location"
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="New York, NY"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bio" className="text-xs font-semibold text-zinc-600">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                placeholder="A brief introduction about yourself…"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              )}
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

