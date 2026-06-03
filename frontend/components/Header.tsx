'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const links = [
  { href: '/', label: 'Home' },
  { href: '/solution', label: 'Solution' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const pathname = usePathname();
  const { token, user } = useAuth();

  return (
    <header className="border-b border-zinc-150 bg-white/80 backdrop-blur-xs py-4 px-6 md:px-8 sticky top-0 z-50">
      <div className="mx-auto w-full max-w-6xl flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="font-semibold text-zinc-900 tracking-tight flex items-center gap-2 text-base">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-950"></span>
          SkillMatch AI
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                transition duration-150 py-1 px-1.5 rounded-md
                ${pathname === link.href
                  ? 'text-zinc-900 font-medium'
                  : 'text-zinc-500 hover:text-zinc-900'
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3 text-xs">
          {token ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 transition duration-150 shadow-xs"
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
