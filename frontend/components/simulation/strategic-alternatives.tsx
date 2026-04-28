'use client';

import React from 'react';
import { DollarSign, Timer, Shield, Check, Sparkles, TrendingUp, TrendingDown, Truck } from 'lucide-react';
import { useSimulation } from '@/contexts/simulation-context';
import type { StrategicOptionId } from '@/contexts/simulation-context';

function formatCurrency(v: number): string {
  const abs = Math.abs(v);
  const sign = v >= 0 ? '+' : '-';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatHours(h: number): string {
  const sign = h >= 0 ? '+' : '';
  return `${sign}${h}h`;
}

const OPTION_META: Record<StrategicOptionId, { icon: React.ElementType; accent: string }> = {
  cost: { icon: DollarSign, accent: 'emerald' },
  time: { icon: Timer, accent: 'blue' },
  risk: { icon: Shield, accent: 'amber' },
  emergency: { icon: Truck, accent: 'amber' },
};

const ACCENT: Record<string, { border: string; bg: string; icon: string; label: string; btn: string }> = {
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    icon: 'bg-emerald-500/10 text-emerald-400',
    label: 'text-emerald-400',
    btn: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  },
  blue: {
    border: 'border-[#3b82f6]/40',
    bg: 'bg-[#3b82f6]/5',
    icon: 'bg-[#3b82f6]/10 text-[#3b82f6]',
    label: 'text-[#3b82f6]',
    btn: 'bg-[#3b82f6] hover:bg-[#2563eb] text-white',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    icon: 'bg-amber-500/10 text-amber-400',
    label: 'text-amber-400',
    btn: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
};

export function StrategicAlternatives() {
  const { strategicOptions, selectedOption, selectOption } = useSimulation();

  // AI-recommended option (lowest combined risk+cost+delay)
  const recommended = React.useMemo(() => {
    return strategicOptions.reduce((best, o) => {
      const score = Math.abs(o.costDelta) / 100000 + o.riskScore + Math.abs(o.delayHours) / 24;
      const bestScore = Math.abs(best.costDelta) / 100000 + best.riskScore + Math.abs(best.delayHours) / 24;
      return score < bestScore ? o : best;
    }, strategicOptions[0]);
  }, [strategicOptions]);

  return (
    <section className="bg-[#141414] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#2a2a2a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Strategic Alternatives</span>
        </div>
        <span className="text-[10px] text-[#525252]">NEMO AI &middot; Multi-Objective Optimizer</span>
      </div>

      <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {strategicOptions.map((opt, idx) => {
          const meta = OPTION_META[opt.id];
          const Icon = meta.icon;
          const style = ACCENT[meta.accent];
          const isSelected = selectedOption === opt.id;
          const isRecommended = recommended.id === opt.id;
          const letter = opt.code || ['A', 'B', 'C', 'D'][idx] || '?';

          return (
            <div
              key={opt.id}
              className={`relative rounded-lg border transition-all overflow-hidden ${
                isSelected
                  ? `${style.border} ${style.bg} ring-1 ring-[#3b82f6]/20`
                  : `border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]`
              }`}
            >
              {isRecommended && (
                <div className="absolute top-0 right-0 bg-[#3b82f6] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl">
                  AI Recommended
                </div>
              )}

              <div className="p-3.5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${style.icon}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold text-[#525252] uppercase tracking-wider">
                        Option {letter}
                      </span>
                      <span className={`text-[9px] font-semibold uppercase tracking-wider ${style.label}`}>
                        {opt.title}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-[#e5e5e5] mt-0.5 leading-tight">{opt.subtitle}</div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-2 py-1.5">
                    <div className="text-[9px] text-[#525252] uppercase tracking-wider mb-0.5">Cost Delta</div>
                    <div className={`text-xs font-mono font-semibold tabular-nums ${opt.costDelta < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(opt.costDelta)}
                    </div>
                  </div>
                  <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-2 py-1.5">
                    <div className="text-[9px] text-[#525252] uppercase tracking-wider mb-0.5">Time Impact</div>
                    <div className={`text-xs font-mono font-semibold tabular-nums ${opt.delayHours < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {formatHours(opt.delayHours)}
                    </div>
                  </div>
                  <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-2 py-1.5">
                    <div className="text-[9px] text-[#525252] uppercase tracking-wider mb-0.5">Risk Score</div>
                    <div className={`text-xs font-mono font-semibold tabular-nums ${opt.riskScore > 50 ? 'text-red-400' : opt.riskScore > 25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {opt.riskScore}/100
                    </div>
                  </div>
                  <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-2 py-1.5">
                    <div className="text-[9px] text-[#525252] uppercase tracking-wider mb-0.5">Buffer Impact</div>
                    <div className={`text-xs font-mono font-semibold tabular-nums flex items-center gap-1 ${opt.bufferImpact < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {opt.bufferImpact < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {opt.bufferImpact >= 0 ? '+' : ''}{opt.bufferImpact.toFixed(1)}d
                    </div>
                  </div>
                </div>

                {/* Fuel / note */}
                <div className="flex items-center justify-between text-[10px] text-[#737373] mb-3 pb-3 border-b border-[#2a2a2a]">
                  <span>Fuel: <span className="text-[#a3a3a3] font-mono">{opt.fuelImpact}</span></span>
                </div>

                <p className="text-[11px] text-[#a3a3a3] leading-relaxed mb-3 min-h-[32px]">
                  {opt.recommendation}
                </p>

                {/* Action */}
                <button
                  onClick={() => selectOption(isSelected ? null : opt.id)}
                  className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded transition-colors ${
                    isSelected
                      ? style.btn
                      : 'bg-[#262626] text-[#a3a3a3] hover:bg-[#333] hover:text-[#e5e5e5] border border-[#2a2a2a]'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3 h-3" />
                      Selected
                    </>
                  ) : (
                    'Apply Scenario'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
