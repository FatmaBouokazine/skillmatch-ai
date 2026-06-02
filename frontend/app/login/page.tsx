'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '../../services/authService';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginUser(formData);
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (error) {
      alert('Login Failed');
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-[#b9e7e7] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#1f6d6d] shadow-sm">
            Sign in
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            Welcome back to <span className="text-[#1f6d6d]">SkillMatch AI</span>
          </h1>
          <p className="max-w-xl text-base text-slate-600 sm:text-lg">
            Log in to access your dashboard, review your matches, and continue where you left off.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Secure</p>
              <p className="mt-2 text-sm text-slate-600">JWT-backed session access.</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Fast</p>
              <p className="mt-2 text-sm text-slate-600">Jump back to your workspace quickly.</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Focused</p>
              <p className="mt-2 text-sm text-slate-600">See only the details your role needs.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="rounded-md bg-[#76cdcd] px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-[#63bcbc]">
              Create account
            </Link>
            <Link href="/solution" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">
              Learn more
            </Link>
            <Link href="/" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">
              Back to home
            </Link>
          </div>
          <div className="rounded-2xl border border-[#b9e7e7] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">What you get after login</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Employees</p>
                <p className="mt-1 text-sm text-slate-600">Best-match jobs, resume feedback, and profile updates.</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Recruiters</p>
                <p className="mt-1 text-sm text-slate-600">Suggested candidates and quicker shortlisting.</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Admins</p>
                <p className="mt-1 text-sm text-slate-600">Role control, access, and platform checks.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-8 shadow-sm">
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
                className="rounded-md border border-[#b9e7e7] bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#76cdcd]"
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
                className="rounded-md border border-[#b9e7e7] bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#76cdcd]"
                required
              />
            </label>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>JWT-secured session</span>
              <span>Need access to another role? Use the register page.</span>
            </div>

            <button
              type="submit"
              className="rounded-md bg-[#76cdcd] px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-[#63bcbc] focus:outline-none"
            >
              Login
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
