'use client';

import { Database, Cpu, ArrowRight } from 'lucide-react';

/**
 * Three-step explainer — Ingest → Reason → Act.
 *
 * Apple-style framing: each step's headline is a complete declarative
 * sentence (not a fragment), the body justifies the claim with one
 * concrete number, and the connecting motif is a single hairline
 * gradient — no busy connector arrows.
 */
export function LandingHowItWorks() {
  const steps = [
    {
      icon: Database,
      tag: '01 · Ingest',
      title: 'Every signal that touches a barrel.',
      body: 'AIS, ECMWF + IMD weather, Indian port queue depth, charter party clauses, MCX/NYMEX strips — fused into a single state model, refreshed every 30 seconds.',
    },
    {
      icon: Cpu,
      tag: '02 · Reason',
      title: '10,000 scenarios. Solved in under four seconds.',
      body: 'Constraint-aware MILP with learned heuristics. Every recommendation carries a confidence score, an alternative, and a human-readable reasoning chain.',
    },
    {
      icon: ArrowRight,
      tag: '03 · Act',
      title: 'The operator approves. The world updates.',
      body: 'Approval propagates to terminal ETAs, demurrage clocks, and notification webhooks. Rejections route to a queue with an explainable diff.',
    },
  ];

  return (
    <section
      id="how"
      className="relative py-24 sm:py-32 border-y border-[#1f1f1f] bg-[#0c0c0c]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
            How it works
          </div>
          <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-[#e5e5e5] leading-[1.05] text-balance">
            From signal to approved action — in one closed loop.
          </h2>
        </div>

        <div className="mt-16 relative">
          {/* Connecting gradient line on desktop */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-6 left-[14%] right-[14%] h-px bg-gradient-to-r from-transparent via-[#3b82f6]/40 to-transparent"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="relative">
                  {/* Numbered node */}
                  <div className="relative z-10 mx-auto lg:mx-0 w-12 h-12 rounded-full border border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#3b82f6]" />
                  </div>

                  <div className="mt-6 text-center lg:text-left">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#525252]">
                      {s.tag}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-[#e5e5e5] leading-snug text-balance">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-sm text-[#a3a3a3] leading-relaxed max-w-md mx-auto lg:mx-0">
                      {s.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
