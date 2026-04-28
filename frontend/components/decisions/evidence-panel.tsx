'use client';

import React, { useState } from 'react';
import type { DecisionRecord, EvidenceType } from '@/contexts/decisions-context';
import {
  Lightbulb, Shield, Scale, Database, HelpCircle,
  Newspaper, Radio, Anchor, Cloud, Cpu, BarChart3,
  TrendingUp, TrendingDown, Minus, ChevronRight,
} from 'lucide-react';
import { RelativeTime } from '@/components/shared/relative-time';

interface Props {
  decision: DecisionRecord | null;
}

type TabId = 'reasoning' | 'confidence' | 'tradeoff' | 'evidence' | 'why-not';

const EVIDENCE_META: Record<EvidenceType, { icon: React.ElementType; label: string; color: string }> = {
  news:     { icon: Newspaper, label: 'News',      color: 'text-amber-400' },
  ais:      { icon: Radio,     label: 'AIS',       color: 'text-[#3b82f6]' },
  port:     { icon: Anchor,    label: 'Port',      color: 'text-cyan-400' },
  weather:  { icon: Cloud,     label: 'Weather',   color: 'text-sky-400' },
  internal: { icon: Cpu,       label: 'Internal',  color: 'text-emerald-400' },
  market:   { icon: BarChart3, label: 'Market',    color: 'text-fuchsia-400' },
};

export function EvidencePanel({ decision }: Props) {
  const [tab, setTab] = useState<TabId>('reasoning');

  if (!decision) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <Database className="mx-auto h-10 w-10 text-[#404040]" />
          <p className="mt-3 text-xs text-[#525252]">Evidence &amp; explanation appear here</p>
        </div>
      </div>
    );
  }

  const d = decision;

  const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'reasoning',  label: 'XAI',        icon: Lightbulb, count: d.reasoningFactors?.length },
    { id: 'confidence', label: 'Confidence', icon: Shield },
    { id: 'tradeoff',   label: 'Trade-offs', icon: Scale },
    { id: 'evidence',   label: 'Evidence',   icon: Database, count: d.evidence?.length },
    { id: 'why-not',    label: 'Why not?',   icon: HelpCircle, count: d.alternatives?.length },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Tab strip */}
      <div className="flex-none border-b border-[#2a2a2a] bg-[#0f0f0f]/80 backdrop-blur-sm px-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((t) => {
            const isActive = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-none items-center gap-2 border-b-2 px-3 py-3 text-[9px] font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? 'border-[#3b82f6] text-[#3b82f6] bg-[#3b82f6]/5'
                    : 'border-transparent text-[#525252] hover:text-[#a3a3a3]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#3b82f6]' : 'text-[#404040]'}`} />
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[8px] font-black ${
                    isActive ? 'bg-[#3b82f6] text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-[#1a1a1a] text-[#525252]'
                  }`}>{t.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab panels */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'reasoning' && <ReasoningTab decision={d} />}
        {tab === 'confidence' && <ConfidenceTab decision={d} />}
        {tab === 'tradeoff' && <TradeoffTab decision={d} />}
        {tab === 'evidence' && <EvidenceTab decision={d} />}
        {tab === 'why-not' && <WhyNotTab decision={d} />}
      </div>
    </div>
  );
}

/* ——— Reasoning (XAI) ——— */

