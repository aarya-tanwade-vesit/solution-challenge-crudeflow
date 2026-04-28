'use client';

import React from 'react';
import { useDecisions } from '@/contexts';
import { CheckCircle2, Clock, Brain, DollarSign } from 'lucide-react';

function fmt(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

interface KpiProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  tone?: 'blue' | 'emerald' | 'amber' | 'neutral';
}

function Kpi({ icon: Icon, label, value, sub, tone = 'neutral' }: KpiProps) {
  const tones = {
    blue:    { border: 'border-[#3b82f6]/30',  icon: 'text-[#3b82f6] bg-[#3b82f6]/10',  value: 'text-[#e5e5e5]' },
    emerald: { border: 'border-emerald-500/30', icon: 'text-emerald-400 bg-emerald-500/10', value: 'text-emerald-400' },
    amber:   { border: 'border-amber-500/30',   icon: 'text-amber-400 bg-amber-500/10',     value: 'text-amber-400' },
    neutral: { border: 'border-[#2a2a2a]',      icon: 'text-[#737373] bg-[#262626]',        value: 'text-[#e5e5e5]' },
  }[tone];

  return (
    <div className={`flex items-center gap-3 rounded-md border ${tones.border} bg-[#1a1a1a] px-3 py-2`}>
      <div className={`flex h-9 w-9 flex-none items-center justify-center rounded-md ${tones.icon}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className={`text-lg font-bold font-mono tabular-nums ${tones.value}`}>{value}</span>
        </div>
        <div className="truncate text-[10px] text-[#525252]">{sub}</div>
      </div>
    </div>
  );
}

export function DecisionsKpiBar() {
  const { pendingCount, criticalCount, metrics, decisions } = useDecisions();
  const autoApproved = decisions.filter((d) => d.status === 'auto-approved').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      <Kpi
        icon={Clock}
        label="Pending Review"
        value={`${pendingCount}`}
        sub={`${criticalCount} critical · ${autoApproved} auto-approved`}
        tone={criticalCount > 0 ? 'amber' : 'neutral'}
      />
      <Kpi
        icon={CheckCircle2}
        label="Approval Rate"
        value={`${metrics.approvalRate}%`}
        sub={`${metrics.avgResponseTimeMinutes}m avg response time`}
        tone={metrics.approvalRate > 75 ? 'emerald' : 'neutral'}
      />
      <Kpi
        icon={Brain}
        label="Avg Confidence"
        value={`${metrics.avgConfidence}%`}
        sub="Across all recommendations"
        tone="blue"
      />
      <Kpi
        icon={DollarSign}
        label="Cost Saved YTD"
        value={fmt(metrics.totalCostSavedYTD)}
        sub={`${fmt(metrics.avgCostSaved)} avg per approved`}
        tone="emerald"
      />
    </div>
  );
}
