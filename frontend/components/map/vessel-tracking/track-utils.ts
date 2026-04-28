/**
 * Vessel track utilities.
 *
 * Builds a continuous timeline from origin → current position → destination
 * with timestamps, speeds, and headings. The output is rendered as:
 *   • Past path  → solid line (history)
 *   • Future path → dashed line (projection)
 *
 * In Phase 1 (frontend-only, pre-backend) we synthesize the history portion
 * by great-circle interpolation between origin port and current position,
 * and use the existing `currentRoute` waypoints as the projection segment.
 *
 * When the backend is wired, replace `synthesizePast()` with the AIS feed
 * and `synthesizeFuture()` with the route-engine output. The public surface
 * (VesselTrack / TrackPoint / interpolateAtT) is stable.
 */

import type { Vessel } from '../map-data';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export type TrackSegment = 'past' | 'future';

export interface TrackPoint {
  lat: number;
  lng: number;
  timestamp: Date;
  heading: number; // 0-360
  speed: number;   // knots
  segment: TrackSegment;
}

export interface VesselTrack {
  vesselId: string;
  vesselName: string;
  points: TrackPoint[];      // chronologically ordered
  currentIndex: number;      // index in `points` representing "now"
  startTime: Date;
  currentTime: Date;
  endTime: Date;
  totalMs: number;
  /** [0..1] — fraction of timeline that is history. */
  pastFraction: number;
}

// ──────────────────────────────────────────────────────────
// Port lookup (string origin → coords)
// Using a small in-module map so `buildTrack` is dependency-free.
// ──────────────────────────────────────────────────────────

const PORT_COORDS: Record<string, [number, number]> = {
  'ras tanura': [26.6441, 50.1575],
  kochi: [9.9675, 76.2383],
  mumbai: [18.9556, 72.8386],
  fujairah: [25.1167, 56.3667],
  basrah: [29.6833, 48.8167],
  chennai: [13.0827, 80.2707],
  'jebel ali': [25.0118, 55.0617],
  singapore: [1.2644, 103.822],
  ningbo: [29.8683, 121.544],
};

function lookupPort(name: string): [number, number] | null {
  const key = name.toLowerCase().split(',')[0].trim();
  return PORT_COORDS[key] ?? null;
}

// ──────────────────────────────────────────────────────────
// Geo helpers (great-circle, simple but accurate enough for visualization)
// ──────────────────────────────────────────────────────────

const R_EARTH_NM = 3440.065; // nautical miles

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

