import Link from 'next/link';

export default function AdminProfilePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-[#b9e7e7] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#1f6d6d] shadow-sm">
            Admin profile
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">Admin profile</h1>
          <p className="max-w-xl text-base text-slate-600 sm:text-lg">
            Manage your access and security preferences.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/admin" className="rounded-md bg-[#76cdcd] px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-[#63bcbc]">
              Back to dashboard
            </Link>
            <Link href="/solution" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">
              Learn more
            </Link>
            <Link href="/" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">
              Back to home
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Contact</p>
              <p className="mt-2 text-sm text-slate-600">Keep admin contact current.</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Security</p>
              <p className="mt-2 text-sm text-slate-600">Configure password and sessions.</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Alerts</p>
              <p className="mt-2 text-sm text-slate-600">Choose notification rules.</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <div className="rounded-xl border border-[#d7f1f1] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">What to know</p>
              <p className="mt-2 text-sm text-slate-600">This profile keeps admin access details visible and easy to update.</p>
            </div>
            <div className="rounded-xl border border-[#d7f1f1] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Next action</p>
              <p className="mt-2 text-sm text-slate-600">Adjust security preferences before returning to the dashboard.</p>
            </div>
            <Link href="/dashboard/admin" className="inline-flex rounded-md border border-[#b9e7e7] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {[
          { title: 'Contact details', note: 'Keep admin contact current.' },
          { title: 'Security settings', note: 'Configure password and sessions.' },
          { title: 'Notification rules', note: 'Choose alert preferences.' },
          { title: 'Admin badge', note: 'Visible to system owners.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm text-slate-500">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
