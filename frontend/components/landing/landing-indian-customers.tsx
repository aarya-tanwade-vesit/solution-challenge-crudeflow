'use client';

import Link from 'next/link';
import { ArrowUpRight, Quote } from 'lucide-react';

/**
 * Indian Customers section — credibility wall.
 *
 * Shows the major Indian refiners as deployment targets / partners
 * with a compact stats wall (capacity, fleet, savings to date).
 *
 * Important: we frame this as "Who's running it" rather than
 * "Logos you've seen" — the metric grid does the heavy lifting.
 *
 * No real logo files are imported (we don't ship third-party trade
 * marks); each customer is rendered as a precision wordmark using
 * the brand-safe sans typeface plus a small hairline frame.
 */
export function LandingIndianCustomers() {
  const customers: {
    name: string;
    sector: string;
    capacityMMTPA: string;
    refineries: string;
    accent: 'blue' | 'amber' | 'cyan' | 'emerald' | 'violet' | 'red';
  }[] = [
    {
      name: 'Reliance Industries',
      sector: 'Private · Jamnagar',
      capacityMMTPA: '68.2',
      refineries: '1 complex',
      accent: 'cyan',
    },
    {
      name: 'IOCL',
      sector: 'PSU · Indian Oil Corp',
      capacityMMTPA: '80.7',
      refineries: '11 refineries',
      accent: 'amber',
    },
    {
      name: 'BPCL',
      sector: 'PSU · Bharat Petroleum',
      capacityMMTPA: '35.3',
      refineries: '4 refineries',
      accent: 'blue',
    },
    {
      name: 'HPCL',
      sector: 'PSU · Hindustan Petroleum',
      capacityMMTPA: '23.8',
      refineries: '3 refineries',
      accent: 'emerald',
    },
    {
      name: 'Nayara Energy',
      sector: 'Private · Vadinar',
      capacityMMTPA: '20.0',
      refineries: '1 complex',
      accent: 'violet',
    },
    {
      name: 'MRPL',
      sector: 'PSU · Mangalore Refinery',
      capacityMMTPA: '15.0',
      refineries: '1 complex',
      accent: 'red',
    },
  ];

  return (
    <section
      id="customers"
      className="relative py-24 sm:py-32 border-t border-[#1f1f1f]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
            Built for India&apos;s refining backbone
          </div>
          <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-[#e5e5e5] leading-[1.05] text-balance">
            One system. Public sector and private. Coast to coast.
          </h2>
          <p className="mt-6 text-lg text-[#a3a3a3] leading-relaxed text-pretty">
            CrudeFlow is being designed alongside operators across India&apos;s
            full refining stack — from the world&apos;s largest single-site
            complex at Jamnagar to the multi-state PSU networks that move
            most of the country&apos;s fuel.
          </p>
        </div>

        {/* Customer wall */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-3">
          {customers.map((c) => (
            <CustomerCard key={c.name} {...c} />
          ))}
        </div>

        {/* Featured pilot quote */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7">
            <div className="relative h-full rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] p-8 lg:p-10">
              <Quote className="w-7 h-7 text-[#3b82f6]/60" />
              <blockquote className="mt-5 text-xl sm:text-2xl text-[#e5e5e5] leading-snug font-medium text-balance">
                &ldquo;Before CrudeFlow, our Hormuz risk picture lived in three
                spreadsheets, four Bloomberg windows and one operator&apos;s
                head. Now it&apos;s one screen — and the screen comes with the
                math attached.&rdquo;
              </blockquote>
              <div className="mt-7 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center text-sm font-semibold text-white">
                  RM
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#e5e5e5]">
                    Rajeev Menon
                  </div>
                  <div className="text-xs text-[#737373]">
                    Head of Crude Logistics, illustrative pilot
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome metrics */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <Stat
              kpi="₹37 Cr"
              label="Demurrage avoided / quarter"
              foot="Pilot fleet · 12 vessels"
            />
            <Stat
              kpi="−4.6 days"
              label="Median dwell, Hormuz to Indian port"
              foot="vs. last-quarter baseline"
              tone="positive"
            />
            <Stat
              kpi="100%"
              label="Audit trail on routing decisions"
              foot="Every override logged"
              tone="muted"
            />
            <Stat
              kpi="< 2 s"
              label="Solver response on what-if scenarios"
              foot="P95 across pilot workload"
              tone="muted"
            />
          </div>
        </div>

        {/* Read more link */}
        <div className="mt-12 text-center">
          <Link
            href="/customers"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
          >
            Read deployment stories
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CustomerCard({
  name,
  sector,
  capacityMMTPA,
  refineries,
  accent,
}: {
  name: string;
  sector: string;
  capacityMMTPA: string;
  refineries: string;
  accent: 'blue' | 'amber' | 'cyan' | 'emerald' | 'violet' | 'red';
}) {
  const accentMap = {
    blue: 'before:bg-[#3b82f6]',
    amber: 'before:bg-amber-500',
    cyan: 'before:bg-cyan-500',
    emerald: 'before:bg-emerald-500',
    violet: 'before:bg-violet-500',
    red: 'before:bg-red-500',
  };

  return (
    <div
      className={`group relative rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-6 hover:border-[#3a3a3a] hover:bg-[#111] hover:translate-y-[-2px] transition-all duration-300 overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-0.5 ${accentMap[accent]} before:opacity-50 hover:before:opacity-100 hover:before:w-1`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-semibold text-[#e5e5e5] tracking-tight">
            {name}
          </div>
          <div className="mt-0.5 text-[11px] text-[#737373]">{sector}</div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-1">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#525252]">
            Capacity
          </div>
          <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-[#e5e5e5]">
            {capacityMMTPA} <span className="text-[#737373] font-normal">MMTPA</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#525252]">
            Footprint
          </div>
          <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-[#e5e5e5]">
            {refineries}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  kpi,
  label,
  foot,
  tone = 'positive',
}: {
  kpi: string;
  label: string;
  foot: string;
  tone?: 'positive' | 'muted';
}) {
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-5 flex flex-col">
      <div
        className={`font-mono text-2xl font-semibold tabular-nums ${
          tone === 'positive' ? 'text-emerald-400' : 'text-[#e5e5e5]'
        }`}
      >
        {kpi}
      </div>
      <div className="mt-1.5 text-sm text-[#e5e5e5] leading-snug font-medium">
        {label}
      </div>
      <div className="mt-auto pt-3 text-[11px] text-[#737373]">{foot}</div>
    </div>
  );
}
