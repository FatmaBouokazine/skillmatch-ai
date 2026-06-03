'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function AboutPage() {
  const { token } = useAuth();

  return (
    <div className="flex flex-col gap-16 py-6 font-sans">
      
      {/* Introduction */}
      <section className="grid gap-12 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-zinc-500 shadow-xs">
            About Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Fusing human capability with skill analytics.
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 leading-relaxed">
            SkillMatch AI was founded to replace keyword-stuffed search queries with authentic capability matches. We believe in transparency for candidates and immediate shortlisting for recruiters.
          </p>
          <div className="flex flex-wrap gap-3">
            {token ? (
              <Link 
                href="/dashboard" 
                className="rounded-lg bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition duration-150"
              >
                Go to Workspace
              </Link>
            ) : (
              <>
                <Link 
                  href="/register" 
                  className="rounded-lg bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition duration-150"
                >
                  Get Started
                </Link>
                <Link 
                  href="/solution" 
                  className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition duration-150"
                >
                  Explore Solution
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Brand Core */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 space-y-6">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Our core philosophy</h3>
          <ul className="space-y-4 text-sm text-zinc-600">
            <li className="flex gap-3">
              <span className="text-zinc-900 font-semibold">01.</span>
              <div>
                <p className="font-medium text-zinc-800">Clear capability ranking</p>
                <p className="text-xs text-zinc-500 mt-0.5">We calculate true matching skill intersections instead of parsing tags blindly.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-zinc-900 font-semibold">02.</span>
              <div>
                <p className="font-medium text-zinc-800">Actionable Candidate scoring</p>
                <p className="text-xs text-zinc-500 mt-0.5">Every resume evaluation yields clear, constructive feedback to help profiles align better.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-zinc-900 font-semibold">03.</span>
              <div>
                <p className="font-medium text-zinc-800">No gatekeeping, no black-box AI</p>
                <p className="text-xs text-zinc-500 mt-0.5">All criteria for matching scores are completely transparently shown to both parties.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Core Values */}
      <section className="border-t border-zinc-200 pt-12 space-y-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Platform values</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Technical Alignment', desc: 'Focusing exclusively on technical capability, skill matrices, and practical knowledge overlap.' },
            { title: 'Simplicity', desc: 'A minimalist application shell, direct actions, and no unnecessary multi-stage pipelines.' },
            { title: 'Equal Access', desc: 'Allowing candidates to see how their profile matches and adjust their skills dynamically.' },
          ].map((v) => (
            <div key={v.title} className="bg-white border border-zinc-200 p-5 rounded-xl shadow-xs">
              <h3 className="font-semibold text-zinc-800 text-sm">{v.title}</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="border-t border-zinc-200 pt-12 space-y-8">
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">The founding team</h2>
          <p className="mt-1 text-xs text-zinc-500">A passionate engineering team focused on creating better talent intersections.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'Azer Idoudi', role: 'Founder & CEO', bio: 'Leads the product vision and user interface standards.' },
            { name: 'Houssem B.S Salem', role: 'CTO', bio: 'Builds backend matching mechanisms and secure API routing.' },
            { name: 'Yasmine Haba', role: 'Head of Product', bio: 'Designs the functional workflow paths for candidates.' },
            { name: 'Fatma Bouokkazine', role: 'Design & Operations', bio: 'Curates the beautiful minimalist aesthetic design systems.' },
          ].map((m) => (
            <div key={m.name} className="bg-white border border-zinc-200 p-5 rounded-xl shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                {m.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-zinc-800">{m.name}</h4>
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">{m.role}</p>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
