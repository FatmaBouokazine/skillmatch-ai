import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 py-10 text-xs text-zinc-500">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
            <span className="font-semibold text-zinc-800 tracking-tight">SkillMatch AI</span>
          </div>
          <div className="flex gap-6 text-zinc-500">
            <Link href="/" className="hover:text-zinc-900 transition duration-150">Home</Link>
            <Link href="/solution" className="hover:text-zinc-900 transition duration-150">Solution</Link>
            <Link href="/about" className="hover:text-zinc-900 transition duration-150">About</Link>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Built by: Azer Idoudi, Houssem B.S Salem, Yasmine Haba, Fatma Bouokkazine</p>
          <p>&copy; {new Date().getFullYear()} SkillMatch AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
