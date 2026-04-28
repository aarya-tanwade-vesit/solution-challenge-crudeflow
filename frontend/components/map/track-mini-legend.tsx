'use client';

/**
 * TrackMiniLegend
 * ───────────────
 * Tiny contextual legend shown only while a vessel is being tracked.
 * Communicates four orthogonal axes in a single compact strip:
 *
 *   ● Live position      — solid dot (real AIS / current observation)
 *   ◌ Simulated position — hollow dot (sim ghost, when sim mode is on)
 *   ─ Past               — solid line (history)
 *   ┄ Projected          — dashed line (future projection)
 *
 * The simulated row is only rendered when `showSimulated` is true so the
 * legend stays minimal in plain tracking mode.
 */

import React from 'react';

interface Props {
  /** Color used for the past path — matches the tracked vessel's status. */
  pastColor: string;
  /** Whether simulation mode is active; toggles the live/simulated row. */
  showSimulated?: boolean;
}

export function TrackMiniLegend({ pastColor, showSimulated = false }: Props) {
  return (
    <div className="rounded-md border border-[#2a2a2a] bg-[#0f0f0f]/95 backdrop-blur shadow-lg px-2.5 py-1.5 flex items-center gap-3 pointer-events-auto">
      {/* Position dots */}
      <div className="flex items-center gap-1.5">
        <span
          className="block w-2 h-2 rounded-full"
          style={{ background: pastColor }}
          title="Live position"
        />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
          Live
        </span>
      </div>

      {showSimulated && (
        <div className="flex items-center gap-1.5">
          <span
            className="block w-2 h-2 rounded-full bg-transparent"
            style={{ border: `1.5px dashed #3b82f6` }}
            title="Simulated position"
          />
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#3b82f6]">
            Sim
          </span>
        </div>
      )}

      {/* Divider */}
      <span className="block w-px h-3 bg-[#2a2a2a]" />

      {/* Line styles */}
      <LegendLine dashed={false} color={pastColor} label="Past" />
      <LegendLine dashed color="#06b6d4" label="Projected" />
    </div>
  );
}

function LegendLine({
  dashed,
  color,
  label,
}: {
  dashed: boolean;
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="block w-5 h-[2px] rounded-full"
        style={
          dashed
            ? {
                backgroundImage: `linear-gradient(to right, ${color} 50%, transparent 50%)`,
                backgroundSize: '4px 2px',
              }
            : { background: color }
        }
      />
      <span className="text-[9px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
        {label}
      </span>
    </div>
  );
}
