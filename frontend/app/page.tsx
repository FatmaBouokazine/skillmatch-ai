'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const faqs = [
  { q: 'How does resume matching work?', a: 'Our AI parses your resume and extracts skills, experience, and keywords, then compares them against job requirements to generate a precise match score.' },
  { q: 'Which services do you provide?', a: 'We provide resume parsing, job matching, candidate ranking, invite management, and dedicated recruiter dashboards.' },
  { q: 'How will you help me find a job?', a: 'Candidates receive detailed feedback on their resume and are automatically surfaced to relevant recruiters based on skill alignment.' },
  { q: 'How can I build my profile effectively?', a: 'Upload a detailed resume, keep your skills section updated, and act on the AI-generated improvement suggestions to boost your score.' },
  { q: 'What is your workflow?', a: 'Register → upload your resume or post a job → get instant match scores → manage invitations and hiring from one dashboard.' },
  { q: 'What should I do after applying?', a: 'You will receive a confirmation and can track your application status in real-time from your candidate dashboard.' },
  { q: 'How does recruiter access work?', a: 'Recruiters post job requirements, and the engine ranks all matched candidates by fit percentage. Invites can be sent with one click.' },
  { q: 'How much do your services cost?', a: 'We offer a free tier to get started. Pro and Enterprise plans are available for power users and growing companies.' },
  { q: 'Is my data secure?', a: 'Yes. All data is encrypted in transit and at rest. We never share your personal information with third parties without consent.' },
  { q: 'Can I cancel my plan anytime?', a: 'Absolutely. You can downgrade or cancel your subscription at any time directly from your account settings.' },
];

const pricingPlans = [
  {
    name: 'Lite plan',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for individual job seekers',
    features: ['1 active resume', 'Basic match scoring', 'Up to 5 applications', '500 MB storage'],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Basic plan',
    price: { monthly: 32, yearly: 26 },
    description: 'Best for active recruiters',
    features: ['Up to 5 job postings', 'Weekly analytics digest', 'Advanced AI scoring', '5 GB storage'],
    cta: 'Get started',
    highlight: true,
  },
  {
    name: 'Pro plan',
    price: { monthly: 40, yearly: 33 },
    description: 'For teams and growing companies',
    features: ['Unlimited job postings', 'Daily analytics digest', 'Priority AI scoring', '10 GB storage'],
    cta: 'Get started',
    highlight: false,
  },
];

