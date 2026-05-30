import Link from 'next/link';

export default function Home() {

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-6 py-12 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(87,132,186,0.2),_transparent_55%),linear-gradient(180deg,#f7f9ff_0%,#eef3fb_60%,#ffffff_100%)]" />
      <div className="absolute right-8 top-20 -z-10 h-52 w-52 rounded-full bg-[#5784BA] opacity-15 blur-[90px]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5784BA]">
            SkillMatch AI
          </span>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm transition hover:border-[#5784BA]/50 hover:text-[#5784BA]">
              Login
            </Link>
            <Link href="/register" className="rounded-full bg-[#5784BA] px-4 py-2 font-semibold text-white shadow-[0_15px_30px_-20px_rgba(87,132,186,0.9)] transition hover:bg-[#4a73a6]">
              Register
            </Link>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              A smarter way to connect{' '}
              <span className="text-[#5784BA]">recruiters</span> and{' '}
              <span className="text-[#5784BA]">candidates</span>.
            </h1>
            <p className="max-w-xl text-base text-slate-600 sm:text-lg">
              Sprint 1 delivers authentication and a clean base UI across
              recruiter, candidate, and admin experiences.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#5784BA]/50 hover:text-[#5784BA]">
                Access your workspace
              </Link>
              <Link href="/register" className="rounded-xl bg-[#5784BA] px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_30px_-20px_rgba(87,132,186,0.9)] transition hover:bg-[#4a73a6]">
                Create an account
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.6)] backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900">Roles</h2>
            <p className="mt-2 text-sm text-slate-500">
              Every role has a tailored dashboard and profile experience.
            </p>
            <div className="mt-6 grid gap-4">
              {[
                { title: 'Admin', note: 'Oversee platform health and access.' },
                { title: 'Recruiter', note: 'Manage pipelines and openings.' },
                { title: 'Candidate', note: 'Track matches and applications.' }
              ].map((role) => (
                <div key={role.title} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">{role.title}</span>
                    <span className="rounded-full bg-[#5784BA]/10 px-3 py-1 text-xs font-semibold text-[#4a73a6]">Dashboard + Profile</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{role.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}