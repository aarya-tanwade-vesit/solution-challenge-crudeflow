'use client';

import {
  Anchor,
  Brain,
  Cog,
  Database,
  Eye,
  FlaskConical,
  Globe2,
  Layers,
  Map as MapIcon,
  Radio,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';

/**
 * Capabilities — full taxonomy of NEMO CrudeFlow's 13 core systems,
 * grouped into the four operator verbs they map to:
 *
 *   SENSE     · what the system perceives
 *   DECIDE    · how it chooses
 *   SIMULATE  · what it can rehearse
 *   GOVERN    · how it stays accountable
 *
 * Each verb gets a tinted column heading, then a tight list of
 * sub-capabilities with their own icon and one-line proof. This
 * preserves "marketing readability" while still surfacing the depth
 * of the underlying engineering — the kind of credibility a refinery
 * CTO needs before they'll route procurement budget your way.
 */
export function LandingCapabilities() {
  return (
    <section
      id="capabilities"
      className="relative py-24 sm:py-32 border-t border-[#1f1f1f]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
            Capabilities
          </div>
          <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-[#e5e5e5] leading-[1.05] text-balance">
            A living ocean brain. Built in thirteen layers.
          </h2>
          <p className="mt-6 text-lg text-[#a3a3a3] leading-relaxed text-pretty">
            CrudeFlow isn&apos;t a dashboard bolted onto a vendor feed. It&apos;s
            a layered system — each layer purpose-built, each layer
            accountable to the operator above it.
          </p>
        </div>

        {/* Four-pillar grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Pillar
            tone="blue"
            verb="Sense"
            tagline="The perception layer."
            items={[
              {
                Icon: Radio,
                title: 'Real-time AIS ingestion',
                blurb:
                  'AISStream-grade global vessel feed, processed continuously into a high-frequency time-series store.',
              },
              {
                Icon: MapIcon,
                title: 'Geospatial intelligence (PostGIS)',
                blurb:
                  'Polygon-based zone detection, route overlap, port proximity — your map knows what it means, not just where things are.',
              },
              {
                Icon: Database,
                title: 'AIS black box (replay-ready)',
                blurb:
                  'Raw JSONB storage of every message — for audits, ML retraining, or replaying a Hormuz incident in slow motion.',
              },
              {
                Icon: Globe2,
                title: 'External intelligence layer',
                blurb:
                  'Weather GRIB, GDELT geopolitics, port queues — fused into the same operator state.',
              },
            ]}
          />

          <Pillar
            tone="cyan"
            verb="Decide"
            tagline="The reasoning layer."
            items={[
              {
                Icon: Eye,
                title: 'Event detection engine',
                blurb:
                  'Route deviation, speed anomaly, entry into risk zone — turned into structured events with metadata.',
              },
              {
                Icon: Brain,
                title: 'Multi-agent AI orchestration',
                blurb:
                  'Intelligence, Weather and Operations agents debate in parallel, then converge to a unified recommendation.',
              },
              {
                Icon: Cog,
                title: 'Deterministic optimization',
                blurb:
                  'Mathematical solvers (PuLP / LP) optimize cost, time, and risk — no hallucinations, only constraints.',
              },
              {
                Icon: Sparkles,
                title: 'Risk intelligence engine',
                blurb:
                  'Severity-graded geospatial risk polygons, evaluated against every vessel state in real time.',
              },
            ]}
          />

          <Pillar
            tone="amber"
            verb="Simulate"
            tagline="The rehearsal layer."
            items={[
              {
                Icon: FlaskConical,
                title: 'Scenario engine',
                blurb:
                  '"Hormuz closure", "Q4 charter spike", "Mumbai port congestion" — run them before they run you.',
              },
              {
                Icon: Workflow,
                title: 'Stub-vessel data integrity',
                blurb:
                  'Self-healing UPSERT logic: positions before identity? No data loss. Identity before position? Same.',
              },
              {
                Icon: Zap,
                title: 'Real-time API (FastAPI)',
                blurb:
                  'Programmatic access to vessel state, positions, and events — your nervous system, queryable.',
              },
            ]}
          />

          <Pillar
            tone="emerald"
            verb="Govern"
            tagline="The accountability layer."
            items={[
              {
                Icon: ShieldCheck,
                title: 'Human-in-the-loop decision matrix',
                blurb:
                  'Every option, every trade-off, every confidence score — surfaced for the operator to make the final call.',
              },
              {
                Icon: Anchor,
                title: 'Command Center UI',
                blurb:
                  'Real-time visualization, simulation interface, interactive flows — system state, made legible.',
              },
              {
                Icon: Layers,
                title: 'End-to-end audit trail',
                blurb:
                  'Override, approval, model version, operator, timestamp — captured for every decision the system touches.',
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

const TONE_MAP = {
  blue: {
    ring: 'border-[#3b82f6]/30',
    bg: 'bg-[#3b82f6]/10',
    fg: 'text-[#60a5fa]',
    barFg: 'bg-[#3b82f6]',
  },
  cyan: {
    ring: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    fg: 'text-cyan-400',
    barFg: 'bg-cyan-500',
  },
  amber: {
    ring: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    fg: 'text-amber-400',
    barFg: 'bg-amber-500',
  },
  emerald: {
    ring: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    fg: 'text-emerald-400',
    barFg: 'bg-emerald-500',
  },
} as const;

type Tone = keyof typeof TONE_MAP;

function Pillar({
  tone,
  verb,
  tagline,
  items,
}: {
  tone: Tone;
  verb: string;
  tagline: string;
  items: { Icon: React.ElementType; title: string; blurb: string }[];
}) {
  const t = TONE_MAP[tone];
  return (
    <div className="group/pillar rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] overflow-hidden flex flex-col transition-all duration-500 hover:border-[#2a2a2a] hover:bg-[#0c0c0c] hover:translate-y-[-2px]">
      {/* Pillar header */}
      <div className="px-5 pt-5 pb-4 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <span className={`w-1 h-4 rounded-sm ${t.barFg} transition-all duration-500 group-hover/pillar:h-5`} />
          <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${t.fg}`}>
            {verb}
          </div>
        </div>
        <div className="mt-2 text-base font-semibold text-[#e5e5e5] leading-snug">
          {tagline}
        </div>
      </div>

      {/* Pillar body — feature list */}
      <div className="flex-1 divide-y divide-[#1f1f1f]">
        {items.map((it) => (
          <div
            key={it.title}
            className="group/item px-5 py-4 transition-colors duration-300 hover:bg-[#0d0d0d]"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-md border ${t.ring} ${t.bg} flex items-center justify-center flex-none transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-[-2deg]`}
              >
                <it.Icon className={`w-4 h-4 ${t.fg}`} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#e5e5e5] leading-snug">
                  {it.title}
                </div>
                <p className="mt-1 text-[12.5px] text-[#a3a3a3] leading-relaxed">
                  {it.blurb}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
