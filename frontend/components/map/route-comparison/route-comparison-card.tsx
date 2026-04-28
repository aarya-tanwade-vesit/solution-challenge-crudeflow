'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  ArrowRight,
  Route as RouteIcon,
  Clock,
  Flame,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import type { Vessel } from '../map-data';
import {
  compareRoutes,
  formatHours,
  formatNm,
  formatTonnes,
} from './compare-routes';

interface Props {
  vessel: Vessel;
  onClose: () => void;
}

function Delta({
  icon: Icon,
  label,
  value,
  positive,
  tone,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  positive: boolean;
  tone: 'time' | 'fuel' | 'risk' | 'distance';
}) {
  const toneClass =
    tone === 'time'
      ? positive
        ? 'text-[#10b981]'
        : 'text-[#ef4444]'
      : tone === 'fuel'
        ? positive
          ? 'text-[#f59e0b]'
          : 'text-[#737373]'
        : tone === 'risk'
          ? positive
            ? 'text-[#10b981]'
            : 'text-[#737373]'
          : positive
            ? 'text-[#3b82f6]'
            : 'text-[#737373]';

  return (
    <div className="rounded-md border border-[#1f1f1f] bg-[#0a0a0a] p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`h-3 w-3 ${toneClass}`} />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-[#737373]">
          {label}
        </span>
      </div>
      <div className={`text-sm font-bold tabular-nums ${toneClass}`}>{value}</div>
    </div>
  );
}

export function RouteComparisonCard({ vessel, onClose }: Props) {
  const cmp = compareRoutes(vessel);

  const distSign = cmp.distanceSavedNm >= 0 ? '−' : '+';
  const timeSign = cmp.timeSavedHours >= 0 ? '−' : '+';

  return (
    <div className="pointer-events-auto w-[320px] rounded-lg border border-[#06b6d4]/30 bg-[#0f0f0f]/95 backdrop-blur-md shadow-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#06b6d4]/20 bg-[#06b6d4]/5">
        <Sparkles className="h-3.5 w-3.5 text-[#06b6d4]" />
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-[#06b6d4]">
            Route comparison
          </div>
          <div className="text-[12px] font-bold text-[#e5e5e5] truncate">
            {vessel.name}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#737373] hover:text-[#e5e5e5] hover:bg-[#1a1a1a]"
          title="Close comparison"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        className={`px-3 py-2 flex items-center justify-between text-[10px] uppercase tracking-wider border-b ${
          cmp.isBetter
            ? 'border-[#10b981]/25 bg-[#10b981]/5 text-[#10b981]'
            : 'border-[#525252]/30 bg-[#1a1a1a] text-[#a3a3a3]'
        }`}
      >
        <span className="font-semibold">
          {cmp.isBetter ? 'AI route recommended' : 'Marginal improvement'}
        </span>
        <span className="font-mono text-[#737373]">
          {formatNm(cmp.currentNm)} &rarr; {formatNm(cmp.recommendedNm)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 p-2.5">
        <Delta
          icon={Clock}
          label="Time"
          value={`${timeSign}${formatHours(cmp.timeSavedHours)}`}
          positive={cmp.timeSavedHours > 0}
          tone="time"
        />
        <Delta
          icon={RouteIcon}
          label="Distance"
          value={`${distSign}${formatNm(cmp.distanceSavedNm)}`}
          positive={cmp.distanceSavedNm > 0}
          tone="distance"
        />
        <Delta
          icon={Flame}
          label="Fuel saved"
          value={formatTonnes(cmp.fuelSavedTonnes)}
          positive={cmp.fuelSavedTonnes > 0}
          tone="fuel"
        />
        <Delta
          icon={ShieldCheck}
          label="Risk drop"
          value={`-${cmp.riskReduction} pts`}
          positive={cmp.riskReduction > 0}
          tone="risk"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 p-2.5 pt-0">
        <button
          onClick={onClose}
          className="h-7 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#262626] text-[10px] font-semibold uppercase tracking-wider"
        >
          Dismiss
        </button>
        <Link
          href={`/decisions?vessel=${vessel.id}`}
          className="h-7 rounded-md border border-[#06b6d4]/40 bg-[#06b6d4]/15 text-[#06b6d4] hover:bg-[#06b6d4]/25 text-[10px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1"
        >
          Apply route
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
