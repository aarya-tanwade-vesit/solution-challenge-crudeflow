'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FlaskConical, ArrowUpRight } from 'lucide-react';
import { DecisionEngine } from './decision-engine';
import { OperationsTable } from './operations-table';
import { ExecutionPanel } from './execution-panel';
import { useKPI, useSimulation } from '@/contexts';
import type { Vessel } from '@/types/vessel';

// Leaflet touches `window` on import, so map must be client-only.
const MaritimeMapEnterprise = dynamic(
  () =>
    import('./maritime-map-enterprise').then((m) => ({
      default: m.MaritimeMapEnterprise,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#2a2a2a] border-t-[#3b82f6] rounded-full animate-spin" />
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
            Loading map
          </div>
        </div>
      </div>
    ),
  }
);

export function MainContent() {
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const { isCascading } = useKPI();
  const { activeScenario, currentDay } = useSimulation();

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">
      {isCascading && (
        <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-3.5 w-3.5 text-[#3b82f6]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3b82f6]">
              System-wide simulation cascade active
            </span>
            <span className="text-[11px] font-mono text-[#737373]">
              {activeScenario.replace('-', ' ')} &middot; Day {Math.round(currentDay)}/30
            </span>
          </div>
          <Link
            href="/simulation"
            className="flex items-center gap-1 rounded border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-2 py-1 text-[10px] font-semibold text-[#3b82f6] hover:bg-[#3b82f6]/20"
          >
            Open Lab
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/*
        Primary view — wide map row on top (map flex-1 + decision engine
        aside 300px), operations table below at full width. This gives
        the map maximum horizontal real estate.
      */}
      <div className="flex flex-col gap-4 p-4 min-h-0 flex-1">
        {/* TOP ROW: Map + Decision Engine aside */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Maritime Map — full horizontal width of left column */}
          <div className={`flex-1 min-w-0 bg-[#1a1a1a] border rounded-lg overflow-hidden flex flex-col transition-colors ${
            isCascading ? 'border-[#3b82f6]/40' : 'border-[#2a2a2a]'
          }`}>
            <div className="flex-shrink-0 h-10 flex items-center justify-between px-4 border-b border-[#2a2a2a]">
              <h3 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                Maritime Intelligence
              </h3>
              <div className="flex items-center gap-2">
                {isCascading && (
                  <span className="text-[10px] font-semibold text-[#3b82f6] bg-[#3b82f6]/10 px-1.5 py-0.5 rounded">
                    SIM CASCADE
                  </span>
                )}
                <span className="text-[10px] text-[#525252] font-mono">3 Active Vessels</span>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isCascading ? 'bg-[#3b82f6]' : 'bg-emerald-500'}`} />
                <Link
                  href="/map"
                  className="ml-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6] hover:text-[#60a5fa] border border-[#3b82f6]/30 hover:border-[#3b82f6]/50 bg-[#3b82f6]/5 hover:bg-[#3b82f6]/10 rounded px-1.5 py-0.5"
                >
                  Full map
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <MaritimeMapEnterprise onVesselSelect={setSelectedVessel} />
            </div>
          </div>

          {/* Decision Engine — narrower (300px) so the map gets more width */}
          <aside className="w-[300px] flex-shrink-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden flex flex-col">
            <DecisionEngine selectedVessel={selectedVessel} />
          </aside>
        </div>

        {/* BOTTOM ROW: Operations table (left) + Execution Panel (right).
            Splitting the bottom strip lets the closed-loop story live
            inline — when a decision clears upstairs, the cascade plays
            out here in plain sight. */}
        <div className="flex-shrink-0 flex gap-4 h-[260px]">
          <div className="flex-1 min-w-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
            <OperationsTable onVesselSelect={setSelectedVessel} />
          </div>
          <aside className="w-[420px] flex-shrink-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
            <ExecutionPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
