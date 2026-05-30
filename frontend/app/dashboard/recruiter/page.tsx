import Link from 'next/link';

export default function RecruiterDashboardPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-6 py-12 text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(87,132,186,0.2),_transparent_55%),linear-gradient(180deg,#f7f9ff_0%,#eef3fb_60%,#ffffff_100%)]" />
      <div className="absolute right-12 top-12 -z-10 h-44 w-44 rounded-full bg-[#5784BA] opacity-15 blur-[90px]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="w-fit rounded-full border border-[#5784BA]/30 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#5784BA]">
              Recruiter workspace
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Recruiter dashboard</h1>
            <p className="max-w-xl text-base text-slate-600 sm:text-lg">
              Manage openings, track pipelines, and review matches.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#5784BA]/50 hover:text-[#5784BA]"
          >
            Back to overview
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: 'Open roles', note: 'Track active requisitions.' },
            { title: 'Top matches', note: 'Review candidate alignment.' },
            { title: 'Team profile', note: 'Showcase your hiring brand.' }
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm text-slate-500">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-[#5784BA]/20 bg-[#5784BA]/10 p-6 text-sm text-[#3d5f8a]">
          Invite hiring managers once authentication is approved.
        </div>
      </div>
    </div>
  );
}
