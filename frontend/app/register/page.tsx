'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { registerUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate',
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
      await login(data.token);
    } catch (error: any) {
      setErrorMsg(error.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-10 md:py-16 font-sans">
      <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl p-8 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 font-semibold text-zinc-900 tracking-tight text-sm justify-center">
            <span className="w-2 h-2 rounded-full bg-zinc-950"></span>
            SkillMatch AI
          </Link>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Create Account</h2>
          <p className="text-xs text-zinc-500">Sign up to get matched with jobs or candidates instantly.</p>
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
            <label className="text-xs font-semibold text-zinc-600">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              onChange={handleChange}
              value={formData.name}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition duration-150"
              required
            />
          </div>

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
            <label className="text-xs font-semibold text-zinc-600">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create secure password"
              onChange={handleChange}
              value={formData.password}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition duration-150"
              required
            />
          </div>

          {/* Role selector cards */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-600 block">Select Account Role</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('candidate')}
                className={`
                  text-left border p-4 rounded-xl transition duration-150 outline-none flex flex-col gap-1.5
                  ${formData.role === 'candidate'
                    ? 'border-zinc-950 bg-zinc-50 shadow-xs ring-1 ring-zinc-950'
                    : 'border-zinc-200 hover:border-zinc-300'
                  }
                `}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-sm text-zinc-800">Candidate</span>
                  <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${formData.role === 'candidate' ? 'border-zinc-950 bg-zinc-950' : 'border-zinc-300'}`}>
                    {formData.role === 'candidate' && <span className="w-1 h-1 rounded-full bg-white"></span>}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 leading-normal">Evaluate resume scores and discover matching jobs.</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('recruiter')}
                className={`
                  text-left border p-4 rounded-xl transition duration-150 outline-none flex flex-col gap-1.5
                  ${formData.role === 'recruiter'
                    ? 'border-zinc-950 bg-zinc-50 shadow-xs ring-1 ring-zinc-950'
                    : 'border-zinc-200 hover:border-zinc-300'
                  }
                `}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-sm text-zinc-800">Recruiter</span>
                  <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${formData.role === 'recruiter' ? 'border-zinc-950 bg-zinc-950' : 'border-zinc-300'}`}>
                    {formData.role === 'recruiter' && <span className="w-1 h-1 rounded-full bg-white"></span>}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 leading-normal">Post positions and sort matching candidate lists.</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition duration-150 shadow-xs flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-zinc-100 text-xs text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-zinc-800 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
