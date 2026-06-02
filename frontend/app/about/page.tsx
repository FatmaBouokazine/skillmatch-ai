import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-[#b9e7e7] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#1f6d6d] shadow-sm">
            About us
          </span>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Making hiring smarter, not harder.
          </h1>
          <p className="max-w-xl text-base text-neutral-600 sm:text-lg">
            We believe the best hires happen when skills speak louder than keywords. SkillMatch AI was built to connect people with opportunities based on what they can actually do.
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Candidates see better-fit jobs and resume guidance.</li>
            <li>• Employers get candidate suggestions and shorter shortlists.</li>
            <li>• The client gets a clearer product story with useful details.</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="rounded-md bg-[#76cdcd] px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-[#63bcbc]">Create account</Link>
            <Link href="/solution" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">Our solution</Link>
            <Link href="/login" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">Sign in</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-900">What the client sees</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>• A simple workflow for matching jobs and people.</li>
            <li>• Clear value on the first page, not technical detail.</li>
            <li>• Easy next steps for both candidates and employers.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          { title: 'What clients get', desc: 'A clearer way to match jobs and people without long manual screening.' },
          { title: 'What candidates get', desc: 'Best-match jobs, resume feedback, and more confidence before applying.' },
          { title: 'What employers get', desc: 'Useful candidate suggestions and a shorter path to strong applicants.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">{item.title}</h2>
            <p className="mt-3 text-sm text-neutral-600">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Mission */}
      <section className="grid gap-8 lg:grid-cols-3">
        {[
          { title: 'Our mission', desc: 'Eliminate the noise in hiring by putting skill alignment at the center of every match — for both sides of the table.' },
          { title: 'Our approach', desc: 'Combine AI-powered resume parsing with intelligent matching algorithms that understand context, not just keywords.' },
          { title: 'Our vision', desc: 'A world where every candidate is seen for their real capabilities and every employer finds the talent they actually need.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">{item.title}</h2>
            <p className="mt-3 text-sm text-neutral-600">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Values */}
      <section className="border-t border-[#d7f1f1] pt-12">
        <h2 className="text-2xl font-semibold text-neutral-900">Core values</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Transparency', desc: 'Match scores and criteria are always visible. No black-box decisions.' },
            { title: 'Fairness', desc: 'We evaluate skills, not pedigrees. Everyone gets a fair assessment.' },
            { title: 'Simplicity', desc: 'Upload, match, connect. No unnecessary steps or complexity.' },
            { title: 'Continuous improvement', desc: 'Our models learn from feedback to get better over time.' },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl border border-[#b9e7e7] bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-neutral-800">{v.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-900">What the client sees</h2>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li>• A simple path to upload a resume or post a role.</li>
            <li>• Clear match cards that explain why something fits.</li>
            <li>• Short, useful feedback instead of technical detail.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-900">Why this matters</h2>
          <p className="mt-4 text-sm text-neutral-600">
            People want to know where they fit and employers want a shorter path to the right profile. The product is built to make both sides understand the next step quickly.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-[#d7f1f1] pt-12">
        <h2 className="text-2xl font-semibold text-neutral-900">Team</h2>
        <p className="mt-2 max-w-xl text-sm text-neutral-600">
          A small team passionate about fixing how people and jobs find each other.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Azer Idoudi', role: 'Founder & CEO', bio: 'Leads the product vision and platform direction.' },
            { name: 'Houssem B.S Salem', role: 'CTO', bio: 'Builds the AI matching and platform architecture.' },
            { name: 'Yasmine Haba', role: 'Head of Product', bio: 'Shapes the experience for candidates and employers.' },
            { name: 'Fatma Bouokkazine', role: 'Design & Operations', bio: 'Keeps the product clear, usable, and well-structured.' },
          ].map((member) => (
            <div key={member.name} className="rounded-2xl border border-[#b9e7e7] bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b9e7e7] bg-[#eefcfc] text-sm font-semibold text-[#1f6d6d]">
                {member.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <h3 className="mt-4 font-semibold text-neutral-900">{member.name}</h3>
              <p className="text-xs text-neutral-500">{member.role}</p>
              <p className="mt-2 text-sm text-neutral-600">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-[#b9e7e7] bg-white p-12 text-center">
        <h2 className="text-3xl font-semibold text-neutral-900">Want to be part of the story?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-neutral-600">
          Create an account and see what SkillMatch AI can do for your hiring or job search.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="rounded-md bg-[#76cdcd] px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-[#63bcbc]">
            Get started
          </Link>
          <Link href="/login" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">
            Sign in
          </Link>
          <Link href="/solution" className="rounded-md border border-[#b9e7e7] bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-[#eefcfc]">
            Learn how it works
          </Link>
        </div>
      </section>
    </div>
  );
}
