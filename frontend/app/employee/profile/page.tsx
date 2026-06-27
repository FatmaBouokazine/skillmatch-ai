'use client';

import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getEmployeeProfile, updateEmployeeProfile } from '../../../services/employeeService';
import { useAuth } from '../../../context/AuthContext';

export default function EmployeeProfilePage() {
  const { user, loading } = useRequireAuth('EMPLOYEE');
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', title: '', bio: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    getEmployeeProfile().then((p) => {
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
      await updateEmployeeProfile(form);
      await refreshUser();
      setMsg({ type: 'success', text: 'Profile saved successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-[#76cdcd] animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Profile</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Update your personal details visible to employers.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'First Name', name: 'firstName', type: 'text', placeholder: 'Jane' },
            { label: 'Last Name', name: 'lastName', type: 'text', placeholder: 'Doe' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name} className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">{label}</label>
              <input
                type={type}
                name={name}
                value={(form as any)[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#76cdcd] focus:ring-1 focus:ring-[#e0f5f5] transition"
              />
            </div>
          ))}
        </div>

        {[
          { label: 'Current Title', name: 'title', type: 'text', placeholder: 'e.g. Senior Frontend Engineer' },
          { label: 'Location', name: 'location', type: 'text', placeholder: 'e.g. San Francisco, CA' },
        ].map(({ label, name, type, placeholder }) => (
          <div key={name} className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600">{label}</label>
            <input
              type={type}
              name={name}
              value={(form as any)[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#76cdcd] focus:ring-1 focus:ring-[#e0f5f5] transition"
            />
          </div>
        ))}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600">Professional Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Write a short professional summary about yourself…"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#76cdcd] focus:ring-1 focus:ring-[#e0f5f5] transition resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-[#76cdcd] text-white text-sm font-semibold rounded-xl hover:bg-[#5ab5b5] transition disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