export default function HomePage() {
  const { token } = useAuth();
  const [billingYearly, setBillingYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col font-sans">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        id="hero"
        className="bg-gradient-to-b from-violet-50 via-white to-white pt-28 pb-20 text-center px-4"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
            Connect talent through<br />skills, not keywords.
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            SkillMatch AI parses resumes and evaluates match percentages dynamically.
            Candidates get actionable feedback, recruiters get pre-screened pipelines.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {token ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-violet-600 px-7 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition shadow-md"
              >
                View Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="rounded-lg bg-violet-600 px-7 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition shadow-md"
                >
                  View the workflow →
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg border border-zinc-300 bg-white px-7 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                >
                  Join the platform
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-16 mx-auto max-w-5xl rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center gap-1.5 bg-zinc-100 border-b border-zinc-200 px-4 py-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-zinc-400 font-medium">SkillMatch AI — Dashboard</span>
          </div>
          <div className="p-6 grid grid-cols-12 gap-4 bg-zinc-50 min-h-[300px]">
            {/* Sidebar */}
            <div className="col-span-2 space-y-1.5">
              {['Dashboard', 'Profile', 'Jobs', 'Matches', 'Invites', 'Settings'].map(item => (
                <div
                  key={item}
                  className={`rounded-lg px-3 py-2 text-xs font-medium ${
                    item === 'Dashboard' ? 'bg-violet-600 text-white' : 'text-zinc-500'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
            {/* Stats + chart */}
            <div className="col-span-10 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Match Score', val: '87%' },
                  { label: 'Applications', val: '12' },
                  { label: 'Invites', val: '3' },
                  { label: 'Profile Views', val: '48' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-3 shadow-xs">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{s.label}</p>
                    <p className="text-xl font-bold text-zinc-900 mt-1">{s.val}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-white rounded-xl border border-zinc-200 p-4 shadow-xs">
                  <p className="text-xs font-semibold text-zinc-500 mb-3">Match Rate Trend</p>
                  <div className="flex items-end gap-1.5 h-20">
                    {[40, 55, 48, 62, 70, 65, 80, 75, 87].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-violet-500 opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs space-y-2">
                  <p className="text-xs font-semibold text-zinc-500">Top Skills</p>
                  {['React', 'Node.js', 'Python', 'SQL'].map(skill => (
                    <div key={skill} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600">{skill}</span>
                      <span className="text-violet-600 font-semibold">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">Our core features</h2>
            <p className="text-zinc-500 leading-relaxed">
              Built for speed and precision. From resume parsing to ranked candidate pipelines,
              everything you need to match the right talent with the right role.
            </p>
            {!token && (
              <Link
                href="/register"
                className="inline-block rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition"
              >
                Try for free
              </Link>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: '📄', title: 'Resume Parsing', desc: 'Automatically extracts skills, experience, and education to build a structured candidate profile.' },
              { icon: '💡', title: 'Skills Matching', desc: 'Compares candidate skills against job requirements and generates a precise match percentage.' },
              { icon: '🔁', title: 'Job Matching', desc: 'Candidates are automatically surfaced to recruiters for the roles they are most qualified for.' },
              { icon: '📨', title: 'Smart Invites', desc: 'Recruiters can directly invite top-ranked candidates with one click from their dashboard.' },
            ].map(f => (
              <div
                key={f.title}
                className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs hover:shadow-sm hover:border-violet-200 transition space-y-2"
              >
                <div className="text-2xl">{f.icon}</div>
                <h3 className="font-semibold text-zinc-800">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STAT HIGHLIGHT ─────────────────────────────────── */}
      <section className="py-24 px-4 bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-md p-6 space-y-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Match Analytics</p>
            <div className="space-y-3">
              {[
                { label: 'React Developer', match: 92 },
                { label: 'Product Manager', match: 78 },
                { label: 'Data Analyst', match: 85 },
                { label: 'UX Designer', match: 61 },
              ].map(r => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-600 font-medium">{r.label}</span>
                    <span className="text-violet-600 font-semibold">{r.match}%</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${r.match}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-zinc-100 grid grid-cols-3 gap-3 text-center">
              {[{ val: '2,379', label: 'Matches' }, { val: '94%', label: 'Accuracy' }, { val: '1.2s', label: 'Avg. parse' }].map(s => (
                <div key={s.label}>
                  <p className="text-lg font-bold text-zinc-900">{s.val}</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Text */}
          <div className="space-y-5">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
              Improve Match Rates<br />
              <span className="text-violet-600">up to 60%</span>
            </h2>
            <p className="text-zinc-500 leading-relaxed">
              Our AI engine continuously learns from successful placements, refining its scoring
              to surface the most relevant candidates faster than traditional keyword-based filters.
            </p>
            <ul className="space-y-2.5 text-sm text-zinc-600">
              {[
                'Weighted skill scoring with role context',
                'Real-time resume feedback for candidates',
                'Ranked pipelines updated as new candidates apply',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-violet-500 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── TEAM ───────────────────────────────────────────── */}
      <section id="team" className="py-24 px-4 text-center">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">Team</h2>
          <p className="mt-3 text-zinc-500 max-w-xl mx-auto text-sm">
            Built by a passionate team dedicated to making hiring smarter, faster, and more fair for everyone.
          </p>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { name: 'Azer Idoudi', role: 'Founder', img: '/Azer.png' },
              { name: 'Houssem B.S Salem', role: 'Design Lead', img: '/Houssem.png' },
              { name: 'Yasmine Haba', role: 'Marketing Lead', img: '/Yassmine.png' },
              { name: 'Fatma Bouokkazine', role: 'Front-End Lead', img: '/Fatma.png' },
            ].map((member) => (
              <div key={member.name} className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-zinc-100">
                <Image
                  src={member.img}
                  alt={member.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-left text-white">
                  <p className="font-semibold text-sm">{member.name}</p>
                  <p className="text-xs text-zinc-300 mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROUD OF ───────────────────────────────────────── */}
      <section className="py-24 px-4 bg-zinc-50 border-y border-zinc-100 text-center">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">What We&apos;re Proud Of</h2>
          <p className="mt-3 text-zinc-500 max-w-xl mx-auto text-sm">
            Numbers that reflect our commitment to accuracy and speed.
          </p>
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { val: '99.9%', label: 'Accuracy' },
              { val: '16×', label: 'Faster than keywords' },
              { val: '+30%', label: 'More successful matches' },
              { val: '5 stars', label: 'Rating from users' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-4xl font-extrabold text-violet-600">{s.val}</p>
                <p className="mt-2 text-sm text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ─────────────────────────────────────── */}
      <section className="py-24 px-4 text-center">
        <div className="mx-auto max-w-xl space-y-5">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Get smarter matches today</h2>
          <p className="text-zinc-500 text-sm">
            Join thousands of candidates and recruiters already using SkillMatch AI.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 mt-4"
            onSubmit={e => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 bg-zinc-50 border-t border-zinc-100 text-center">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">Pricing</h2>
          <p className="mt-3 text-zinc-500 max-w-xl mx-auto text-sm">
            Simple, transparent pricing for individuals and teams.
          </p>
          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1">
            <button
              onClick={() => setBillingYearly(false)}
              className={`rounded-full px-6 py-1.5 text-sm font-medium transition ${!billingYearly ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingYearly(true)}
              className={`rounded-full px-6 py-1.5 text-sm font-medium transition ${billingYearly ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Yearly
            </button>
          </div>

          <div className="mt-10 grid sm:grid-cols-3 gap-6 text-left items-start">
            {pricingPlans.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-7 space-y-6 transition ${
                  plan.highlight
                    ? 'border-violet-400 bg-violet-600 text-white shadow-xl scale-105'
                    : 'border-zinc-200 bg-white shadow-xs'
                }`}
              >
                <div>
                  <p className={`text-sm font-semibold ${plan.highlight ? 'text-violet-200' : 'text-zinc-500'}`}>{plan.name}</p>
                  <p className={`mt-1 text-xs ${plan.highlight ? 'text-violet-200' : 'text-zinc-400'}`}>{plan.description}</p>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-start gap-2 ${plan.highlight ? 'text-violet-100' : 'text-zinc-600'}`}>
                      <span className={`shrink-0 ${plan.highlight ? 'text-white' : 'text-violet-500'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div>
                  <span className="text-4xl font-extrabold">${billingYearly ? plan.price.yearly : plan.price.monthly}</span>
                  <span className={`text-xs ml-1 ${plan.highlight ? 'text-violet-200' : 'text-zinc-400'}`}>/mo</span>
                </div>
                <Link
                  href="/register"
                  className={`block text-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    plan.highlight
                      ? 'bg-white text-violet-700 hover:bg-violet-50'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 text-center">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-zinc-500 text-center text-sm max-w-xl mx-auto">
            Everything you need to know about SkillMatch AI.
          </p>
          <div className="mt-12 grid sm:grid-cols-2 gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50 transition"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <span className={`text-zinc-400 text-lg shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 pt-3 text-xs text-zinc-500 leading-relaxed border-t border-zinc-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section
        id="cta"
        className="mx-4 mb-12 rounded-3xl bg-gradient-to-br from-violet-600 to-violet-800 text-white py-20 px-6 text-center space-y-6"
      >
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Ready to superpower your hiring?
        </h2>
        <p className="text-violet-200 max-w-md mx-auto text-sm">
          Join the platform that connects talent with opportunity using AI-driven precision.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          {token ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-white text-violet-700 px-7 py-3 text-sm font-semibold hover:bg-violet-50 transition shadow-md"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/register"
              className="rounded-lg bg-white text-violet-700 px-7 py-3 text-sm font-semibold hover:bg-violet-50 transition shadow-md"
            >
              Get started for free →
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}
