'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { uploadResume, getResumeScore, extractResume } from '../../../services/employeeService';
import { updateEmployeeProfile, addSkill } from '../../../services/employeeService';
import { useAuth } from '../../../context/AuthContext';

export default function EmployeeResumePage() {
  const { user, loading } = useRequireAuth('EMPLOYEE');
  const { refreshUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [scoreData, setScoreData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<any>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!user) return;
    getResumeScore().then(setScoreData).catch(() => {});
  }, [user]);

  const handleFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      setMsg({ type: 'error', text: 'Please select a valid PDF file.' });
      return;
    }
    setUploading(true);
    setMsg(null);
    try {
      const result = await uploadResume(file);
      setScoreData({ resumeScore: result.resumeScore, resumeHints: result.resumeHints, resumeUrl: result.resumeUrl });
      setMsg({ type: 'success', text: 'Resume uploaded and scored successfully!' });
      await refreshUser();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleExtract = async () => {
    setExtracting(true);
    setMsg(null);
    try {
      const res = await extractResume();
      setExtracted(res.extracted);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'AI extraction failed.' });
    } finally {
      setExtracting(false);
    }
  };

  const handleConfirmExtract = async () => {
    if (!extracted) return;
    try {
      const { skills, experience: _exp, ...profileFields } = extracted;
      await updateEmployeeProfile(profileFields);
      if (Array.isArray(skills)) {
        for (const sk of skills) {
          await addSkill(sk).catch(() => {});
        }
      }
      setExtracted(null);
      setMsg({ type: 'success', text: 'Profile auto-filled from resume!' });
      await refreshUser();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Failed to apply extracted data.' });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-[#76cdcd] animate-spin" /></div>;

  const score = scoreData?.resumeScore ?? 0;
  const hints: string[] = Array.isArray(scoreData?.resumeHints) ? scoreData.resumeHints : [];
  const scoreColor = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-500' : 'text-red-500';
  const barColor = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Resume</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Upload your PDF resume to get scored and analyzed.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition
          ${dragOver ? 'border-[#76cdcd] bg-[#e0f5f5]/30' : 'border-zinc-200 hover:border-[#76cdcd] hover:bg-[#e0f5f5]/20'}`}
      >
        <svg className="w-10 h-10 text-[#76cdcd]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-700">{uploading ? 'Uploading and scoring…' : 'Drop your PDF here or click to browse'}</p>
          <p className="text-xs text-zinc-400 mt-1">PDF only · max 5 MB</p>
        </div>
        {uploading && <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-[#76cdcd] animate-spin" />}
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {/* Score Display */}
      {score > 0 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800">Resume Score</h2>
            {scoreData?.resumeUrl && (
              <a href={`http://localhost:5050${scoreData.resumeUrl}`} target="_blank" rel="noreferrer" className="text-xs text-zinc-500 underline hover:text-zinc-800">View PDF</a>
            )}
          </div>
          <div className={`text-5xl font-bold ${scoreColor}`}>{score}<span className="text-xl text-zinc-400 font-normal">/100</span></div>
          <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
            <div className={`h-2.5 rounded-full ${barColor}`} style={{ width: `${score}%` }} />
          </div>

          {hints.length > 0 && (
            <div className="pt-2 border-t border-zinc-100">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Improvement Hints</p>
              <ul className="space-y-2">
                {hints.map((h, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-600">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-100 text-zinc-500 text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sprint 2: AI Extract */}
          <button
            onClick={handleExtract}
            disabled={extracting}
            className="mt-2 w-full py-2.5 rounded-xl bg-[#76cdcd] text-white text-sm font-semibold hover:bg-[#5ab5b5] transition disabled:opacity-50"
          >
            {extracting ? 'Extracting with AI…' : '✨ Auto-fill Profile from Resume'}
          </button>
        </div>
      )}

      {/* Extracted Preview Modal */}
      {extracted && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-zinc-900">Auto-detected Info</h2>
            <p className="text-xs text-zinc-500">Review and confirm the data extracted from your resume.</p>
            <div className="space-y-3">
              {['firstName', 'lastName', 'title', 'location'].map((field) => (
                <div key={field} className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    value={extracted[field] || ''}
                    onChange={(e) => setExtracted({ ...extracted, [field]: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500">Bio</label>
                <textarea
                  value={extracted.bio || ''}
                  onChange={(e) => setExtracted({ ...extracted, bio: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500">Skills</label>
                <p className="text-sm text-zinc-700">{Array.isArray(extracted.skills) ? extracted.skills.join(', ') : 'None detected'}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleConfirmExtract} className="flex-1 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800">Confirm & Apply</button>
              <button onClick={() => setExtracted(null)} className="flex-1 py-2.5 border border-zinc-200 text-sm font-semibold rounded-xl hover:bg-zinc-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
