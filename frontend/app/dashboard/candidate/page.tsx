'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getJobs, applyJob, updateProfile } from '../../../services/authService';

export default function CandidateDashboardPage() {
  const { user, token, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [fetchingJobs, setFetchingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  
  // Resume parsing/rating states
  const [resumeText, setResumeText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evalStatus, setEvalStatus] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Authenticate candidate role
  useEffect(() => {
    if (!loading) {
      if (!token || !user) {
        router.push('/login');
      } else if (user.role !== 'candidate') {
        router.push('/dashboard');
      }
    }
  }, [user, token, loading, router]);

  // Load jobs list
  useEffect(() => {
    if (token && user?.role === 'candidate') {
      fetchJobsList();
      // Prep skills text from profile
      if (user.skills) {
        setSkillsText(user.skills.join(', '));
      }
      if (user.resumeText) {
        setResumeText(user.resumeText);
      }
    }
  }, [token, user]);

  const fetchJobsList = async () => {
    if (!token) return;
    setFetchingJobs(true);
    try {
      const data = await getJobs(token);
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setFetchingJobs(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!token) return;
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await applyJob(jobId, token);
      setActionSuccess(`Successfully applied for the job!`);
      // Reload jobs to get updated application status
      await fetchJobsList();
      // Reload user profile to update applied list
      await refreshUser();
    } catch (err: any) {
      setActionError(err.message || 'Failed to apply.');
    }
  };

  const handleEvaluateResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setEvaluating(true);
    setActionSuccess(null);
    setActionError(null);

    // Simulate AI parsing stages
    setEvalStatus('Reading document formatting...');
    await new Promise(r => setTimeout(r, 600));
    setEvalStatus('Extracting tech skill vectors...');
    await new Promise(r => setTimeout(r, 600));
    setEvalStatus('Compiling matching summaries...');
    await new Promise(r => setTimeout(r, 600));

    try {
      // Sync candidate skills list parsed from text box
      const updatedUser = await updateProfile({
        skills: skillsText,
        resumeText: resumeText,
        bio: user.bio || `Passionate technical engineer. Technical focus.`
      }, token);
      
      await refreshUser();
      setActionSuccess('Resume evaluated! Your skill rating has been updated.');
    } catch (err: any) {
      setActionError(err.message || 'Evaluation failed.');
    } finally {
      setEvaluating(false);
      setEvalStatus('');
    }
  };

  // Helper to determine match badge styling
  const getMatchScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-250 text-emerald-700';
    if (score >= 50) return 'bg-amber-50 border-amber-250 text-amber-700';
    return 'bg-zinc-50 border-zinc-200 text-zinc-600';
  };

  if (loading || !user) {
    return null; // LayoutManager handles spinner
  }

  const appliedCount = user.appliedJobs?.length || 0;

  return (
    <div className="space-y-12">
      
      {/* SUCCESS / ERROR NOTIFICATIONS */}
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

      {/* OVERVIEW HEADER */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Candidate Workspace</h1>
        <p className="text-zinc-500 text-sm max-w-xl">
          Evaluate your resume, browse available vacancies, and examine custom compatibility metrics.
        </p>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Resume Rating Score</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">{user.resumeScore || 0}</span>
              <span className="text-xs text-zinc-400">/ 100</span>
            </div>
            <div className="mt-2 w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-zinc-900 h-full rounded-full transition-all duration-350"
                style={{ width: `${user.resumeScore || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Applications Submitted</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">{appliedCount}</span>
              <span className="text-xs text-zinc-400">active submissions</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Skill Index Count</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">{user.skills?.length || 0}</span>
              <span className="text-xs text-zinc-400">technical skill tags</span>
            </div>
          </div>
        </div>
      </section>

      {/* RESUME EVALUATION & RATING AREA */}
      <section id="resume" className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="font-semibold text-zinc-900 text-sm">Resume Evaluation & Skills Profiling</h2>
          {user.resumeScore > 0 && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Scored Profile
            </span>
          )}
        </div>
        
        <div className="p-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Rating Form */}
          <form onSubmit={handleEvaluateResume} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 block">Technical Skills Matrix (Comma Separated)</label>
              <input
                type="text"
                placeholder="React, TypeScript, CSS, Node.js, Git..."
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition duration-150"
                required
              />
              <span className="text-[10px] text-zinc-400 block">Add technical tags which match job listings to increase overlap metrics.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 block">Resume Raw Text</label>
              <textarea
                rows={5}
                placeholder="Paste your CV / Resume description here. Detail your tech stack, projects, and work experience..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition duration-150 font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={evaluating}
              className="rounded-lg bg-zinc-900 hover:bg-zinc-800 px-5 py-2.5 text-xs font-semibold text-white transition duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {evaluating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-white rounded-full animate-spin"></span>
                  <span>{evalStatus}</span>
                </>
              ) : (
                <>
                  <span>Evaluate Resume</span>
                </>
              )}
            </button>
          </form>

          {/* Feedback Report */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Resume Score Report</h3>
            {user.resumeScore > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-zinc-900 bg-white flex items-center justify-center font-bold text-base">
                    {user.resumeScore}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-800">Overall Strength Rating</p>
                    <p className="text-[10px] text-zinc-400">Recruiters prioritize applicants with scores &gt; 80%</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-zinc-200 pt-4">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Improvement Checkpoints</p>
                  {user.resumeFeedback && user.resumeFeedback.length > 0 ? (
                    <ul className="space-y-2">
                      {user.resumeFeedback.map((tip: string, idx: number) => (
                        <li key={idx} className="flex gap-2 text-xs text-zinc-600">
                          <span className="text-amber-500">⚡</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex gap-2 text-xs text-emerald-700">
                      <span>✓</span>
                      <span>Your profile is fully completed and optimized for matching!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-2">
                <div className="text-2xl">📄</div>
                <p className="text-xs font-semibold text-zinc-700">No score evaluated yet</p>
                <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">Fill in your skills matrix and paste your resume text on the left to trigger the analysis engine.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* JOBS & COMPATIBILITY MATCHES */}
      <section id="jobs" className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Job Matching Hub</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Explore active listings sorted by computed compatibility.</p>
          </div>
          <button 
            onClick={fetchJobsList}
            className="p-2 border border-zinc-200 hover:border-zinc-300 bg-white rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 transition"
            aria-label="Refresh job listings"
          >
            Refresh Hub
          </button>
        </div>

        {fetchingJobs ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-16 text-center shadow-xs">
            <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin mx-auto"></div>
            <p className="mt-3 text-xs text-zinc-400">Recalculating real-time skill matching indices...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl py-12 text-center shadow-xs">
            <p className="text-xs text-zinc-400">No active job listings found.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => {
              const hasApplied = job.applicationStatus !== null;
              return (
                <div key={job._id} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-6 hover:border-zinc-350 transition duration-200">
                  <div className="space-y-3">
                    
                    {/* Header: Title and Match */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-zinc-800 text-sm">{job.title}</h3>
                        <p className="text-xs text-zinc-500">{job.company}</p>
                      </div>
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${getMatchScoreBadge(job.matchScore || 0)}`}>
                        {job.matchScore || 0}% Match
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.requirements?.map((req: string) => {
                        const isMatched = job.matchedSkills?.some(
                          (m: string) => m.toLowerCase() === req.toLowerCase()
                        );
                        return (
                          <span 
                            key={req} 
                            className={`text-[9px] px-2 py-0.5 rounded-sm border ${
                              isMatched 
                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700 font-medium' 
                                : 'bg-zinc-50 border-zinc-150 text-zinc-400'
                            }`}
                          >
                            {req}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions & Meta */}
                  <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-[10px]">
                    <div className="text-zinc-400">
                      <span>📍 {job.location || 'Remote'}</span>
                      {job.salary && <span className="ml-2">• 💰 {job.salary}</span>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-2.5 py-1.5 border border-zinc-200 hover:border-zinc-300 rounded-md font-medium text-zinc-600 hover:text-zinc-900 transition duration-150"
                      >
                        Compare Skills
                      </button>
                      <button
                        onClick={() => handleApply(job._id)}
                        disabled={hasApplied}
                        className={`
                          px-3 py-1.5 rounded-md font-semibold text-white transition duration-150
                          ${hasApplied 
                            ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                            : 'bg-zinc-900 hover:bg-zinc-800 shadow-xs'
                          }
                        `}
                      >
                        {hasApplied ? `Applied (${job.applicationStatus})` : 'Apply Now'}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SKILLS COMPARISON MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-sans">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedJob(null)}
            className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-200"
          />
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-zinc-900 text-base">Skills Alignment Breakdown</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{selectedJob.title} at {selectedJob.company}</p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-zinc-400 hover:text-zinc-900 p-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Score circle */}
            <div className="flex items-center gap-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl px-4">
              <div className="w-14 h-14 rounded-full border-2 border-zinc-900 bg-white flex flex-col items-center justify-center font-bold text-zinc-800 text-xs">
                <span>{selectedJob.matchScore}%</span>
                <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-normal">Score</span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-800">
                  {selectedJob.matchScore >= 80 ? 'Strong Skill Fit' : selectedJob.matchScore >= 50 ? 'Moderate Fit' : 'Skills Gap Detected'}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-0.5 max-w-xs leading-normal">
                  {selectedJob.matchScore >= 80 
                    ? 'Your skills correspond highly to this recruiter\'s requirements. Apply immediately!' 
                    : 'Consider updating your profile skill tags on the dashboard if you have relevant experience.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Matched Skills */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Matched Skills ({selectedJob.matchedSkills?.length || 0})</p>
                {selectedJob.matchedSkills && selectedJob.matchedSkills.length > 0 ? (
                  <ul className="space-y-1.5">
                    {selectedJob.matchedSkills.map((sk: string) => (
                      <li key={sk} className="text-xs text-zinc-600 flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{sk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-400">None</p>
                )}
              </div>

              {/* Missing Skills */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Missing Skills ({selectedJob.missingSkills?.length || 0})</p>
                {selectedJob.missingSkills && selectedJob.missingSkills.length > 0 ? (
                  <ul className="space-y-1.5">
                    {selectedJob.missingSkills.map((sk: string) => (
                      <li key={sk} className="text-xs text-zinc-500 flex items-center gap-1.5">
                        <span className="text-amber-500 font-bold">!</span>
                        <span>{sk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-400">None</p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
