'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { changePassword } from '../../../../services/authService';

export default function RecruiterAccountPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!token || !user) router.push('/login');
      else if (user.role !== 'recruiter') router.push('/dashboard');
    }
  }, [user, token, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await changePassword(currentPassword, newPassword, token);
      setSuccessMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Account</h1>
        <p className="text-xs text-zinc-500 mt-1">Manage your login credentials.</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-zinc-900 text-xs text-white font-medium rounded-lg">{successMsg}</div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-600 font-medium rounded-lg">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600">Email</label>
          <input
            type="email"
            value={user.email || ''}
            disabled
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
          />
          <p className="text-[10px] text-zinc-400">Email cannot be changed at this time.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border-t border-zinc-100 pt-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