function ReasoningTab({ decision }: { decision: DecisionRecord }) {
  const factors = decision.reasoningFactors;
  return (
    <div className="p-5 space-y-4">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#525252]">
          Contributing factors
        </h3>
        <p className="mt-0.5 text-[11px] text-[#737373]">
          Weighted inputs that drove this recommendation. Higher weight = stronger signal.
        </p>
      </div>

      {factors && factors.length > 0 ? (
        <ul className="space-y-2">
          {factors.map((f, i) => (
            <li key={i} className="rounded-md border border-[#2a2a2a] bg-[#141414] p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <DirectionIcon dir={f.direction} />
                  <span className="text-[13px] font-semibold text-[#e5e5e5]">{f.factor}</span>
                </div>
                <span className="font-mono text-[11px] text-[#3b82f6] tabular-nums">
                  {Math.round(f.weight * 100)}%
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#262626]">
                <div
                  className={`h-full rounded-full ${
                    f.direction === 'negative' ? 'bg-red-400' : f.direction === 'positive' ? 'bg-emerald-400' : 'bg-[#3b82f6]'
                  }`}
                  style={{ width: `${f.weight * 100}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[#a3a3a3]">{f.summary}</p>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-1.5 rounded-md border border-[#2a2a2a] bg-[#141414] p-3">
          {decision.reasoning.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-[#e5e5e5]">
              <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-[#525252]" />
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DirectionIcon({ dir }: { dir: 'positive' | 'negative' | 'neutral' }) {
  if (dir === 'positive') return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (dir === 'negative') return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
  return <Minus className="h-3.5 w-3.5 text-[#737373]" />;
}

/* ——— Confidence breakdown ——— */

function ConfidenceTab({ decision }: { decision: DecisionRecord }) {
  const cb = decision.confidenceBreakdown;
  const fallback = { riskSignal: decision.confidence, delayForecast: decision.confidence, costEstimate: decision.confidence, bufferPrediction: decision.confidence };
  const values = cb || fallback;

  const rows = [
    { label: 'Risk signal',       value: values.riskSignal,       desc: 'Confidence in threat assessment and external risk inputs' },
    { label: 'Delay forecast',    value: values.delayForecast,    desc: 'Confidence in ETA prediction and routing calculation' },
    { label: 'Cost estimate',     value: values.costEstimate,     desc: 'Confidence in bunker, demurrage, and commercial modeling' },
    { label: 'Buffer prediction', value: values.bufferPrediction, desc: 'Confidence in inventory cushion and throughput model' },
  ];

  return (
    <div className="p-5 space-y-4">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#525252]">Confidence components</h3>
        <p className="mt-0.5 text-[11px] text-[#737373]">
          The overall {decision.confidence}% score is a weighted blend of these signal sources.
        </p>
      </div>

      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#e5e5e5]">{r.label}</span>
              <span className="font-mono text-[11px] tabular-nums text-[#a3a3a3]">{r.value}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#1f1f1f]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]" style={{ width: `${r.value}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-[#525252]">{r.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ——— Trade-off matrix ——— */

function TradeoffTab({ decision }: { decision: DecisionRecord }) {
  const co2 = decision.co2DeltaTons ?? 0;
  const cards = [
    {
      label: 'Cost vs Delay',
      left: { label: 'Cost', value: fmtCostDelta(decision.costImpact), tone: decision.costImpact <= 0 ? 'good' : 'warn' as const },
      right: { label: 'Delay', value: `${decision.delayHoursImpact >= 0 ? '+' : ''}${decision.delayHoursImpact}h`, tone: decision.delayHoursImpact > 0 ? 'warn' : 'good' as const },
    },
    {
      label: 'Risk vs Buffer',
      left: { label: 'Risk', value: `${decision.riskDelta >= 0 ? '+' : ''}${decision.riskDelta}`, tone: decision.riskDelta < 0 ? 'good' : 'warn' as const },
      right: { label: 'Buffer', value: decision.bufferImpactDays !== undefined ? `${decision.bufferImpactDays >= 0 ? '+' : ''}${decision.bufferImpactDays.toFixed(1)}d` : '—', tone: (decision.bufferImpactDays ?? 0) >= 0 ? 'good' : 'warn' as const },
    },
    {
      label: 'ESG & CO₂',
      left: { label: 'CO₂ Δ', value: `${co2 >= 0 ? '+' : ''}${co2}t`, tone: co2 <= 0 ? 'good' : 'warn' as const },
      right: { label: 'Sustainability', value: co2 > 300 ? 'Review' : 'Within policy', tone: co2 > 300 ? 'warn' : 'good' as const },
    },
  ];

  return (
    <div className="p-5 space-y-4">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#525252]">Trade-off matrix</h3>
        <p className="mt-0.5 text-[11px] text-[#737373]">
          Every optimization has a counter-move. These are the explicit compromises of the recommended action.
        </p>
      </div>

      <ul className="space-y-2">
        {cards.map((c) => (
          <li key={c.label} className="rounded-md border border-[#2a2a2a] bg-[#141414] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#525252]">{c.label}</div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-[#737373]">{c.left.label}</div>
                <div className={`font-mono text-base font-bold tabular-nums ${c.left.tone === 'good' ? 'text-emerald-400' : 'text-amber-400'}`}>{c.left.value}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#737373]">{c.right.label}</div>
                <div className={`font-mono text-base font-bold tabular-nums ${c.right.tone === 'good' ? 'text-emerald-400' : 'text-amber-400'}`}>{c.right.value}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function fmtCostDelta(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? '−' : v > 0 ? '+' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

/* ——— Evidence explorer (USP: RAE cards) ——— */

function EvidenceTab({ decision }: { decision: DecisionRecord }) {
  const [filterType, setFilterType] = useState<EvidenceType | 'all'>('all');
  const evidence = decision.evidence || [];
  const filtered = filterType === 'all' ? evidence : evidence.filter((e) => e.type === filterType);

  const availableTypes = Array.from(new Set(evidence.map((e) => e.type)));

  return (
    <div className="p-5 space-y-4">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#525252]">Evidence Explorer</h3>
        <p className="mt-0.5 text-[11px] text-[#737373]">
          Traceable sources that drove this recommendation. Each card shows origin, timestamp, and confidence.
        </p>
      </div>

      {evidence.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#2a2a2a] bg-[#141414] p-6 text-center">
          <Database className="mx-auto h-6 w-6 text-[#404040]" />
          <p className="mt-2 text-[11px] text-[#525252]">No retrieval-augmented evidence attached to this decision.</p>
        </div>
      ) : (
        <>
          {/* Type filter chips */}
          <div className="flex flex-wrap gap-1.5">
            <Chip active={filterType === 'all'} onClick={() => setFilterType('all')} label={`All (${evidence.length})`} />
            {availableTypes.map((t) => {
              const meta = EVIDENCE_META[t];
              const count = evidence.filter((e) => e.type === t).length;
              const Icon = meta.icon;
              return (
                <Chip
                  key={t}
                  active={filterType === t}
                  onClick={() => setFilterType(t)}
                  label={`${meta.label} (${count})`}
                  icon={<Icon className="h-3 w-3" />}
                />
              );
            })}
          </div>

          {/* Cards */}
          <ul className="space-y-2">
            {filtered.map((e) => {
              const meta = EVIDENCE_META[e.type];
              const Icon = meta.icon;
              return (
                <li key={e.id} className="rounded-md border border-[#2a2a2a] bg-[#141414] p-3 hover:border-[#3a3a3a]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <div className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded border border-[#2a2a2a] bg-[#0f0f0f] ${meta.color}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
                          <span className="text-[10px] text-[#525252]">•</span>
                          <span className="text-[10px] text-[#a3a3a3]">{e.source}</span>
                        </div>
                        <p className="mt-1 text-[12px] leading-relaxed text-[#e5e5e5]">{e.summary}</p>
                        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[#737373]">
                          <RelativeTime ts={e.timestamp} compact className="font-mono" />
                          <span className="flex items-center gap-1">
                            <span className="inline-block h-1 w-10 overflow-hidden rounded-full bg-[#262626]">
                              <span className="block h-full bg-[#3b82f6]" style={{ width: `${e.confidence}%` }} />
                            </span>
                            {e.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function Chip({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
        active
          ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]'
          : 'border-[#2a2a2a] bg-[#141414] text-[#a3a3a3] hover:border-[#3a3a3a]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ——— Why Not mode ——— */

function WhyNotTab({ decision }: { decision: DecisionRecord }) {
  const alts = decision.alternatives || [];
  return (
    <div className="p-5 space-y-4">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#525252]">Why not these?</h3>
        <p className="mt-0.5 text-[11px] text-[#737373]">
          Alternatives the AI evaluated and rejected, with structured reasoning.
        </p>
      </div>

      {alts.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#2a2a2a] bg-[#141414] p-6 text-center">
          <HelpCircle className="mx-auto h-6 w-6 text-[#404040]" />
          <p className="mt-2 text-[11px] text-[#525252]">No alternatives recorded for this decision.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {alts.map((a) => (
            <li key={a.id} className="rounded-md border border-[#2a2a2a] bg-[#141414] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${a.feasible ? 'bg-amber-400' : 'bg-red-400'}`} />
                    <span className="text-[13px] font-medium text-[#e5e5e5]">{a.label}</span>
                    <span className={`rounded px-1 text-[9px] font-semibold uppercase tracking-wider ${
                      a.feasible ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {a.feasible ? 'Feasible, sub-optimal' : 'Infeasible'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                    <div><span className="text-[#525252]">Δ Delay:</span> <span className="font-mono text-[#e5e5e5]">{a.deltaDelayHours > 0 ? '+' : ''}{a.deltaDelayHours}h</span></div>
                    <div><span className="text-[#525252]">Δ Cost:</span> <span className={`font-mono ${a.deltaCost > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{fmtCostDelta(a.deltaCost)}</span></div>
                    <div><span className="text-[#525252]">Δ Risk:</span> <span className={`font-mono ${a.deltaRisk > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{a.deltaRisk > 0 ? '+' : ''}{a.deltaRisk}</span></div>
                  </div>
                  <div className="mt-2 flex items-start gap-1.5 rounded border border-[#2a2a2a] bg-[#0f0f0f] p-2 text-[11px] text-[#a3a3a3]">
                    <ChevronRight className="mt-0.5 h-3 w-3 flex-none text-[#525252]" />
                    <span><span className="font-semibold text-[#e5e5e5]">Rejected because:</span> {a.rejectionReason}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
