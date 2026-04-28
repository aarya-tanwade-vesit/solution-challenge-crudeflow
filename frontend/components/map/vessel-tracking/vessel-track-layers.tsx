'use client';

import React, { useEffect, useMemo } from 'react';
import { CircleMarker, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { TrackPoint, VesselTrack } from './track-utils';

interface Props {
  track: VesselTrack;
  current: TrackPoint;
  /** Whether the map should follow the playhead. */
  autoFollow: boolean;
  /** Color used for the past path (matches vessel status color). */
  pastColor: string;
  /**
   * Projection confidence at the current playhead (0-100).
   * Drives the visual treatment of the future polyline so the user
   * *feels* uncertainty: higher confidence = clearer dashed line,
   * lower = more faded with longer gaps. Optional; defaults to 100.
   */
  projectionConfidence?: number;
}

// ──────────────────────────────────────────────────────────
// Camera follow controller
// ──────────────────────────────────────────────────────────
function FollowController({
  enabled,
  position,
}: {
  enabled: boolean;
  position: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    if (!enabled) return;
    map.panTo(position, { animate: true, duration: 0.6 });
  }, [enabled, position, map]);
  return null;
}

// ──────────────────────────────────────────────────────────
// Animated playhead icon — small chevron, no glow.
// ──────────────────────────────────────────────────────────
function buildPlayheadIcon(heading: number, color: string) {
  const size = 34;
  const html = `
    <div style="width:${size}px;height:${size}px;position:relative;">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}"
           style="transform:rotate(${heading}deg);transition:transform 200ms linear;display:block;">
        <circle cx="12" cy="12" r="9" fill="#0a0a0a" stroke="${color}" stroke-width="1.5"/>
        <path d="M12 5.5 L17 17 L12 14.2 L7 17 Z"
              fill="${color}" stroke="#0a0a0a" stroke-width="0.6" stroke-linejoin="round"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    className: 'mim-playhead',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ──────────────────────────────────────────────────────────
// Main layers
// ──────────────────────────────────────────────────────────
export function VesselTrackLayers({
  track,
  current,
  autoFollow,
  pastColor,
  projectionConfidence = 100,
}: Props) {
  // Map confidence (0-100) → visual properties so users *feel* uncertainty.
  //   • Opacity:   0.30 → 0.65  (clearer when more confident)
  //   • Dash gap:  3 → 10       (more broken when less confident)
  // Clamp to [0, 100] before normalizing.
  const conf = Math.max(0, Math.min(100, projectionConfidence)) / 100;
  const futureOpacity = 0.3 + conf * 0.35;
  const futureDashGap = Math.round(10 - conf * 7);
  const futureDashArray = `4 ${futureDashGap}`;
  // Build path arrays once per track change.
  const pastCoords = useMemo<[number, number][]>(
    () =>
      track.points
        .filter((p) => p.segment === 'past')
        .map((p) => [p.lat, p.lng] as [number, number]),
    [track.vesselId]
  );

  const futureCoords = useMemo<[number, number][]>(
    () =>
      track.points
        .filter((p) => p.segment === 'future')
        .map((p) => [p.lat, p.lng] as [number, number]),
    [track.vesselId]
  );

  // Connect past↔future at the current position for a continuous look.
  const futureConnected = useMemo<[number, number][]>(() => {
    const last = pastCoords[pastCoords.length - 1];
    return last ? [last, ...futureCoords] : futureCoords;
  }, [pastCoords, futureCoords]);

  // Time interval markers (one every ~12h of travel).
  const timeMarkers = useMemo<TrackPoint[]>(() => {
    const out: TrackPoint[] = [];
    const interval = 12 * 3600_000; // 12h in ms
    let nextMark = track.startTime.getTime() + interval;
    for (const p of track.points) {
      if (p.timestamp.getTime() >= nextMark) {
        out.push(p);
        nextMark = p.timestamp.getTime() + interval;
      }
    }
    return out;
  }, [track.vesselId]);

  const playheadIcon = useMemo(
    () => buildPlayheadIcon(current.heading, pastColor),
    [current.heading, pastColor]
  );

  return (
    <>
      <FollowController enabled={autoFollow} position={[current.lat, current.lng]} />

      {/* Past path — solid, slightly muted */}
      {pastCoords.length > 1 && (
        <Polyline
          positions={pastCoords}
          pathOptions={{
            color: pastColor,
            weight: 3,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      {/*
        Future path — dashed projection, lighter tone.
        Visual properties (opacity + dash gap) scale with confidence so
        uncertainty is *felt*, not just shown as a number badge.
      */}
      {futureConnected.length > 1 && (
        <Polyline
          positions={futureConnected}
          pathOptions={{
            color: pastColor,
            weight: 2,
            opacity: futureOpacity,
            dashArray: futureDashArray,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      {/* Time markers along the track */}
      {timeMarkers.map((m, i) => (
        <CircleMarker
          key={`tm-${i}`}
          center={[m.lat, m.lng]}
          radius={2.5}
          pathOptions={{
            color: m.segment === 'past' ? pastColor : '#737373',
            weight: 1,
            fillColor: '#0a0a0a',
            fillOpacity: 1,
            opacity: m.segment === 'past' ? 0.75 : 0.45,
          }}
        />
      ))}

      {/* Animated playhead — moves along the timeline as user scrubs / plays */}
      <Marker
        position={[current.lat, current.lng]}
        icon={playheadIcon}
        zIndexOffset={1000}
      />
    </>
  );
}
