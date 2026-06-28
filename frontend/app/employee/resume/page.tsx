'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { uploadResume, getResumeScore } from '../../../services/employeeService';
import { updateEmployeeProfile, addSkill } from '../../../services/employeeService';
import { useAuth } from '../../../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExperienceEntry { company: string; role: string; startDate: string; endDate: string; current: boolean; description: string; }
interface EducationEntry  { institution: string; degree: string; field: string; startDate: string; endDate: string; }
interface Extracted {
  firstName: string; lastName: string; title: string; location: string;
  phone: string; linkedIn: string; github: string; bio: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{children}</p>;
}
function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  const cls = "w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#76cdcd] focus:ring-2 focus:ring-[#e0f5f5] transition";
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-zinc-500">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className={cls + " resize-none"} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

export default function EmployeeResumePage() {
  const { user, loading } = useRequireAuth('EMPLOYEE');
  const { refreshUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [scoreData, setScoreData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [applying, setApplying] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'experience' | 'education'>('info');

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
      await refreshUser();
      if (result.extracted) {
        // Normalise arrays so UI never crashes on null
        setExtracted({
          firstName: result.extracted.firstName || '',
          lastName:  result.extracted.lastName  || '',
          title:     result.extracted.title     || '',
          location:  result.extracted.location  || '',
          phone:     result.extracted.phone     || '',
          linkedIn:  result.extracted.linkedIn  || '',
          github:    result.extracted.github    || '',
          bio:       result.extracted.bio       || '',
          skills:    Array.isArray(result.extracted.skills)     ? result.extracted.skills     : [],
          experience: Array.isArray(result.extracted.experience) ? result.extracted.experience : [],
          education:  Array.isArray(result.extracted.education)  ? result.extracted.education  : [],
        });
        setActiveTab('info');
      } else {
        setMsg({ type: 'success', text: 'Resume uploaded and scored! Could not extract profile data.' });
      }
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

  const handleConfirm = async () => {
    if (!extracted) return;
    setApplying(true);
    try {
      const { skills, ...profileFields } = extracted;
      await updateEmployeeProfile(profileFields as Record<string, unknown>);
      // Add skills one-by-one (deduplication handled by backend)
      for (const sk of skills) {
        await addSkill(sk.trim()).catch(() => {});
      }
      await refreshUser();
      setExtracted(null);
      setMsg({ type: 'success', text: 'Profile, skills, experience and education filled from resume!' });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Failed to apply extracted data.' });
    } finally {
      setApplying(false);
    }
  };

  // ── helpers to mutate extracted state ───────────────────────────────────────
  const setField = (key: keyof Extracted, value: unknown) =>
    setExtracted(prev => prev ? { ...prev, [key]: value } : prev);
  const setExpField = (i: number, key: keyof ExperienceEntry, value: string | boolean) =>
    setExtracted(prev => {
      if (!prev) return prev;
      const exp = [...prev.experience];
      (exp[i] as any)[key] = value;
      return { ...prev, experience: exp };
    });
  const setEduField = (i: number, key: keyof EducationEntry, value: string) =>
    setExtracted(prev => {
      if (!prev) return prev;
      const edu = [...prev.education];
      (edu[i] as any)[key] = value;
      return { ...prev, education: edu };
    });
  const removeExp = (i: number) => setExtracted(prev => prev ? { ...prev, experience: prev.experience.filter((_, idx) => idx !== i) } : prev);
  const removeEdu = (i: number) => setExtracted(prev => prev ? { ...prev, education: prev.education.filter((_, idx) => idx !== i) } : prev);
  const removeSkill = (s: string) => setExtracted(prev => prev ? { ...prev, skills: prev.skills.filter(x => x !== s) } : prev);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-[#76cdcd] animate-spin" />
    </div>
  );

  const score = scoreData?.resumeScore ?? 0;
  const hints: string[] = Array.isArray(scoreData?.resumeHints) ? scoreData.resumeHints : [];
  const scoreColor = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-500' : 'text-red-500';
  const barColor   = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';

  const TABS = [
    { key: 'info',       label: 'Basic Info' },
    { key: 'skills',     label: `Skills (${extracted?.skills.length ?? 0})` },
    { key: 'experience', label: `Experience (${extracted?.experience.length ?? 0})` },
    { key: 'education',  label: `Education (${extracted?.education.length ?? 0})` },
  ] as const;

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Resume</h1>
        <p className="text-sm text-zinc-500 mt-1">Upload your PDF — we&apos;ll score it and fill your profile with AI.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition
          ${dragOver ? 'border-[#76cdcd] bg-[#e0f5f5]/30' : 'border-zinc-200 hover:border-[#76cdcd] hover:bg-[#e0f5f5]/20'}`}
      >
        <svg className="w-10 h-10 text-[#76cdcd]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div className="text-center">
          {uploading ? (
            <>
              <p className="text-sm font-medium text-zinc-700">Uploading, scoring and extracting with AI…</p>
              <p className="text-xs text-zinc-400 mt-1">This may take a few seconds</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-zinc-700">Drop your PDF here or click to browse</p>
              <p className="text-xs text-zinc-400 mt-1">PDF only · max 5 MB</p>
            </>
          )}
        </div>
        {uploading && <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-[#76cdcd] animate-spin" />}
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {/* Score Card */}
      {score > 0 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800">Resume Score</h2>
            {scoreData?.resumeUrl && (
              <a href={`http://localhost:5050${scoreData.resumeUrl}`} target="_blank" rel="noreferrer"
                className="text-xs text-zinc-400 hover:text-zinc-700 transition">View PDF →</a>
            )}
          </div>
          <div className={`text-5xl font-bold ${scoreColor}`}>{score}<span className="text-xl text-zinc-400 font-normal">/100</span></div>
          <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
            <div className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${score}%` }} />
          </div>
          {hints.length > 0 && (
            <div className="pt-2 border-t border-zinc-100">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Improvement Tips</p>
              <ul className="space-y-2">
                {hints.map((h, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-zinc-600">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-100 text-zinc-500 text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── AI Review Modal ──────────────────────────────────────────────────── */}
      {extracted && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setExtracted(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full  flex flex-col max-h-[90vh]">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Review AI-Extracted Data</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Edit anything before applying to your profile.</p>
              </div>
              <button onClick={() => setExtracted(null)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-100 px-6 shrink-0">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-3 text-xs font-semibold border-b-2 transition ${activeTab === t.key ? 'border-[#76cdcd] text-[#3e9999]' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              {/* ── Basic Info ── */}
              {activeTab === 'info' && (
                <>
                  <SectionTitle>Personal Details</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First Name" value={extracted.firstName} onChange={v => setField('firstName', v)} />
                    <Field label="Last Name"  value={extracted.lastName}  onChange={v => setField('lastName', v)} />
                  </div>
                  <Field label="Current Title" value={extracted.title}    onChange={v => setField('title', v)} />
                  <Field label="Location"      value={extracted.location} onChange={v => setField('location', v)} />
                  <Field label="Phone"         value={extracted.phone}    onChange={v => setField('phone', v)} />
                  <Field label="LinkedIn URL"  value={extracted.linkedIn} onChange={v => setField('linkedIn', v)} />
                  <Field label="GitHub URL"    value={extracted.github}   onChange={v => setField('github', v)} />
                  <Field label="Professional Bio" value={extracted.bio}  onChange={v => setField('bio', v)} textarea />
                </>
              )}

              {/* ── Skills ── */}
              {activeTab === 'skills' && (
                <>
                  <SectionTitle>Detected Skills</SectionTitle>
                  {extracted.skills.length === 0
                    ? <p className="text-sm text-zinc-400">No skills detected.</p>
                    : (
                      <div className="flex flex-wrap gap-2">
                        {extracted.skills.map(s => (
                          <span key={s} className="inline-flex items-center gap-1.5 bg-[#e0f5f5] text-[#3e9999] text-sm font-medium px-3 py-1.5 rounded-full border border-[#76cdcd]/30">
                            {s}
                            <button onClick={() => removeSkill(s)} className="text-[#76cdcd]/60 hover:text-red-500 transition font-bold leading-none">×</button>
                          </span>
                        ))}
                      </div>
                    )
                  }
                </>
              )}

              {/* ── Experience ── */}
              {activeTab === 'experience' && (
                <>
                  <SectionTitle>Work Experience</SectionTitle>
                  {extracted.experience.length === 0
                    ? <p className="text-sm text-zinc-400">No work experience detected.</p>
                    : extracted.experience.map((exp, i) => (
                      <div key={i} className="border border-zinc-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-400">Entry {i + 1}</span>
                          <button onClick={() => removeExp(i)} className="text-xs text-red-400 hover:text-red-600 transition">Remove</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Company"   value={exp.company}   onChange={v => setExpField(i, 'company', v)} />
                          <Field label="Job Title" value={exp.role}      onChange={v => setExpField(i, 'role', v)} />
                          <Field label="Start Date" value={exp.startDate} onChange={v => setExpField(i, 'startDate', v)} />
                          <Field label="End Date"  value={exp.current ? 'Present' : exp.endDate} onChange={v => setExpField(i, 'endDate', v)} />
                        </div>
                        <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer">
                          <input type="checkbox" checked={exp.current} onChange={e => setExpField(i, 'current', e.target.checked)}
                            className="rounded border-zinc-300 accent-[#76cdcd]" />
                          Current role
                        </label>
                        <Field label="Description" value={exp.description} onChange={v => setExpField(i, 'description', v)} textarea />
                      </div>
                    ))
                  }
                </>
              )}

              {/* ── Education ── */}
              {activeTab === 'education' && (
                <>
                  <SectionTitle>Education</SectionTitle>
                  {extracted.education.length === 0
                    ? <p className="text-sm text-zinc-400">No education detected.</p>
                    : extracted.education.map((edu, i) => (
                      <div key={i} className="border border-zinc-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-400">Entry {i + 1}</span>
                          <button onClick={() => removeEdu(i)} className="text-xs text-red-400 hover:text-red-600 transition">Remove</button>
                        </div>
                        <Field label="Institution" value={edu.institution} onChange={v => setEduField(i, 'institution', v)} />
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Degree" value={edu.degree}     onChange={v => setEduField(i, 'degree', v)} />
                          <Field label="Field"  value={edu.field}      onChange={v => setEduField(i, 'field', v)} />
                          <Field label="Start Year" value={edu.startDate} onChange={v => setEduField(i, 'startDate', v)} />
                          <Field label="End Year"   value={edu.endDate}   onChange={v => setEduField(i, 'endDate', v)} />
                        </div>
                      </div>
                    ))
                  }
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 pt-3 border-t border-zinc-100 flex gap-3 shrink-0">
              <button onClick={() => setExtracted(null)} className="flex-1 py-2.5 border border-zinc-200 text-sm font-semibold text-zinc-600 rounded-xl hover:bg-zinc-50 transition">
                Cancel
              </button>
              <button onClick={handleConfirm} disabled={applying}
                className="flex-1 py-2.5 bg-[#76cdcd] text-white text-sm font-semibold rounded-xl hover:bg-[#5ab5b5] transition disabled:opacity-50 flex items-center justify-center gap-2">
                {applying && <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                {applying ? 'Applying…' : 'Apply to Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

