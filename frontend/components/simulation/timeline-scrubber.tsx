'use client';

import React, { useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, Skull, Pin, Rewind, FastForward, Clock } from 'lucide-react';
import { useSimulation } from '@/contexts';
import type { PlaybackStepHours } from '@/contexts/simulation-context';

const STEP_OPTIONS: { value: PlaybackStepHours; label: string }[] = [
  { value: 1,  label: '1h' },
  { value: 3,  label: '3h' },
  { value: 6,  label: '6h' },
  { value: 12, label: '12h' },
  { value: 24, label: '1d' },
];

const SPEED_OPTIONS: (1 | 1.5 | 2 | 4)[] = [1, 1.5, 2, 4];

export function TimelineScrubber() {
  const {
    currentDay, setCurrentDay,
    isPlaying, togglePlayback,
    playbackSpeed, setPlaybackSpeed,
    playbackStepHours, setPlaybackStepHours,
    bufferDeathDay, bufferDays,
    pinSnapshot, snapshots,
  } = useSimulation();

  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleTrackInteraction = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const day = 1 + percent * 29;
    // Snap to playback step granularity for precise control
    const stepDays = playbackStepHours / 24;
    const snapped = Math.round(day / stepDays) * stepDays;
    setCurrentDay(Math.max(1, Math.min(30, snapped)));
  }, [setCurrentDay, playbackStepHours]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    handleTrackInteraction(e.clientX);
    const onMove = (ev: MouseEvent) => isDragging.current && handleTrackInteraction(ev.clientX);
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const positionPercent = ((currentDay - 1) / 29) * 100;
  const deathPercent = bufferDeathDay !== null && bufferDeathDay <= 30 ? ((bufferDeathDay - 1) / 29) * 100 : null;

  // Format current day as "Day X, HH:00"
  const dayInt = Math.floor(currentDay);
  const hour = Math.round((currentDay - dayInt) * 24);
  const dayLabel = `D${dayInt}`;
  const hourLabel = `${String(hour).padStart(2, '0')}:00`;

  const stepBack = () => setCurrentDay(currentDay - playbackStepHours / 24);
  const stepFwd  = () => setCurrentDay(currentDay + playbackStepHours / 24);

  return (
    <div className="flex-shrink-0 bg-[#0f0f0f] border-t border-[#2a2a2a]">
      <div className="px-5 py-2.5">
        {/* Top row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            {/* Playback */}
            <div className="flex items-center gap-0.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded p-0.5">
              <button
                onClick={() => setCurrentDay(1)}
                className="w-7 h-7 flex items-center justify-center text-[#737373] hover:text-[#e5e5e5] hover:bg-[#262626] rounded transition-colors"
                title="Reset to Day 1"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={stepBack}
                className="w-7 h-7 flex items-center justify-center text-[#737373] hover:text-[#e5e5e5] hover:bg-[#262626] rounded transition-colors"
                title={`Back ${playbackStepHours}h`}
              >
                <Rewind className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={togglePlayback}
                className="w-8 h-7 flex items-center justify-center bg-[#3b82f6] text-white rounded hover:bg-[#2563eb] transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                onClick={stepFwd}
                className="w-7 h-7 flex items-center justify-center text-[#737373] hover:text-[#e5e5e5] hover:bg-[#262626] rounded transition-colors"
                title={`Forward ${playbackStepHours}h`}
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step interval */}
            <div className="flex items-center gap-0.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded p-0.5" title="Time step per tick">
              <Clock className="w-3 h-3 text-[#525252] mx-1.5" />
              {STEP_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setPlaybackStepHours(s.value)}
                  className={`px-1.5 py-1 text-[10px] font-mono font-semibold rounded transition-colors ${
                    playbackStepHours === s.value ? 'bg-[#3b82f6]/15 text-[#3b82f6]' : 'text-[#525252] hover:text-[#a3a3a3]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Speed */}
            <div className="flex items-center gap-0.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded p-0.5" title="Playback speed multiplier">
              {SPEED_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-1.5 py-1 text-[10px] font-mono font-semibold rounded transition-colors ${
                    playbackSpeed === s ? 'bg-[#262626] text-[#e5e5e5]' : 'text-[#525252] hover:text-[#a3a3a3]'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Time display */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded">
              <span className="text-sm font-mono font-bold text-[#e5e5e5] tabular-nums">{dayLabel}</span>
              <span className="text-xs font-mono text-[#525252] tabular-nums">{hourLabel}</span>
              <span className="text-[10px] text-[#525252]">/ D30</span>
            </div>

            {/* Buffer death warning */}
            {bufferDeathDay !== null && bufferDeathDay <= 30 && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-[10px] font-semibold text-red-400 uppercase tracking-wider">
                <Skull className="w-3 h-3" />
                Buffer Death: D{Math.floor(bufferDeathDay)}
              </div>
            )}
          </div>

          {/* Pin */}
          <button
            onClick={() => pinSnapshot(`Day ${Math.round(currentDay)}`)}
            disabled={snapshots.length >= 3}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3] rounded hover:border-[#3b82f6]/40 hover:text-[#3b82f6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={snapshots.length >= 3 ? 'Max 3 snapshots' : 'Pin current state'}
          >
            <Pin className="w-3 h-3" />
            Pin ({snapshots.length}/3)
          </button>
        </div>

        {/* Track */}
        <div className="relative pt-3 pb-4">
          <div className="absolute inset-x-0 top-0 flex justify-between text-[9px] font-mono text-[#525252] tabular-nums select-none">
            {[1, 5, 10, 15, 20, 25, 30].map((d) => (
              <span key={d}>D{d}</span>
            ))}
          </div>

          <div
            ref={trackRef}
            onMouseDown={handleMouseDown}
            className="relative h-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full cursor-pointer select-none"
          >
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-full"
              style={{ width: `${positionPercent}%` }}
            />

            {deathPercent !== null && (
              <div
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${deathPercent}%` }}
              >
                <div className="w-px h-6 bg-red-500 -translate-y-1" />
                <div className="absolute top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-red-500/10 border border-red-500/30 rounded whitespace-nowrap">
                  <Skull className="w-2.5 h-2.5 text-red-400" />
                  <span className="text-[9px] font-mono text-red-400">D{Math.floor(bufferDeathDay!)}</span>
                </div>
              </div>
            )}

            {snapshots.map((snap) => {
              const pct = ((snap.day - 1) / 29) * 100;
              return (
                <div
                  key={snap.id}
                  className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: `${pct}%` }}
                  title={snap.label}
                >
                  <div className="w-2.5 h-2.5 -translate-x-1/2 bg-amber-500 border-2 border-[#0f0f0f] rounded-full" />
                </div>
              );
            })}

            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 -translate-x-1/2 bg-white border-2 border-[#3b82f6] rounded-full shadow-lg shadow-[#3b82f6]/30 pointer-events-none"
              style={{ left: `${positionPercent}%` }}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between text-[10px]">
            <span className="text-[#525252]">
              <span className="text-[#737373]">Buffer:</span>{' '}
              <span className={`font-mono font-semibold ${bufferDays < 2 ? 'text-red-400' : bufferDays < 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {bufferDays.toFixed(1)}d
              </span>
            </span>
            <span className="text-[#525252]">
              Step: <span className="text-[#a3a3a3] font-mono">{playbackStepHours}h</span> &middot; 30-Day Forecast
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
