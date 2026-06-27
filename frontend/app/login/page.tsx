'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const data = await loginUser(formData);
      await login(data.token, data.user.role);
    } catch (error: any) {
      setErrorMsg(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white px-4 py-16 font-sans">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-zinc-900 tracking-tight text-sm justify-center">
              <span className="w-5 h-5 rounded-md bg-violet-600 flex items-center justify-center">
                <span className="w-2 h-2 rounded-sm bg-white" />
              </span>
              SkillMatch AI
            </Link>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight pt-1">Welcome back</h2>
            <p className="text-sm text-zinc-500">Sign in to access your dashboard.</p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                value={formData.email}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                onChange={handleChange}
                value={formData.password}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in…</>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-zinc-100 text-sm text-zinc-500">
            New to SkillMatch?{' '}
            <Link href="/register" className="font-semibold text-violet-600 hover:text-violet-700">
              Create an account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
