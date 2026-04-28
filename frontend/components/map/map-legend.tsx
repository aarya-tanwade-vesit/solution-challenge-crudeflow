'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function MapLegend() {
  const [open, setOpen] = useState(true);

  return (
    <div className="w-[220px] rounded-lg border border-[#2a2a2a] bg-[#0f0f0f]/95 backdrop-blur shadow-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full h-8 flex items-center justify-between px-3 hover:bg-[#1a1a1a]"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
          Legend
        </span>
        {open ? (
          <ChevronDown className="h-3 w-3 text-[#525252]" />
        ) : (
          <ChevronUp className="h-3 w-3 text-[#525252]" />
        )}
      </button>

      {open && (
        <div className="p-3 space-y-2.5 border-t border-[#2a2a2a]">
          <LegendRow color="#10b981" label="Normal vessel" />
          <LegendRow color="#f59e0b" label="Delayed" />
          <LegendRow color="#ef4444" label="High-risk transit" />
          <div className="border-t border-[#1f1f1f] my-2" />
          <LegendLine color="#10b981" label="Current route (solid)" />
          <LegendLine color="#06b6d4" label="AI-optimal route (dotted)" dotted />
          <div className="border-t border-[#1f1f1f] my-2" />
          <LegendSquare color="#ef4444" label="Risk zone" />
          <LegendSquare color="#3b82f6" label="Historic Match" match />
          <LegendSquare color="#3b82f6" label="BPCL hub port" ring />
        </div>
      )}
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-4 h-4">
        <div
          className="absolute inset-0 rounded-full opacity-40"
          style={{ background: color }}
        />
        <div
          className="absolute inset-[3px] rounded-full border"
          style={{ background: '#0a0a0a', borderColor: color }}
        />
      </div>
      <span className="text-[11px] text-[#a3a3a3]">{label}</span>
    </div>
  );
}

function LegendLine({
  color,
  label,
  dashed,
  dotted,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  dotted?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 flex items-center justify-center">
        <div
          className="w-4 h-[2px]"
          style={{
            background: dashed
              ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)`
              : dotted
                ? `repeating-linear-gradient(90deg, ${color} 0 2px, transparent 2px 5px)`
                : color,
          }}
        />
      </div>
      <span className="text-[11px] text-[#a3a3a3]">{label}</span>
    </div>
  );
}

function LegendSquare({ color, label, ring, match }: { color: string; label: string; ring?: boolean; match?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-sm flex items-center justify-center ${ring ? 'border' : ''}`}
        style={{
          background: match ? '#0a0a0a' : (ring ? 'transparent' : `${color}30`),
          borderColor: color,
          border: match || ring ? `1.5px solid ${color}` : 'none',
          boxShadow: ring ? `inset 0 0 0 1px ${color}` : 'none',
        }}
      >
        {match && (
          <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round">
            <line x1="12" y1="6" x2="12" y2="14" />
            <line x1="12" y1="18" x2="12" y2="18.01" />
          </svg>
        )}
      </div>
      <span className="text-[11px] text-[#a3a3a3]">{label}</span>
    </div>
  );
}
