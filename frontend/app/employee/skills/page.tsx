'use client';

import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { getEmployeeProfile, addSkill, removeSkill } from '../../../services/employeeService';

export default function EmployeeSkillsPage() {
  const { user, loading } = useRequireAuth('EMPLOYEE');
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    getEmployeeProfile()
      .then((p) => setSkills(p.skills || []))
      .catch(() => {});
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSkill.trim();
    if (!name) return;
    setAdding(true);
    setMsg(null);
    try {
      const skill = await addSkill(name);
      setSkills((prev) => [...prev, skill]);
      setNewSkill('');
      setMsg({ type: 'success', text: `"${name}" added.` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to add skill.' });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    try {
      await removeSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      setMsg({ type: 'success', text: `"${name}" removed.` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to remove skill.' });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-[#76cdcd] animate-spin" /></div>;

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Skills</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Add skills to improve your job match score.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Add skill form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. React, Python, Figma…"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-[#76cdcd] focus:ring-1 focus:ring-[#e0f5f5] transition"
        />
        <button
          type="submit"
          disabled={adding || !newSkill.trim()}
          className="px-5 py-2.5 bg-[#76cdcd] text-white text-sm font-semibold rounded-xl hover:bg-[#5ab5b5] transition disabled:opacity-50"
        >
          {adding ? '…' : 'Add'}
        </button>
      </form>

      {/* Skills list */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
          {skills.length} skill{skills.length !== 1 ? 's' : ''} listed
        </p>
        {skills.length === 0 ? (
          <p className="text-sm text-zinc-400">No skills added yet. Add your first skill above.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 bg-[#e0f5f5] text-[#3e9999] text-sm font-medium px-3 py-1.5 rounded-full border border-[#76cdcd]/30"
              >
                {skill.name}
                <button
                  onClick={() => handleRemove(skill.id, skill.name)}
                  className="text-[#76cdcd]/60 hover:text-red-500 transition leading-none font-bold"
                  aria-label={`Remove ${skill.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
