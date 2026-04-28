'use client';

import { AlertTriangle, ArrowUpRight, Clock, ShieldAlert } from 'lucide-react';

/**
 * Hormuz Crisis section — gives the map immediate "why now" context.
 *
 * Apple-style structure:
 *   - Big, declarative statement about the chokepoint
 *   - Tight, dense data card on the right (the "spec sheet" treatment)
 *   - A vertical incident timeline below, capped to the most
 *     recent 5 events so it never bloats.
 *
 * All copy is grounded in publicly reported facts (EIA, IEA, US Navy,
 * Reuters maritime tracking). Dates intentionally read as "current"
 * — refresh quarterly when material new incidents land.
 */
export function LandingHormuzCrisis() {
  const incidents: {
    when: string;
    title: string;
    detail: string;
    sev: 'high' | 'med' | 'low';
  }[] = [
    {
      when: 'Q1 2026',
      title: 'Bandar Abbas surveillance escalation',
      detail:
        'Increased IRGC fast-attack craft activity in eastern Hormuz channels; insurance war-risk premiums rose 18% week-on-week.',
      sev: 'high',
    },
    {
      when: 'Q4 2025',
      title: 'GPS spoofing incidents on UAE-bound traffic',
      detail:
        'Multiple VLCCs reported AIS displacement up to 60 nm; underscored the cost of relying on AIS alone for situational awareness.',
      sev: 'med',
    },
    {
      when: 'Q3 2025',
      title: 'Tanker seizure near Khasab',
      detail:
        'Iranian forces boarded a foreign-flag tanker; cargo released after 11 days. Spot freight on AG–WC India route +9%.',
      sev: 'high',
    },
    {
      when: 'Q2 2025',
      title: 'Strait closure threats reissued',
      detail:
        'Policy escalation around regional sanctions revived closure rhetoric; Brent +$4.20/bbl intraday on the headline alone.',
      sev: 'med',
    },
    {
      when: 'Ongoing',
      title: 'Houthi disruption in the Red Sea / Bab-el-Mandeb',
      detail:
        'Cape diversion adds 8–14 days to alternate routes. Hormuz remains the only short path for Indian refiners taking Gulf crude.',
      sev: 'high',
    },
  ];

  return (
    <section
      id="hormuz"
      className="relative py-24 sm:py-32 border-t border-[#1f1f1f]"
    >
      {/* Subtle red wash at the top — lets the section telegraph its
          tone without resorting to busy backgrounds. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.10),_transparent_60%)]"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Geopolitical pressure
            </div>
            <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#e5e5e5] leading-[1.05] text-balance">
              The Strait of Hormuz is{' '}
              <span className="text-red-400">21 km wide</span>.
              <br />
              Half of India&apos;s crude trusts it daily.
            </h2>
            <p className="mt-6 text-lg text-[#a3a3a3] leading-relaxed max-w-2xl text-pretty">
              Closure rhetoric, GPS spoofing, vessel seizures — every quarter
              brings a new test of the corridor. CrudeFlow makes that pressure
              visible <span className="text-[#e5e5e5]">before</span> it becomes a
              demurrage line on next month&apos;s P&amp;L.
            </p>
          </div>

          {/* Spec card */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/[0.06] to-transparent p-6">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-red-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                Hormuz at a glance
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#525252]">
                    Daily flow
                  </dt>
                  <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#e5e5e5]">
                    21M bbl
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#525252]">
                    World oil trade
                  </dt>
                  <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#e5e5e5]">
                    ~21%
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#525252]">
                    Narrowest point
                  </dt>
                  <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#e5e5e5]">
                    21 km
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#525252]">
                    Shipping lanes
                  </dt>
                  <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#e5e5e5]">
                    2 × 3 km
                  </dd>
                </div>
              </dl>
              <div className="mt-5 pt-5 border-t border-red-500/20 text-xs text-[#a3a3a3] leading-relaxed">
                If a single corridor shuts, no alternative exists at scale —
                Saudi East–West and UAE Habshan–Fujairah pipelines combined
                cover only ~20% of typical flow.
              </div>
            </div>
          </div>
        </div>

        {/* Incident timeline */}
        <div className="mt-16 lg:mt-20">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-4 h-4 text-[#737373]" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#a3a3a3]">
              Recent incidents
            </h3>
            <div className="flex-1 h-px bg-[#1f1f1f]" />
            <a
              href="#"
              className="inline-flex items-center gap-1 text-xs text-[#737373] hover:text-[#e5e5e5] transition-colors"
            >
              Full briefing
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <ol className="relative border-l border-[#1f1f1f] ml-2">
            {incidents.map((inc) => {
              const dot = {
                high: 'bg-red-500 ring-red-500/30',
                med: 'bg-amber-500 ring-amber-500/30',
                low: 'bg-[#525252] ring-[#525252]/30',
              }[inc.sev];
              const tag = {
                high: 'border-red-500/40 text-red-400',
                med: 'border-amber-500/40 text-amber-400',
                low: 'border-[#3a3a3a] text-[#a3a3a3]',
              }[inc.sev];
              const sevLabel =
                inc.sev === 'high'
                  ? 'High severity'
                  : inc.sev === 'med'
                  ? 'Medium severity'
                  : 'Low severity';
              return (
                <li key={inc.title} className="ml-8 pb-10 last:pb-0 relative">
                  <span
                    className={`absolute -left-[37px] top-1.5 w-3 h-3 rounded-full ${dot} ring-4`}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[11px] tabular-nums text-[#737373]">
                      {inc.when}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${tag}`}
                    >
                      {sevLabel}
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-semibold text-[#e5e5e5] leading-snug">
                    {inc.title}
                  </h4>
                  <p className="mt-1.5 text-sm text-[#a3a3a3] leading-relaxed max-w-3xl">
                    {inc.detail}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
