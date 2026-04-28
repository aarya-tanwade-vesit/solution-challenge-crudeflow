'use client';

import { Brain, GitBranch, Calculator } from 'lucide-react';

/**
 * Stack & Architecture — credibility section.
 *
 * Three pillars in a triptych, Apple-style:
 *   1. Gemma — the brain. Open weights, fine-tuned on Indic + maritime
 *      corpora; reads the world.
 *   2. LangGraph — the boardroom. Multi-agent orchestration with a
 *      human-in-the-loop checkpoint at every committed action.
 *   3. NEMO Math Core — the spine. Deterministic LP / MILP via PuLP;
 *      no hallucinations, every decision is auditable and reproducible.
 *
 * The diagram beneath the triptych shows the data flow: open-source
 * intelligence → Gemma scoring → LangGraph deliberation → math core
 * → executable plan + audit log.
 *
 * No animation in this section beyond a hover lift on the cards —
 * the goal is gravitas, not motion.
 */

const PILLARS = [
  {
    icon: Brain,
    name: 'Gemma',
    role: 'The brain',
    headline: 'Reads the world.',
    body:
      'Open-weight LLM, fine-tuned on Indic + maritime corpora — port advisories, sanctions filings, IMD bulletins, freight prints. Sub-200ms inference, runs on a single GPU, can be deployed inside a refinery network.',
    metaLabel: 'Why open weights',
    meta:
      'Auditable provenance, no per-token vendor billing, and the ability to keep sensitive prompts inside Indian data residency boundaries.',
  },
  {
    icon: GitBranch,
    name: 'LangGraph',
    role: 'The boardroom',
    headline: 'Deliberates.',
    body:
      'A graph of specialist agents — Intelligence, Environment, Operations, Risk, Audit — debate every consequential decision. Each transition between agents is a checkpoint where a human operator can intervene, override, or request more evidence.',
    metaLabel: 'HITL by default',
    meta:
      'No autonomous commit. Every executable plan emerges from a graph that the operator can replay step-by-step, edit, and re-run.',
  },
  {
    icon: Calculator,
    name: 'NEMO math core',
    role: 'The spine',
    headline: 'Solves it.',
    body:
      'Deterministic linear and mixed-integer programming via PuLP and HiGHS. Every routing, scheduling and inventory call is a feasible solution to an explicit, written-down objective with constraints — not a probabilistic guess.',
    metaLabel: 'No hallucinations',
    meta:
      'If the solver returns infeasible, the platform tells you which constraint blocked it and proposes a relaxation. Every plan ships with a math receipt.',
  },
];

export function LandingStack() {
  return (
    <section
      id="stack"
      className="relative py-24 sm:py-32 border-t border-[#1f1f1f] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
            Architecture
          </div>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#e5e5e5] leading-[1.05] text-balance">
            Built like a research lab. Deployed like infrastructure.
          </h2>
          <p className="mt-6 text-lg text-[#a3a3a3] leading-relaxed max-w-2xl text-pretty">
            CrudeFlow is not a wrapper. Three independent systems work in
            concert: an open-weights brain that reads the world, a multi-agent
            graph that deliberates over every decision, and a deterministic
            math core that turns conclusions into executable plans.
          </p>
        </div>

        {/* The triptych */}
        <div className="mt-12 lg:mt-16 grid md:grid-cols-3 gap-px bg-[#1f1f1f] rounded-2xl overflow-hidden border border-[#1f1f1f]">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className="group relative bg-[#0a0a0a] p-8 lg:p-10 transition-colors duration-500 hover:bg-[#0c0c0c]"
              >
                {/* Top: icon + role tag */}
                <div className="flex items-center gap-3">
                  <div className="rounded-md border border-[#2a2a2a] bg-[#141414] p-2 transition-all duration-500 group-hover:border-[#3b82f6]/40 group-hover:bg-[#0a1628]">
                    <Icon className="h-4 w-4 text-[#a3a3a3] transition-colors duration-500 group-hover:text-[#3b82f6]" />
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#525252]">
                    {p.role}
                  </div>
                </div>

                {/* Pillar name */}
                <div className="mt-6 text-2xl font-semibold tracking-tight text-[#e5e5e5]">
                  {p.name}
                </div>
                {/* Headline */}
                <div className="mt-1 text-2xl font-semibold tracking-tight text-[#525252] group-hover:text-[#a3a3a3] transition-colors duration-500">
                  {p.headline}
                </div>

                {/* Body */}
                <p className="mt-5 text-sm text-[#a3a3a3] leading-relaxed">{p.body}</p>

                {/* Meta block */}
                <div className="mt-8 pt-5 border-t border-[#1a1a1a]">
                  <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#525252]">
                    {p.metaLabel}
                  </div>
                  <p className="mt-1 text-xs text-[#737373] leading-relaxed">{p.meta}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Data flow diagram beneath the triptych */}
        <div className="mt-10 rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] p-6 sm:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#737373]">
            Data flow
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-2 items-stretch">
            {[
              { tag: 'Ingest', label: 'OSINT · AIS · weather · sanctions', tone: 'neutral' },
              { tag: 'Score', label: 'Gemma · −100…+100', tone: 'brand' },
              { tag: 'Deliberate', label: 'LangGraph · 5 agents · HITL', tone: 'brand' },
              { tag: 'Solve', label: 'PuLP · HiGHS · LP/MILP', tone: 'brand' },
              { tag: 'Commit', label: 'Plan + audit receipt', tone: 'good' },
            ].map((step, i, arr) => (
              <div key={step.tag} className="relative flex items-stretch">
                <div
                  className="flex-1 rounded-lg border bg-[#0d0d0d] p-4 transition-all duration-300 hover:translate-y-[-1px] hover:border-[#3a3a3a]"
                  style={{
                    borderColor:
                      step.tone === 'brand'
                        ? 'rgba(59, 130, 246, 0.25)'
                        : step.tone === 'good'
                        ? 'rgba(52, 211, 153, 0.25)'
                        : '#1f1f1f',
                  }}
                >
                  <div
                    className="text-[10px] font-mono uppercase tracking-[0.14em]"
                    style={{
                      color:
                        step.tone === 'brand'
                          ? '#60a5fa'
                          : step.tone === 'good'
                          ? '#34d399'
                          : '#737373',
                    }}
                  >
                    {step.tag}
                  </div>
                  <div className="mt-1.5 text-xs text-[#a3a3a3] leading-snug">{step.label}</div>
                </div>
                {/* Connector arrow */}
                {i < arr.length - 1 && (
                  <div className="hidden md:flex w-2 items-center justify-center text-[#3a3a3a] text-xs">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 text-[10px] font-mono text-[#525252]">
            Every step is logged. Every decision is replayable. Every plan ships
            with the constraints it was solved against.
          </div>
        </div>
      </div>
    </section>
  );
}
