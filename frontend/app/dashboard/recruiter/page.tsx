'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getRecruiterJobs, createJob, getJobApplicants, updateApplicationStatus } from '../../../services/authService';

export default function RecruiterDashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [fetchingJobs, setFetchingJobs] = useState(true);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJobTitle, setActiveJobTitle] = useState('');
  
  // Applicants state
  const [applicants, setApplicants] = useState<any[]>([]);
  const [fetchingApplicants, setFetchingApplicants] = useState(false);

  // Job post states
  const [showPostModal, setShowPostModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: 'Remote',
    salary: ''
  });

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Authenticate recruiter role
  useEffect(() => {
    if (!loading) {
      if (!token || !user) {
        router.push('/login');
      } else if (user.role !== 'recruiter') {
        router.push('/dashboard');
      }
    }
  }, [user, token, loading, router]);

  // Load recruiter's job postings
  useEffect(() => {
    if (token && user?.role === 'recruiter') {
      fetchJobsList();
      setFormData(prev => ({ ...prev, company: user.companyName || 'My Company' }));
    }
  }, [token, user]);

  const fetchJobsList = async () => {
    if (!token) return;
    setFetchingJobs(true);
    try {
      const data = await getRecruiterJobs(token);
      setJobs(data);
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err);
    } finally {
      setFetchingJobs(false);
    }
  };

  const handleSelectJob = async (jobId: string, jobTitle: string) => {
    if (!token) return;
    setActiveJobId(jobId);
    setActiveJobTitle(jobTitle);
    setFetchingApplicants(true);
    try {
      const candidates = await getJobApplicants(jobId, token);
      setApplicants(candidates);
      
      // Auto scroll to applicants list on mobile
      setTimeout(() => {
        const section = document.getElementById('applicants-panel');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      console.error('Failed to fetch job applicants:', err);
    } finally {
      setFetchingApplicants(false);
    }
  };

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    if (!token || !activeJobId) return;
    try {
      await updateApplicationStatus(activeJobId, candidateId, newStatus, token);
      setActionSuccess(`Candidate status updated to ${newStatus}`);
      // Refresh applicants list
      const updated = await getJobApplicants(activeJobId, token);
      setApplicants(updated);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update candidate status');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      await createJob(formData, token);
      setActionSuccess('Requisition posted successfully!');
      setShowPostModal(false);
      // Reset form (except company name)
      setFormData({
        title: '',
        company: user?.companyName || '',
        description: '',
        requirements: '',
        location: 'Remote',
        salary: ''
      });
      // Refresh jobs list
      await fetchJobsList();
    } catch (err: any) {
      setActionError(err.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-250 text-emerald-700';
    if (score >= 50) return 'bg-amber-50 border-amber-250 text-amber-700';
    return 'bg-zinc-50 border-zinc-200 text-zinc-500';
  };

  if (loading || !user) {
    return null;
  }

  // Calculate stats
  const totalJobs = jobs.length;
  const totalApplicantsCount = jobs.reduce((acc, job) => acc + (job.applicantsCount || 0), 0);

  return (
    <div className="space-y-12">
      
      {/* NOTIFICATIONS */}
      {(actionSuccess || actionError) && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm space-y-2">
          {actionSuccess && (
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-medium shadow-lg flex items-center justify-between gap-4">
              <span>{actionSuccess}</span>
              <button onClick={() => setActionSuccess(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
          )}
          {actionError && (
            <div className="p-4 bg-red-900 border border-red-800 rounded-xl text-xs text-white font-medium shadow-lg flex items-center justify-between gap-4">
              <span>{actionError}</span>
              <button onClick={() => setActionError(null)} className="text-red-300 hover:text-white">✕</button>
            </div>
          )}
        </div>
      )}

      {/* HEADER SECTION */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Recruiter Workspace</h1>
            <p className="text-zinc-500 text-sm max-w-xl">
              Post requisitions, monitor active pipelines, and check match scores from candidates.
            </p>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="w-fit rounded-lg bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-white transition shadow-xs flex items-center gap-1.5"
          >
            <span>➕</span>
            Post New Job
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Active Openings</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">{totalJobs}</span>
              <span className="text-xs text-zinc-400">posted roles</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Total Applicants</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">{totalApplicantsCount}</span>
              <span className="text-xs text-zinc-400">candidate records</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Company Branch</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-zinc-800 truncate max-w-xs block">
                {user.companyName || 'Not Set'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* JOBS LIST & APPLICANTS PANEL WORKSPACE */}
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] items-start">
        
        {/* Requisitions List */}
        <section id="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-zinc-900">Active Job Postings</h2>
            <button 
              onClick={fetchJobsList}
              className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 transition"
            >
              Refresh Postings
            </button>
          </div>

          {fetchingJobs ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center shadow-xs">
              <div className="w-5 h-5 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin mx-auto"></div>
              <p className="mt-2 text-xs text-zinc-400">Loading requisitions list...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl py-12 text-center shadow-xs space-y-3">
              <p className="text-xs text-zinc-400">You haven't posted any jobs yet.</p>
              <button 
                onClick={() => setShowPostModal(true)}
                className="px-3 py-1.5 border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-semibold text-zinc-600"
              >
                Create First Requisition
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const isActive = activeJobId === job._id;
                return (
                  <div 
                    key={job._id}
                    onClick={() => handleSelectJob(job._id, job.title)}
                    className={`
                      border rounded-xl p-4 bg-white transition duration-150 cursor-pointer text-left
                      ${isActive 
                        ? 'border-zinc-950 ring-1 ring-zinc-950 shadow-xs' 
                        : 'border-zinc-200 hover:border-zinc-350'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-zinc-800 text-sm">{job.title}</h3>
                        <div className="flex gap-2 text-[10px] text-zinc-400 mt-1">
                          <span>📍 {job.location}</span>
                          {job.salary && <span>• 💰 {job.salary}</span>}
                        </div>
                      </div>
                      <span className="text-xs bg-zinc-50 border border-zinc-200 font-bold px-2 py-1 rounded-md text-zinc-700">
                        {job.applicantsCount || 0} Applicants
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {job.requirements?.slice(0, 4).map((tag: string) => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-sm bg-zinc-50 border border-zinc-150 text-zinc-500">
                          {tag}
                        </span>
                      ))}
                      {job.requirements?.length > 4 && (
                        <span className="text-[9px] px-1.5 py-0.5 text-zinc-400">
                          +{job.requirements.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Applicants Pipeline Panel */}
        <section id="applicants-panel" className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden sticky top-24 min-h-[400px]">
          <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50">
            <h2 className="font-semibold text-zinc-900 text-sm">
              {activeJobId ? `Candidates: ${activeJobTitle}` : 'Applicants Pipeline'}
            </h2>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {activeJobId ? 'Candidates sorted dynamically by computed match percentage score.' : 'Select a requisition on the left to display applications.'}
            </p>
          </div>

          <div className="p-6">
            {!activeJobId ? (
              <div className="text-center py-20 space-y-2">
                <div className="text-2xl text-zinc-400">👥</div>
                <p className="text-xs font-semibold text-zinc-700">No Job Selected</p>
                <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">Select a requisiton from the list to analyze candidate ratings, review details, and shortlist applicants.</p>
              </div>
            ) : fetchingApplicants ? (
              <div className="text-center py-16">
                <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-xs text-zinc-400">Retrieving applicant profiles...</p>
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-16 space-y-1">
                <p className="text-xs font-semibold text-zinc-700">No applicants yet</p>
                <p className="text-[10px] text-zinc-400">When candidates apply to this position, their credentials will show up here.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 max-h-[500px] overflow-y-auto pr-1">
                {applicants.map((cand) => (
                  <div key={cand._id} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-4">
                    
                    {/* Applicant Profile */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-700">
                          {cand.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-zinc-800 text-xs">{cand.name}</h4>
                          <p className="text-[10px] text-zinc-400">{cand.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full ${getMatchScoreBadge(cand.matchScore)}`}>
                          {cand.matchScore}% Match
                        </span>
                        <span className={`text-[9px] font-semibold border px-1.5 py-0.5 rounded-full ${
                          cand.status === 'Shortlisted' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : cand.status === 'Declined' 
                            ? 'bg-red-50 border-red-200 text-red-700' 
                            : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                        }`}>
                          {cand.status}
                        </span>
                      </div>
                    </div>

                    {/* Resume rating bio & skills */}
                    <div className="pl-12 space-y-2">
                      {cand.bio && <p className="text-xs text-zinc-500 leading-normal">{cand.bio}</p>}
                      
                      {/* Skills match report */}
                      <div className="flex flex-wrap gap-1">
                        {cand.matchedSkills?.map((sk: string) => (
                          <span key={sk} className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-1.5 py-0.5 rounded-sm">
                            ✓ {sk}
                          </span>
                        ))}
                        {cand.missingSkills?.map((sk: string) => (
                          <span key={sk} className="text-[8px] bg-zinc-50 border border-zinc-150 text-zinc-400 px-1.5 py-0.5 rounded-sm">
                            Missing: {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 border-t border-zinc-50 pt-3">
                      <button
                        onClick={() => handleStatusChange(cand._id, 'Declined')}
                        disabled={cand.status === 'Declined'}
                        className="px-2.5 py-1.5 border border-zinc-200 hover:border-red-200 rounded-md text-[10px] font-semibold text-zinc-500 hover:text-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleStatusChange(cand._id, 'Shortlisted')}
                        disabled={cand.status === 'Shortlisted'}
                        className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-[10px] font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                      >
                        Shortlist Candidate
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* JOB CREATION MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-sans">
          {/* Backdrop */}
          <div 
            onClick={() => setShowPostModal(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-200"
          />
          {/* Form Modal */}
          <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-zinc-900 text-base">Create Requisition</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Post an active job listing to match with candidates.</p>
              </div>
              <button 
                onClick={() => setShowPostModal(false)}
                className="text-zinc-400 hover:text-zinc-950 p-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostJob} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 block">Job Requisition Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Senior Frontend Architect"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Job Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Salary Package</label>
                  <input
                    type="text"
                    name="salary"
                    placeholder="e.g. $130k - $160k"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 block">Required Skills Matrix (Comma Separated)</label>
                <input
                  type="text"
                  name="requirements"
                  placeholder="React, TypeScript, CSS, Node.js..."
                  value={formData.requirements}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition"
                  required
                />
                <span className="text-[9px] text-zinc-400 block">These tags are compared against candidate skills to compute match scores.</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 block">Requisition Details & Description</label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Describe the team, active projects, daily tasks, and requirements..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition"
                  required
                />
              </div>

              <div className="pt-2 border-t border-zinc-150 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 border border-zinc-200 hover:border-zinc-300 rounded-lg font-semibold text-zinc-600 hover:text-zinc-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Job Requisition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
