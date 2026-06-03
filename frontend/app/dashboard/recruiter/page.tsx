'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getRecruiterJobs, createJob } from '../../../services/authService';

export default function RecruiterOverviewPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState({ postedJobs: 0, hiredCandidates: 0 });
  const [fetching, setFetching] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: 'Remote',
    salary: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!token || !user) router.push('/login');
      else if (user.role !== 'recruiter') router.push('/dashboard');
    }
  }, [user, token, loading, router]);

  useEffect(() => {
    if (token && user?.role === 'recruiter') {
      loadJobs();
      setFormData((prev) => ({ ...prev, company: user.companyName || '' }));
    }
  }, [token, user]);

  const loadJobs = async () => {
    if (!token) return;
    setFetching(true);
    try {
      const data = await getRecruiterJobs(token);
      setJobs(data.jobs || []);
      setStats(data.stats || { postedJobs: 0, hiredCandidates: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await createJob(formData, token);
      setSuccessMsg('Job posted successfully.');
      setShowPostModal(false);
      setFormData({
        title: '',
        company: user?.companyName || '',
        description: '',
        requirements: '',
        location: 'Remote',
        salary: '',
      });
      await loadJobs();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to post job.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Overview</h1>
          <p className="text-zinc-500 text-sm mt-1">Your job postings and hiring summary.</p>
        </div>
        <button
          onClick={() => setShowPostModal(true)}
          className="w-fit rounded-lg bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-white"
        >
          Post a New Job
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-zinc-900 text-xs text-white font-medium rounded-lg">{successMsg}</div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-600 font-medium rounded-lg">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Posted Jobs</span>
          <div className="mt-2 text-3xl font-bold text-zinc-900">{stats.postedJobs}</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Hired Candidates</span>
          <div className="mt-2 text-3xl font-bold text-zinc-900">{stats.hiredCandidates}</div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900">Your Job Postings</h2>
        {fetching ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center">
            <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl py-12 text-center text-xs text-zinc-400">
            No jobs posted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job: { _id: string; title: string; location?: string; salary?: string; requirements?: string[] }) => (
              <div key={job._id} className="bg-white border border-zinc-200 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-zinc-800">{job.title}</h3>
                <p className="text-[10px] text-zinc-400 mt-1">
                  {job.location}
                  {job.salary ? ` • ${job.salary}` : ''}
                </p>
                {job.requirements && job.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.requirements.slice(0, 5).map((tag: string) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-zinc-50 border border-zinc-150 rounded-sm text-zinc-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPostModal(false)} />
          <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-zinc-900">Post a New Job</h3>
            <form onSubmit={handlePostJob} className="space-y-3 text-sm">
              <input
                type="text"
                name="title"
                placeholder="Job title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:border-zinc-950"
                required
              />
              <input
                type="text"
                name="company"
                placeholder="Company"
                value={formData.company}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:border-zinc-950"
              />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:border-zinc-950"
              />
              <input
                type="text"
                name="salary"
                placeholder="Salary (optional)"
                value={formData.salary}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:border-zinc-950"
              />
              <input
                type="text"
                name="requirements"
                placeholder="Skills (comma separated)"
                value={formData.requirements}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:border-zinc-950"
                required
              />
              <textarea
                name="description"
                rows={4}
                placeholder="Job description"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:border-zinc-950"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
