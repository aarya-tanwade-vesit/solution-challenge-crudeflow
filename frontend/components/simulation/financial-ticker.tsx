'use client';

import React from 'react';
import { DollarSign, TrendingDown, Scale, Clock } from 'lucide-react';
import { useSimulation } from '@/contexts/simulation-context';

function formatCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

interface TickerCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle: string;
  severity: 'critical' | 'warning' | 'neutral';
  pulse?: boolean;
}

function TickerCard({ icon: Icon, label, value, subtitle, severity, pulse }: TickerCardProps) {
  const styles = {
    critical: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      icon: 'text-red-400 bg-red-500/10',
      value: 'text-red-400',
      dot: 'bg-red-500',
    },
    warning: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      icon: 'text-amber-400 bg-amber-500/10',
      value: 'text-amber-400',
      dot: 'bg-amber-500',
    },
    neutral: {
      border: 'border-[#2a2a2a]',
      bg: 'bg-[#1a1a1a]',
      icon: 'text-[#737373] bg-[#262626]',
      value: 'text-[#e5e5e5]',
      dot: 'bg-[#3b82f6]',
    },
  }[severity];

  return (
    <div className={`flex-1 min-w-0 ${styles.bg} border ${styles.border} rounded-lg p-3`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded flex items-center justify-center ${styles.icon}`}>
            <Icon className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">{label}</span>
        </div>
        {pulse && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} animate-pulse`} />}
      </div>
      <div className={`text-xl font-bold font-mono tabular-nums ${styles.value}`}>{value}</div>
      <div className="text-[10px] text-[#525252] mt-0.5 truncate">{subtitle}</div>
    </div>
  );
}

export function FinancialTicker() {
  const { demurrageAccum, revenueLoss, opportunityCost, currentDay, isPlaying } = useSimulation();
  const totalImpact = demurrageAccum + revenueLoss;

  return (
    <section className="bg-[#141414] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#2a2a2a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Financial Damage</span>
          {isPlaying && (
            <span className="flex items-center gap-1 text-[10px] text-[#3b82f6]">
              <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <span className="text-[10px] text-[#525252] font-mono">
          Day {currentDay} &middot; Total Impact {formatCurrency(totalImpact)}
        </span>
      </div>

      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <TickerCard
          icon={Clock}
          label="Demurrage Ticker"
          value={formatCurrency(demurrageAccum)}
          subtitle={`Accumulating @ ${formatCurrency(demurrageAccum / Math.max(currentDay, 1))}/day`}
          severity={demurrageAccum > 1_000_000 ? 'critical' : demurrageAccum > 300_000 ? 'warning' : 'neutral'}
          pulse={isPlaying}
        />
        <TickerCard
          icon={TrendingDown}
          label="Revenue at Risk"
          value={formatCurrency(revenueLoss)}
          subtitle="Daily operating income loss"
          severity={revenueLoss > 800_000 ? 'critical' : revenueLoss > 200_000 ? 'warning' : 'neutral'}
          pulse={isPlaying}
        />
        <TickerCard
          icon={Scale}
          label="Opportunity Cost"
          value={formatCurrency(opportunityCost)}
          subtitle="vs. AI recommended action"
          severity={opportunityCost > 500_000 ? 'warning' : 'neutral'}
        />
        <TickerCard
          icon={DollarSign}
          label="Total Exposure"
          value={formatCurrency(totalImpact + opportunityCost)}
          subtitle="Cumulative loss envelope"
          severity={totalImpact > 1_500_000 ? 'critical' : totalImpact > 500_000 ? 'warning' : 'neutral'}
        />
      </div>
    </section>
  );
}
