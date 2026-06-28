'use client';

import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getAccount, updateAccount } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function AccountPage() {
  const { user, loading } = useRequireAuth();
  const { refreshUser } = useAuth();
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    getAccount().then((acc) => setEmailForm({ email: acc.email })).catch(() => {});
  }, [user]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmail(true);
    setEmailMsg(null);
    try {
      await updateAccount({ email: emailForm.email });
      await refreshUser();
      setEmailMsg({ type: 'success', text: 'Email updated successfully.' });
    } catch (err: any) {
      setEmailMsg({ type: 'error', text: err.message || 'Failed to update email.' });
    } finally {
      setSavingEmail(false);
    }
  };

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (passForm.newPassword.length < 8) {
      setPassMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    setSavingPass(true);
    setPassMsg(null);
    try {
      await updateAccount({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPassMsg({ type: 'success', text: 'Password changed successfully.' });
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setSavingPass(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" /></div>;

  const roleLabel = user?.role === 'EMPLOYEE' ? 'Employee' : user?.role === 'EMPLOYER' ? 'Employer' : 'Admin';

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Account Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          <span className="font-medium">{user?.email}</span> · {roleLabel}
        </p>
      </div>

      {/* Email */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-800">Email Address</h2>
        {emailMsg && (
          <div className={`p-3 rounded-xl text-sm font-medium ${emailMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {emailMsg.text}
          </div>
        )}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600">New Email</label>
            <input
              type="email"
              value={emailForm.email}
              onChange={(e) => setEmailForm({ email: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
              required
            />
          </div>
          <button type="submit" disabled={savingEmail} className="w-full py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50">
            {savingEmail ? 'Updating…' : 'Update Email'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-800">Change Password</h2>
        {passMsg && (
          <div className={`p-3 rounded-xl text-sm font-medium ${passMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {passMsg.text}
          </div>
        )}
        <form onSubmit={handlePassSubmit} className="space-y-3">
          {[
            { label: 'Current Password', key: 'currentPassword' },
            { label: 'New Password', key: 'newPassword' },
            { label: 'Confirm New Password', key: 'confirmPassword' },
          ].map(({ label, key }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">{label}</label>
              <input
                type="password"
                value={(passForm as any)[key]}
                onChange={(e) => setPassForm({ ...passForm, [key]: e.target.value })}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"
                required
                minLength={key !== 'currentPassword' ? 8 : 1}
              />
            </div>
          ))}
          <button type="submit" disabled={savingPass} className="w-full py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50">
            {savingPass ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
