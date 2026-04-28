'use client';

import React from 'react';
import Link from 'next/link';
import { Check, AlertTriangle, Brain, ArrowUpRight, Clock, DollarSign, Shield, Beaker, Sparkles } from 'lucide-react';
import { useDecisions } from '@/contexts';
import type { Vessel } from '@/types/vessel';

interface DecisionEngineProps {
  selectedVessel?: Vessel | null;
}

function fmtCost(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? '−' : v > 0 ? '+' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function DecisionEngine({ selectedVessel }: DecisionEngineProps) {
  const { decisions, pendingCount, criticalCount, approve } = useDecisions();

  // Pending pool, with optional bias toward the currently-selected vessel.
  // When a vessel is selected on the map or operations table, its decisions
  // float to the top — the system feels live and contextual.
  const pending = decisions.filter((d) => d.status === 'pending');

  const sortedPending = pending.slice().sort((a, b) => {
    const order = { critical: 4, high: 3, medium: 2, low: 1 } as const;

    // Vessel match always wins, then priority, then confidence.
    if (selectedVessel) {
      const aMatch =
        a.vesselId === selectedVessel.id ||
        (a.vesselName && selectedVessel.name && a.vesselName === selectedVessel.name);
      const bMatch =
        b.vesselId === selectedVessel.id ||
        (b.vesselName && selectedVessel.name && b.vesselName === selectedVessel.name);
      if (aMatch && !bMatch) return -1;
      if (bMatch && !aMatch) return 1;
    }

    if (order[a.priority] !== order[b.priority]) {
      return order[b.priority] - order[a.priority];
    }
    return b.confidence - a.confidence;
  });

  const topDecision = sortedPending[0] || null;
  const topMatchesSelection =
    !!selectedVessel &&
    !!topDecision &&
    (topDecision.vesselId === selectedVessel.id ||
      topDecision.vesselName === selectedVessel.name);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Brain className="w-4 h-4 text-[#3b82f6] flex-shrink-0" />
          <span className="text-xs uppercase tracking-wider text-[#a3a3a3] font-semibold truncate">
            Decision Engine
          </span>
        </div>

      </div>

      {/* Selected vessel context strip — appears when user clicks a vessel */}
      {selectedVessel && (
        <div className="flex-none flex items-center justify-between gap-2 border-b border-[#2a2a2a] bg-[#3b82f6]/5 px-4 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6] animate-pulse flex-shrink-0" />
            <span className="text-[10px] uppercase tracking-wider text-[#525252] font-semibold flex-shrink-0">
              Focus
            </span>
            <span className="text-xs text-[#e5e5e5] font-semibold truncate">
              {selectedVessel.name}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#525252] flex-shrink-0">
            {topMatchesSelection ? 'Match' : 'No open decision'}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {topDecision ? (
          <div className="p-4 space-y-3">
            {/* Top recommendation */}
            <div className="rounded-md border border-[#3b82f6]/30 bg-[#3b82f6]/5 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                    topDecision.priority === 'critical' ? 'bg-red-500' :
                    topDecision.priority === 'high' ? 'bg-amber-500' :
                    'bg-[#3b82f6]'
                  }`} />
                  <span className="rounded bg-[#262626] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                    {topDecision.priority}
                  </span>
                  {topDecision.source === 'simulation' && (
                    <span className="rounded bg-[#3b82f6]/15 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#3b82f6] flex items-center gap-0.5">
                      <Beaker className="h-2 w-2" /> SIM
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-[#3b82f6]">
                  {topDecision.confidence}% CONF
                </span>
              </div>

              <h3 className="mt-2 text-[13px] font-semibold leading-tight text-[#e5e5e5]">
                {topDecision.recommendation}
              </h3>
              <p className="mt-1 line-clamp-2 text-[11px] text-[#a3a3a3]">
                {topDecision.oneLineReason || topDecision.cause}
              </p>
            </div>

            {/* Compact impact row */}
            <div className="grid grid-cols-3 gap-2">
              <ImpactChip icon={Clock} label="Delay" value={`${topDecision.delayHoursImpact >= 0 ? '+' : ''}${topDecision.delayHoursImpact}h`} tone={topDecision.delayHoursImpact > 0 ? 'warn' : 'good'} />
              <ImpactChip icon={DollarSign} label="Cost" value={fmtCost(topDecision.costImpact)} tone={topDecision.costImpact < 0 ? 'good' : 'warn'} />
              <ImpactChip icon={Shield} label="Risk" value={`${topDecision.riskDelta >= 0 ? '+' : ''}${topDecision.riskDelta}`} tone={topDecision.riskDelta < 0 ? 'good' : 'warn'} />
            </div>

            {/* Next in queue */}
            {pending.length > 1 && (
              <div className="mt-2 border-t border-[#2a2a2a] pt-2">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-[#525252] mb-1">
                  Next in queue
                </div>
                <ul className="space-y-1">
                  {pending.slice(1, 3).map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="truncate text-[#a3a3a3]">{d.title}</span>
                      <span className="font-mono text-[#525252]">{d.confidence}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <Sparkles className="mx-auto h-6 w-6 text-[#404040]" />
              <p className="mt-2 text-xs text-[#525252]">All recommendations resolved</p>
              <p className="text-[10px] text-[#404040]">No pending decisions</p>
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="flex-none border-t border-[#2a2a2a] p-3 flex items-center gap-2">
        {topDecision && (
          <button
            onClick={() => approve(topDecision.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded bg-[#3b82f6] px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#2563eb]"
          >
            <Check className="h-3.5 w-3.5" />
            Approve top
          </button>
        )}
        <Link
          href="/decisions"
          className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-[11px] font-semibold text-[#a3a3a3] transition-colors hover:border-[#3b82f6]/40 hover:text-[#3b82f6]"
        >
          Open Engine
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function ImpactChip({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: 'good' | 'warn' }) {
  const toneColor = tone === 'good' ? 'text-emerald-400' : 'text-amber-400';
  return (
    <div className="rounded border border-[#2a2a2a] bg-[#141414] px-2 py-1.5">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#525252]">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </div>
      <div className={`mt-0.5 font-mono text-[12px] font-bold tabular-nums ${toneColor}`}>{value}</div>
    </div>
  );
}
