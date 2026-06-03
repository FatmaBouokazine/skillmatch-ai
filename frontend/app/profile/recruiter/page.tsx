'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { updateProfile } from '../../../services/authService';

export default function RecruiterProfilePage() {
  const { user, token, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    companyWebsite: '',
    companyBio: ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authenticate role recruiter
  useEffect(() => {
    if (!loading) {
      if (!token || !user) {
        router.push('/login');
      } else if (user.role !== 'recruiter') {
        router.push('/dashboard');
      }
    }
  }, [user, token, loading, router]);

  // Load current values
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        companyName: user.companyName || '',
        companyWebsite: user.companyWebsite || '',
        companyBio: user.companyBio || ''
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
      setSuccessMsg('Company profile updated successfully!');
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
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Company Profile</h1>
        <p className="text-xs text-zinc-500 mt-1">Configure your hiring team details and organization profile.</p>
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
            <label className="font-semibold text-zinc-600">Recruiter Contact Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-600">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Tesla, Inc."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-600">Company Website URL</label>
              <input
                type="url"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleChange}
                placeholder="https://company.com"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-600">Company Mission & Description</label>
            <textarea
              name="companyBio"
              rows={4}
              value={formData.companyBio}
              onChange={handleChange}
              placeholder="Describe your company's sector, vision, and candidate criteria..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition"
            />
          </div>

          <div className="pt-2 border-t border-zinc-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard/recruiter')}
              className="px-4 py-2 border border-zinc-200 hover:border-zinc-350 rounded-lg font-semibold text-zinc-600 transition"
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
