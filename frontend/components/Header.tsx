'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/solution', label: 'Solution' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
      <Link href="/" className="text-sm font-semibold tracking-wider text-indigo-600">
        SkillMatch AI
      </Link>
      <nav className="hidden items-center gap-4 text-sm sm:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? 'text-slate-900 font-semibold rounded-md px-2 py-1 bg-indigo-50'
                : 'text-slate-700 hover:text-slate-900 rounded-md px-2 py-1 hover:bg-indigo-50'
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/login"
          className="rounded-md border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-50"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-[#76cdcd] px-3 py-1 font-semibold text-slate-900 hover:bg-[#63bcbc]"
        >
          Register
        </Link>
      </div>
    </header>
  );
}
