'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  DollarSign,
  Navigation,
  Radio,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Product preview — a "real screenshot" of the dashboard, but built
 * from the same primitives the actual app uses (KPI strip, decision
 * card, AIS feed). This lets us:
 *   1. Avoid showing a stale PNG that drifts from the real app.
 *   2. Promise things we actually deliver (every metric maps to a
 *      real dashboard widget).
 *   3. Animate small parts (the AIS feed) to give the marketing
 *      surface a heartbeat.
 *
 * Composition:
 *   - Browser-chrome frame (faux URL bar)
 *   - Top KPI strip (4 tiles, matching dashboard treatment)
 *   - Two-column body:
 *       Left: Decision card with reroute recommendation
 *       Right: Live AIS feed
 */
export function LandingProductPreview() {
  return (
    <section
      id="product"
      className="relative py-20 sm:py-24 border-t border-[#1f1f1f]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">
              The console
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#e5e5e5] leading-[1.05] text-balance">
              One screen. Every signal. The math attached.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[#a3a3a3] text-base leading-relaxed text-pretty">
              The CrudeFlow console fuses fleet positions, weather, port queues
              and charter constraints into ranked decisions — every
              recommendation arrives with reasoning and a one-click audit.
            </p>
          </div>
        </div>

        {/* Browser frame */}
        <div className="mt-12 rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a] overflow-hidden shadow-2xl shadow-black/40">
          {/* Faux browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1f1f1f] bg-[#0f0f0f]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-md bg-[#1a1a1a] px-3 py-1 text-[11px] text-[#737373]">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className="font-mono">crudeflow.app/dashboard</span>
              </div>
            </div>
            <div className="text-[10px] text-[#525252] font-mono">v4.2.1</div>
          </div>

          {/* Console body */}
          <div className="p-4 sm:p-5 lg:p-6 bg-[#0a0a0a] space-y-4">
            <KPIStripPreview />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7">
                <DecisionCardPreview />
              </div>
              <div className="lg:col-span-5">
                <AISFeedPreview />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
          >
            Open the live dashboard
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────  KPI Strip preview  ─────────────────────── */

function KPIStripPreview() {
  const tiles = [
    {
      icon: Activity,
      label: 'Fleet on track',
      value: '184',
      unit: '/ 247',
      severity: 'good' as const,
      delta: '+3',
    },
    {
      icon: AlertTriangle,
      label: 'Hormuz exposure',
      value: '74',
      unit: 'idx',
      severity: 'critical' as const,
      delta: '↑ 8',
    },
    {
      icon: Clock,
      label: 'Avg dwell delta',
      value: '−4.6',
      unit: 'days',
      severity: 'good' as const,
      delta: 'vs LQ',
    },
    {
      icon: DollarSign,
      label: 'Demurrage avoided',
      value: '₹37',
      unit: 'Cr QTD',
      severity: 'normal' as const,
      delta: '+9.6%',
    },
  ];

  const sevMap = {
    good: { border: 'border-emerald-500/30', icon: 'text-emerald-400 bg-emerald-500/10', value: 'text-emerald-400' },
    critical: { border: 'border-red-500/30', icon: 'text-red-400 bg-red-500/10', value: 'text-red-400' },
    normal: { border: 'border-[#3b82f6]/30', icon: 'text-[#3b82f6] bg-[#3b82f6]/10', value: 'text-[#60a5fa]' },
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tiles.map((t) => {
        const s = sevMap[t.severity];
        const Icon = t.icon;
        return (
          <div
            key={t.label}
            className={`rounded-lg border ${s.border} bg-[#0f0f0f] p-3.5`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center ${s.icon}`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-mono tabular-nums text-[#737373]">
                {t.delta}
              </span>
            </div>
            <div className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#737373]">
              {t.label}
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                className={`font-mono text-xl font-semibold tabular-nums ${s.value}`}
              >
                {t.value}
              </span>
              <span className="text-[10px] font-mono text-[#737373]">{t.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────  Decision card preview  ─────────────────────── */

function DecisionCardPreview() {
  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#3b82f6]/10 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-[#3b82f6]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e5e5]">
              Decision Engine
            </div>
            <div className="text-[10px] text-[#737373]">
              VLCC TRINETRA · Hormuz-bound
            </div>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-400">
            Action needed
          </span>
        </div>
      </div>

      {/* Recommendation block */}
      <div className="rounded-md border border-[#3b82f6]/30 bg-[#3b82f6]/[0.06] p-3.5">
        <div className="flex items-start gap-2">
          <Cpu className="w-4 h-4 text-[#60a5fa] mt-0.5 flex-none" />
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#60a5fa]">
              Solver recommendation · 94% confidence
            </div>
            <p className="mt-1.5 text-sm text-[#e5e5e5] leading-snug">
              Reroute via UAE coastal lane. Avoids elevated Hormuz inner channel,
              adds ~2 h transit, saves ₹2.1 Cr in war-risk premium.
            </p>
          </div>
        </div>

        {/* Three-column impact deltas */}
        <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-[#3b82f6]/20">
          <ImpactCell label="Time" value="+2 h" tone="warn" />
          <ImpactCell label="Cost" value="−₹2.1 Cr" tone="good" />
          <ImpactCell label="Risk" value="−42 pts" tone="good" />
        </div>
      </div>

      {/* Approve / route row */}
      <div className="mt-4 flex items-center gap-2">
        <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#3b82f6] hover:bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white transition-colors">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approve & dispatch
        </button>
        <button className="rounded-md border border-[#2a2a2a] hover:border-[#3a3a3a] px-3 py-2 text-xs font-semibold text-[#a3a3a3] hover:text-[#e5e5e5] transition-colors">
          Route to peer
        </button>
        <button className="rounded-md border border-[#2a2a2a] hover:border-[#3a3a3a] px-3 py-2 text-xs font-semibold text-[#a3a3a3] hover:text-[#e5e5e5] transition-colors">
          Reject
        </button>
      </div>
    </div>
  );
}

function ImpactCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'good' | 'warn';
}) {
  const c = tone === 'good' ? 'text-emerald-400' : 'text-amber-400';
  return (
    <div>
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#737373]">
        {label}
      </div>
      <div className={`mt-0.5 font-mono text-sm font-semibold tabular-nums ${c}`}>
        {value}
      </div>
    </div>
  );
}

/* ───────────────────────  AIS feed preview  ─────────────────────── */

function AISFeedPreview() {
  // Static seed so we don't hydrate-mismatch; the gentle "shuffle in"
  // animation comes from the index rotating every few seconds.
  const baseEvents = [
    { vessel: 'NEW HARMONY', port: 'Mumbai', kind: 'arrival', when: '14:02 IST' },
    { vessel: 'STAR PEGASUS', port: 'Hormuz', kind: 'risk', when: '13:58 IST' },
    { vessel: 'BW LION', port: 'Vadinar', kind: 'arrival', when: '13:45 IST' },
    { vessel: 'EAGLE BARENTS', port: 'Cape', kind: 'reroute', when: '13:31 IST' },
    { vessel: 'GAGAN-1', port: 'Paradip', kind: 'departure', when: '13:18 IST' },
    { vessel: 'TRINETRA', port: 'Hormuz', kind: 'risk', when: '13:04 IST' },
  ];

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 3500);
    return () => clearInterval(id);
  }, []);

  // Rotate the array so the "newest" appears at the top.
  const events = [
    ...baseEvents.slice(tick % baseEvents.length),
    ...baseEvents.slice(0, tick % baseEvents.length),
  ];

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-cyan-500/10 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#e5e5e5]">AIS feed</div>
            <div className="text-[10px] text-[#737373]">Last 30 min · 1.2 k events</div>
          </div>
        </div>
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
          <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
        </span>
      </div>

      <ul className="divide-y divide-[#1f1f1f]">
        {events.slice(0, 5).map((e) => {
          const meta =
            e.kind === 'risk'
              ? {
                  Icon: AlertTriangle,
                  iconClass: 'text-red-400',
                  label: 'Entered risk zone',
                  labelClass: 'text-red-400',
                }
              : e.kind === 'reroute'
              ? {
                  Icon: Navigation,
                  iconClass: 'text-amber-400',
                  label: 'Rerouted',
                  labelClass: 'text-amber-400',
                }
              : e.kind === 'arrival'
              ? {
                  Icon: CheckCircle2,
                  iconClass: 'text-emerald-400',
                  label: 'Arrived',
                  labelClass: 'text-emerald-400',
                }
              : {
                  Icon: Activity,
                  iconClass: 'text-[#60a5fa]',
                  label: 'Departed',
                  labelClass: 'text-[#60a5fa]',
                };
          return (
            <li
              key={e.vessel + e.when}
              className="flex items-center gap-2.5 py-2.5"
            >
              <meta.Icon
                className={`w-3.5 h-3.5 flex-none ${meta.iconClass}`}
                strokeWidth={2.2}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[12px] font-semibold text-[#e5e5e5] truncate">
                    {e.vessel}
                  </span>
                  <span className="text-[10px] text-[#737373] flex-none">
                    · {e.port}
                  </span>
                </div>
                <div className={`text-[10.5px] font-medium ${meta.labelClass}`}>
                  {meta.label}
                </div>
              </div>
              <div className="text-[10px] font-mono tabular-nums text-[#525252] flex-none">
                {e.when}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
