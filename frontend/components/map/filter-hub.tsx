'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { VesselStatus } from './map-data';

export interface MapFilters {
  query: string;
  bpclOnly: boolean;
  statuses: VesselStatus[];
  types: string[]; // VLCC, Suezmax, etc
  destinationPort: string | null;
}

interface Props {
  filters: MapFilters;
  onChange: (f: MapFilters) => void;
  vesselCount: number;
  totalVessels: number;
  ports: Array<{ id: string; name: string }>;
}

const ALL_STATUSES: Array<{ id: VesselStatus; label: string; color: string }> = [
  { id: 'onTrack', label: 'On Track', color: '#10b981' },
  { id: 'delayed', label: 'Delayed', color: '#f59e0b' },
  { id: 'highRisk', label: 'High Risk', color: '#ef4444' },
  { id: 'critical', label: 'Critical', color: '#ef4444' },
];

const ALL_TYPES = ['VLCC', 'Suezmax', 'Aframax', 'Panamax'];

export function FilterHub({ filters, onChange, vesselCount, totalVessels, ports }: Props) {
  const [expanded, setExpanded] = useState(false);

  const toggleStatus = (s: VesselStatus) => {
    const next = filters.statuses.includes(s)
      ? filters.statuses.filter((x) => x !== s)
      : [...filters.statuses, s];
    onChange({ ...filters, statuses: next });
  };

  const toggleType = (t: string) => {
    const next = filters.types.includes(t)
      ? filters.types.filter((x) => x !== t)
      : [...filters.types, t];
    onChange({ ...filters, types: next });
  };

  const reset = () => onChange({ query: '', bpclOnly: false, statuses: [], types: [], destinationPort: null });
  const anyActive =
    filters.query || filters.bpclOnly || filters.statuses.length || filters.types.length || filters.destinationPort;

  return (
    <div className="w-[280px] rounded-lg border border-[#2a2a2a] bg-[#0f0f0f]/95 backdrop-blur shadow-xl overflow-hidden">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#3b82f6]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
            Filter Hub
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#737373]">
          {vesselCount}/{totalVessels}
        </span>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[#2a2a2a]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#525252]" />
          <input
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Vessel, IMO, MMSI, port..."
            className="w-full h-8 pl-7 pr-7 text-[12px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-[#e5e5e5] placeholder-[#525252] focus:outline-none focus:border-[#3b82f6]/50"
          />
          {filters.query && (
            <button
              onClick={() => onChange({ ...filters, query: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#525252] hover:text-[#e5e5e5]"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Quick toggle */}
        <button
          onClick={() => onChange({ ...filters, bpclOnly: !filters.bpclOnly })}
          className={`mt-2 w-full h-8 px-3 rounded-md text-[11px] font-semibold uppercase tracking-wider border transition-colors ${
            filters.bpclOnly
              ? 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/40'
              : 'bg-[#1a1a1a] text-[#a3a3a3] border-[#2a2a2a] hover:bg-[#262626]'
          }`}
        >
          {filters.bpclOnly ? 'My shipments only' : 'All vessels'}
        </button>
      </div>

      {/* Status chips */}
      <div className="p-3 border-b border-[#2a2a2a]">
        <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-2">
          Status
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATUSES.map((s) => {
            const on = filters.statuses.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleStatus(s.id)}
                className={`flex items-center gap-1.5 px-2 h-7 rounded-md text-[11px] border transition-colors ${
                  on
                    ? 'bg-[#1a1a1a] border-[#3b82f6]/40 text-[#e5e5e5]'
                    : 'bg-transparent border-[#2a2a2a] text-[#737373] hover:text-[#a3a3a3]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable advanced */}
      <div className="p-3">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[11px] font-semibold uppercase tracking-wider text-[#525252] hover:text-[#a3a3a3]"
        >
          {expanded ? '− Hide advanced' : '+ Advanced filters'}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3">
            {/* Types */}
            <div>
              <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-2">
                Vessel type
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TYPES.map((t) => {
                  const on = filters.types.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className={`px-2 h-6 rounded text-[10px] border ${
                        on
                          ? 'bg-[#3b82f6]/15 border-[#3b82f6]/40 text-[#3b82f6]'
                          : 'bg-transparent border-[#2a2a2a] text-[#737373] hover:text-[#a3a3a3]'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Destination port */}
            <div>
              <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-2">
                Destination
              </p>
              <select
                value={filters.destinationPort || ''}
                onChange={(e) => onChange({ ...filters, destinationPort: e.target.value || null })}
                className="w-full h-8 px-2 text-[12px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-[#e5e5e5] focus:outline-none focus:border-[#3b82f6]/50"
              >
                <option value="">Any port</option>
                {ports.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {anyActive && (
          <button
            onClick={reset}
            className="mt-3 w-full h-7 text-[10px] font-semibold uppercase tracking-wider text-[#737373] hover:text-[#e5e5e5] border border-[#2a2a2a] hover:border-[#404040] rounded-md"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
