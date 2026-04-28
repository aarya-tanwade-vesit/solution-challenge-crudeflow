'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Vessel } from '../map-data';
import {
  buildTrack,
  interpolateAtT,
  type TrackPoint,
  type VesselTrack,
} from './track-utils';

export type PlaybackSpeed = 1 | 2 | 5;

export interface PlaybackState {
  /** Active track (null when no vessel selected). */
  track: VesselTrack | null;
  /** Normalized timeline position 0..1. */
  t: number;
  /** Interpolated point at the current `t`. */
  current: TrackPoint | null;
  /** Whether playback animation is running. */
  isPlaying: boolean;
  /** Multiplier on real-time animation speed (1x / 2x / 5x). */
  speed: PlaybackSpeed;
  /** Whether the camera follows the playhead. */
  autoFollow: boolean;
  /**
   * Whether the track has enough data for meaningful playback.
   * Used to disable Play in the UI when data is too short / not ready.
   * Critical safeguard before backend AIS integration.
   */
  playable: boolean;
  /**
   * Confidence (0-100) for the projected (future) segment of the track.
   * Decays smoothly from 100% at "now" → 40% at the end of the projection.
   * Communicates that future positions are estimates, not facts.
   */
  projectionConfidence: number;

  // ── Actions ──
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (t: number) => void;
  jumpToStart: () => void;
  jumpToCurrent: () => void;
  jumpToEnd: () => void;
  setSpeed: (s: PlaybackSpeed) => void;
  setAutoFollow: (v: boolean) => void;
}

// Base animation rate: animate the entire timeline in 60s at 1x.
const BASE_DURATION_MS = 60_000;
// Min duration of a track to be considered playable (5 minutes real-time).
const MIN_PLAYABLE_MS = 5 * 60_000;
// Cap dt per rAF tick — guards against background-tab catch-up jumps.
const MAX_TICK_MS = 100;

export function useVesselTrack(vessel: Vessel | null): PlaybackState {
  const track = useMemo(() => (vessel ? buildTrack(vessel) : null), [vessel]);

  // Initial t = "now" position for selected vessel
  const [t, setT] = useState(() => track?.pastFraction ?? 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState<PlaybackSpeed>(1);
  const [autoFollow, setAutoFollow] = useState(true);

  // Reset when the vessel (and therefore track) changes.
  useEffect(() => {
    setT(track?.pastFraction ?? 0);
    setIsPlaying(false);
    setSpeedState(1);
  }, [track?.vesselId]);

  // rAF playback loop.
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || !track) return;

    const tick = (now: number) => {
      const last = lastTickRef.current;
      lastTickRef.current = now;
      if (last !== null) {
        // Clamp dt: protects against huge jumps after tab backgrounding
        // and against extreme high-refresh-rate displays accumulating error.
        const dt = Math.min(MAX_TICK_MS, now - last);
        const advance = (dt * speed) / BASE_DURATION_MS;
        setT((prev) => {
          const next = prev + advance;
          if (next >= 1) {
            // auto-stop at end
            setIsPlaying(false);
            return 1;
          }
          return next;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = null;
    };
  }, [isPlaying, speed, track]);

  // Stop on unmount safety net.
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const current = useMemo(
    () => (track ? interpolateAtT(track, t) : null),
    [track, t]
  );

  // Track is "playable" iff it has enough span to animate meaningfully.
  const playable = !!track && track.totalMs >= MIN_PLAYABLE_MS && track.points.length >= 2;

  // Confidence fades linearly across the projection portion of the track.
  // At "now" (= track.pastFraction) → 100%, at end → 40%.
  const projectionConfidence = useMemo(() => {
    if (!track) return 0;
    if (t <= track.pastFraction) return 100;
    const span = 1 - track.pastFraction;
    if (span <= 0) return 100;
    const into = (t - track.pastFraction) / span;
    return Math.round(100 - into * 60);
  }, [track, t]);

  return {
    track,
    t,
    current,
    isPlaying,
    speed,
    autoFollow,
    playable,
    projectionConfidence,
    // Refuse to play if not playable — prevents wasted rAF cycles.
    play: () => playable && setIsPlaying(true),
    pause: () => setIsPlaying(false),
    toggle: () => playable && setIsPlaying((p) => !p),
    seek: (next) => {
      setIsPlaying(false);
      setT(Math.max(0, Math.min(1, next)));
    },
    jumpToStart: () => {
      setIsPlaying(false);
      setT(0);
    },
    jumpToCurrent: () => {
      setIsPlaying(false);
      setT(track?.pastFraction ?? 0);
    },
    jumpToEnd: () => {
      setIsPlaying(false);
      setT(1);
    },
    setSpeed: setSpeedState,
    setAutoFollow,
  };
}
