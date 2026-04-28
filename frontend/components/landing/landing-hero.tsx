'use client';

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

/**
 * Marketing hero — Apple-grade typographic discipline:
 *   - Massive display headline that fills the fold
 *   - One sub-headline, no more
 *   - One primary CTA, one tertiary
 *   - A single live status pill that doubles as social proof
 *
 * Tone: deliberately Indian-energy-sector. We address the reader as
 * a refinery operator, not a generic "user".
 */
export function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Radial spotlight — low-intensity, kept behind everything */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.18),_transparent_60%)]"
      />

      {/* Latitude grid — barely-there horizontal hairlines, suggesting
          a chart background without committing to one. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0 1px, transparent 1px 80px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Eyebrow — live status pill */}
        <div className="flex justify-center">
          <a
            href="#sentiment"
            className="group inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#141414]/70 backdrop-blur px-3 py-1.5 text-xs text-[#a3a3a3] hover:text-[#e5e5e5] hover:border-[#3a3a3a] transition-all duration-300 hover:shadow-[0_0_24px_-6px_rgba(239,68,68,0.4)]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
              <span className="relative rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
            <span className="font-medium">Live</span>
            <span className="text-[#525252]">·</span>
            <span>India energy sentiment</span>
            <span className="font-mono text-red-400">−42</span>
            <span className="text-[#525252]">·</span>
            <span>Heightened</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Headline — massive, single sentence, Apple cadence */}
        <h1 className="mt-8 mx-auto max-w-5xl text-center text-balance font-sans text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-[-0.02em] text-[#e5e5e5] leading-[1.02]">
          Every barrel.{' '}
          <span className="bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">
            One orchestrator.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="mt-7 mx-auto max-w-2xl text-center text-pretty text-base sm:text-lg leading-relaxed text-[#a3a3a3]">
          Built in India for India&apos;s refiners. CrudeFlow fuses live AIS,
          weather, port queues, charter terms and a real-time{' '}
          <span className="text-[#e5e5e5] font-medium">−100…+100 sentiment index</span>{' '}
          into ranked routing decisions — the neural engine watching the
          Persian Gulf so your operators don&apos;t have to.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#3b82f6] hover:bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#3b82f6]/20 transition-all duration-300 hover:shadow-[0_8px_32px_-6px_rgba(59,130,246,0.5)] hover:translate-y-[-1px]"
          >
            Open command center
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#theatre"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#141414] px-5 py-3 text-sm font-semibold text-[#e5e5e5] transition-all duration-300 hover:translate-y-[-1px]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            See the live theatre
          </a>
        </div>

        {/* Stack attribution — quiet, single line */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-mono text-[#525252]">
          <span>Powered by</span>
          <span className="text-[#737373]">Gemma</span>
          <span className="text-[#3a3a3a]">·</span>
          <span className="text-[#737373]">LangGraph</span>
          <span className="text-[#3a3a3a]">·</span>
          <span className="text-[#737373]">NEMO math core</span>
        </div>

        {/* Live status strip — uses the dashboard's mono/tabular treatment so
            the visual handoff to the actual app feels seamless. */}
        <div className="mt-16 sm:mt-20">
          <div className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f]/80 backdrop-blur-sm overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#1f1f1f]">
              <StatusStat
                label="Vessels orchestrated"
                value="247"
                delta="+12"
                tone="positive"
              />
              <StatusStat
                label="Demurrage avoided"
                value="₹37 Cr"
                delta="QTD"
                tone="muted"
              />
              <StatusStat
                label="AI decisions / day"
                value="1,184"
                delta="+9.6%"
                tone="positive"
              />
              <StatusStat
                label="Solver uptime"
                value="99.94%"
                delta="30d"
                tone="muted"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusStat({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone: 'positive' | 'muted';
}) {
  return (
    <div className="px-5 py-4 sm:px-6 sm:py-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#525252]">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-[#e5e5e5] kpi-value">
          {value}
        </span>
        <span
          className={`text-[11px] font-mono tabular-nums ${
            tone === 'positive' ? 'text-emerald-400' : 'text-[#525252]'
          }`}
        >
          {delta}
        </span>
      </div>
    </div>
  );
}
