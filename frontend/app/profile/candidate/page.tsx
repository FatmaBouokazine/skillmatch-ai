'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { updateProfile } from '../../../services/authService';

export default function CandidateProfilePage() {
  const { user, token, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authenticate role candidate
  useEffect(() => {
    if (!loading) {
      if (!token || !user) {
        router.push('/login');
      } else if (user.role !== 'candidate') {
        router.push('/dashboard');
      }
    }
  }, [user, token, loading, router]);

  // Load current values
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        skills: user.skills ? user.skills.join(', ') : ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (successMsg) setSuccessMsg(null);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await updateProfile(formData, token);
      setSuccessMsg('Profile updated successfully!');
      await refreshUser();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="max-w-xl space-y-6 font-sans">
      
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Profile Settings</h1>
        <p className="text-xs text-zinc-500 mt-1">Configure your personal information and technical skill sets.</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-zinc-900 border border-zinc-800 text-xs text-white font-medium rounded-lg">
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-600 font-medium rounded-lg">
          ✕ {errorMsg}
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-600">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-600">Technical Skills Matrix (Comma Separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, TypeScript, SQL"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition"
              required
            />
            <span className="text-[10px] text-zinc-400 block mt-1">Add matching skill tags to align with recruiter requirements.</span>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-600">Professional Bio Description</label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write a summary describing your professional experience, goals, and core developer competencies..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition"
              required
            />
          </div>

          <div className="pt-2 border-t border-zinc-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard/candidate')}
              className="px-4 py-2 border border-zinc-200 hover:border-zinc-355 rounded-lg font-semibold text-zinc-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {saving ? 'Saving changes...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
