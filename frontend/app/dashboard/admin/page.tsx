import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-[#b9e7e7] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#1f6d6d] shadow-sm">
            Admin workspace
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">Admin dashboard</h1>
          <p className="max-w-xl text-base text-slate-600 sm:text-lg">
            Monitor platform health, roles, and security controls.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-md bg-[#76cdcd] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#63bcbc]">
              Back to overview
            </Link>
            <Link href="/profile/admin" className="rounded-md border border-[#b9e7e7] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">
              View profile
            </Link>
            <Link href="/solution" className="rounded-md border border-[#b9e7e7] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">
              Learn more
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Access</p>
              <p className="mt-2 text-sm text-slate-600">Invite and manage admin users.</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Audit</p>
              <p className="mt-2 text-sm text-slate-600">Review authentication activity.</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Health</p>
              <p className="mt-2 text-sm text-slate-600">Watch uptime and performance.</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <div className="rounded-xl border border-[#d7f1f1] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">What to know</p>
              <p className="mt-2 text-sm text-slate-600">The admin area focuses on access, safety, and platform oversight.</p>
            </div>
            <div className="rounded-xl border border-[#d7f1f1] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Next action</p>
              <p className="mt-2 text-sm text-slate-600">Review users, logs, and system status before making changes.</p>
            </div>
            <Link href="/dashboard" className="inline-flex rounded-md border border-[#b9e7e7] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">
              Back to overview
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: 'Access control', note: 'Invite and manage admin users.' },
          { title: 'Audit log', note: 'Review authentication activity.' },
          { title: 'System health', note: 'Watch uptime and performance.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm text-slate-500">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 text-sm text-slate-700 shadow-sm">
        Admin features are live. Extend with metrics and team management next.
      </div>
    </div>
  );
}
