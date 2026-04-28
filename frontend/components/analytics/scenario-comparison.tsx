'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GitCompare, Shield, Clock, DollarSign, Battery, Leaf, TrendingDown, TrendingUp, Minus,
  Beaker, ArrowRight, Check, X, CircleDashed,
} from 'lucide-react';

type MetricKey = 'cost' | 'delay' | 'risk' | 'buffer' | 'co2';

interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  cost: number;        // USD
  delay: number;       // hours
  risk: number;        // 0-100
  buffer: number;      // days
  co2: number;         // tonnes
  tag?: 'baseline' | 'recommended' | 'alternative';
  outcomes: string[];
}

const SEED_SCENARIOS: Scenario[] = [
  {
    id: 'baseline',
    name: 'Current Plan',
    subtitle: 'Hormuz transit, normal speed',
    cost: 1_400_000, delay: 48, risk: 85, buffer: 1.5, co2: 420,
    tag: 'baseline',
    outcomes: ['+48h delay from Hormuz exposure', '$1.4M insurance + demurrage', 'Buffer falls to 1.5d (critical)'],
  },
  {
    id: 'cape',
    name: 'Reroute via Cape',
    subtitle: 'Full Cape of Good Hope transit',
    cost: 420_000, delay: 168, risk: 18, buffer: 4.0, co2: 832,
    tag: 'recommended',
    outcomes: ['Zero geopolitical risk exposure', '$980K net savings', 'CO₂ cost — review ESG policy'],
  },
  {
    id: 'slow-steam',
    name: 'Slow Steam + Window',
    subtitle: '10kt speed, await Hormuz clear',
    cost: 640_000, delay: 72, risk: 45, buffer: 1.8, co2: 305,
    tag: 'alternative',
    outcomes: ['Partial risk exposure remains', 'Lower CO₂ footprint', 'Buffer stays near critical'],
  },
];

const METRICS: { key: MetricKey; label: string; icon: React.ElementType; betterIsLower: boolean; fmt: (v: number) => string }[] = [
  { key: 'cost',   label: 'Cost',     icon: DollarSign, betterIsLower: true,  fmt: (v) => fmtMoney(v) },
  { key: 'delay',  label: 'Delay',    icon: Clock,      betterIsLower: true,  fmt: (v) => `${v}h` },
  { key: 'risk',   label: 'Risk',     icon: Shield,     betterIsLower: true,  fmt: (v) => `${v}/100` },
  { key: 'buffer', label: 'Buffer',   icon: Battery,    betterIsLower: false, fmt: (v) => `${v.toFixed(1)}d` },
  { key: 'co2',    label: 'CO₂',      icon: Leaf,       betterIsLower: true,  fmt: (v) => `${v}t` },
];

function fmtMoney(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export function ScenarioComparison() {
  const [scenarios] = useState<Scenario[]>(SEED_SCENARIOS);
  const [highlighted, setHighlighted] = useState<MetricKey | null>(null);

  // For each metric, compute which scenario is the winner
  const winners = React.useMemo(() => {
    const out: Record<MetricKey, string> = {} as any;
    METRICS.forEach((m) => {
      const sorted = [...scenarios].sort((a, b) => m.betterIsLower ? a[m.key] - b[m.key] : b[m.key] - a[m.key]);
      out[m.key] = sorted[0].id;
    });
    return out;
  }, [scenarios]);

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] px-4 py-3">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-[#3b82f6]" />
          <h2 className="text-sm font-semibold text-[#e5e5e5]">Scenario Comparison</h2>
          <span className="rounded bg-[#262626] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
            What-if analysis
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/simulation"
            className="flex items-center gap-1 rounded border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6] hover:bg-[#3b82f6]/15"
          >
            <Beaker className="h-3 w-3" />
            Model in Lab
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Metric chips */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[#2a2a2a] px-4 py-2">
        <button
          onClick={() => setHighlighted(null)}
          className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
            highlighted === null ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]' : 'border-[#2a2a2a] bg-[#141414] text-[#a3a3a3] hover:border-[#3a3a3a]'
          }`}
        >
          All metrics
        </button>
        {METRICS.map((m) => {
          const Icon = m.icon;
          const isActive = highlighted === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setHighlighted(m.key)}
              className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                isActive ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]' : 'border-[#2a2a2a] bg-[#141414] text-[#a3a3a3] hover:border-[#3a3a3a]'
              }`}
            >
              <Icon className="h-3 w-3" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-3">
        {scenarios.map((s) => (
          <ScenarioCard
            key={s.id}
            scenario={s}
            winners={winners}
            highlighted={highlighted}
          />
        ))}
      </div>
    </div>
  );
}

function ScenarioCard({
  scenario, winners, highlighted,
}: {
  scenario: Scenario;
  winners: Record<MetricKey, string>;
  highlighted: MetricKey | null;
}) {
  const tagMeta =
    scenario.tag === 'recommended' ? { label: 'Recommended', class: 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30', icon: Check } :
    scenario.tag === 'baseline'    ? { label: 'Baseline',    class: 'bg-[#262626] text-[#a3a3a3] border-[#2a2a2a]',       icon: CircleDashed } :
                                      { label: 'Alternative', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: X };
  const TagIcon = tagMeta.icon;

  return (
    <div
      className={`rounded-md border bg-[#141414] p-3 transition-colors ${
        scenario.tag === 'recommended' ? 'border-[#3b82f6]/40' : 'border-[#2a2a2a]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-semibold text-[#e5e5e5]">{scenario.name}</h3>
          <p className="text-[10px] text-[#737373]">{scenario.subtitle}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${tagMeta.class}`}>
          <TagIcon className="h-2.5 w-2.5" />
          {tagMeta.label}
        </span>
      </div>

      {/* Metric table */}
      <dl className="mt-3 grid grid-cols-5 gap-1">
        {METRICS.map((m) => {
          const isWinner = winners[m.key] === scenario.id;
          const isHighlighted = highlighted === null || highlighted === m.key;
          const value = scenario[m.key];
          const Icon = m.icon;
          return (
            <div
              key={m.key}
              className={`rounded border p-1.5 transition-opacity ${
                isWinner ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#2a2a2a] bg-[#0f0f0f]'
              } ${!isHighlighted ? 'opacity-40' : ''}`}
            >
              <dt className="flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#525252]">
                <Icon className="h-2.5 w-2.5" />
                {m.label}
              </dt>
              <dd className={`mt-0.5 font-mono text-[11px] font-bold tabular-nums ${isWinner ? 'text-emerald-400' : 'text-[#e5e5e5]'}`}>
                {m.fmt(value)}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* Outcomes */}
      <ul className="mt-3 space-y-1 border-t border-[#2a2a2a] pt-2">
        {scenario.outcomes.map((o, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[10.5px] text-[#a3a3a3]">
            <span className={`mt-1 h-1 w-1 flex-none rounded-full ${
              scenario.tag === 'recommended' ? 'bg-emerald-400' : scenario.tag === 'baseline' ? 'bg-red-400' : 'bg-amber-400'
            }`} />
            {o}
          </li>
        ))}
      </ul>
    </div>
  );
}
