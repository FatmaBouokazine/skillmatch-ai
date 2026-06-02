import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col gap-20">
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-[#b9e7e7] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#1f6d6d] shadow-sm">
            AI matching for both sides
          </span>
          <h1 className="max-w-2xl text-5xl font-bold leading-tight sm:text-6xl">
            Find your best-match job offers.
          </h1>
          <p className="max-w-xl text-base text-slate-600 sm:text-lg">
            Employees can see the roles that fit them best and rate their resume. Employers get suggested candidates with clear match signals.
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Employees see best-match jobs and get resume feedback.</li>
            <li>• Employers receive suggested candidates with clearer fit signals.</li>
            <li>• Both sides save time through simpler screening and shortlisting.</li>
          </ul>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Employee view</p>
              <p className="mt-2 text-sm text-slate-600">Find the right roles faster.</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Employer view</p>
              <p className="mt-2 text-sm text-slate-600">Shortlist better candidates.</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Shared outcome</p>
              <p className="mt-2 text-sm text-slate-600">Less time wasted on mismatches.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="rounded-md bg-[#76cdcd] px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-[#63bcbc]">Create account</Link>
            <Link href="/solution" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">Learn more</Link>
            <Link href="/about" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">About us</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <div className="rounded-xl border border-[#d7f1f1] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Employee detail</p>
              <p className="mt-2 text-sm text-slate-600">Upload a resume, see match quality, and know what to improve.</p>
            </div>
            <div className="rounded-xl border border-[#d7f1f1] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Employer detail</p>
              <p className="mt-2 text-sm text-slate-600">Get suggested candidates ranked by fit, not just keywords.</p>
            </div>
            <div className="rounded-xl border border-[#d7f1f1] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Key benefit</p>
              <p className="mt-2 text-sm text-slate-600">A simpler workflow for matching jobs with people.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">For employees</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Discover job offers that match your skills and experience.</li>
            <li>• Rate your resume to get clearer improvement suggestions.</li>
            <li>• Track how well each role fits your profile before applying.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">For employers</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Receive suggested candidates ranked by skills and fit.</li>
            <li>• Review match summaries to compare applicants faster.</li>
            <li>• Reduce manual screening and focus on the best profiles.</li>
          </ul>
        </div>
      </section>

      <section className="pt-12">
        <h2 className="text-3xl font-semibold text-slate-900">Why choose us</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 text-center shadow-sm">
            <h3 className="font-semibold text-slate-900">Accurate matches</h3>
            <p className="mt-2 text-sm text-slate-600">Matches based on real skills and relevance, not just keywords.</p>
          </div>
          <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 text-center shadow-sm">
            <h3 className="font-semibold text-slate-900">Easy resume rating</h3>
            <p className="mt-2 text-sm text-slate-600">Rate your resume to get better, personalized job suggestions.</p>
          </div>
          <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 text-center shadow-sm">
            <h3 className="font-semibold text-slate-900">Faster hiring</h3>
            <p className="mt-2 text-sm text-slate-600">Employers get concise candidate suggestions to accelerate decisions.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">How clients use it</h2>
          <p className="mt-3 text-sm text-slate-600">
            The experience is designed for both sides of the market: employees get guidance, and employers get shortlists.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: 'Upload or post', desc: 'Employees upload a resume. Employers post role requirements.' },
            { title: 'Review the match', desc: 'The platform compares skills, experience, and role fit.' },
            { title: 'Take action', desc: 'Employees apply with confidence. Employers contact better matches faster.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-[#b9e7e7] bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#b9e7e7] bg-white p-12 text-center">
        <h2 className="text-3xl font-semibold text-slate-900">Ready to match</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600">Create an account, upload a resume, or post a role to start receiving matches and suggestions.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="rounded-md bg-[#76cdcd] px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-[#63bcbc]">Create account</Link>
          <Link href="/login" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">Sign in</Link>
        </div>
      </section>
    </div>
  );
}
