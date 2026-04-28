/**
 * Route Comparison Engine
 * ───────────────────────
 * Pure utility that turns a vessel's `currentRoute` and `recommendedRoute`
 * into a structured comparison: distance delta, time delta, fuel delta,
 * and a midpoint anchor for on-map labels.
 *
 * Designed to be deterministic and dependency-free so it can later be
 * swapped for a backend response (`/api/routes/compare?vesselId=...`).
 */

import type { Vessel } from '../map-data';

// ─────────────────────────────────────────────────────────
// Geo helpers
// ─────────────────────────────────────────────────────────

const NM_PER_DEG = 60; // ≈ at the equator; good enough for visual deltas
const EARTH_NM = 3440.065;

function haversineNm(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_NM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function routeLengthNm(route: Array<[number, number]>): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversineNm(route[i - 1], route[i]);
  }
  return total;
}

// Returns the geographic centroid of a polyline.
function centroidOf(points: Array<[number, number]>): [number, number] {
  if (points.length === 0) return [0, 0];
  const sum = points.reduce(
    (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng] as [number, number],
    [0, 0] as [number, number]
  );
  return [sum[0] / points.length, sum[1] / points.length];
}

// Maximum perpendicular spread between the two routes (in degrees).
// Used as a quick "how different are they" signal for the badge color.
function maxSeparationDeg(
  a: Array<[number, number]>,
  b: Array<[number, number]>
): number {
  if (a.length === 0 || b.length === 0) return 0;
  let max = 0;
  for (const p of a) {
    let min = Infinity;
    for (const q of b) {
      const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
      if (d < min) min = d;
    }
    if (min > max) max = min;
  }
  return max;
}

// Build a "diff polygon" by walking forward through the current route and
// back through the recommended route. The fill of this polygon shows the
// area of divergence in a single glance.
export function buildDiffPolygon(
  current: Array<[number, number]>,
  recommended: Array<[number, number]>
): Array<[number, number]> {
  if (current.length < 2 || recommended.length < 2) return [];
  return [...current, ...recommended.slice().reverse()];
}

// Approximate the visual midpoint of the divergence — used to anchor the
// on-map summary badge so it sits *between* the two paths.
export function divergenceAnchor(
  current: Array<[number, number]>,
  recommended: Array<[number, number]>
): [number, number] {
  if (current.length === 0 && recommended.length === 0) return [0, 0];
  const c1 = centroidOf(current);
  const c2 = centroidOf(recommended);
  return [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2];
}

// ─────────────────────────────────────────────────────────
// Comparison model
// ─────────────────────────────────────────────────────────

export interface RouteComparison {
  /** Total length of the active AIS route (nm). */
  currentNm: number;
  /** Total length of the AI-recommended alternative (nm). */
  recommendedNm: number;
  /** Positive value = AI route is shorter. */
  distanceSavedNm: number;
  /** Positive value = AI route arrives sooner. */
  timeSavedHours: number;
  /** Approx fuel saved in tonnes (Aframax/Suezmax baseline). */
  fuelSavedTonnes: number;
  /** Estimated reduction in transit risk score (0-100 scale). */
  riskReduction: number;
  /** Whether the AI route is materially better than the current one. */
  isBetter: boolean;
  /** Whether the routes diverge meaningfully (so a badge makes sense). */
  hasDivergence: boolean;
  /** Geographic anchor for the on-map summary badge. */
  anchor: [number, number];
  /** Polygon points filling the area between the two routes. */
  diffPolygon: Array<[number, number]>;
}

// Heuristic fuel burn for a tanker at cruising speed:
// ≈ 35 t/day at 12 kn → 35 / (12 × 24) ≈ 0.122 t/nm.
// We use a conservative 0.10 t/nm to avoid overstating savings.
const FUEL_TONNES_PER_NM = 0.1;

export function compareRoutes(vessel: Vessel): RouteComparison {
  const currentNm = routeLengthNm(vessel.currentRoute);
  const recommendedNm = routeLengthNm(vessel.recommendedRoute);

  const distanceSavedNm = currentNm - recommendedNm;
  const speed = Math.max(6, vessel.speedKnots || 12);
  const timeSavedHours = distanceSavedNm / speed;
  const fuelSavedTonnes = distanceSavedNm * FUEL_TONNES_PER_NM;

  // Risk reduction is proportional to how risky the *current* path is and
  // how much the AI route deviates from it (more deviation → more avoidance).
  const separation = maxSeparationDeg(vessel.currentRoute, vessel.recommendedRoute);
  const deviationFactor = Math.min(1, separation / 4); // 4° ≈ "very different"
  const riskReduction = Math.round(vessel.riskScore * deviationFactor * 0.45);

  const isBetter = distanceSavedNm > 5 || riskReduction > 4;
  const hasDivergence = separation > 0.05; // ~3 nm

  return {
    currentNm,
    recommendedNm,
    distanceSavedNm,
    timeSavedHours,
    fuelSavedTonnes,
    riskReduction,
    isBetter,
    hasDivergence,
    anchor: divergenceAnchor(vessel.currentRoute, vessel.recommendedRoute),
    diffPolygon: buildDiffPolygon(vessel.currentRoute, vessel.recommendedRoute),
  };
}

// ─────────────────────────────────────────────────────────
// Formatting helpers
// ─────────────────────────────────────────────────────────

export function formatNm(nm: number): string {
  if (Math.abs(nm) >= 1000) return `${(nm / 1000).toFixed(1)}k nm`;
  return `${Math.round(nm)} nm`;
}

export function formatHours(hours: number): string {
  const abs = Math.abs(hours);
  if (abs < 1) return `${Math.round(abs * 60)} min`;
  if (abs < 24) return `${abs.toFixed(1)} h`;
  return `${(abs / 24).toFixed(1)} d`;
}

export function formatTonnes(t: number): string {
  if (Math.abs(t) >= 100) return `${Math.round(t)} t`;
  return `${t.toFixed(1)} t`;
}

// Used only for documentation; keeps the constant exported in case the
// caller wants to translate degree-based separation into nautical miles.
export const NAUTICAL_MILES_PER_DEGREE_LAT = NM_PER_DEG;
