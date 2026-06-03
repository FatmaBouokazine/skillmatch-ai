'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { token } = useAuth();

  return (
    <div className="flex flex-col gap-20 py-6 font-sans">
      
      {/* HERO SECTION */}
      <section className="grid gap-12 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Intelligence-backed Job Placement
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-tight">
            Connecting talent through skills, not keywords.
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 max-w-xl leading-relaxed">
            SkillMatch AI parses resumes and evaluates match percentages dynamically. Candidates get actionable resume feedback, and recruiters get pre-screened pipelines.
          </p>
          
          <div className="flex flex-wrap gap-3 pt-2">
            {token ? (
              <Link 
                href="/dashboard" 
                className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition duration-150 shadow-xs"
              >
                Go to Workspace
              </Link>
            ) : (
              <>
                <Link 
                  href="/register" 
                  className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition duration-150 shadow-xs"
                >
                  Create Account
                </Link>
                <Link 
                  href="/login" 
                  className="rounded-lg border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition duration-150"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Visual panel */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 shadow-xs space-y-6">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Platform capabilities</h3>
          <div className="space-y-4">
            <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-xs transition duration-200 hover:border-zinc-300">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Candidate Service</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Auto-Matching</span>
              </div>
              <p className="mt-2 text-sm font-medium text-zinc-800">Dynamic Resume Rating</p>
              <p className="mt-1 text-xs text-zinc-500">Upload your profile to receive instant skills scores and customized improvement insights.</p>
            </div>

            <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-xs transition duration-200 hover:border-zinc-300">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recruiter Service</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Ranked Pipelines</span>
              </div>
              <p className="mt-2 text-sm font-medium text-zinc-800">Direct Requisition Matches</p>
              <p className="mt-1 text-xs text-zinc-500">Post job requirements and see candidates sorted instantly by calculated fit percentages.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE WORKFLOWS */}
      <section className="border-t border-zinc-200 pt-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">Tailored experiences for both sides</h2>
          <p className="mt-2 text-zinc-500 text-sm sm:text-base">We have designed dedicated dashboards to eliminate the friction in shortlisting.</p>
        </div>
        
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs space-y-4">
            <div className="text-xl">📄</div>
            <h3 className="font-semibold text-zinc-800 text-base">For Candidates</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Upload your resume, track top and last scores, and manage your profile and account from a simple dashboard.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs space-y-4">
            <div className="text-xl">💼</div>
            <h3 className="font-semibold text-zinc-800 text-base">For Recruiters</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Post jobs, see how many candidates you have hired, and manage your company profile and account settings.
            </p>
          </div>
        </div>
      </section>

      {/* STATS / OUTCOMES */}
      <section className="bg-zinc-900 text-white rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Ready to optimize your hiring experience?</h2>
          <p className="text-zinc-400 text-sm">Create an account or sign in to get started with the SkillMatch AI engine.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {token ? (
            <Link 
              href="/dashboard" 
              className="rounded-lg bg-white text-zinc-900 px-6 py-3 text-sm font-semibold hover:bg-zinc-100 transition duration-150"
            >
              Enter Application
            </Link>
          ) : (
            <>
              <Link 
                href="/register" 
                className="rounded-lg bg-white text-zinc-900 px-6 py-3 text-sm font-semibold hover:bg-zinc-100 transition duration-150"
              >
                Sign Up Now
              </Link>
              <Link 
                href="/login" 
                className="rounded-lg border border-zinc-700 text-white bg-zinc-800 px-6 py-3 text-sm font-semibold hover:bg-zinc-700 transition duration-150"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

    </div>
  );
}
