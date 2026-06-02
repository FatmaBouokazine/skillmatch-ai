import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 pt-6 pb-6 text-sm text-slate-700">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-lg font-semibold text-indigo-600">SkillMatch AI</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/solution" className="hover:text-slate-900">Solution</Link>
            <Link href="/about" className="hover:text-slate-900">About</Link>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <span>Team: Azer Idoudi, Houssem B.S Salem, Yasmine Haba, Fatma Bouokkazine</span>
          <span className="text-slate-500">&copy; 2026 SkillMatch AI. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
