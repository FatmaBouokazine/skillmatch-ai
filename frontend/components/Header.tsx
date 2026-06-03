'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { token } = useAuth();

  return (
    <header className="border-b border-zinc-150 bg-white/80 backdrop-blur-xs py-4 px-6 md:px-8 sticky top-0 z-50">
      <div className="mx-auto w-full max-w-6xl flex items-center justify-between">
        <Link href="/" className="font-semibold text-zinc-900 tracking-tight flex items-center gap-2 text-base">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-950"></span>
          SkillMatch AI
        </Link>

        <div className="flex items-center gap-3 text-xs">
          {token ? (
            <Link
              href="/dashboard"
              className={`rounded-lg px-4 py-2 font-medium transition duration-150 ${
                pathname.startsWith('/dashboard')
                  ? 'bg-zinc-900 text-white'
                  : 'border border-zinc-200 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-zinc-200 px-4 py-2 font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition duration-150"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-zinc-900 px-4 py-2 font-semibold text-white hover:bg-zinc-800 transition duration-150 shadow-xs"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
