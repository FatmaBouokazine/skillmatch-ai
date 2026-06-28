'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { registerUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'EMPLOYEE',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg(null);
  };

  const handleRoleSelect = (role: string) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const data = await registerUser(formData);
      await login(data.token, data.user.role);
    } catch (error: any) {
      setErrorMsg(error.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white px-4 py-16 font-sans">
      <div className="w-full max-w-lg">

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
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight pt-1">Create your account</h2>
            <p className="text-sm text-zinc-500">Sign up to get matched with jobs or find top talent.</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-600 block">I am a…</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: 'EMPLOYEE', icon: '📄', title: 'Candidate', desc: 'Upload resume, get scored, find matching jobs.' },
                  { value: 'EMPLOYER', icon: '💼', title: 'Recruiter', desc: 'Post jobs and discover top matched candidates.' },
                ].map(({ value, icon, title, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRoleSelect(value)}
                    className={`text-left border p-4 rounded-xl transition flex flex-col gap-1.5 ${
                      formData.role === value
                        ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-100'
                        : 'border-zinc-200 hover:border-violet-200 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{icon}</span>
                        <span className="font-semibold text-sm text-zinc-800">{title}</span>
                      </div>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                        formData.role === value ? 'border-violet-600 bg-violet-600' : 'border-zinc-300'
                      }`}>
                        {formData.role === value && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500 leading-relaxed">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

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
                placeholder="Create a secure password (min. 8 characters)"
                onChange={handleChange}
                value={formData.password}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating account…</>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-sm text-zinc-500 pt-1 border-t border-zinc-100">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-700">Sign In</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
