'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getJobs, createJob, updateJob, deleteJob } from '../../../services/employerService';

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE'];
const EMPTY_FORM = { title: '', description: '', location: '', type: 'FULL_TIME', requiredSkills: '' };

export default function EmployerJobsPage() {
  const { user, loading } = useRequireAuth('EMPLOYER');
  const [jobs, setJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        setMsg({ type: 'success', text: 'Job updated.' });
      } else {
        const created = await createJob(payload);
        setJobs((prev) => [created, ...prev]);
        setMsg({ type: 'success', text: 'Job created.' });
      }
      setShowForm(false);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save job.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job post?')) return;
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete.' });
    }
  };

  const handleStatusToggle = async (job: any) => {
    const newStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const updated = await updateJob(job.id, { status: newStatus });
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Job Posts</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{jobs.length} post{jobs.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition">
          + New Job
        </button>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center">
          <p className="text-zinc-400 text-sm">No job posts yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border border-zinc-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-zinc-800">{job.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                      {job.status}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                      {job.type?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{job.location || 'Remote'}</p>
                  {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.requiredSkills.map((s: string) => (
                        <span key={s} className="text-[11px] px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/employer/jobs/${job.id}/matches`} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 font-medium text-zinc-600">
                    Matches
                  </Link>
                  <button onClick={() => openEdit(job)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 font-medium text-zinc-600">
                    Edit
                  </button>
                  <button onClick={() => handleStatusToggle(job)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 font-medium text-zinc-600">
                    {job.status === 'OPEN' ? 'Close' : 'Reopen'}
                  </button>
                  <button onClick={() => handleDelete(job.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 font-medium text-red-500">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-zinc-900">{editingJob ? 'Edit Job Post' : 'New Job Post'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Job Title', name: 'title', placeholder: 'e.g. Senior React Developer' },
                { label: 'Location', name: 'location', placeholder: 'e.g. New York, NY or Remote' },
              ].map(({ label, name, placeholder }) => (
                <div key={name} className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">{label}</label>
                  <input
                    value={(form as any)[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
                    required={name === 'title'}
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Job Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-900 bg-white"
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Required Skills <span className="text-zinc-400 font-normal">(comma separated)</span></label>
                <input
                  value={form.requiredSkills}
                  onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
                  placeholder="e.g. React, TypeScript, Node.js"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the role, responsibilities, and requirements…"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-900 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50">
                  {saving ? 'Saving…' : editingJob ? 'Update Job' : 'Create Job'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-zinc-200 text-sm font-semibold rounded-xl hover:bg-zinc-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
