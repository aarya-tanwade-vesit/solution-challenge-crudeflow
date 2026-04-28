'use client';

/**
 * execution-panel.tsx — "Simulated Execution Layer".
 *
 * The closing-the-loop story: NEMO doesn't just decide a new route —
 * it cascades the decision into the downstream logistics that have to
 * actually happen for the route to be real (rail, trucking, refinery
 * intake slot, cost reconciliation, ETA confirmation).
 *
 * Pitch positioning (per the product spec):
 *   "NEMO doesn't stop at decision-making. It extends into execution —
 *    coordinating downstream logistics like rail and port scheduling.
 *    In production, this integrates directly with logistics providers
 *    (CONCOR, IRCTC, TCI, VRL) to automate the entire response."
 *
 * Behaviour:
 *   - Six steps cascade in sequence, each ~3.5s, with a 5s hold at the
 *     end before the cascade resets and a fresh reroute kicks off.
 *   - Each step has a "scheduling…" pending state and a "scheduled"
 *     completed state with brand/partner attribution.
 *   - A small footer disclaimer makes clear this is simulated until
 *     real partner APIs are wired (honest with auditors, important
 *     for a PSU buyer).
 *   - Respects prefers-reduced-motion (renders all steps complete).
 */

import React, { useEffect, useState } from 'react';
import {
  Route,
  Train,
  Truck,
  Factory,
  IndianRupee,
  Clock,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Step = {
  id: string;
  Icon: LucideIcon;
  label: string;
  detail: string;
  partner: string;
  /** Right-aligned summary value (e.g. "−₹2.4 Cr"). */
  metric: string;
  metricTone: 'neutral' | 'good' | 'warning';
};

const STEPS: Step[] = [
  {
    id: 'route',
    Icon: Route,
    label: 'Reroute confirmed',
    detail: 'VLCC PRATIBHA SAVITA · Hormuz → BPCL Mumbai',
    partner: 'NEMO Math Core',
    metric: '1,684 nm',
    metricTone: 'neutral',
  },
  {
    id: 'rail',
    Icon: Train,
    label: 'Rail rake allocated',
    detail: 'BTPN rake · Wadi Bunder yard · 14 wagons',
    partner: 'CONCOR · IRCTC',
    metric: 'Slot 06:40',
    metricTone: 'neutral',
  },
  {
    id: 'truck',
    Icon: Truck,
    label: 'Trucking dispatched',
    detail: '12 × 28kL tankers staged at JNPT',
    partner: 'TCI · VRL Logistics',
    metric: '12 trucks',
    metricTone: 'neutral',
  },
  {
    id: 'refinery',
    Icon: Factory,
    label: 'Refinery intake reserved',
    detail: 'BPCL Mahul · Crude Unit 2 · Slot D-14:00',
    partner: 'BPCL Operations',
    metric: '14:00 IST',
    metricTone: 'neutral',
  },
  {
    id: 'cost',
    Icon: IndianRupee,
    label: 'Cost reconciled',
    detail: 'Demurrage avoided · charter spread closed',
    partner: 'Treasury · Audit',
    metric: '−₹2.4 Cr',
    metricTone: 'good',
  },
  {
    id: 'eta',
    Icon: Clock,
    label: 'ETA locked',
    detail: 'Discharge window 14 Mar · 02:30 → 04:30 IST',
    partner: 'Watch floor',
    metric: '−16h 10m',
    metricTone: 'good',
  },
];

const STEP_DURATION = 3500; // ms per step
const HOLD_MS = 5_000; // hold all-complete this long before resetting
const TOTAL = STEPS.length * STEP_DURATION + HOLD_MS;

export function ExecutionPanel() {
  // Active step is the index currently animating ("scheduling…").
  // Anything below it is "scheduled". Anything above is "queued".
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const r = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(r);
    if (r) {
      setActive(STEPS.length); // mark all complete
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) % TOTAL;
      const idx = Math.min(STEPS.length, Math.floor(t / STEP_DURATION));
      setActive(idx);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] overflow-hidden">
      {/* Header — match the visual rhythm of decision-engine.tsx */}
      <div className="flex-shrink-0 h-10 flex items-center justify-between px-4 border-b border-[#2a2a2a]">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
          <Sparkles className="h-3 w-3 text-[#3b82f6]" />
          Execution Layer
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] font-mono uppercase tracking-[0.18em] text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded">
            Simulated
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[#22d3ee]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-[#22d3ee] animate-ping opacity-50" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[#22d3ee]" />
            </span>
            <span className="font-mono">live</span>
          </span>
        </div>
      </div>

      {/* Sub-header — context line */}
      <div className="px-4 py-2 border-b border-[#2a2a2a] bg-[#141414]">
        <p className="text-[11px] text-[#a3a3a3] leading-relaxed">
          When a reroute clears, NEMO cascades into rail, trucking, refinery
          intake and cost reconciliation —{' '}
          <span className="text-[#e5e5e5]">closed-loop orchestration</span>.
        </p>
      </div>

      {/* Step list — scrollable if vertical space is tight */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
        <ol className="relative">
          {/* Continuous spine */}
          <span
            aria-hidden="true"
            className="absolute left-[22px] top-2 bottom-2 w-px bg-[#2a2a2a]"
          />
          {STEPS.map((s, i) => {
            const state =
              reduced || i < active
                ? 'done'
                : i === active
                ? 'active'
                : 'queued';
            return (
              <ExecutionStep key={s.id} step={s} state={state} />
            );
          })}
        </ol>
      </div>

      {/* Footer — honest disclosure */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-[#2a2a2a] bg-[#141414]">
        <p className="text-[9.5px] font-mono leading-relaxed text-[#737373]">
          <span className="text-[#a3a3a3]">In production:</span> wires to
          CONCOR · IRCTC · TCI · VRL · BPCL refinery scheduling APIs.
        </p>
      </div>
    </div>
  );
}

/* ─── Step renderer ─────────────────────────────────────────────── */

function ExecutionStep({
  step,
  state,
}: {
  step: Step;
  state: 'queued' | 'active' | 'done';
}) {
  const { Icon, label, detail, partner, metric, metricTone } = step;

  // Color tokens per state
  const ringColor =
    state === 'done'
      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
      : state === 'active'
      ? 'border-[#3b82f6]/60 bg-[#3b82f6]/15 text-[#3b82f6]'
      : 'border-[#2a2a2a] bg-[#0f0f0f] text-[#525252]';

  const labelColor =
    state === 'queued' ? 'text-[#525252]' : 'text-[#e5e5e5]';

  const detailColor =
    state === 'queued' ? 'text-[#3a3a3a]' : 'text-[#a3a3a3]';

  const metricColor =
    state === 'queued'
      ? 'text-[#525252]'
      : metricTone === 'good'
      ? 'text-emerald-400'
      : metricTone === 'warning'
      ? 'text-amber-400'
      : state === 'active'
      ? 'text-[#3b82f6]'
      : 'text-[#a3a3a3]';

  // Pick the right status icon for the right column
  const StatusIcon =
    state === 'done'
      ? CheckCircle2
      : state === 'active'
      ? Loader2
      : null;

  return (
    <li className="relative flex items-start gap-3 px-2 py-2.5">
      {/* Spine bullet */}
      <div
        className={`relative z-[1] flex h-9 w-9 flex-none items-center justify-center rounded-full border ${ringColor} transition-colors duration-300`}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <div className={`text-[12.5px] font-semibold leading-snug ${labelColor}`}>
            {label}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-mono tabular-nums ${metricColor}`}
            >
              {metric}
            </span>
            {StatusIcon ? (
              <StatusIcon
                className={`h-3 w-3 ${
                  state === 'active'
                    ? 'text-[#3b82f6] animate-spin'
                    : 'text-emerald-400'
                }`}
              />
            ) : null}
          </div>
        </div>
        <div className={`mt-0.5 text-[11px] leading-relaxed ${detailColor}`}>
          {detail}
        </div>
        <div className="mt-1 text-[9.5px] font-mono uppercase tracking-[0.16em] text-[#525252]">
          {partner}
        </div>
      </div>
    </li>
  );
}
