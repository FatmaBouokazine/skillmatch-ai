'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AppShell from './AppShell';
import Header from './Header';
import Footer from './Footer';

const APP_PREFIXES = ['/employee', '/employer', '/account', '/admin'];

export default function LayoutManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();

  const isAppRoute = APP_PREFIXES.some((p) => pathname.startsWith(p));

  if (isAppRoute) {
    if (loading) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" />
            <span className="text-xs text-zinc-500 font-medium tracking-wide">Loading workspace...</span>
          </div>
        </div>
      );
    }
    return <AppShell>{children}</AppShell>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
