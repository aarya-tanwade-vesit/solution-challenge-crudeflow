'use client';

import React from 'react';
import { GitCompare, ArrowRight, X } from 'lucide-react';
import { useSimulation } from '@/contexts/simulation-context';

function formatCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

const BASELINE = {
  bufferDays: 6.2,
  demurrage: 0,
  revenueLoss: 0,
  riskIndex: 28,
};

interface DiffRowProps {
  label: string;
  before: string;
  after: string;
  delta: string;
  deltaColor: 'red' | 'amber' | 'emerald' | 'neutral';
}

function DiffRow({ label, before, after, delta, deltaColor }: DiffRowProps) {
  const deltaClass = {
    red: 'text-red-400 bg-red-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    neutral: 'text-[#a3a3a3] bg-[#262626]',
  }[deltaColor];

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-3 px-3 py-2.5 border-b border-[#2a2a2a] last:border-b-0">
      <span className="text-[11px] text-[#a3a3a3]">{label}</span>
      <span className="text-xs font-mono text-[#525252] tabular-nums">{before}</span>
      <ArrowRight className="w-3 h-3 text-[#404040]" />
      <span className="text-xs font-mono font-semibold text-[#e5e5e5] tabular-nums">{after}</span>
      <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${deltaClass} tabular-nums`}>
        {delta}
      </span>
    </div>
  );
}

export function ImpactSummary() {
  const { bufferDays, demurrageAccum, revenueLoss, riskIndex, snapshots, removeSnapshot, currentDay } = useSimulation();

  const bufferDelta = bufferDays - BASELINE.bufferDays;
  const riskDelta = riskIndex - BASELINE.riskIndex;

  return (
    <section className="bg-[#141414] border border-[#2a2a2a] rounded-lg overflow-hidden flex flex-col">
      <div className="px-4 py-2.5 border-b border-[#2a2a2a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Impact Summary</span>
        </div>
        <span className="text-[10px] text-[#525252]">Live vs Day {currentDay}</span>
      </div>

      <div>
        <DiffRow
          label="Buffer Days"
          before={`${BASELINE.bufferDays.toFixed(1)}d`}
          after={`${bufferDays.toFixed(1)}d`}
          delta={`${bufferDelta >= 0 ? '+' : ''}${bufferDelta.toFixed(1)}d`}
          deltaColor={bufferDelta < -2 ? 'red' : bufferDelta < 0 ? 'amber' : 'emerald'}
        />
        <DiffRow
          label="Demurrage Accrued"
          before="$0"
          after={formatCurrency(demurrageAccum)}
          delta={`+${formatCurrency(demurrageAccum)}`}
          deltaColor={demurrageAccum > 500_000 ? 'red' : demurrageAccum > 100_000 ? 'amber' : 'neutral'}
        />
        <DiffRow
          label="Revenue Loss"
          before="$0"
          after={formatCurrency(revenueLoss)}
          delta={`+${formatCurrency(revenueLoss)}`}
          deltaColor={revenueLoss > 500_000 ? 'red' : revenueLoss > 100_000 ? 'amber' : 'neutral'}
        />
        <DiffRow
          label="Maritime Risk"
          before={`${BASELINE.riskIndex}`}
          after={`${riskIndex}`}
          delta={`${riskDelta >= 0 ? '+' : ''}${riskDelta}`}
          deltaColor={riskDelta > 30 ? 'red' : riskDelta > 10 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Pinned snapshot comparison */}
      {snapshots.length > 0 && (
        <div className="border-t border-[#2a2a2a] p-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">
              Pinned Snapshots
            </span>
          </div>
          {snapshots.map((snap) => (
            <div
              key={snap.id}
              className="flex items-center justify-between px-2.5 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[11px] hover:border-[#3a3a3a] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                <span className="text-[#e5e5e5] font-semibold flex-shrink-0">{snap.label}</span>
                <span className="text-[#525252] capitalize truncate">
                  &middot; {snap.scenario.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px] flex-shrink-0">
                <span className="text-[#a3a3a3]">{snap.bufferDays.toFixed(1)}d</span>
                <span className="text-red-400">{formatCurrency(snap.demurrage)}</span>
                <button
                  onClick={() => removeSnapshot(snap.id)}
                  className="text-[#525252] hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
