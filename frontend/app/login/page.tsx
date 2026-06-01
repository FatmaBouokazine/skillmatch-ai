'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { loginUser } from '../../services/authService';

export default function LoginPage() {

  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
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

      const data = await loginUser(formData);

      localStorage.setItem(
        'token',
        data.token
      );

      router.push('/dashboard');

    } catch (error) {

      console.log(error);

      alert('Login Failed');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-6 py-12 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(87,132,186,0.25),_transparent_55%),linear-gradient(180deg,#f7f9ff_0%,#eef3fb_60%,#ffffff_100%)]" />
      <div className="absolute left-1/2 top-16 -z-10 h-48 w-48 -translate-x-1/2 rounded-full bg-[#5784BA] opacity-20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="flex flex-col gap-3">
      
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Welcome back to{' '}
            <span className="text-[#5784BA]">SkillMatch AI</span>
          </h1>
          <p className="max-w-xl text-base text-slate-600 sm:text-lg">
            Log in to access your dashboard and continue matching the right skills
            with the right opportunities.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <div className="hidden flex-col justify-between rounded-3xl border border-white/60 bg-white/60 p-8 text-slate-600 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.6)] backdrop-blur lg:flex">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Role-based workspaces</h2>
              <p className="text-sm leading-relaxed">
                Recruiters, candidates, and admins each get a focused dashboard
                and profile experience to keep the flow simple.
              </p>
              <div className="grid gap-3">
                {['Admin', 'Recruiter', 'Candidate'].map((role) => (
                  <div key={role} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-xs">
                    <span className="font-semibold text-slate-800">{role}</span>
                    <span className="rounded-full bg-[#5784BA]/10 px-3 py-1 font-semibold text-[#4a73a6]">Dashboard + Profile</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[#5784BA]/20 bg-[#5784BA]/10 p-4 text-sm text-[#3d5f8a]">
              <span className="text-lg font-semibold">99%</span>
              <span>ready to extend with onboarding and profile steps.</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Login</h2>
              <p className="text-sm text-slate-500">
                Use your account credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                  placeholder="Enter your password"
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#5784BA] focus:ring-4 focus:ring-[#5784BA]/20"
                  required
                />
              </label>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>JWT-secured session</span>
                <Link href="/register" className="font-semibold text-[#5784BA] hover:text-[#3f679b]">
                  Create an account
                </Link>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#5784BA] px-4 py-3 text-sm font-semibold text-white shadow-[0_15px_30px_-20px_rgba(87,132,186,0.9)] transition hover:bg-[#4a73a6] focus:outline-none focus:ring-4 focus:ring-[#5784BA]/30"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}