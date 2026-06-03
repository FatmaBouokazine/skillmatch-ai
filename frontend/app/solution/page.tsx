'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function SolutionPage() {
  const { token } = useAuth();

  return (
    <div className="flex flex-col gap-16 py-6 font-sans">
      
      {/* Introduction */}
      <section className="grid gap-12 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-zinc-500 shadow-xs">
            Our Solution
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            An automated, skill-first matching ecosystem.
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 leading-relaxed">
            SkillMatch AI parses technical competencies directly from profiles and resumes, cross-checking them against requirements to produce real-time match rankings.
          </p>
          <div className="flex flex-wrap gap-3">
            {token ? (
              <Link 
                href="/dashboard" 
                className="rounded-lg bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition duration-150"
              >
                Go to Workspace
              </Link>
            ) : (
              <>
                <Link 
                  href="/register" 
                  className="rounded-lg bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition duration-150"
                >
                  Create Account
                </Link>
                <Link 
                  href="/about" 
                  className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition duration-150"
                >
                  About Our Team
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature list panel */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 space-y-6">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Matching pipeline steps</h3>
          <ul className="space-y-4 text-sm text-zinc-600">
            <li className="flex gap-3">
              <span className="text-zinc-400 font-semibold">Step 1</span>
              <div>
                <p className="font-medium text-zinc-800">Job requirements definition</p>
                <p className="text-xs text-zinc-500 mt-0.5">Recruiters specify key skill tags required for the requisition.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-zinc-400 font-semibold">Step 2</span>
              <div>
                <p className="font-medium text-zinc-800">Profile & Resume mapping</p>
                <p className="text-xs text-zinc-500 mt-0.5">Candidates input their technical skills. Resumes are evaluated for completeness.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-zinc-400 font-semibold">Step 3</span>
              <div>
                <p className="font-medium text-zinc-800">Live capability calculation</p>
                <p className="text-xs text-zinc-500 mt-0.5">Our engine calculates matches on-the-fly and presents clear fit signals.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Grid panels */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">For Candidates</span>
          <h3 className="text-lg font-semibold text-zinc-800">Improve resume score and check alignment</h3>
          <ul className="space-y-2 text-xs text-zinc-500 leading-relaxed">
            <li>• See how your profile fits each job with an explicit matching percentage indicator.</li>
            <li>• Evaluate your resume to obtain an automated rating score out of 100.</li>
            <li>• View a checklist detailing matched skills vs missing skills for target roles.</li>
          </ul>
        </div>

        <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">For Recruiters</span>
          <h3 className="text-lg font-semibold text-zinc-800">Post jobs and sort incoming applicants</h3>
          <ul className="space-y-2 text-xs text-zinc-500 leading-relaxed">
            <li>• Post active openings specifying company details and core technical tags.</li>
            <li>• View a list of applied candidates sorted automatically from highest match score to lowest.</li>
            <li>• Update applications status to "Shortlisted" or "Declined" to manage pipelines.</li>
          </ul>
        </div>
      </section>

    </div>
  );
}
