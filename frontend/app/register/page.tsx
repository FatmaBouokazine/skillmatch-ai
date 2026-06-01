'use client';

import { useState } from 'react';
import Link from 'next/link';
import { registerUser } from '@/services/authService';

export default function RegisterPage() {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate'
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      const data = await registerUser(formData);

      console.log(data);

      alert('Register Success');

    } catch (error) {
      console.log(error);
      alert('Register Failed');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-6 py-12 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(87,132,186,0.22),_transparent_55%),linear-gradient(180deg,#f7f9ff_0%,#eef3fb_60%,#ffffff_100%)]" />
      <div className="absolute left-12 top-24 -z-10 h-52 w-52 rounded-full bg-[#5784BA] opacity-15 blur-[90px]" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="flex flex-col gap-3">
          <span className="w-fit rounded-full border border-[#5784BA]/30 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#5784BA]">
            Create account
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Join{' '}
            <span className="text-[#5784BA]">SkillMatch AI</span>
          </h1>
          <p className="max-w-xl text-base text-slate-600 sm:text-lg">
            Choose your role to unlock a tailored dashboard and profile.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <div className="hidden flex-col justify-between rounded-3xl border border-white/60 bg-white/60 p-8 text-slate-600 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.6)] backdrop-blur lg:flex">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Roles built-in</h2>
              <p className="text-sm leading-relaxed">
                Recruiters and candidates self-select during registration.
                Admin access is invitation-only to keep the platform secure.
              </p>
            </div>
            <div className="rounded-2xl border border-[#5784BA]/20 bg-[#5784BA]/10 p-4 text-sm text-[#3d5f8a]">
              Admin dashboards are provisioned by your system owner.
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Register</h2>
              <p className="text-sm text-slate-500">Fill in your details to start.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Full name
                <input
                  type="text"
                  name="name"
                  placeholder="Jane Doe"
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#5784BA] focus:ring-4 focus:ring-[#5784BA]/20"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="you@email.com"
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#5784BA] focus:ring-4 focus:ring-[#5784BA]/20"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#5784BA] focus:ring-4 focus:ring-[#5784BA]/20"
                  required
                />
              </label>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Choose your role</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[{ value: 'recruiter', label: 'Recruiter', note: 'Hire and manage pipelines.' }, { value: 'candidate', label: 'Candidate', note: 'Track matches and applications.' }].map((role) => (
                    <label key={role.value} className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm transition ${formData.role === role.value ? 'border-[#5784BA] bg-[#5784BA]/10 text-[#3d5f8a]' : 'border-slate-200 bg-white text-slate-600 hover:border-[#5784BA]/50'}`}>
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        onChange={handleChange}
                        checked={formData.role === role.value}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{role.label}</span>
                        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5784BA]">Select</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{role.note}</p>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Admin accounts are provisioned by invitation only.</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>JWT-secured session</span>
                <Link href="/login" className="font-semibold text-[#5784BA] hover:text-[#3f679b]">
                  Already have an account?
                </Link>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#5784BA] px-4 py-3 text-sm font-semibold text-white shadow-[0_15px_30px_-20px_rgba(87,132,186,0.9)] transition hover:bg-[#4a73a6] focus:outline-none focus:ring-4 focus:ring-[#5784BA]/30"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}