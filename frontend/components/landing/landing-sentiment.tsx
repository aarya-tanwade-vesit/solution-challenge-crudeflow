'use client';

import { useEffect, useState } from 'react';
import { Newspaper, Cloud, Anchor, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';

/**
 * Sentiment Intelligence — the "-100 to +100" section.
 *
 * Markets, refineries and fleets all move on signal long before
 * data hardens. NEMO ingests open-source intelligence (news,
 * weather, port advisories, freight indices, sanctions filings)
 * and scores each item from -100 (acute negative) to +100 (acute
 * positive opportunity), then composes a rolling India Energy
 * Sentiment Index across five sub-domains.
 *
 * The visual centerpiece is a half-arc gauge that lerps to the
 * current composite score with a calm, slow easing (Apple-grade
 * motion: never bouncy, never jittery). Around it: a live ticker
 * of recent scored headlines, and a five-row meter for the sub
 * domains.
 *
 * Powered by Gemma (open weights, fine-tuned on Indic + maritime
 * corpora) and orchestrated by LangGraph — those credits live in
 * a thin attribution band below the gauge.
 */

type ScoredItem = {
  id: string;
  source: string;
  headline: string;
  /** -100 to +100 */
  score: number;
  /** sub-domain */
  bucket: 'geo' | 'weather' | 'port' | 'freight' | 'cargo';
  ts: string;
};

const FEED: ScoredItem[] = [
  {
    id: 'a',
    source: 'Reuters',
    headline: 'Tehran signals possible Hormuz transit curbs amid escalation',
    score: -82,
    bucket: 'geo',
    ts: '03:14',
  },
  {
    id: 'b',
    source: 'Mundra Port',
    headline: 'Berth 7 cleared; container backlog falls 31% wk/wk',
    score: 38,
    bucket: 'port',
    ts: '03:09',
  },
  {
    id: 'c',
    source: 'IMD',
    headline: 'Cyclone Dana intensifies; Paradip approach restricted 36 hr',
    score: -54,
    bucket: 'weather',
    ts: '03:02',
  },
  {
    id: 'd',
    source: 'Bloomberg',
    headline: 'Russian Urals discount narrows to $2.40/bbl over Brent',
    score: 22,
    bucket: 'cargo',
    ts: '02:58',
  },
  {
    id: 'e',
    source: 'BIMCO',
    headline: 'VLCC Arabian Gulf → West Coast India spot rates +14%',
    score: -28,
    bucket: 'freight',
    ts: '02:51',
  },
  {
    id: 'f',
    source: 'MEA',
    headline: 'IMEC corridor MoU adds India–Greece logistics arm',
    score: 47,
    bucket: 'geo',
    ts: '02:44',
  },
  {
    id: 'g',
    source: 'JNPA',
    headline: 'Nhava Sheva strike deferred; ops resume 06:00 IST',
    score: 31,
    bucket: 'port',
    ts: '02:39',
  },
  {
    id: 'h',
    source: 'OFAC',
    headline: 'Two Iranian-linked tankers added to SDN list',
    score: -61,
    bucket: 'geo',
    ts: '02:30',
  },
];

/**
 * Sub-domain composite scores (the radial meters around the gauge).
 * In production these would tick with the feed; here they're stable
 * so the page reads cleanly on first load.
 */
const BUCKETS: { key: ScoredItem['bucket']; label: string; score: number; icon: typeof Newspaper }[] = [
  { key: 'geo', label: 'Geopolitical', score: -71, icon: Newspaper },
  { key: 'weather', label: 'Weather & ocean', score: -28, icon: Cloud },
  { key: 'port', label: 'Port congestion', score: 18, icon: Anchor },
  { key: 'freight', label: 'Freight rates', score: -34, icon: TrendingDown },
  { key: 'cargo', label: 'Cargo & supply', score: 12, icon: TrendingUp },
];

/** Composite index = capacity-weighted average of buckets. */
const TARGET_INDEX = -42;

function scoreColor(score: number): string {
  if (score <= -60) return '#ef4444';
  if (score <= -25) return '#f59e0b';
  if (score <= 25) return '#a3a3a3';
  if (score <= 60) return '#22d3ee';
  return '#34d399';
}

function scoreLabel(score: number): string {
  if (score <= -60) return 'Acute';
  if (score <= -25) return 'Heightened';
  if (score <= 25) return 'Neutral';
  if (score <= 60) return 'Constructive';
  return 'Strong tailwind';
}

export function LandingSentiment() {
  // Smoothly lerp the gauge to its target on mount — a single, calm
  // animation that lasts ~1.6s and then settles.
  const [index, setIndex] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1600);
      // ease-out-expo
      const eased = 1 - Math.pow(2, -8 * t);
      setIndex(Math.round(TARGET_INDEX * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Map score (-100..100) to angle on a half-arc (-90deg..+90deg).
  const angle = (index / 100) * 90;

  // Cycle the highlighted feed item every 3.2s — gives the ticker
  // a subtle "live" feel without being distracting.
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % FEED.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="sentiment"
      className="relative py-24 sm:py-32 border-t border-[#1f1f1f] overflow-hidden"
    >
      {/* very subtle radial wash — an Apple-style "spotlight" */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59, 130, 246, 0.06), transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
            <Sparkles className="h-3 w-3" />
            Sentiment intelligence
          </div>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#e5e5e5] leading-[1.05] text-balance">
            Markets move on rumour. We measure it.
          </h2>
          <p className="mt-6 text-lg text-[#a3a3a3] leading-relaxed max-w-2xl text-pretty">
            Every minute, NEMO reads thousands of sources — news, weather,
            port advisories, freight prints, sanctions filings — and scores
            each one from{' '}
            <span className="font-mono text-red-400">−100</span> to{' '}
            <span className="font-mono text-emerald-400">+100</span>. The
            composite becomes India&apos;s real-time energy sentiment, and it
            feeds every routing decision the platform makes.
          </p>
        </div>

        {/* Main stage: gauge (left) + feed (right) */}
        <div className="mt-12 lg:mt-16 grid lg:grid-cols-5 gap-6">
          {/* ───── Gauge card ───── */}
          <div className="lg:col-span-3 rounded-2xl border border-[#2a2a2a] bg-gradient-to-br from-[#0a0f1a] via-[#0a0a0a] to-[#0a0a0a] p-6 sm:p-8 lg:p-10">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">
                India energy sentiment · live composite
              </h3>
              <span className="text-[10px] font-mono text-[#525252]">
                updated 03:14 IST
              </span>
            </div>

            {/* The gauge */}
            <div className="mt-8 relative mx-auto" style={{ maxWidth: 520 }}>
              <svg viewBox="0 0 520 280" className="w-full h-auto">
                <defs>
                  {/* Gradient sweep across the arc: red → amber → grey → cyan → green */}
                  <linearGradient id="gauge-track" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="25%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#525252" />
                    <stop offset="75%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>

                {/* Arc track */}
                <path
                  d="M 60 240 A 200 200 0 0 1 460 240"
                  fill="none"
                  stroke="url(#gauge-track)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  opacity="0.32"
                />
                {/* Active arc — drawn from the centre outward to the current angle.
                    For simplicity we render the same path with a stroke-dasharray
                    proportional to |index|/100 of the half-arc length (~628). */}
                <path
                  d="M 60 240 A 200 200 0 0 1 460 240"
                  fill="none"
                  stroke="url(#gauge-track)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${(Math.abs(index) / 100) * 628 / 2} 628`}
                  strokeDashoffset={
                    index < 0
                      ? -((628 / 2) - ((Math.abs(index) / 100) * 628) / 2)
                      : -(628 / 2)
                  }
                  style={{ transition: 'stroke-dasharray 600ms ease, stroke-dashoffset 600ms ease' }}
                />

                {/* Tick marks at -100, -50, 0, +50, +100 */}
                {[-100, -50, 0, 50, 100].map((t) => {
                  const a = (t / 100) * 90;
                  const rad = ((a - 90) * Math.PI) / 180;
                  const r1 = 184;
                  const r2 = 198;
                  const x1 = 260 + r1 * Math.cos(rad);
                  const y1 = 240 + r1 * Math.sin(rad);
                  const x2 = 260 + r2 * Math.cos(rad);
                  const y2 = 240 + r2 * Math.sin(rad);
                  const lx = 260 + 218 * Math.cos(rad);
                  const ly = 240 + 218 * Math.sin(rad);
                  return (
                    <g key={t}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#525252"
                        strokeWidth="1"
                      />
                      <text
                        x={lx}
                        y={ly + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                        fill="#737373"
                      >
                        {t > 0 ? `+${t}` : t}
                      </text>
                    </g>
                  );
                })}

                {/* Needle */}
                <g
                  transform={`rotate(${angle} 260 240)`}
                  style={{ transition: 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  <line
                    x1="260"
                    y1="240"
                    x2="260"
                    y2="60"
                    stroke={scoreColor(index)}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="260" cy="60" r="5" fill={scoreColor(index)} />
                </g>
                {/* Hub */}
                <circle cx="260" cy="240" r="10" fill="#0a0a0a" stroke="#3a3a3a" strokeWidth="2" />
                <circle cx="260" cy="240" r="3" fill={scoreColor(index)} />
              </svg>

              {/* Centre readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 pointer-events-none">
                <div className="font-mono text-5xl sm:text-6xl tabular-nums" style={{ color: scoreColor(index) }}>
                  {index > 0 ? `+${index}` : index}
                </div>
                <div
                  className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: scoreColor(index) }}
                >
                  {scoreLabel(index)}
                </div>
              </div>
            </div>

            {/* Sub-domain meters */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {BUCKETS.map((b) => {
                const Icon = b.icon;
                const pct = ((b.score + 100) / 200) * 100; // 0..100 across the bar
                return (
                  <div key={b.key} className="flex items-center gap-3">
                    <Icon className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs text-[#a3a3a3] truncate">{b.label}</span>
                        <span
                          className="font-mono text-[11px] tabular-nums"
                          style={{ color: scoreColor(b.score) }}
                        >
                          {b.score > 0 ? `+${b.score}` : b.score}
                        </span>
                      </div>
                      {/* bar with center origin */}
                      <div className="relative mt-1 h-[3px] rounded-full bg-[#1a1a1a] overflow-hidden">
                        {/* zero marker */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#3a3a3a]" />
                        {/* fill */}
                        <div
                          className="absolute top-0 bottom-0"
                          style={{
                            background: scoreColor(b.score),
                            left: b.score < 0 ? `${pct}%` : '50%',
                            right: b.score >= 0 ? `${100 - pct}%` : '50%',
                            transition: 'all 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stack attribution */}
            <div className="mt-8 pt-6 border-t border-[#1f1f1f] flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-mono text-[#525252]">
              <span>Powered by</span>
              <span className="text-[#a3a3a3]">Gemma · open weights</span>
              <span className="text-[#3a3a3a]">·</span>
              <span className="text-[#a3a3a3]">LangGraph · multi-agent</span>
              <span className="text-[#3a3a3a]">·</span>
              <span className="text-[#a3a3a3]">NEMO math core · deterministic LP</span>
            </div>
          </div>

          {/* ───── Live feed card ───── */}
          <div className="lg:col-span-2 rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] p-6 sm:p-8 flex flex-col">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">
                Scored intake · last 30 min
              </h3>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                  <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                LIVE
              </span>
            </div>

            <ul className="mt-5 flex-1 space-y-3">
              {FEED.map((item, i) => {
                const isActive = i === activeIdx;
                const c = scoreColor(item.score);
                return (
                  <li
                    key={item.id}
                    className="group rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-3 transition-all duration-300 hover:border-[#2a2a2a]"
                    style={{
                      borderColor: isActive ? '#2a2a2a' : undefined,
                      transform: isActive ? 'translateX(2px)' : undefined,
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex items-baseline gap-2 text-[10px] font-mono text-[#525252]">
                        <span>{item.ts}</span>
                        <span className="text-[#3a3a3a]">·</span>
                        <span className="text-[#737373]">{item.source}</span>
                      </div>
                      <span
                        className="font-mono text-sm tabular-nums shrink-0"
                        style={{ color: c }}
                      >
                        {item.score > 0 ? `+${item.score}` : item.score}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#e5e5e5] leading-snug">
                      {item.headline}
                    </p>
                    {/* Score bar */}
                    <div className="relative mt-2 h-[2px] rounded-full bg-[#1a1a1a] overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#3a3a3a]" />
                      <div
                        className="absolute top-0 bottom-0"
                        style={{
                          background: c,
                          left: item.score < 0 ? `${((item.score + 100) / 200) * 100}%` : '50%',
                          right: item.score >= 0 ? `${100 - ((item.score + 100) / 200) * 100}%` : '50%',
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
