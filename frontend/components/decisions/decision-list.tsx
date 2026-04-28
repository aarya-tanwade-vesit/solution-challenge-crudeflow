'use client';

import React from 'react';
import type { DecisionRecord } from '@/contexts/decisions-context';
import { AlertOctagon, Clock, CheckCircle2, XCircle, Bot, Inbox, Ship, Beaker } from 'lucide-react';
import { RelativeTime } from '@/components/shared/relative-time';

interface Props {
  decisions: DecisionRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const PRIORITY_COLORS = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-[#3b82f6]',
  low: 'bg-[#737373]',
};

const STATUS_META: Record<string, { label: string; Icon: React.ElementType; color: string }> = {
  pending:        { label: 'Pending',        Icon: Clock,        color: 'text-amber-400' },
  approved:       { label: 'Approved',       Icon: CheckCircle2, color: 'text-emerald-400' },
  'auto-approved':{ label: 'Auto',           Icon: Bot,          color: 'text-[#3b82f6]' },
  rejected:       { label: 'Rejected',       Icon: XCircle,      color: 'text-red-400' },
  expired:        { label: 'Expired',        Icon: Clock,        color: 'text-[#737373]' },
};

function fmtCost(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? '−' : '+';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function DecisionList({ decisions, selectedId, onSelect }: Props) {
  if (decisions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <Inbox className="mx-auto h-8 w-8 text-[#404040]" />
          <p className="mt-2 text-sm text-[#737373]">No decisions match the current filter</p>
        </div>
      </div>
    );
  }

  return (
    <ul>
      {decisions.map((d) => {
        const isSelected = d.id === selectedId;
        const meta = STATUS_META[d.status];
        const Icon = meta.Icon;
        return (
          <li key={d.id}>
            <button
              onClick={() => onSelect(d.id)}
              className={`w-full border-b border-[#1a1a1a] px-4 py-3 text-left transition-colors ${
                isSelected ? 'bg-[#3b82f6]/5 border-l-2 border-l-[#3b82f6]' : 'hover:bg-[#141414] border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`mt-1.5 h-2 w-2 flex-none rounded-full ${PRIORITY_COLORS[d.priority]}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="min-w-0 truncate text-[13px] font-semibold text-[#e5e5e5]">
                      {d.title}
                    </h3>
                    <span className={`flex flex-none items-center gap-1 text-[10px] ${meta.color}`}>
                      <Icon className="h-2.5 w-2.5" />
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-[#737373]">{d.cause}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-[#a3a3a3]">
                      <div className="h-1 w-10 overflow-hidden rounded-full bg-[#2a2a2a]">
                        <div className="h-full bg-[#3b82f6]" style={{ width: `${d.confidence}%` }} />
                      </div>
                      {d.confidence}%
                    </span>
                    <span className={d.costImpact < 0 ? 'text-emerald-400' : 'text-amber-400'}>
                      {fmtCost(d.costImpact)}
                    </span>
                    {d.vesselName && (
                      <span className="flex items-center gap-1 text-[#737373]">
                        <Ship className="h-2.5 w-2.5" />
                        {d.vesselName}
                      </span>
                    )}
                    {d.source === 'simulation' && (
                      <span className="flex items-center gap-1 rounded bg-[#3b82f6]/15 px-1 text-[#3b82f6]">
                        <Beaker className="h-2.5 w-2.5" />
                        SIM
                      </span>
                    )}
                    <RelativeTime ts={d.createdAt} className="ml-auto text-[#525252]" />
                  </div>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
