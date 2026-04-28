'use client';

import React from 'react';
import { Brain, AlertTriangle, Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { useSimulation } from '@/contexts/simulation-context';

function formatCurrency(v: number): string {
  const abs = Math.abs(v);
  const sign = v >= 0 ? '+' : '-';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function DecisionEngineSim() {
  const {
    activeScenario,
    sliders,
    bufferDays,
    demurrageAccum,
    riskIndex,
    strategicOptions,
    selectedOption,
    selectOption,
    currentDay,
    bufferDeathDay,
  } = useSimulation();

  // Determine AI recommendation
  const recommended = React.useMemo(() => {
    return strategicOptions.reduce((best, o) => {
      const score = Math.abs(o.costDelta) / 100000 + o.riskScore + Math.abs(o.delayHours) / 24;
      const bestScore = Math.abs(best.costDelta) / 100000 + best.riskScore + Math.abs(best.delayHours) / 24;
      return score < bestScore ? o : best;
    }, strategicOptions[0]);
  }, [strategicOptions]);

  const isCrisis = bufferDays < 2.5 || riskIndex > 65 || !sliders.jettyAvailable;
  const confidence = isCrisis ? 94 : 78;

  const scenarioLabel = {
    baseline: 'Normal Operations',
    'hormuz-blockade': 'Strait of Hormuz Blockade',
    'arabian-cyclone': 'Arabian Sea Cyclone',
    'refinery-shutdown': 'Refinery Unit Shutdown',
    'cyber-attack': 'Port Cyber Incident',
    'jetty-strike': 'Kochi Jetty Strike',
  }[activeScenario];

  return (
    <aside className="w-[360px] flex-shrink-0 bg-[#141414] border-l border-[#2a2a2a] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center gap-2 flex-shrink-0">
        <div className="w-6 h-6 rounded bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-[#3b82f6]" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-[#e5e5e5] uppercase tracking-wider">Decision Engine</div>
          <div className="text-[10px] text-[#525252]">NEMO AI &middot; Scenario Mode</div>
        </div>
        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded text-[9px] font-mono font-semibold text-[#3b82f6]">
          <span className="w-1 h-1 bg-[#3b82f6] rounded-full animate-pulse" />
          {confidence}% CONF
        </span>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Crisis Alert */}
        {isCrisis && (
          <div className="m-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">
                Crisis Detected in Simulation
              </span>
            </div>
            <p className="text-[11px] text-[#e5e5e5] leading-relaxed">
              {bufferDays < 2.5 && `Buffer critical at ${bufferDays.toFixed(1)}d. `}
              {!sliders.jettyAvailable && 'Jetty 4 offline creating berth congestion. '}
              {riskIndex > 65 && 'Elevated geopolitical risk on primary route. '}
              Rerouting via Cape of Good Hope is now the optimal path.
            </p>
          </div>
        )}

        {/* Primary Recommendation */}
        <div className="m-3 p-3 bg-[#3b82f6]/5 border border-[#3b82f6]/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-[#3b82f6] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Recommended Action
            </span>
          </div>
          <div className="text-sm font-bold text-[#e5e5e5] mb-1">{recommended.subtitle}</div>
          <div className="text-[11px] text-[#a3a3a3] leading-relaxed">
            {recommended.recommendation}
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-3">
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-2 py-1.5 text-center">
              <div className="text-[8px] text-[#525252] uppercase tracking-wider">Cost</div>
              <div className={`text-[11px] font-mono font-semibold ${recommended.costDelta < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {formatCurrency(recommended.costDelta)}
              </div>
            </div>
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-2 py-1.5 text-center">
              <div className="text-[8px] text-[#525252] uppercase tracking-wider">Time</div>
              <div className={`text-[11px] font-mono font-semibold ${recommended.delayHours < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {recommended.delayHours > 0 ? '+' : ''}{recommended.delayHours}h
              </div>
            </div>
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-2 py-1.5 text-center">
              <div className="text-[8px] text-[#525252] uppercase tracking-wider">Risk</div>
              <div className={`text-[11px] font-mono font-semibold ${recommended.riskScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                {recommended.riskScore}
              </div>
            </div>
          </div>
        </div>

        {/* Scenario context */}
        <div className="mx-3 mb-3 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
          <div className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-2">
            Active Scenario
          </div>
          <div className="text-sm font-semibold text-[#e5e5e5] mb-1">{scenarioLabel}</div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <div className="text-[9px] text-[#525252] uppercase tracking-wider">Simulated Day</div>
              <div className="text-sm font-mono font-semibold text-[#e5e5e5] tabular-nums">{currentDay}/30</div>
            </div>
            <div>
              <div className="text-[9px] text-[#525252] uppercase tracking-wider">Buffer Death</div>
              <div className={`text-sm font-mono font-semibold tabular-nums ${bufferDeathDay ? 'text-red-400' : 'text-emerald-400'}`}>
                {bufferDeathDay ? `Day ${bufferDeathDay}` : 'Safe'}
              </div>
            </div>
          </div>
        </div>

        {/* Cascading impacts */}
        <div className="mx-3 mb-3">
          <div className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-2 px-1">
            Cascading Impacts
          </div>
          <ul className="space-y-1.5">
            {[
              { label: 'Kochi berth queue', value: '5 tankers waiting', critical: sliders.portCongestion > 60 },
              { label: 'MT Rajput demurrage', value: formatCurrency(demurrageAccum * 0.4), critical: demurrageAccum > 500_000 },
              { label: 'Refinery crude mix', value: sliders.crudeType.replace('-', ' '), critical: false },
              { label: 'Tank ullage at BPCL', value: `${sliders.inventoryCapacity}% free`, critical: sliders.inventoryCapacity < 20 },
            ].map((item, i) => (
              <li
                key={i}
                className={`flex items-center justify-between px-2.5 py-2 rounded border ${
                  item.critical ? 'bg-red-500/5 border-red-500/20' : 'bg-[#1a1a1a] border-[#2a2a2a]'
                }`}
              >
                <span className="text-[11px] text-[#a3a3a3]">{item.label}</span>
                <span className={`text-[11px] font-mono font-semibold capitalize ${item.critical ? 'text-red-400' : 'text-[#e5e5e5]'}`}>
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Alternative summary */}
        <div className="mx-3 mb-3">
          <div className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-2 px-1">
            Alternative Paths
          </div>
          <div className="space-y-1.5">
            {strategicOptions
              .filter((o) => o.id !== recommended.id)
              .map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => selectOption(selectedOption === opt.id ? null : opt.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded border text-left transition-colors ${
                    selectedOption === opt.id
                      ? 'bg-[#3b82f6]/5 border-[#3b82f6]/30'
                      : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[#e5e5e5] truncate">{opt.title}</div>
                    <div className="text-[10px] text-[#525252] truncate">{opt.subtitle}</div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#525252] flex-shrink-0 ml-2" />
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="p-3 border-t border-[#2a2a2a] flex gap-2 flex-shrink-0">
        <button
          disabled={!selectedOption}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#3b82f6] text-white text-xs font-semibold rounded hover:bg-[#2563eb] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-3.5 h-3.5" />
          Commit Decision
        </button>
        <button
          disabled={!selectedOption}
          onClick={() => selectOption(null)}
          className="px-3 py-2.5 bg-[#262626] text-[#a3a3a3] text-xs font-semibold rounded hover:bg-[#333] hover:text-[#e5e5e5] transition-colors border border-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
