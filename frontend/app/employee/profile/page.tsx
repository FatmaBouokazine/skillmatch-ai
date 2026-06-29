'use client';

import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getEmployeeProfile, updateEmployeeProfile } from '../../../services/employeeService';
import { useAuth } from '../../../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExperienceEntry { company: string; role: string; startDate: string; endDate: string; current: boolean; description: string; }
interface EducationEntry  { institution: string; degree: string; field: string; startDate: string; endDate: string; }

const emptyExp  = (): ExperienceEntry => ({ company: '', role: '', startDate: '', endDate: '', current: false, description: '' });
const emptyEdu  = (): EducationEntry  => ({ institution: '', degree: '', field: '', startDate: '', endDate: '' });

// ─── Mini helpers ─────────────────────────────────────────────────────────────
function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-zinc-800">{title}</h2>
      <button type="button" onClick={onAdd}
        className="text-xs font-semibold text-[#3e9999] hover:text-[#5ab5b5] transition flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add
      </button>
    </div>
  );
}
function InputField({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean }) {
  const cls = "w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#76cdcd] focus:ring-1 focus:ring-[#e0f5f5] transition";
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-zinc-600">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls + " resize-none"} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />}
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { user, loading } = useRequireAuth('EMPLOYEE');
  const { refreshUser } = useAuth();

  const [basic, setBasic] = useState({
    firstName: '', lastName: '', title: '', bio: '', location: '', phone: '', linkedIn: '', github: '',
  });
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [education, setEducation]   = useState<EducationEntry[]>([]);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    getEmployeeProfile().then((p) => {
      setBasic({
        firstName: p.firstName  || '',
        lastName:  p.lastName   || '',
        title:     p.title      || '',
        bio:       p.bio        || '',
        location:  p.location   || '',
        phone:     p.phone      || '',
        linkedIn:  p.linkedIn   || '',
        github:    p.github     || '',
      });
      setExperience(Array.isArray(p.experience) ? p.experience : []);
      setEducation(Array.isArray(p.education) ? p.education : []);
    }).catch(() => {});
  }, [user]);

  // ── experience helpers ───────────────────────────────────────────────────────
  const setExpField = (i: number, key: keyof ExperienceEntry, value: string | boolean) => {
    setExperience(prev => { const a = [...prev]; (a[i] as any)[key] = value; return a; });
  };
  const removeExp = (i: number) => setExperience(prev => prev.filter((_, idx) => idx !== i));

  // ── education helpers ────────────────────────────────────────────────────────
  const setEduField = (i: number, key: keyof EducationEntry, value: string) => {
    setEducation(prev => { const a = [...prev]; (a[i] as any)[key] = value; return a; });
  };
  const removeEdu = (i: number) => setEducation(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await updateEmployeeProfile({ ...basic, experience, education });
      await refreshUser();
      setMsg({ type: 'success', text: 'Profile saved successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-[#76cdcd] animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Profile</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Update your personal details, experience, and education.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Basic Info ─────────────────────────────────────────────────────── */}
        <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-800">Personal Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="First Name" value={basic.firstName} onChange={v => setBasic(b => ({ ...b, firstName: v }))} placeholder="Jane" />
            <InputField label="Last Name"  value={basic.lastName}  onChange={v => setBasic(b => ({ ...b, lastName:  v }))} placeholder="Doe" />
          </div>
          <InputField label="Current Title" value={basic.title}    onChange={v => setBasic(b => ({ ...b, title: v }))}    placeholder="e.g. Senior Frontend Engineer" />
          <InputField label="Location"      value={basic.location} onChange={v => setBasic(b => ({ ...b, location: v }))} placeholder="e.g. San Francisco, CA" />
          <InputField label="Phone"         value={basic.phone}    onChange={v => setBasic(b => ({ ...b, phone: v }))}    placeholder="+1 555 000 0000" />
          <InputField label="LinkedIn URL"  value={basic.linkedIn} onChange={v => setBasic(b => ({ ...b, linkedIn: v }))} placeholder="https://linkedin.com/in/…" />
          <InputField label="GitHub URL"    value={basic.github}   onChange={v => setBasic(b => ({ ...b, github: v }))}   placeholder="https://github.com/…" />
          <InputField label="Professional Bio" value={basic.bio}   onChange={v => setBasic(b => ({ ...b, bio: v }))}      placeholder="Write a short professional summary…" textarea />
        </section>

        {/* ── Work Experience ───────────────────────────────────────────────── */}
        <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
          <SectionHeader title="Work Experience" onAdd={() => setExperience(prev => [...prev, emptyExp()])} />

          {experience.length === 0 && (
            <p className="text-sm text-zinc-400">No experience entries yet. Click &quot;Add&quot; to get started.</p>
          )}

          {experience.map((exp, i) => (
            <div key={i} className="border border-zinc-100 rounded-xl p-4 space-y-3 bg-zinc-50/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Entry {i + 1}</span>
                <button type="button" onClick={() => removeExp(i)} className="text-xs text-red-400 hover:text-red-600 transition font-semibold">Remove</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Company"    value={exp.company}   onChange={v => setExpField(i, 'company', v)} placeholder="Acme Corp" />
                <InputField label="Job Title"  value={exp.role}      onChange={v => setExpField(i, 'role', v)}    placeholder="Software Engineer" />
                <InputField label="Start Date" value={exp.startDate} onChange={v => setExpField(i, 'startDate', v)} placeholder="Jan 2022" />
                <InputField label="End Date"   value={exp.current ? 'Present' : exp.endDate} onChange={v => setExpField(i, 'endDate', v)} placeholder="Dec 2024" />
              </div>
              <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer">
                <input type="checkbox" checked={exp.current} onChange={e => setExpField(i, 'current', e.target.checked)}
                  className="rounded border-zinc-300 accent-[#76cdcd]" />
                I currently work here
              </label>
              <InputField label="Description" value={exp.description} onChange={v => setExpField(i, 'description', v)} placeholder="What did you do here?" textarea />
            </div>
          ))}
        </section>

        {/* ── Education ─────────────────────────────────────────────────────── */}
        <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
          <SectionHeader title="Education" onAdd={() => setEducation(prev => [...prev, emptyEdu()])} />

          {education.length === 0 && (
            <p className="text-sm text-zinc-400">No education entries yet. Click &quot;Add&quot; to get started.</p>
          )}

          {education.map((edu, i) => (
            <div key={i} className="border border-zinc-100 rounded-xl p-4 space-y-3 bg-zinc-50/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Entry {i + 1}</span>
                <button type="button" onClick={() => removeEdu(i)} className="text-xs text-red-400 hover:text-red-600 transition font-semibold">Remove</button>
              </div>
              <InputField label="Institution" value={edu.institution} onChange={v => setEduField(i, 'institution', v)} placeholder="MIT" />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Degree"     value={edu.degree}    onChange={v => setEduField(i, 'degree', v)}    placeholder="B.Sc." />
                <InputField label="Field"      value={edu.field}     onChange={v => setEduField(i, 'field', v)}     placeholder="Computer Science" />
                <InputField label="Start Year" value={edu.startDate} onChange={v => setEduField(i, 'startDate', v)} placeholder="2018" />
                <InputField label="End Year"   value={edu.endDate}   onChange={v => setEduField(i, 'endDate', v)}   placeholder="2022" />
              </div>
            </div>
          ))}
        </section>

        <button type="submit" disabled={saving}
          className="w-full py-2.5 bg-[#76cdcd] text-white text-sm font-semibold rounded-xl hover:bg-[#5ab5b5] transition disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
