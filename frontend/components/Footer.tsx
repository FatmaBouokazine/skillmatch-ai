import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white pt-14 pb-8 px-6 md:px-8">
      <div className="mx-auto w-full max-w-6xl">

        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 pb-10 border-b border-zinc-100">
          {/* Brand */}
          <div className="space-y-3 max-w-xs">
            <Link href="/" className="inline-flex">
              <Image src="/wLogo.svg" alt="SkillMatch AI" width={120} height={32} className="h-8 w-auto" />
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              AI-powered talent matching that connects the right candidates with the right roles — instantly.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {['𝕏', 'in', 'f', '▶'].map(icon => (
                <span key={icon} className="w-7 h-7 rounded-full border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-500 hover:border-violet-400 hover:text-violet-600 cursor-pointer transition">
                  {icon}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div className="space-y-3">
              <p className="font-semibold text-zinc-800 text-xs uppercase tracking-wider">Product</p>
              <ul className="space-y-2 text-zinc-500">
                <li><Link href="/#features" className="hover:text-zinc-900 transition">Features</Link></li>
                <li><Link href="/#pricing" className="hover:text-zinc-900 transition">Pricing</Link></li>
                <li><Link href="/#faq" className="hover:text-zinc-900 transition">FAQ</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-zinc-800 text-xs uppercase tracking-wider">Account</p>
              <ul className="space-y-2 text-zinc-500">
                <li><Link href="/login" className="hover:text-zinc-900 transition">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-zinc-900 transition">Register</Link></li>
                <li><Link href="/dashboard" className="hover:text-zinc-900 transition">Dashboard</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-zinc-800 text-xs uppercase tracking-wider">Company</p>
              <ul className="space-y-2 text-zinc-500">
                <li><Link href="/#team" className="hover:text-zinc-900 transition">Team</Link></li>
                <li><span className="cursor-default">Terms &amp; Conditions</span></li>
                <li><span className="cursor-default">Privacy Policy</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <p>Built by: Azer Idoudi · Houssem B.S Salem · Yasmine Haba · Fatma Bouokkazine</p>
          <p>&copy; {new Date().getFullYear()} SkillMatch AI. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
