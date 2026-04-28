'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Gauge,
  Navigation,
  AlertTriangle,
  Clock,
  Brain,
  Zap,
  Play,
  CircleStop,
  Ship,
  TrendingUp,
  BarChart3,
  GitCompareArrows,
} from 'lucide-react';
import type { Vessel } from './map-data';
import { formatHours } from './route-comparison/compare-routes';

interface Props {
  vessel: Vessel | null;
  /** Whether this vessel is currently being tracked. */
  isTracking?: boolean;
  /** Whether this vessel is in route-comparison mode. */
  isComparing?: boolean;
  /**
   * Hours of ETA delta vs schedule. Positive = late, negative = ahead of
   * schedule. Drives the dynamic suffix on the Impact CTA so users see
   * the magnitude of the delay before clicking through.
   */
  impactDeltaHours?: number | null;
  onClose: () => void;
  onFocus: (coords: [number, number]) => void;
  /** Activate tracking mode for the current vessel. */
  onTrack?: () => void;
  /** Stop tracking. */
  onUntrack?: () => void;
  /** Activate route-comparison mode for the current vessel. */
  onCompareRoutes?: () => void;
  /** Exit route comparison. */
  onStopComparing?: () => void;
}

const STATUS_META: Record<
  Vessel['status'],
  { label: string; color: string; bg: string; border: string }
> = {
  normal: { label: 'On schedule', color: '#10b981', bg: '#10b98115', border: '#10b98140' },
  onTrack: { label: 'On track', color: '#10b981', bg: '#10b98115', border: '#10b98140' },
  delayed: { label: 'Delayed', color: '#f59e0b', bg: '#f59e0b15', border: '#f59e0b40' },
  'high-risk': { label: 'High risk', color: '#ef4444', bg: '#ef444415', border: '#ef444440' },
  highRisk: { label: 'High risk', color: '#ef4444', bg: '#ef444415', border: '#ef444440' },
  critical: { label: 'Critical', color: '#ef4444', bg: '#ef444415', border: '#ef444440' },
};

function DataRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#1f1f1f] last:border-0">
      <span className="text-[11px] text-[#737373] uppercase tracking-wider">{label}</span>
      <span className={`text-[12px] text-[#e5e5e5] ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

export function VesselDetailDrawer({
  vessel,
  isTracking = false,
  isComparing = false,
  impactDeltaHours = null,
  onClose,
  onFocus,
  onTrack,
  onUntrack,
  onCompareRoutes,
  onStopComparing,
}: Props) {
  if (!vessel) return null;

  const meta = STATUS_META[vessel.status];

  // Build the dynamic Impact CTA suffix: "+12h" / "−2.4h" / null.
  const impactSuffix =
    impactDeltaHours !== null && Math.abs(impactDeltaHours) >= 0.5
      ? `${impactDeltaHours > 0 ? '+' : '−'}${formatHours(impactDeltaHours)}`
      : null;

  return (
    <div className="absolute top-0 right-0 h-full w-[380px] bg-[#0f0f0f]/95 backdrop-blur border-l border-[#2a2a2a] shadow-2xl z-[1000] flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-[#2a2a2a]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Ship className="h-4 w-4 text-[#3b82f6]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
              Vessel Intelligence
            </span>
          </div>
          <h2 className="text-base font-bold text-[#e5e5e5] truncate">{vessel.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-mono text-[#737373]">
              IMO {vessel.imo}
            </span>
            <span className="text-[10px] text-[#525252]">·</span>
            <span className="text-[11px] font-mono text-[#737373]">
              MMSI {vessel.mmsi}
            </span>
            {vessel.isBpcl && (
              <span className="text-[9px] font-semibold text-[#3b82f6] bg-[#3b82f6]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                BPCL Fleet
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-[#1a1a1a] text-[#737373] hover:text-[#e5e5e5]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Status banner */}
      <div
        className="px-4 py-2.5 flex items-center justify-between border-b border-[#2a2a2a]"
        style={{ background: meta.bg }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: meta.color }} />
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
            {meta.label}
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#737373]">
          Last updated {vessel.lastUpdateMin}m ago
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Risk row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-3 w-3 text-[#ef4444]" />
              <span className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider">
                Risk score
              </span>
            </div>
            <div className="text-xl font-bold text-[#e5e5e5] leading-none">
              {vessel.riskScore}
              <span className="text-sm text-[#525252] font-normal">/100</span>
            </div>
          </div>
          <div className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3 w-3 text-[#f59e0b]" />
              <span className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider">
                Delay prob.
              </span>
            </div>
            <div className="text-xl font-bold text-[#e5e5e5] leading-none">
              {vessel.delayProbability}
              <span className="text-sm text-[#525252] font-normal">%</span>
            </div>
          </div>
        </div>

        {/* Operational */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Navigation className="h-3 w-3 text-[#3b82f6]" />
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
              Operational
            </h3>
          </div>
          <div className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3">
            <DataRow label="From" value={vessel.origin} />
            <DataRow label="To" value={vessel.destination} />
            <DataRow
              label="Position"
              value={`${vessel.position[0].toFixed(2)}°, ${vessel.position[1].toFixed(2)}°`}
              mono
            />
            <DataRow label="Speed" value={`${vessel.speedKnots.toFixed(1)} kn`} mono />
            <DataRow label="Heading" value={`${vessel.headingDeg}°`} mono />
          </div>
        </section>

        {/* ETA */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="h-3 w-3 text-[#3b82f6]" />
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
              ETA
            </h3>
          </div>
          <div className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3">
            <DataRow label="UTC" value={vessel.etaUtc} mono />
            <DataRow label="IST" value={vessel.etaIst} mono />
          </div>
        </section>

        {/* Technical */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Gauge className="h-3 w-3 text-[#3b82f6]" />
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
              Technical
            </h3>
          </div>
          <div className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3">
            <DataRow label="Type" value={vessel.type} />
            <DataRow label="Flag" value={vessel.flag} />
            <DataRow label="DWT" value={`${vessel.dwt.toLocaleString()} t`} mono />
            <DataRow label="GT / NT" value={`${vessel.gt.toLocaleString()} / ${vessel.nt.toLocaleString()}`} mono />
            <DataRow label="Length" value={`${vessel.length} m`} mono />
          </div>
        </section>
      </div>

      {/* Action footer */}
      <div className="p-3 border-t border-[#2a2a2a] bg-[#0a0a0a] space-y-2">
        {/*
          Primary actions — Track vs Compare. Mutually exclusive map modes,
          so we expose them as a 50/50 split. The active one shows a stop
          icon + danger-tinted style.
        */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => (isTracking ? onUntrack?.() : onTrack?.())}
            className={`h-9 rounded-md flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              isTracking
                ? 'border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/15'
                : 'border border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#3b82f6] hover:bg-[#3b82f6]/15'
            }`}
          >
            {isTracking ? (
              <>
                <CircleStop className="h-3.5 w-3.5" />
                Stop track
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Track
              </>
            )}
          </button>
          <button
            onClick={() => (isComparing ? onStopComparing?.() : onCompareRoutes?.())}
            className={`h-9 rounded-md flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              isComparing
                ? 'border border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/15'
                : 'border border-[#06b6d4]/40 bg-[#06b6d4]/10 text-[#06b6d4] hover:bg-[#06b6d4]/15'
            }`}
            title="Compare current AIS route vs AI-recommended route"
          >
            {isComparing ? (
              <>
                <CircleStop className="h-3.5 w-3.5" />
                Stop compare
              </>
            ) : (
              <>
                <GitCompareArrows className="h-3.5 w-3.5" />
                Compare routes
              </>
            )}
          </button>
        </div>

        {/*
          Secondary actions — three intelligence verbs:
          • Decide   → Decision Engine (apply / reject AI recommendation)
          • Simulate → Simulation Lab (what-if exploration)
          • Impact   → Analytics (financial + operational impact analysis)
          Tracking & Compare observe; these three turn observation into action.
          The Impact CTA gets a dynamic delay suffix when meaningful.
        */}
        <div className="grid grid-cols-3 gap-2">
          <Link
            href={`/decisions?vessel=${vessel.id}`}
            className="flex flex-col items-center justify-center gap-0.5 h-11 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#262626]"
          >
            <Brain className="h-3 w-3" />
            <span className="text-[9px] font-semibold uppercase tracking-wider">Decide</span>
          </Link>
          <Link
            href={`/simulation?vessel=${vessel.id}`}
            className="flex flex-col items-center justify-center gap-0.5 h-11 rounded-md border border-[#2a2a2a] bg-[#1a1a1a] text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#262626]"
          >
            <Zap className="h-3 w-3" />
            <span className="text-[9px] font-semibold uppercase tracking-wider">Simulate</span>
          </Link>
          <Link
            href={`/analytics?vessel=${vessel.id}`}
            className={`flex flex-col items-center justify-center gap-0.5 h-11 rounded-md border ${
              impactSuffix
                ? 'border-[#f59e0b]/30 bg-[#f59e0b]/5 text-[#f59e0b] hover:bg-[#f59e0b]/10'
                : 'border-[#2a2a2a] bg-[#1a1a1a] text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#262626]'
            }`}
            title={
              impactSuffix
                ? `Projected impact: ${impactSuffix}`
                : 'View financial & operational impact'
            }
          >
            <BarChart3 className="h-3 w-3" />
            <span className="text-[9px] font-semibold uppercase tracking-wider">
              Impact{impactSuffix ? ` ${impactSuffix}` : ''}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
