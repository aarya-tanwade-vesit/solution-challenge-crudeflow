'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronRight, AlertTriangle, Clock, Shield, DollarSign } from 'lucide-react';
import { useKPI } from '@/contexts/kpi-context';
import { KPIDrillDownDrawer } from './kpi-drilldown-drawer';

type Severity = 'critical' | 'warning' | 'normal' | 'good' | 'purple';

interface KPICardProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  unit?: string;
  currency?: string;
  trend: 'up' | 'down' | 'neutral';
  trendPercentage: number;
  impact: string;
  severity: Severity;
  onSelect: () => void;
}

function KPICard({
  id,
  icon,
  label,
  value,
  unit,
  currency,
  trend,
  trendPercentage,
  impact,
  severity,
  onSelect,
}: KPICardProps) {
  // Restored: tinted background per severity, with the four-color
  // brand mapping: red / amber / blue / purple.
  const severityStyles: Record<
    Severity,
    { bg: string; border: string; value: string; icon: string; glow: string }
  > = {
    critical: {
      bg: 'bg-[#1a1a1a]',
      border: 'border-red-500/40',
      value: 'text-red-400',
      icon: 'text-red-500 bg-red-500/10',
      glow: 'shadow-red-500/5',
    },
    warning: {
      bg: 'bg-[#1a1a1a]',
      border: 'border-amber-500/40',
      value: 'text-amber-400',
      icon: 'text-amber-500 bg-amber-500/10',
      glow: 'shadow-amber-500/5',
    },
    normal: {
      bg: 'bg-[#1a1a1a]',
      border: 'border-blue-500/40',
      value: 'text-blue-400',
      icon: 'text-blue-500 bg-blue-500/10',
      glow: 'shadow-blue-500/5',
    },
    purple: {
      bg: 'bg-[#1a1a1a]',
      border: 'border-purple-500/40',
      value: 'text-purple-400',
      icon: 'text-purple-500 bg-purple-500/10',
      glow: 'shadow-purple-500/5',
    },
    good: {
      bg: 'bg-[#1a1a1a]',
      border: 'border-emerald-500/40',
      value: 'text-emerald-400',
      icon: 'text-emerald-500 bg-emerald-500/10',
      glow: 'shadow-emerald-500/5',
    },
  };

  const styles = severityStyles[severity];

  const formattedValue =
    currency
      ? `$${(value / 1_000_000).toFixed(1)}M`
      : unit === '%'
      ? `${value.toFixed(0)}%`
      : unit === 'Days'
      ? value.toFixed(1)
      : value.toFixed(1);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  // Buffer Days improving = good (up). Everything else: down = good.
  const isTrendPositive =
    (id === 'buffer' && trend === 'up') || (id !== 'buffer' && trend === 'down');

  return (
    <button
      onClick={onSelect}
      className={`flex-1 min-w-[230px] ${styles.bg} border ${styles.border} rounded-lg p-4 hover:border-opacity-70 hover:bg-[#1f1f1f] transition-all cursor-pointer group text-left shadow-lg ${styles.glow}`}
      title={`Click to drill down: ${impact}`}
    >
      {/* Icon + label + chevron */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${styles.icon} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#737373] block">
              {label}
            </span>
            {unit && !currency && <span className="text-[10px] text-[#525252]">{unit}</span>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#404040] opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
      </div>

      {/* Value + trend */}
      <div className="flex items-baseline gap-3 mb-3">
        <span className={`kpi-value text-3xl font-bold tracking-tight ${styles.value}`}>
          {formattedValue}
        </span>
        <div
          className={`flex items-center gap-1 text-xs font-mono font-semibold ${
            isTrendPositive ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          <TrendIcon className="w-3.5 h-3.5" />
          <span>
            {trend === 'neutral' ? '0' : trend === 'up' ? '+' : '-'}
            {Math.abs(trendPercentage)}%
          </span>
        </div>
      </div>

      {/* Impact */}
      <p className="text-xs text-[#737373] leading-relaxed line-clamp-2">{impact}</p>
    </button>
  );
}

export function KPIStrip() {
  const { kpiData, isLoading } = useKPI();
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);

  if (isLoading || !kpiData) {
    return (
      <div className="bg-[#0f0f0f] border-b border-[#1a1a1a] px-6 py-5">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-1 min-w-[230px] h-[140px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#0f0f0f] border-b border-[#1a1a1a] px-6 py-5">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
              Key Performance Indicators
            </h2>
            <span className="text-[10px] text-[#525252] font-mono">Updated 2m ago</span>
          </div>
          <button className="text-[10px] text-[#525252] hover:text-[#a3a3a3] transition-colors uppercase tracking-wider font-semibold">
            View All Metrics
          </button>
        </div>

        {/*
          KPI grid — fixed brand color order:
          1. Demurrage Forecast → red
          2. Buffer Days        → amber (yellow)
          3. Maritime Risk      → blue
          4. Cost of Inaction   → purple
        */}
        <div className="flex gap-4 overflow-x-auto pb-1">
          <KPICard
            id="demurrage"
            icon={<DollarSign className="w-5 h-5" />}
            label="Demurrage Forecast"
            value={kpiData.demurrageForecast.value}
            currency="USD"
            trend={kpiData.demurrageForecast.trend}
            trendPercentage={kpiData.demurrageForecast.trendPercentage}
            impact={kpiData.demurrageForecast.impact}
            severity="critical"
            onSelect={() => setSelectedKPI('demurrage')}
          />

          <KPICard
            id="buffer"
            icon={<Clock className="w-5 h-5" />}
            label="Buffer Days Remaining"
            value={kpiData.bufferDaysRemaining.value}
            unit="Days"
            trend={kpiData.bufferDaysRemaining.trend}
            trendPercentage={kpiData.bufferDaysRemaining.trendPercentage}
            impact={kpiData.bufferDaysRemaining.impact}
            severity="warning"
            onSelect={() => setSelectedKPI('buffer')}
          />

          <KPICard
            id="risk"
            icon={<Shield className="w-5 h-5" />}
            label="Maritime Risk Index"
            value={kpiData.maritimeRiskIndex.value}
            unit="%"
            trend={kpiData.maritimeRiskIndex.trend}
            trendPercentage={kpiData.maritimeRiskIndex.trendPercentage}
            impact={kpiData.maritimeRiskIndex.impact}
            severity="normal"
            onSelect={() => setSelectedKPI('risk')}
          />

          <KPICard
            id="inaction"
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Cost of Inaction"
            value={kpiData.costOfInaction.value}
            currency="USD"
            unit="/day"
            trend={kpiData.costOfInaction.trend}
            trendPercentage={kpiData.costOfInaction.trendPercentage}
            impact={kpiData.costOfInaction.impact}
            severity="purple"
            onSelect={() => setSelectedKPI('inaction')}
          />
        </div>
      </div>

      {/* Drill-down drawer */}
      {selectedKPI && kpiData && (
        <KPIDrillDownDrawer
          isOpen={!!selectedKPI}
          onClose={() => setSelectedKPI(null)}
          kpiType={selectedKPI as 'demurrage' | 'buffer' | 'risk' | 'inaction'}
          kpiData={kpiData}
        />
      )}
    </>
  );
}