function haversineNm(a: [number, number], b: [number, number]): number {
  const [lat1, lon1] = a.map(toRad) as [number, number];
  const [lat2, lon2] = b.map(toRad) as [number, number];
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH_NM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function bearingDeg(a: [number, number], b: [number, number]): number {
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const dLon = toRad(b[1] - a[1]);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Linear interpolation between two coordinates (fine for sub-1000nm legs). */
function lerpCoord(
  a: [number, number],
  b: [number, number],
  f: number
): [number, number] {
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

/** Shortest-path angle interpolation. */
export function lerpAngle(a: number, b: number, f: number): number {
  let diff = ((b - a + 540) % 360) - 180;
  return (a + diff * f + 360) % 360;
}

// ──────────────────────────────────────────────────────────
// Build track
// ──────────────────────────────────────────────────────────

/** Density of interpolation (waypoints per leg) for the past path. */
const PAST_INTERP_STEPS = 8;

function densifyLeg(
  start: [number, number],
  end: [number, number],
  steps: number
): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 1; i <= steps; i++) {
    out.push(lerpCoord(start, end, i / steps));
  }
  return out;
}

function timestampPath(
  coords: Array<[number, number]>,
  speedKn: number,
  startTime: Date,
  segment: TrackSegment,
  defaultHeading: number
): TrackPoint[] {
  const result: TrackPoint[] = [];
  let elapsedHr = 0;
  for (let i = 0; i < coords.length; i++) {
    const prev = i === 0 ? coords[i] : coords[i - 1];
    const curr = coords[i];
    const legNm = haversineNm(prev, curr);
    elapsedHr += legNm / Math.max(speedKn, 1);
    const heading =
      i === 0
        ? defaultHeading
        : bearingDeg(prev, curr);
    result.push({
      lat: curr[0],
      lng: curr[1],
      timestamp: new Date(startTime.getTime() + elapsedHr * 3600_000),
      heading,
      speed: speedKn,
      segment,
    });
  }
  return result;
}

export function buildTrack(v: Vessel, now: Date = new Date()): VesselTrack {
  // ── Past path: origin port → current position ────────────────────
  const originCoords = lookupPort(v.origin);
  const pastCoords: Array<[number, number]> = originCoords
    ? [originCoords, ...densifyLeg(originCoords, v.position, PAST_INTERP_STEPS)]
    : [v.position]; // fallback if origin port not in lookup

  // Historical avg speed — slightly lower than current (port handling, weather).
  const historicalSpeed = Math.max(v.speedKnots * 0.9, 8);

  // Total past distance dictates how far back in time the track starts.
  let pastDistNm = 0;
  for (let i = 1; i < pastCoords.length; i++) {
    pastDistNm += haversineNm(pastCoords[i - 1], pastCoords[i]);
  }
  const pastHours = pastDistNm / historicalSpeed;
  const startTime = new Date(now.getTime() - pastHours * 3600_000);

  const pastPoints = timestampPath(
    pastCoords,
    historicalSpeed,
    startTime,
    'past',
    v.headingDeg
  );

  // The last past point is "now"; pin its heading to the current vessel heading.
  if (pastPoints.length > 0) {
    pastPoints[pastPoints.length - 1].heading = v.headingDeg;
    pastPoints[pastPoints.length - 1].speed = v.speedKnots;
    pastPoints[pastPoints.length - 1].timestamp = now;
    pastPoints[pastPoints.length - 1].lat = v.position[0];
    pastPoints[pastPoints.length - 1].lng = v.position[1];
  }

  // ── Future path: vessel.currentRoute (current → destination) ─────
  // Drop the leading waypoint if it equals current position (it usually does).
  const futureCoords: Array<[number, number]> = v.currentRoute.slice(1);
  const futurePoints = timestampPath(
    futureCoords,
    v.speedKnots,
    now,
    'future',
    v.headingDeg
  );

  const points: TrackPoint[] = [...pastPoints, ...futurePoints];
  const currentIndex = pastPoints.length - 1;
  const endTime =
    futurePoints[futurePoints.length - 1]?.timestamp ?? now;
  const totalMs = endTime.getTime() - startTime.getTime();
  const pastFraction =
    totalMs > 0 ? (now.getTime() - startTime.getTime()) / totalMs : 0.5;

  return {
    vesselId: v.id,
    vesselName: v.name,
    points,
    currentIndex,
    startTime,
    currentTime: now,
    endTime,
    totalMs,
    pastFraction: Math.max(0, Math.min(1, pastFraction)),
  };
}

// ──────────────────────────────────────────────────────────
// Interpolation
// ──────────────────────────────────────────────────────────

/** Returns an interpolated point at normalized time t (0..1). */
export function interpolateAtT(track: VesselTrack, t: number): TrackPoint {
  const clamped = Math.max(0, Math.min(1, t));
  const targetMs = track.startTime.getTime() + clamped * track.totalMs;

  // Binary search would be overkill; the points list is short.
  const pts = track.points;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (targetMs >= a.timestamp.getTime() && targetMs <= b.timestamp.getTime()) {
      const span = b.timestamp.getTime() - a.timestamp.getTime();
      const f = span === 0 ? 0 : (targetMs - a.timestamp.getTime()) / span;
      return {
        lat: a.lat + (b.lat - a.lat) * f,
        lng: a.lng + (b.lng - a.lng) * f,
        timestamp: new Date(targetMs),
        heading: lerpAngle(a.heading, b.heading, f),
        speed: a.speed + (b.speed - a.speed) * f,
        segment: targetMs <= track.currentTime.getTime() ? 'past' : 'future',
      };
    }
  }
  // edge: clamp to endpoints
  return pts[clamped <= 0 ? 0 : pts.length - 1];
}

// ──────────────────────────────────────────────────────────
// Formatting
// ──────────────────────────────────────────────────────────

export function formatTrackTime(d: Date): string {
  // Compact: "Apr 25, 14:30 UTC"
  const opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  };
  return new Intl.DateTimeFormat('en-GB', opts).format(d) + ' UTC';
}

export function formatRelative(d: Date, ref: Date = new Date()): string {
  const diffMs = d.getTime() - ref.getTime();
  const sign = diffMs >= 0 ? '+' : '-';
  const abs = Math.abs(diffMs);
  const hr = Math.floor(abs / 3_600_000);
  const min = Math.floor((abs % 3_600_000) / 60_000);
  if (hr >= 24) {
    const days = Math.floor(hr / 24);
    const remHr = hr % 24;
    return `${sign}${days}d ${remHr}h`;
  }
  return `${sign}${hr}h ${min}m`;
}
