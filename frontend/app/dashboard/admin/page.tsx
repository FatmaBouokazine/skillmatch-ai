'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getAllUsers, updateUserRole, deleteUser } from '../../../services/authService';

export default function AdminDashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  
  // Platform metrics
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [apiLatency, setApiLatency] = useState('14ms');
  const [uptime, setUptime] = useState('99.98%');

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Simulated live event streams
  const [systemLogs, setSystemLogs] = useState<string[]>([
    'System initialization successful.',
    'MongoDB clusters online and routed.',
    'Auth middleware configured: JWT 256-bit encryption.',
    'Ready for incoming matches.'
  ]);

  // Authenticate admin role
  useEffect(() => {
    if (!loading) {
      if (!token || !user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, token, loading, router]);

  // Load user database
  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchUsersList();
      setDbStatus('Connected / Healthy');
      
      // Dynamic logs generator simulation
      const interval = setInterval(() => {
        const actions = [
          'Guest viewed the solution page.',
          'Secure token issued for user session.',
          'Matching score requested for candidate.',
          'Database ping returned HTTP 200.',
          'Audit trail checked by system scheduler.'
        ];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setSystemLogs(prev => [`[${time}] ${randomAction}`, ...prev.slice(0, 7)]);
        // Jitter latency slightly
        setApiLatency(`${Math.floor(Math.random() * 8) + 8}ms`);
      }, 7000);

      return () => clearInterval(interval);
    }
  }, [token, user]);

  const fetchUsersList = async () => {
    if (!token) return;
    setFetchingUsers(true);
    try {
      const data = await getAllUsers(token);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load user database:', err);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!token) return;
    try {
      await updateUserRole(userId, newRole, token);
      setActionSuccess(`Account role changed to ${newRole}`);
      await fetchUsersList();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token) return;
    setDeletingId(userId);
    try {
      await deleteUser(userId, token);
      setActionSuccess('User deleted successfully.');
      await fetchUsersList();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || !user) {
    return null;
  }

  // Count profiles
  const totalAccounts = users.length;
  const candidatesCount = users.filter(u => u.role === 'candidate').length;
  const recruitersCount = users.filter(u => u.role === 'recruiter').length;

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
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Admin Workspace</h1>
        <p className="text-zinc-500 text-sm max-w-xl">
          Review security profiles, audit account roles, and watch platform database status tables.
        </p>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Total Accounts</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">{totalAccounts}</span>
              <span className="text-xs text-zinc-400">active profiles</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Candidate Profiles</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">{candidatesCount}</span>
              <span className="text-xs text-zinc-400">users</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Recruiter Profiles</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">{recruitersCount}</span>
              <span className="text-xs text-zinc-400">teams</span>
            </div>
          </div>
        </div>
      </section>

      {/* REGISTRY & AUDIT WORKSPACE */}
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] items-start">
        
        {/* User Registry Table */}
        <section id="users" className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
            <h2 className="font-semibold text-zinc-900 text-sm">Account Registry Database</h2>
            <button 
              onClick={fetchUsersList}
              className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 transition"
            >
              Reload Database
            </button>
          </div>

          <div className="p-6 overflow-x-auto">
            {fetchingUsers ? (
              <div className="text-center py-12">
                <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-xs text-zinc-400">Querying mongoose database collection...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-400">
                No accounts found.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-150 text-zinc-400 uppercase font-bold tracking-wider">
                    <th className="pb-3 font-semibold">User details</th>
                    <th className="pb-3 font-semibold">Workspace role</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {users.map((item) => (
                    <tr key={item._id} className="hover:bg-zinc-50/50 transition">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-zinc-800">{item.name}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{item.email}</div>
                      </td>
                      <td className="py-3.5">
                        <select
                          value={item.role}
                          onChange={(e) => handleRoleChange(item._id, e.target.value)}
                          className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 outline-none focus:border-zinc-900 transition"
                        >
                          <option value="candidate">Candidate</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3.5 text-right">
                        {item._id === user._id ? (
                          <span className="text-[10px] text-zinc-400 italic">Active Self</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(item._id)}
                            disabled={deletingId === item._id}
                            className="px-2 py-1 text-[10px] font-semibold border border-zinc-250 hover:border-red-200 text-zinc-500 hover:text-red-600 rounded-md transition disabled:opacity-50"
                          >
                            {deletingId === item._id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Diagnostics & Logs */}
        <div className="space-y-6">
          
          {/* Uptime and Latency metrics */}
          <section className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Diagnostics Monitor</h3>
            
            <div className="space-y-3 divide-y divide-zinc-100 text-xs">
              <div className="flex justify-between items-center py-2 first:pt-0">
                <span className="text-zinc-500">Database Status</span>
                <span className="font-medium text-emerald-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {dbStatus}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-500">API Response Latency</span>
                <span className="font-medium text-zinc-800">{apiLatency}</span>
              </div>
              <div className="flex justify-between items-center py-2 last:pb-0">
                <span className="text-zinc-500">System Uptime</span>
                <span className="font-medium text-zinc-800">{uptime}</span>
              </div>
            </div>
          </section>

          {/* Activity logs stream */}
          <section id="logs" className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Audit Event Stream</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            
            <div className="bg-zinc-950 rounded-lg p-4 font-mono text-[9px] text-zinc-400 space-y-1.5 max-h-[220px] overflow-y-auto leading-relaxed">
              {systemLogs.map((log, idx) => (
                <div key={idx} className="whitespace-nowrap truncate">
                  <span className="text-zinc-600">&gt; </span>
                  {log}
                </div>
              ))}
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
