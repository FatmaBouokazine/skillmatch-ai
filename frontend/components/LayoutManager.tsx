'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import AppShell from './AppShell';

export default function LayoutManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, user } = useAuth();

  const isAppRoute = pathname.startsWith('/dashboard');

  if (isAppRoute) {
    if (loading) {
      return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin"></div>
            <span className="text-xs text-zinc-500 font-medium tracking-wide">Loading workspace...</span>
          </div>
        </div>
      );
    }

    return <AppShell>{children}</AppShell>;
  }

  // Public/marketing routes get the header and footer
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 py-10 px-6">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
