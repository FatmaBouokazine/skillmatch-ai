'use client';

import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getEmployerProfile, updateEmployerProfile } from '../../../services/employerService';
import { useAuth } from '../../../context/AuthContext';

export default function EmployerProfilePage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ companyName: '', website: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    getEmployerProfile().then((p) => {
      setForm({ companyName: p.companyName || '', website: p.website || '', description: p.description || '' });
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
      setMsg({ type: 'success', text: 'Company profile saved!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Company Profile</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Update your company information visible to candidates.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
        {[
          { label: 'Company Name', name: 'companyName', type: 'text', placeholder: 'Acme Corp' },
          { label: 'Website', name: 'website', type: 'url', placeholder: 'https://acmecorp.com' },
        ].map(({ label, name, type, placeholder }) => (
          <div key={name} className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600">{label}</label>
            <input
              type={type}
              name={name}
              value={(form as any)[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>
        ))}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600">Company Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Tell candidates about your company culture and mission…"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
