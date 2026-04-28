'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Crosshair,
  Locate,
  X,
  Ship,
} from 'lucide-react';
import {
  formatRelative,
  formatTrackTime,
  type VesselTrack,
  interpolateAtT,
} from './track-utils';
import type { PlaybackSpeed } from './use-vessel-track';

interface Props {
  track: VesselTrack;
  t: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  autoFollow: boolean;
  /** Whether the track has enough data for meaningful playback. */
  playable: boolean;
  /** Projection confidence (0-100) at the current playhead. */
  projectionConfidence: number;
  onPlayPause: () => void;
  onSeek: (t: number) => void;
  onJumpToStart: () => void;
  onJumpToCurrent: () => void;
  onJumpToEnd: () => void;
  onSpeedChange: (s: PlaybackSpeed) => void;
  onAutoFollowToggle: () => void;
  onClose: () => void;
}

const SPEEDS: PlaybackSpeed[] = [1, 2, 5];

export function TrackPlaybackBar({
  track,
  t,
  isPlaying,
  speed,
  autoFollow,
  playable,
  projectionConfidence,
  onPlayPause,
  onSeek,
  onJumpToStart,
  onJumpToCurrent,
  onJumpToEnd,
  onSpeedChange,
  onAutoFollowToggle,
  onClose,
}: Props) {
  const [hoverT, setHoverT] = useState<number | null>(null);
  const trackBarRef = useRef<HTMLDivElement>(null);

  // Current point info from t
  const playhead = useMemo(() => interpolateAtT(track, t), [track, t]);
  const hoverPoint = useMemo(
    () => (hoverT !== null ? interpolateAtT(track, hoverT) : null),
    [track, hoverT]
  );

  const segment: 'past' | 'now' | 'future' =
    Math.abs(t - track.pastFraction) < 0.005
      ? 'now'
      : t < track.pastFraction
        ? 'past'
        : 'future';

  // Convert mouse X to normalized t.
  const xToT = (clientX: number): number => {
    const el = trackBarRef.current;
    if (!el) return t;
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  return (
    <div
      className="rounded-lg border border-[#2a2a2a] bg-[#0f0f0f]/95 backdrop-blur shadow-2xl pointer-events-auto"
      role="region"
      aria-label="Vessel playback"
    >
      {/* ── Top row: identity + actions ──────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-3 pt-2.5 pb-2 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-2 min-w-0">
          <Ship className="h-3.5 w-3.5 text-[#3b82f6] flex-shrink-0" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#525252] flex-shrink-0">
            Tracking
          </span>
          <span className="text-[12px] font-semibold text-[#e5e5e5] truncate">
            {track.vesselName}
          </span>
          <span
            className={`flex-shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              segment === 'past'
                ? 'bg-[#10b981]/15 text-[#10b981]'
                : segment === 'now'
                  ? 'bg-[#3b82f6]/15 text-[#3b82f6]'
                  : 'bg-[#06b6d4]/15 text-[#06b6d4]'
            }`}
          >
            {segment === 'past' ? 'History' : segment === 'now' ? 'Live' : 'Projection'}
          </span>

          {/*
            Confidence badge: communicates that future positions are
            estimates, decaying with horizon. Hidden in past segment.
          */}
          {segment !== 'past' && (
            <span
              className="flex-shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#2a2a2a] text-[#a3a3a3]"
              title="Projection confidence — decays with forecast horizon"
            >
              {projectionConfidence}% conf.
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onAutoFollowToggle}
            title={autoFollow ? 'Auto-follow on' : 'Auto-follow off'}
            className={`flex items-center gap-1 h-6 px-2 rounded text-[10px] font-semibold uppercase tracking-wider border ${
              autoFollow
                ? 'border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#3b82f6]'
                : 'border-[#2a2a2a] bg-transparent text-[#737373] hover:text-[#e5e5e5]'
            }`}
          >
            <Crosshair className="h-3 w-3" />
            Follow
          </button>
          <button
            onClick={onClose}
            title="Close tracking"
            className="p-1 rounded text-[#737373] hover:text-[#e5e5e5] hover:bg-[#1a1a1a]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Middle row: transport + scrubber ─────────────────────── */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Transport controls */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={onJumpToStart}
            title="Jump to start"
            className="p-1.5 rounded text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#1a1a1a]"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onPlayPause}
            disabled={!playable}
            title={
              !playable
                ? 'Track too short to play'
                : isPlaying
                  ? 'Pause'
                  : 'Play'
            }
            className={`ml-0.5 flex items-center justify-center h-7 w-7 rounded-full text-white transition-colors ${
              !playable
                ? 'bg-[#2a2a2a] cursor-not-allowed text-[#525252]'
                : 'bg-[#3b82f6] hover:bg-[#2563eb]'
            }`}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 translate-x-[1px]" />
            )}
          </button>
          <button
            onClick={onJumpToCurrent}
            title="Jump to current"
            className="ml-0.5 flex items-center gap-1 h-6 px-1.5 rounded text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#1a1a1a]"
          >
            <Locate className="h-3 w-3" />
            Now
          </button>
          <button
            onClick={onJumpToEnd}
            title="Jump to end"
            className="p-1.5 rounded text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#1a1a1a]"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Scrubber */}
        <div className="flex-1 min-w-0 select-none">
          <div
            ref={trackBarRef}
            className="relative h-6 cursor-pointer"
            onMouseMove={(e) => setHoverT(xToT(e.clientX))}
            onMouseLeave={() => setHoverT(null)}
            onMouseDown={(e) => {
              const handle = (ev: MouseEvent) => onSeek(xToT(ev.clientX));
              const cleanup = () => {
                window.removeEventListener('mousemove', handle);
                window.removeEventListener('mouseup', cleanup);
              };
              window.addEventListener('mousemove', handle);
              window.addEventListener('mouseup', cleanup);
              onSeek(xToT(e.clientX));
            }}
          >
            {/* Track */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-[#1f1f1f] rounded-full" />
            {/* Past portion fill (from start to current 'now') */}
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-[#10b981]/35 rounded-full"
              style={{ width: `${track.pastFraction * 100}%` }}
            />
            {/* Active portion (from start to playhead) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-[#3b82f6] rounded-full"
              style={{ width: `${t * 100}%` }}
            />
            {/* "Now" tick */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-[#e5e5e5]"
              style={{ left: `${track.pastFraction * 100}%` }}
              title="Current position"
            />
            {/* Playhead handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-lg ring-2 ring-[#3b82f6]"
              style={{ left: `${t * 100}%` }}
            />

            {/* Hover tooltip */}
            {hoverT !== null && hoverPoint && (
              <div
                className="absolute -top-9 -translate-x-1/2 px-2 py-1 rounded bg-[#0a0a0a] border border-[#2a2a2a] shadow-lg pointer-events-none z-10"
                style={{ left: `${hoverT * 100}%` }}
              >
                <div className="text-[9px] font-mono text-[#e5e5e5] whitespace-nowrap">
                  {formatTrackTime(hoverPoint.timestamp)}
                </div>
                <div className="text-[9px] text-[#737373] whitespace-nowrap">
                  {hoverPoint.lat.toFixed(2)}°, {hoverPoint.lng.toFixed(2)}° ·{' '}
                  {hoverPoint.speed.toFixed(1)}kn
                </div>
              </div>
            )}
          </div>

          {/* Time labels */}
          <div className="flex items-center justify-between mt-1 px-0.5">
            <span className="text-[9px] font-mono text-[#525252]">
              {formatTrackTime(track.startTime)}
            </span>
            <span className="text-[9px] font-mono text-[#a3a3a3]">
              {formatTrackTime(playhead.timestamp)} · {formatRelative(playhead.timestamp, track.currentTime)}
            </span>
            <span className="text-[9px] font-mono text-[#525252]">
              {formatTrackTime(track.endTime)}
            </span>
          </div>
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-0 rounded border border-[#2a2a2a] overflow-hidden flex-shrink-0">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`h-6 px-2 text-[10px] font-semibold tabular-nums ${
                speed === s
                  ? 'bg-[#3b82f6] text-white'
                  : 'text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#1a1a1a]'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
