'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import {
  getAdminUsers,
  getAdminUser,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../../../services/adminService';

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

const ROLE_COLORS: Record<string, string> = {
  EMPLOYEE: 'bg-violet-100 text-violet-700',
  EMPLOYER: 'bg-emerald-100 text-emerald-700',
  ADMIN: 'bg-rose-100 text-rose-700',
};

const EMPTY_EDIT = {
  email: '', password: '', role: '',
  firstName: '', lastName: '', title: '', bio: '', location: '',
  phone: '', linkedIn: '', github: '',
  companyName: '', website: '', description: '',
};

const EMPTY_CREATE = { email: '', password: '', role: 'EMPLOYEE' };

export default function AdminUsersPage() {
  const { user, loading } = useRequireAuth('ADMIN');
  const [users, setUsers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // ── Create modal ──────────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // ── Edit modal ────────────────────────────────────────────────────────────
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);

  const load = useCallback(() => {
    setFetching(true);
    getAdminUsers(roleFilter || undefined)
      .then(setUsers)
      .catch(() => setError('Failed to load users'))
      .finally(() => setFetching(false));
  }, [roleFilter]);

  useEffect(() => { if (user) load(); }, [user, load]);

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await createAdminUser(createForm);
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
      load();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  // ── Open edit modal ───────────────────────────────────────────────────────
  const openEdit = async (id: string) => {
    setLoadingEdit(true);
    setEditError('');
    setEditUser({});
    try {
      const data = await getAdminUser(id);
      setEditUser(data);
      const ep = data.employeeProfile ?? {};
      const erp = data.employerProfile ?? {};
      setEditForm({
        email: data.email ?? '',
        password: '',
        role: data.role ?? '',
        firstName: ep.firstName ?? erp.firstName ?? '',
        lastName: ep.lastName ?? erp.lastName ?? '',
        title: ep.title ?? erp.title ?? '',
        bio: ep.bio ?? erp.bio ?? '',
        location: ep.location ?? erp.location ?? '',
        phone: ep.phone ?? '',
        linkedIn: ep.linkedIn ?? '',
        github: ep.github ?? '',
        companyName: erp.companyName ?? '',
        website: erp.website ?? '',
        description: erp.description ?? '',
      });
    } catch {
      setEditError('Failed to load user data');
    } finally {
      setLoadingEdit(false);
    }
  };

  // ── Save edit ─────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    setEditError('');

    const role = editUser.role;
    const profilePayload: Record<string, string> = {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      title: editForm.title,
      bio: editForm.bio,
      location: editForm.location,
    };
    if (role === 'EMPLOYEE') {
      profilePayload.phone = editForm.phone;
      profilePayload.linkedIn = editForm.linkedIn;
      profilePayload.github = editForm.github;
    }
    if (role === 'EMPLOYER') {
      profilePayload.companyName = editForm.companyName;
      profilePayload.website = editForm.website;
      profilePayload.description = editForm.description;
    }

    const payload: Record<string, any> = {
      email: editForm.email,
      role: editForm.role,
      profile: profilePayload,
    };
    if (editForm.password.trim()) payload.password = editForm.password.trim();

    try {
      await updateAdminUser(editUser._id || editUser.id, payload);
      setEditUser(null);
      load();
    } catch (err: any) {
      setEditError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete account "${email}"? This cannot be undone.`)) return;
    try {
      await deleteAdminUser(id);
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = u.employeeProfile
      ? `${u.employeeProfile.firstName ?? ''} ${u.employeeProfile.lastName ?? ''}`.toLowerCase()
      : (u.employerProfile?.companyName ?? '').toLowerCase();
    return u.email.toLowerCase().includes(q) || name.includes(q);
  });

  if (loading) return <Spinner />;

  const ef = editForm;
  const setEf = (patch: Partial<typeof EMPTY_EDIT>) => setEditForm((p) => ({ ...p, ...patch }));
  const isEmployee = editUser?.role === 'EMPLOYEE';
  const isEmployer = editUser?.role === 'EMPLOYER';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Users</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage all platform accounts and their details.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition shrink-0"
        >
          + Create Account
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {['', 'EMPLOYEE', 'EMPLOYER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                roleFilter === r
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {r || 'All'}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="ml-auto border border-zinc-200 rounded-xl px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Table */}
      {fetching ? <Spinner /> : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Name / Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-zinc-400 text-sm">No users found.</td></tr>
                )}
                {filtered.map((u) => {
                  const id = u._id || u.id;
                  const name = u.employeeProfile
                    ? `${u.employeeProfile.firstName ?? ''} ${u.employeeProfile.lastName ?? ''}`.trim()
                    : u.employerProfile?.companyName ?? '';
                  const location = u.employeeProfile?.location || u.employerProfile?.location || '';
                  return (
                    <tr key={id} className="hover:bg-zinc-50 transition">
                      <td className="px-4 py-3 text-zinc-800 font-medium">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_COLORS[u.role] ?? 'bg-zinc-100 text-zinc-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{name || <span className="text-zinc-300 italic">—</span>}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{location || '—'}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(id)}
                            className="text-xs px-2.5 py-1 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-100 transition"
                          >
                            Edit
                          </button>
                          {id !== user?.id && (
                            <button
                              onClick={() => handleDelete(id, u.email)}
                              className="text-xs px-2.5 py-1 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {(editUser !== null || loadingEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto">
            {loadingEdit || !editUser?._id ? (
              <div className="p-10 flex justify-center">
                <div className="w-7 h-7 rounded-full border-2 border-zinc-200 border-t-violet-600 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSave}>
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900">Edit Account</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">{editUser?.email}</p>
                  </div>
                  <button type="button" onClick={() => { setEditUser(null); setEditError(''); }} className="text-zinc-400 hover:text-zinc-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
                  {/* Account section */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Account</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">Email</label>
                        <input type="email" required value={ef.email} onChange={(e) => setEf({ email: e.target.value })}
                          className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          New Password <span className="font-normal text-zinc-400">(leave blank to keep current)</span>
                        </label>
                        <input type="password" value={ef.password} onChange={(e) => setEf({ password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                      </div>
                      {(editUser?._id || editUser?.id) !== user?.id && (
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Role</label>
                          <select value={ef.role} onChange={(e) => setEf({ role: e.target.value })}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                            <option value="EMPLOYEE">EMPLOYEE</option>
                            <option value="EMPLOYER">EMPLOYER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal info — EMPLOYEE + EMPLOYER */}
                  {(isEmployee || isEmployer) && (
                    <div className="space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Personal Info</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">First Name</label>
                          <input type="text" value={ef.firstName} onChange={(e) => setEf({ firstName: e.target.value })}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Last Name</label>
                          <input type="text" value={ef.lastName} onChange={(e) => setEf({ lastName: e.target.value })}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Job Title</label>
                          <input type="text" value={ef.title} onChange={(e) => setEf({ title: e.target.value })}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Location</label>
                          <input type="text" value={ef.location} onChange={(e) => setEf({ location: e.target.value })}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Bio</label>
                          <textarea rows={3} value={ef.bio} onChange={(e) => setEf({ bio: e.target.value })}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Employee-only */}
                  {isEmployee && (
                    <div className="space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Contact &amp; Links</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone</label>
                          <input type="text" value={ef.phone} onChange={(e) => setEf({ phone: e.target.value })}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">LinkedIn URL</label>
                          <input type="text" value={ef.linkedIn} onChange={(e) => setEf({ linkedIn: e.target.value })}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">GitHub URL</label>
                          <input type="text" value={ef.github} onChange={(e) => setEf({ github: e.target.value })}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Employer-only */}
                  {isEmployer && (
                    <div className="space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Company Info</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Company Name</label>
                          <input type="text" value={ef.companyName} onChange={(e) => setEf({ companyName: e.target.value })}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Website</label>
                          <input type="text" value={ef.website} onChange={(e) => setEf({ website: e.target.value })}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-zinc-700 mb-1">Company Description</label>
                          <textarea rows={3} value={ef.description} onChange={(e) => setEf({ description: e.target.value })}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {editError && <p className="text-xs text-red-600">{editError}</p>}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-4 border-t border-zinc-100 flex gap-3">
                  <button type="button" onClick={() => { setEditUser(null); setEditError(''); }}
                    className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Create Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">Create Account</h2>
              <button type="button" onClick={() => { setShowCreate(false); setCreateError(''); }} className="text-zinc-400 hover:text-zinc-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Email</label>
                <input type="email" required value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="user@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
                <input type="password" required minLength={8} value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Role</label>
                <select value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="EMPLOYER">EMPLOYER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              {createError && <p className="text-xs text-red-600">{createError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowCreate(false); setCreateError(''); }}
                  className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition">
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

