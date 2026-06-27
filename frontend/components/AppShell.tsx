'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

type NavItem = { href: string; label: string; icon: React.ReactNode };

function getNavItems(role: string): NavItem[] {
  const dashIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
  const docIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
  const tagIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
  const userIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
  const briefIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
  const mailIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
  const appIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
  const buildingIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
  const cogIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  if (role === 'EMPLOYEE') {
    return [
      { href: '/employee/dashboard', label: 'Dashboard', icon: dashIcon },
      { href: '/employee/jobs',      label: 'Jobs',      icon: briefIcon },
      { href: '/employee/resume',    label: 'Resume',    icon: docIcon },
      { href: '/employee/skills',    label: 'Skills',    icon: tagIcon },
      { href: '/employee/profile',   label: 'Profile',   icon: userIcon },
      { href: '/account',            label: 'Account',   icon: cogIcon },
    ];
  }
  if (role === 'EMPLOYER') {
    return [
      { href: '/employer/dashboard',    label: 'Dashboard',    icon: dashIcon },
      { href: '/employer/jobs',         label: 'Jobs',         icon: briefIcon },
      { href: '/employer/invites',      label: 'Applications', icon: appIcon },
      { href: '/employer/company',      label: 'Company',      icon: buildingIcon },
      { href: '/employer/profile',      label: 'Profile',      icon: userIcon },
      { href: '/account',               label: 'Account',      icon: cogIcon },
    ];
  }
  return [{ href: '/account', label: 'Account', icon: cogIcon }];
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role ?? '';
  const navItems = getNavItems(role);
  const initials = user
    ? ((user.employeeProfile?.firstName?.[0] ?? '') +
       (user.employeeProfile?.firstName ? (user.employeeProfile?.lastName?.[0] ?? '') : (user.email?.[0] ?? 'U'))).toUpperCase() || user.email[0].toUpperCase()
    : 'U';
  const displayName = user?.employeeProfile
    ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}`.trim() || user.email
    : (user?.employerProfile?.firstName || user?.employerProfile?.lastName)
      ? `${user.employerProfile.firstName || ''} ${user.employerProfile.lastName || ''}`.trim()
      : user?.employerProfile?.companyName || user?.email || 'User';

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row antialiased font-sans">
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-zinc-200 sticky top-0 z-40">
        <Link href="/" className="flex items-center">
          <Image src="/wLogo.svg" alt="SkillMatch AI" width={100} height={28} className="h-7 w-auto" />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded-md hover:bg-zinc-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:flex'}`}
      >
        <div className="flex flex-col flex-1 py-6 px-4 gap-5 overflow-y-auto">
          {/* Logo */}
          <div className="hidden md:flex items-center px-2 mb-1">
            <Image src="/wLogo.svg" alt="SkillMatch AI" width={110} height={30} className="h-7 w-auto" />
          </div>

          {/* Role badge */}
          <div className="px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-widest block mb-1">
              Workspace
            </span>
            <span className="text-sm font-semibold text-zinc-800">
              {role === 'EMPLOYEE' ? 'Employee' : role === 'EMPLOYER' ? 'Employer' : 'Admin'}
            </span>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                    ${active
                      ? 'bg-violet-600 text-white font-medium shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold text-xs shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-zinc-800 truncate">{displayName}</span>
              <span className="text-xs text-zinc-500 truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={() => { setMobileOpen(false); logout(); }}
            className="w-full py-2 border border-zinc-200 hover:border-zinc-300 bg-white rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-800 transition duration-150"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 p-5 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
