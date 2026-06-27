'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getJobs, createJob, updateJob, deleteJob } from '../../../services/employerService';

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE'];
const EMPTY_FORM = { title: '', description: '', location: '', type: 'FULL_TIME', requiredSkills: '' };

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

export default function EmployerJobsPage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const [jobs, setJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  useEffect(() => {
    if (!user) return;
    getJobs().then(setJobs).catch(() => {});
  }, [user]);

  const openCreate = () => { setEditingJob(null); setForm({ ...EMPTY_FORM }); setShowForm(true); };
  const openEdit = (job: any) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      description: job.description,
      location: job.location || '',
      type: job.type,
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const skills = form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
    const payload = { title: form.title, description: form.description, location: form.location, type: form.type, requiredSkills: skills };
    try {
      if (editingJob) {
        const updated = await updateJob(editingJob.id, payload);
        setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? updated : j)));
        setMsg({ type: 'success', text: 'Job updated successfully.' });
      } else {
        const created = await createJob(payload);
        setJobs((prev) => [created, ...prev]);
        setPage(0);
        setMsg({ type: 'success', text: 'Job created successfully.' });
      }
      setShowForm(false);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save job.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job post? This cannot be undone.')) return;
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setPage(0);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete job.' });
    }
  };

  const handleStatusToggle = async (job: any) => {
    const newStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const updated = await updateJob(job.id, { status: newStatus });
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
      setMsg({ type: 'success', text: `"${job.title}" is now ${newStatus}.` });
    } catch {
      setMsg({ type: 'error', text: 'Failed to update job status.' });
    }
  };

  if (loading) return <Spinner />;

  const openJobs = jobs.filter((j) => j.status === 'OPEN');

  return (
    <div className="space-y-6 ">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Job Posts</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {jobs.length} post{jobs.length !== 1 ? 's' : ''} total · {openJobs.length} open
          </p>
        </div>
        <button
          onClick={openCreate}
          className="shrink-0 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition"
        >
          + New Job
        </button>
      </div>

      {/* Alert */}
      {msg && (
        <div
          className={`p-3 rounded-xl text-sm font-medium border ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-600 border-red-200'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Empty State */}
      {jobs.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-500 mb-1">No job posts yet</p>
          <p className="text-xs text-zinc-400 mb-4">Create your first posting to start finding candidates.</p>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition"
          >
            + Create First Job
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((job) => (
            <div
              key={job.id}
              className="bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Job Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-zinc-900">{job.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        job.status === 'OPEN'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                      }`}
                    >
                      {job.status}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {job.type?.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location || 'Remote'}
                    </span>
                  </p>

                  {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.map((s: string) => (
                        <span key={s} className="text-[11px] px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {job.description && (
                    <div>
                      <p className={`text-xs text-zinc-500 leading-relaxed ${expandedJob === job.id ? '' : 'line-clamp-2'}`}>
                        {job.description}
                      </p>
                      {job.description.length > 100 && (
                        <button
                          onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                          className="text-[11px] text-violet-500 hover:text-violet-700 hover:underline mt-0.5"
                        >
                          {expandedJob === job.id ? 'Show less ↑' : 'Show more ↓'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <Link
                    href={`/employer/jobs/${job.id}/matches`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
                  >
                    View Matches
                  </Link>
                  <button
                    onClick={() => openEdit(job)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 font-medium text-zinc-600 hover:bg-zinc-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleStatusToggle(job)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 font-medium text-zinc-600 hover:bg-zinc-50 transition"
                  >
                    {job.status === 'OPEN' ? 'Close' : 'Reopen'}
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 font-medium text-red-500 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {jobs.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, jobs.length)} of {jobs.length} jobs
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50 transition"
            >
              ← Prev
            </button>
            <button
              disabled={(page + 1) * PAGE_SIZE >= jobs.length}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50 transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base font-bold text-zinc-900">
                {editingJob ? 'Edit Job Post' : 'New Job Post'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <form id="job-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="job-title" className="text-xs font-semibold text-zinc-600">
                    Job Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="job-title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Senior React Developer"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="job-location" className="text-xs font-semibold text-zinc-600">Location</label>
                  <input
                    id="job-location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. New York, NY or Remote"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="job-type" className="text-xs font-semibold text-zinc-600">Job Type</label>
                  <select
                    id="job-type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition bg-white"
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="job-skills" className="text-xs font-semibold text-zinc-600">
                    Required Skills{' '}
                    <span className="font-normal text-zinc-400">(comma separated)</span>
                  </label>
                  <input
                    id="job-skills"
                    value={form.requiredSkills}
                    onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
                    placeholder="e.g. React, TypeScript, Node.js"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="job-description" className="text-xs font-semibold text-zinc-600">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="job-description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    placeholder="Describe the role, responsibilities, and requirements…"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition resize-none"
                    required
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 flex gap-3">
              <button
                type="submit"
                form="job-form"
                disabled={saving}
                className="flex-1 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving…' : editingJob ? 'Update Job' : 'Create Job'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-zinc-200 text-sm font-semibold text-zinc-700 rounded-xl hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


