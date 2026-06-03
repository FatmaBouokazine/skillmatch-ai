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
      await login(data.token);
    } catch (error: any) {
      setErrorMsg(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-10 md:py-16 font-sans">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-8 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 font-semibold text-zinc-900 tracking-tight text-sm justify-center">
            <span className="w-2 h-2 rounded-full bg-zinc-950"></span>
            SkillMatch AI
          </Link>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-zinc-500">Sign in to access your skills dashboard workspace.</p>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium">
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
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition duration-150"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-zinc-600">Password</label>
            </div>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              onChange={handleChange}
              value={formData.password}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition duration-150"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition duration-150 shadow-xs flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-zinc-100 text-xs text-zinc-500">
          New to SkillMatch?{' '}
          <Link href="/register" className="font-semibold text-zinc-800 hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}
