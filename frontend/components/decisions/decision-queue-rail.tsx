'use client';

import React from 'react';
import type { DecisionRecord } from '@/contexts/decisions-context';
import { Clock, CheckCircle2, XCircle, Bot, Ship, Beaker, Inbox } from 'lucide-react';
import { RelativeTime } from '@/components/shared/relative-time';

interface Props {
  decisions: DecisionRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const PRIORITY_DOT = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-[#3b82f6]',
  low: 'bg-[#737373]',
};

const STATUS_ICON: Record<string, { Icon: React.ElementType; color: string }> = {
  pending:         { Icon: Clock,        color: 'text-amber-400' },
  approved:        { Icon: CheckCircle2, color: 'text-emerald-400' },
  'auto-approved': { Icon: Bot,          color: 'text-[#3b82f6]' },
  rejected:        { Icon: XCircle,      color: 'text-red-400' },
  expired:         { Icon: Clock,        color: 'text-[#737373]' },
};

function fmtCost(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? '−' : '+';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function DecisionQueueRail({ decisions, selectedId, onSelect }: Props) {
  if (decisions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <Inbox className="mx-auto h-6 w-6 text-[#404040]" />
          <p className="mt-2 text-[11px] text-[#525252]">Queue empty</p>
        </div>
      </div>
    );
  }

  return (
    <ul>
      {decisions.map((d) => {
        const isSelected = d.id === selectedId;
        const meta = STATUS_ICON[d.status];
        const Icon = meta.Icon;
        return (
          <li key={d.id}>
            <button
              onClick={() => onSelect(d.id)}
              className={`w-full border-b border-[#1a1a1a] px-3 py-2.5 text-left transition-colors ${
                isSelected
                  ? 'bg-[#3b82f6]/5 border-l-2 border-l-[#3b82f6]'
                  : 'hover:bg-[#141414] border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${PRIORITY_DOT[d.priority]}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="min-w-0 truncate text-[12px] font-medium text-[#e5e5e5]">
                      {d.title}
                    </h4>
                    <Icon className={`h-3 w-3 flex-none ${meta.color}`} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-mono">
                    <span className={d.costImpact < 0 ? 'text-emerald-400' : 'text-amber-400'}>
                      {fmtCost(d.costImpact)}
                    </span>
                    <span className="flex items-center gap-0.5 text-[#737373]">
                      <span className="inline-block h-1 w-8 overflow-hidden rounded-full bg-[#262626]">
                        <span className="block h-full bg-[#3b82f6]" style={{ width: `${d.confidence}%` }} />
                      </span>
                      {d.confidence}
                    </span>
                    <RelativeTime ts={d.createdAt} compact className="ml-auto text-[#525252]" />
                  </div>
                  {d.vesselName && (
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[#737373]">
                      <Ship className="h-2.5 w-2.5" />
                      <span className="truncate font-mono">{d.vesselName}</span>
                      {d.source === 'simulation' && (
                        <Beaker className="ml-auto h-2.5 w-2.5 text-[#3b82f6]" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
