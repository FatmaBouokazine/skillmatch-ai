'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { token } = useAuth();

  return (
    <header className="border-b border-zinc-100 bg-white/90 backdrop-blur-sm py-4 px-6 md:px-8 sticky top-0 z-50">
      <div className="mx-auto w-full max-w-6xl flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/wLogo.svg" alt="SkillMatch AI" width={120} height={32} className="h-8 w-auto" />
        </Link>

        {/* Nav links — only on homepage when logged out */}
        {!token && pathname === '/' && (
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link href="/#features" className="rounded-md px-4 py-2 font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition">Features</Link>
            <Link href="/#pricing" className="rounded-md px-4 py-2 font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition">Pricing</Link>
            <Link href="/#team" className="rounded-md px-4 py-2 font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition">Team</Link>
            <Link href="/#faq" className="rounded-md px-4 py-2 font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition">FAQ</Link>
          </nav>
        )}

        {/* CTA */}
        <div className="flex items-center gap-3 text-sm shrink-0">
          {token ? (
            <Link
              href="/dashboard"
              className={`rounded-lg px-4 py-2 font-medium transition ${
                pathname.startsWith('/dashboard')
                  ? 'bg-violet-600 text-white'
                  : 'border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 font-medium text-zinc-600 hover:text-zinc-900 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-violet-600 px-4 py-2 font-semibold text-violet-600 hover:bg-violet-600 hover:text-white transition"
              >
                Try for free
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}