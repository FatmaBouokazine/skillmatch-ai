'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role === 'recruiter' ? 'recruiter' : 'candidate';
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const navItems = [
    { href: `/dashboard/${role}`, label: 'Overview' },
    { href: `/dashboard/${role}/profile`, label: 'Profile' },
    { href: `/dashboard/${role}/account`, label: 'Account' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col md:flex-row antialiased font-sans">
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 sticky top-0 z-40">
        <Link href="/" className="font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          SkillMatch AI
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
            {roleLabel}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-zinc-600 hover:text-zinc-900 outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <aside
        className={`
        fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition duration-250 ease-in-out
        w-64 bg-white border-r border-zinc-200 z-50 flex flex-col justify-between
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:flex'}
      `}
      >
        <div className="flex flex-col flex-1 py-6 px-4 gap-6 overflow-y-auto">
          <div className="hidden md:flex items-center gap-2 px-3 mb-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            <span className="font-semibold text-zinc-900 tracking-tight text-lg">SkillMatch AI</span>
          </div>

          <div className="px-3 py-2 bg-zinc-50 border border-zinc-150 rounded-lg flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-widest">Dashboard</span>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-zinc-800">{roleLabel}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                    ${isActive
                      ? 'bg-zinc-900 text-white font-medium shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                    }
                  `}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-medium text-sm">
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-zinc-800 truncate">{user?.name || 'User'}</span>
              <span className="text-xs text-zinc-500 truncate">{user?.email || ''}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            className="flex items-center justify-center gap-2 w-full py-2 border border-zinc-200 hover:border-zinc-300 bg-white rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-800 transition duration-150"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-200 sticky top-0 z-35">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Dashboard</span>
            <span className="text-zinc-300">/</span>
            <span className="text-sm font-medium text-zinc-800">{roleLabel}</span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
