'use client';

import React from 'react';
import { Clock, DollarSign, Shield, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useSimulation, useSettings } from '@/contexts';

function formatCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

const BASELINE = { bufferDays: 6.2, demurrage: 0, riskIndex: 28, revenueLoss: 0 };

interface KPIProps {
  icon: React.ElementType;
  label: string;
  value: string;
  baseline: string;
  delta: string;
  deltaTrend: 'up' | 'down' | 'flat';
  severity: 'critical' | 'warning' | 'normal' | 'good';
}

function KPI({ icon: Icon, label, value, baseline, delta, deltaTrend, severity }: KPIProps) {
  const styles = {
    critical: { border: 'border-red-500/40', icon: 'text-red-400 bg-red-500/10', value: 'text-red-400', delta: 'text-red-400' },
    warning:  { border: 'border-amber-500/40', icon: 'text-amber-400 bg-amber-500/10', value: 'text-amber-400', delta: 'text-amber-400' },
    normal:   { border: 'border-[#2a2a2a]', icon: 'text-[#3b82f6] bg-[#3b82f6]/10', value: 'text-[#e5e5e5]', delta: 'text-[#a3a3a3]' },
    good:     { border: 'border-emerald-500/30', icon: 'text-emerald-400 bg-emerald-500/10', value: 'text-emerald-400', delta: 'text-emerald-400' },
  }[severity];

  const TrendIcon = deltaTrend === 'up' ? TrendingUp : deltaTrend === 'down' ? TrendingDown : null;

  return (
    <div className={`bg-[#1a1a1a] border ${styles.border} rounded-md px-3 py-2 flex items-center gap-3 min-w-0`}>
      <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#737373] truncate">{label}</div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className={`text-lg font-bold font-mono tabular-nums ${styles.value}`}>{value}</span>
          <span className="text-[10px] text-[#525252] font-mono">vs {baseline}</span>
        </div>
      </div>
      <div className={`flex items-center gap-0.5 text-[10px] font-mono font-semibold flex-shrink-0 ${styles.delta}`}>
        {TrendIcon && <TrendIcon className="w-3 h-3" />}
        <span>{delta}</span>
      </div>
    </div>
  );
}

export function SimKpiBar() {
  const { bufferDays, demurrageAccum, riskIndex, revenueLoss, currentDay, isPlaying, isCascading } = useSimulationDerived();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-wider">Live Simulation Metrics</span>
          {isPlaying && (
            <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              UPDATING
            </span>
          )}
        </div>
        <span className="text-[10px] text-[#525252] font-mono">
          Day {Math.round(currentDay * 10) / 10} / 30
          {isCascading && <span className="ml-2 text-[#3b82f6]">• Cascading system-wide</span>}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <KPI
          icon={Clock}
          label="Buffer Days"
          value={`${bufferDays.toFixed(1)}d`}
          baseline={`${BASELINE.bufferDays.toFixed(1)}d`}
          delta={`${(bufferDays - BASELINE.bufferDays).toFixed(1)}d`}
          deltaTrend={bufferDays > BASELINE.bufferDays ? 'up' : bufferDays < BASELINE.bufferDays ? 'down' : 'flat'}
          severity={bufferDays < 2 ? 'critical' : bufferDays < 4 ? 'warning' : 'good'}
        />
        <KPI
          icon={DollarSign}
          label="Demurrage Accrued"
          value={formatCurrency(demurrageAccum)}
          baseline="$0"
          delta={`+${formatCurrency(demurrageAccum)}`}
          deltaTrend="up"
          severity={demurrageAccum > 1_000_000 ? 'critical' : demurrageAccum > 300_000 ? 'warning' : 'normal'}
        />
        <KPI
          icon={AlertTriangle}
          label="Revenue at Risk"
          value={formatCurrency(revenueLoss)}
          baseline="$0"
          delta={`+${formatCurrency(revenueLoss)}`}
          deltaTrend="up"
          severity={revenueLoss > 800_000 ? 'critical' : revenueLoss > 200_000 ? 'warning' : 'normal'}
        />
        <KPI
          icon={Shield}
          label="Maritime Risk"
          value={`${riskIndex}`}
          baseline={`${BASELINE.riskIndex}`}
          delta={`${riskIndex > BASELINE.riskIndex ? '+' : ''}${riskIndex - BASELINE.riskIndex}`}
          deltaTrend={riskIndex > BASELINE.riskIndex ? 'up' : 'down'}
          severity={riskIndex > 70 ? 'critical' : riskIndex > 50 ? 'warning' : 'good'}
        />
      </div>
    </div>
  );
}

function useSimulationDerived() {
  const sim = useSimulation();
  const { preferences } = useSettings();
  return {
    bufferDays: sim.bufferDays,
    demurrageAccum: sim.demurrageAccum,
    riskIndex: sim.riskIndex,
    revenueLoss: sim.revenueLoss,
    currentDay: sim.currentDay,
    isPlaying: sim.isPlaying,
    isCascading: sim.isSimulationMode && preferences.simulationViewMode === 'integrated',
  };
}
