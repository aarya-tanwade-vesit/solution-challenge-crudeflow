'use client';

import React from 'react';
import { Ship, MapPin, Anchor } from 'lucide-react';
import { useSimulation } from '@/contexts/simulation-context';

interface VesselState {
  id: string;
  name: string;
  type: 'VLCC' | 'Suezmax' | 'Aframax';
  origin: string;
  destination: string;
  cargo: string;
  baseProgress: number; // 0 - 1 baseline
  baseEtaDays: number;
  demurrageRate: number; // per hour
}

const VESSELS: VesselState[] = [
  { id: 'v1', name: 'MT Rajput', type: 'VLCC', origin: 'Ras Tanura', destination: 'Kochi SPM', cargo: 'Arabian Heavy', baseProgress: 0.72, baseEtaDays: 3.2, demurrageRate: 18000 },
  { id: 'v2', name: 'MT Yamuna', type: 'Suezmax', origin: 'Basrah', destination: 'Mumbai BPCL', cargo: 'Basrah Light', baseProgress: 0.48, baseEtaDays: 5.8, demurrageRate: 12500 },
  { id: 'v3', name: 'MT Ganges', type: 'VLCC', origin: 'Fujairah', destination: 'Paradip IOCL', cargo: 'Murban', baseProgress: 0.35, baseEtaDays: 7.4, demurrageRate: 16000 },
  { id: 'v4', name: 'MT Saraswati', type: 'Aframax', origin: 'Jebel Ali', destination: 'Vadinar', cargo: 'Murban', baseProgress: 0.89, baseEtaDays: 1.4, demurrageRate: 9500 },
  { id: 'v5', name: 'MT Narmada', type: 'Suezmax', origin: 'Ras Tanura', destination: 'Kochi SPM', cargo: 'Arabian Light', baseProgress: 0.22, baseEtaDays: 9.1, demurrageRate: 13000 },
];

function formatCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export function ScenarioVisualization() {
  const { sliders, currentDay, activeScenario } = useSimulation();

  // Advance vessel progress over days with slider effects
  const getVesselState = (v: VesselState) => {
    const speedFactor = sliders.vesselSpeed / 12;
    const congestionSlowdown = 1 - (sliders.portCongestion - 25) / 200;
    const effectiveSpeed = speedFactor * congestionSlowdown;

    const progressGain = (currentDay - 1) / v.baseEtaDays * 0.28 * effectiveSpeed;
    const progress = Math.min(1, v.baseProgress + progressGain);

    // Calculate hours delayed
    const expectedProgress = Math.min(1, v.baseProgress + (currentDay - 1) / v.baseEtaDays * 0.28);
    const delayHours = Math.round((expectedProgress - progress) * v.baseEtaDays * 24);

    // Status
    let status: 'transit' | 'critical' | 'waiting' | 'berthed' = 'transit';
    if (progress >= 1) {
      status = sliders.jettyAvailable ? 'berthed' : 'waiting';
    } else if (delayHours > 12 || sliders.riskLevel > 70) {
      status = 'critical';
    }

    const demurrageAccum = status === 'waiting' || status === 'critical'
      ? v.demurrageRate * Math.max(delayHours, currentDay * 2)
      : 0;

    return { progress, delayHours, status, demurrageAccum };
  };

  const statusStyles = {
    transit: { color: 'text-[#3b82f6]', bg: 'bg-[#3b82f6]/10', border: 'border-[#3b82f6]/30', label: 'In Transit' },
    critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'At Risk' },
    waiting: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Waiting' },
    berthed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Berthed' },
  };

  return (
    <section className="bg-[#141414] border border-[#2a2a2a] rounded-lg overflow-hidden flex flex-col">
      <div className="px-4 py-2.5 border-b border-[#2a2a2a] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Ship className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Fleet State Simulation</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#525252]">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full" /> Transit</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Waiting</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> At Risk</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Berthed</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#2a2a2a]">
        {VESSELS.map((v) => {
          const state = getVesselState(v);
          const style = statusStyles[state.status];
          return (
            <div key={v.id} className="px-4 py-3 hover:bg-[#1a1a1a] transition-colors">
              <div className="flex items-center gap-4">
                {/* Identity */}
                <div className="w-36 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-[#e5e5e5]">{v.name}</span>
                    <span className="text-[9px] font-mono text-[#525252] px-1 py-0.5 bg-[#262626] rounded">
                      {v.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#737373] truncate">{v.cargo}</div>
                </div>

                {/* Route progress bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] text-[#525252] mb-1.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {v.origin}
                    </span>
                    <span className="flex items-center gap-1">
                      <Anchor className="w-2.5 h-2.5" />
                      {v.destination}
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                        state.status === 'critical'
                          ? 'bg-gradient-to-r from-red-500 to-red-400'
                          : state.status === 'waiting'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : state.status === 'berthed'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]'
                      }`}
                      style={{ width: `${state.progress * 100}%` }}
                    />
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 -translate-x-1/2 rounded-full border-2 border-[#141414] ${
                        state.status === 'critical' ? 'bg-red-500' : state.status === 'waiting' ? 'bg-amber-500' : state.status === 'berthed' ? 'bg-emerald-500' : 'bg-[#3b82f6]'
                      }`}
                      style={{ left: `${state.progress * 100}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-[9px] text-[#525252] uppercase tracking-wider">Progress</div>
                    <div className="text-xs font-mono font-semibold text-[#e5e5e5] tabular-nums">
                      {Math.round(state.progress * 100)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-[#525252] uppercase tracking-wider">Delay</div>
                    <div className={`text-xs font-mono font-semibold tabular-nums ${state.delayHours > 6 ? 'text-red-400' : state.delayHours > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {state.delayHours > 0 ? `+${state.delayHours}h` : 'On Time'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-[#525252] uppercase tracking-wider">Demurrage</div>
                    <div className={`text-xs font-mono font-semibold tabular-nums ${state.demurrageAccum > 0 ? 'text-red-400' : 'text-[#525252]'}`}>
                      {state.demurrageAccum > 0 ? formatCurrency(state.demurrageAccum) : '—'}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded border ${style.bg} ${style.border} w-20 text-center`}>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.color}`}>
                      {style.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
