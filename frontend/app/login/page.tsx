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
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
            <li><span className="font-semibold text-[#1f6d6d]">Secure:</span> JWT-backed session access.</li>
            <li><span className="font-semibold text-[#1f6d6d]">Fast:</span> Jump back to your workspace quickly.</li>
            <li><span className="font-semibold text-[#1f6d6d]">Focused:</span> See only the details your role needs.</li>
          </ul>
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
          <section className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">What you get after login</p>
            <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-slate-600">
              <li><span className="font-semibold text-slate-900">Employees:</span> Best-match jobs, resume feedback, and profile updates.</li>
              <li><span className="font-semibold text-slate-900">Recruiters:</span> Suggested candidates and quicker shortlisting.</li>
              <li><span className="font-semibold text-slate-900">Admins:</span> Role control, access, and platform checks.</li>
            </ul>
          </section>
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
