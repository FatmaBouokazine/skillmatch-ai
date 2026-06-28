'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { evaluateResume } from '../../../services/authService';

export default function CandidateOverviewPage() {
  const { user, token, loading, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumeText, setResumeText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!token || !user) router.push('/login');
      else if (user.role !== 'candidate') router.push('/dashboard');
    }
  }, [user, token, loading, router]);

  useEffect(() => {
    if (user?.resumeText) setResumeText(user.resumeText);
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setResumeText(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setEvaluating(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await evaluateResume(resumeText, token);
      await refreshUser();
      setSuccessMsg('Resume uploaded and scored successfully.');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to evaluate resume.');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading || !user) return null;

  const topScore = user.topResumeScore ?? user.resumeScore ?? 0;
  const lastScore = user.lastResumeScore ?? user.resumeScore ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Overview</h1>
        <p className="text-zinc-500 text-sm mt-1">Upload your resume and track your scores.</p>
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
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Top Resume Score</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900">{topScore}</span>
            <span className="text-xs text-zinc-400">/ 100</span>
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Last Resume Score</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900">{lastScore}</span>
            <span className="text-xs text-zinc-400">/ 100</span>
          </div>
        </div>
      </div>

      <section className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="font-semibold text-zinc-900 text-sm">Upload Resume</h2>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Paste your resume or upload a .txt file. Update your bio and skills in Profile for a better score.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900"
            >
              Upload .txt file
            </button>
          </div>
          <textarea
            rows={8}
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            required
          />
          {user.resumeFeedback && user.resumeFeedback.length > 0 && (
            <ul className="text-xs text-zinc-600 space-y-1 border-t border-zinc-100 pt-3">
              {user.resumeFeedback.map((tip: string, idx: number) => (
                <li key={idx}>• {tip}</li>
              ))}
            </ul>
          )}
          <button
            type="submit"
            disabled={evaluating}
            className="rounded-lg bg-zinc-900 hover:bg-zinc-800 px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {evaluating ? 'Scoring resume...' : 'Upload & Score Resume'}
          </button>
        </form>
      </section>
    </div>
  );
}
