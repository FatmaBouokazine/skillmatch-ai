import Link from 'next/link';

export default function SolutionPage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-[#b9e7e7] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#1f6d6d] shadow-sm">
            The solution
          </span>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">What we do</h1>
          <p className="max-w-xl text-base text-neutral-600 sm:text-lg">
            Employees can see their best-match job offers and rate their resumes. Employers receive suggested candidates based on skills and fit.
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Employees review their best-fit jobs and get resume feedback.</li>
            <li>• Employers receive suggested candidates with relevant match summaries.</li>
            <li>• The process is designed to keep the next step obvious for both sides.</li>
          </ul>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Step 1</p>
              <p className="mt-2 text-sm text-slate-600">Upload resume or role details.</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Step 2</p>
              <p className="mt-2 text-sm text-slate-600">Compare skills, experience, and fit.</p>
            </div>
            <div className="rounded-2xl border border-[#b9e7e7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Step 3</p>
              <p className="mt-2 text-sm text-slate-600">Apply or shortlist with confidence.</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <div className="rounded-xl border border-[#d7f1f1] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Employee detail</p>
              <p className="mt-2 text-sm text-slate-600">Best-match jobs, resume feedback, and clearer next steps.</p>
            </div>
            <div className="rounded-xl border border-[#d7f1f1] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6d6d]">Employer detail</p>
              <p className="mt-2 text-sm text-slate-600">Ranked candidate suggestions and concise match summaries.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-900">For employees</h2>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>• See which job offers match you best based on your skills.</li>
            <li>• Rate your resume to understand what can be improved.</li>
            <li>• Use the match view to focus on the most relevant roles first.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-900">For employers</h2>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>• Receive candidate suggestions ranked by fit and skills.</li>
            <li>• Review quick match insights without manual filtering.</li>
            <li>• Move faster from posting a role to shortlisting applicants.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          { title: 'What the employee sees', desc: 'Matched jobs, resume feedback, and a simple path to better opportunities.' },
          { title: 'What the employer sees', desc: 'Suggested candidates, fit summaries, and a clearer hiring shortlist.' },
          { title: 'What both sides gain', desc: 'Less time wasted, better alignment, and a more transparent process.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
            <p className="mt-3 text-sm text-neutral-600">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {[
          {
            title: 'How the matching works',
            items: ['We read resume and role content.', 'We compare skills and experience.', 'We surface the most relevant matches first.'],
          },
          {
            title: 'What the rating means',
            items: ['A clearer resume score for the employee.', 'Stronger suggestions after each update.', 'A practical guide to improve the profile.'],
          },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-neutral-900">{card.title}</h3>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              {card.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-[#b9e7e7] bg-white p-8 text-center">
        <h2 className="text-2xl font-semibold text-neutral-900">Get started</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-neutral-600">Create an account and upload a resume to find matches or post a role to get candidate suggestions.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="rounded-md bg-[#76cdcd] px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-[#63bcbc]">Create account</Link>
          <Link href="/login" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">Sign in</Link>
          <Link href="/about" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">About us</Link>
        </div>
      </section>
    </div>
  );
}
