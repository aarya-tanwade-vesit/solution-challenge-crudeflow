'use client';

import React, { useEffect, useState } from 'react';
import { Radio, FlaskConical } from 'lucide-react';

interface Props {
  isSimulation: boolean;
  vesselCount: number;
}

export function LiveStatusPill({ isSimulation, vesselCount }: Props) {
  // Live updating "last sync" label
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const seconds = tick % 60;

  if (isSimulation) {
    return (
      <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/10 backdrop-blur shadow-lg">
        <FlaskConical className="h-3.5 w-3.5 text-[#3b82f6] animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3b82f6]">
          Simulation view
        </span>
        <span className="text-[10px] font-mono text-[#3b82f6]/70">
          · {vesselCount} vessels
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f]/90 backdrop-blur shadow-lg">
      <div className="relative">
        <Radio className="h-3.5 w-3.5 text-[#10b981]" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#10b981] rounded-full animate-ping" />
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#10b981]">
        Live
      </span>
      <span className="text-[10px] font-mono text-[#737373]">
        · {vesselCount} vessels · synced {seconds}s ago
      </span>
    </div>
  );
}
