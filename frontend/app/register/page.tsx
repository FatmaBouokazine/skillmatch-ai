'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/services/authService';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await registerUser(formData);
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (error) {
      alert('Register Failed');
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex w-fit rounded-full border border-[#b9e7e7] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#1f6d6d] shadow-sm">
            Create account
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            Join <span className="text-[#1f6d6d]">SkillMatch AI</span>
          </h1>
          <p className="max-w-xl text-base text-slate-600 sm:text-lg">
            Choose your role to unlock a tailored dashboard, personalized matches, and a clear profile workflow.
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Candidates can track matches and improve their resume.</li>
            <li>• Recruiters can review suggested candidates and pipelines.</li>
            <li>• Admin access stays secure and invitation-based.</li>
          </ul>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Candidate</p>
              <p className="mt-2 text-sm text-slate-600">Track matches and improve your resume.</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Recruiter</p>
              <p className="mt-2 text-sm text-slate-600">Review candidate suggestions and pipelines.</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Admin</p>
              <p className="mt-2 text-sm text-slate-600">Secure access is managed by invitation only.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#b9e7e7] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">What happens after registration</p>
            <p className="mt-2 text-sm text-slate-600">Employees can find better job matches, and employers can start receiving better candidate suggestions.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="rounded-md bg-[#76cdcd] px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-[#63bcbc]">
              Sign in
            </Link>
            <Link href="/solution" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">
              Learn more
            </Link>
            <Link href="/" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">
              Back to home
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-8 shadow-sm">
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
                className="rounded-md border border-[#b9e7e7] bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#76cdcd]"
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
                className="rounded-md border border-[#b9e7e7] bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#76cdcd]"
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
                className="rounded-md border border-[#b9e7e7] bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#76cdcd]"
                required
              />
            </label>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Choose your role</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: 'recruiter', label: 'Recruiter', note: 'Hire and manage pipelines.' },
                  { value: 'candidate', label: 'Candidate', note: 'Track matches and applications.' },
                ].map((role) => (
                  <label
                    key={role.value}
                    className={`cursor-pointer border px-4 py-3 text-sm transition ${
                      formData.role === role.value
                        ? 'border-[#76cdcd] bg-white text-slate-800 shadow-sm'
                        : 'border-[#b9e7e7] bg-white text-slate-600 hover:border-[#76cdcd]'
                    }`}
                  >
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
                      <span className="rounded-full bg-[#eefcfc] px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#1f6d6d]">
                        Select
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{role.note}</p>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500">Admin accounts are provisioned by invitation only.</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>JWT-secured session</span>
              <span>Already have an account? Use the login page.</span>
            </div>

            <button
              type="submit"
              className="rounded-md bg-[#76cdcd] px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-[#63bcbc] focus:outline-none"
            >
              Register
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
