'use client';

import React from 'react';
import { useDecisions } from '@/contexts';
import type { DecisionStatus, DecisionPriority } from '@/contexts/decisions-context';
import { Filter } from 'lucide-react';

const STATUSES: { id: DecisionStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'auto-approved', label: 'Auto-Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const PRIORITIES: { id: DecisionPriority | 'all'; label: string }[] = [
  { id: 'all', label: 'All Priorities' },
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

const SOURCES: { id: 'live' | 'simulation' | 'all'; label: string }[] = [
  { id: 'all', label: 'All Sources' },
  { id: 'live', label: 'Live Ops' },
  { id: 'simulation', label: 'Simulation' },
];

export function DecisionsFilterBar() {
  const { filter, setFilter } = useDecisions();

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5 text-[#737373]">
        <Filter className="h-3 w-3" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">Filter</span>
      </div>

      <div className="flex items-center gap-1 rounded-md border border-[#2a2a2a] bg-[#141414] p-0.5">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter({ status: s.id })}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              filter.status === s.id ? 'bg-[#3b82f6] text-white' : 'text-[#a3a3a3] hover:text-[#e5e5e5]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <select
        value={filter.priority}
        onChange={(e) => setFilter({ priority: e.target.value as DecisionPriority | 'all' })}
        className="rounded-md border border-[#2a2a2a] bg-[#141414] px-2 py-1 text-[11px] text-[#a3a3a3]"
      >
        {PRIORITIES.map((p) => (
          <option key={p.id} value={p.id} className="bg-[#141414]">
            {p.label}
          </option>
        ))}
      </select>

      <select
        value={filter.source}
        onChange={(e) => setFilter({ source: e.target.value as 'live' | 'simulation' | 'all' })}
        className="rounded-md border border-[#2a2a2a] bg-[#141414] px-2 py-1 text-[11px] text-[#a3a3a3]"
      >
        {SOURCES.map((s) => (
          <option key={s.id} value={s.id} className="bg-[#141414]">
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
