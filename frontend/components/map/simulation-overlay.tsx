'use client';

/**
 * SimulationOverlay
 * ─────────────────
 * Renders the **simulation layer** on top of the live (reality) layer.
 *
 * Reality layer (always shown):
 *   • Solid coloured current routes
 *   • Solid vessel markers at AIS positions
 *
 * Simulation layer (this component, only when sim mode is active):
 *   • "Ghost" vessel markers — translucent, positioned at projected
 *     locations after `currentDay` days under the active sliders.
 *   • A subtle dashed "drift line" connecting real → projected position.
 *
 * The component is rendered as a Leaflet map child (Marker/Polyline siblings),
 * so it must live inside <MapContainer>.
 *
 * It reads `currentDay`, sliders, and per-vessel overrides from
 * `useSimulation()`, applies them deterministically, and emits an overlay
 * that updates instantly when the user moves a slider — fulfilling the
 * "Real-time map updates from Simulation Lab" requirement.
 */

import React, { useMemo } from 'react';
import { Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';

import type { Vessel } from './map-data';
import { useSimulation } from '@/contexts';

// ──────────────────────────────────────────────────────────
// Drift midpoint label — shows the most relevant single metric
// (ETA shift, in hours) at the midpoint of the drift line so the
// user instantly sees decision-grade impact, not just visual change.
// ──────────────────────────────────────────────────────────
function driftLabelIcon(etaShiftHours: number, isHighlight: boolean) {
  // One metric is enough — keep the label tight and readable.
  const sign = etaShiftHours >= 0 ? '+' : '−';
  const abs = Math.abs(etaShiftHours);
  const text =
    abs < 1 ? `${sign}${Math.round(abs * 60)}m ETA` : `${sign}${abs.toFixed(1)}h ETA`;
  const tone = etaShiftHours >= 2 ? '#ef4444' : etaShiftHours >= 0.5 ? '#f59e0b' : '#10b981';

  const html = `
    <div style="
      display:inline-flex;align-items:center;gap:4px;
      padding:2px 6px;border-radius:4px;
      background:rgba(15,15,15,${isHighlight ? 0.96 : 0.85});
      border:1px solid ${tone}55;
      box-shadow:0 4px 12px rgba(0,0,0,0.35);
      font-family:inherit;font-size:10px;font-weight:600;
      color:${tone};letter-spacing:0.02em;line-height:1;
      white-space:nowrap;pointer-events:none;
      transform:translateY(-1px);
    ">${text}</div>
  `;
  return L.divIcon({
    className: 'sim-drift-label',
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

// ──────────────────────────────────────────────────────────
// Ghost icon — translucent chevron, no status ring
// ──────────────────────────────────────────────────────────
function ghostIcon(opts: { heading: number; status: Vessel['status'] }) {
  const fill =
    opts.status === 'high-risk'
      ? '#ef4444'
      : opts.status === 'delayed'
        ? '#f59e0b'
        : '#10b981';
  const size = 26;
  const html = `
    <div style="width:${size}px;height:${size}px;position:relative;opacity:0.55;filter:saturate(0.85);">
      <svg
        viewBox="0 0 24 24"
        width="${size}"
        height="${size}"
        style="position:absolute;inset:0;transform:rotate(${opts.heading}deg);"
      >
        <circle cx="12" cy="12" r="9.5" fill="rgba(10,10,10,0.6)" stroke="#3b82f6" stroke-width="1" stroke-dasharray="2 2"/>
        <path
          d="M12 4.5 L17 17 L12 14.2 L7 17 Z"
          fill="${fill}"
          stroke="#0a0a0a"
          stroke-width="0.6"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  `;
  return L.divIcon({
    className: 'sim-ghost-divicon',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ──────────────────────────────────────────────────────────
// Project a position along the vessel's current route based on
// elapsed sim days + slider-driven speed factor.
// ──────────────────────────────────────────────────────────

function haversineNm(a: [number, number], b: [number, number]): number {
  const R = 3440.065;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function lerp(a: [number, number], b: [number, number], f: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

function bearingDeg(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const dLon = toRad(b[1] - a[1]);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

interface ProjectedPosition {
  position: [number, number];
  heading: number;
  bufferLossDays: number;
  etaShiftHours: number;
}

function projectVessel(
  v: Vessel,
  effectiveSpeed: number,
  congestionPct: number,
  riskLevel: number,
  daysAhead: number
): ProjectedPosition {
  const route = v.currentRoute;
  if (route.length < 2) {
    return {
      position: v.position,
      heading: v.headingDeg,
      bufferLossDays: 0,
      etaShiftHours: 0,
    };
  }

  // Cumulative leg distances.
  const legNm: number[] = [];
  let totalNm = 0;
  for (let i = 1; i < route.length; i++) {
    const d = haversineNm(route[i - 1], route[i]);
    legNm.push(d);
    totalNm += d;
  }

  // Effective speed under sim conditions:
  //   - Base from sliders
  //   - Penalty from port congestion (slows arrival)
  //   - Penalty from elevated risk (rerouting/diversions)
  const congestionPenalty = 1 - Math.max(0, congestionPct - 25) / 200; // up to ~37% slower
  const riskPenalty = 1 - Math.max(0, riskLevel - 30) / 250;           // up to ~28% slower
  const adjustedSpeed = Math.max(4, effectiveSpeed * congestionPenalty * riskPenalty);

  // Distance the ghost has covered since "now", clamped to route length.
  const distNm = Math.min(totalNm, adjustedSpeed * 24 * Math.max(0, daysAhead));

  // Walk the route to find ghost coords + leg heading.
  let walked = 0;
  for (let i = 0; i < legNm.length; i++) {
    const segEnd = walked + legNm[i];
    if (distNm <= segEnd) {
      const f = legNm[i] === 0 ? 0 : (distNm - walked) / legNm[i];
      const a = route[i];
      const b = route[i + 1];
      const pos = lerp(a, b, f);
      const heading = bearingDeg(a, b);
      // Buffer loss + ETA shift (minutes per day under penalty).
      const baselineSpeed = v.speedKnots || 12;
      const speedRatio = adjustedSpeed / baselineSpeed;
      const etaShiftHours = daysAhead * 24 * (1 / speedRatio - 1);
      const bufferLossDays = Math.max(0, etaShiftHours / 24);
      return { position: pos, heading, bufferLossDays, etaShiftHours };
    }
    walked = segEnd;
  }

  // Past the last waypoint — pin to destination.
  return {
    position: route[route.length - 1],
    heading: v.headingDeg,
    bufferLossDays: 0,
    etaShiftHours: 0,
  };
}

// ──────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────

interface Props {
  vessels: Vessel[];
  /** Allow caller to suppress overlay even in sim mode (Show/Hide toggle). */
  enabled: boolean;
  /** Highlight a single vessel — others render dimmer. */
  highlightVesselId?: string | null;
}

export function SimulationOverlay({ vessels, enabled, highlightVesselId }: Props) {
  const { isSimulationMode, sliders, getEffectiveSliders, currentDay } = useSimulation();

  const ghosts = useMemo(() => {
    if (!isSimulationMode || !enabled) return [];
    // currentDay starts at 1 in the sim context; "days ahead from now" = currentDay - 1
    const daysAhead = Math.max(0, currentDay - 1);

    return vessels.map((v) => {
      const eff = getEffectiveSliders(v.id);
      const projection = projectVessel(
        v,
        eff.vesselSpeed,
        eff.portCongestion,
        eff.riskLevel,
        daysAhead
      );
      return { vessel: v, projection };
    });
  }, [isSimulationMode, enabled, vessels, sliders, getEffectiveSliders, currentDay]);

  if (!isSimulationMode || !enabled) return null;

  return (
    <>
      {ghosts.map(({ vessel, projection }) => {
        const isHighlight = highlightVesselId === vessel.id;
        const dimmed = highlightVesselId !== null && !isHighlight;
        // Skip drawing the ghost if it has barely moved (visually noisy).
        const dx = projection.position[0] - vessel.position[0];
        const dy = projection.position[1] - vessel.position[1];
        const stillNear = Math.hypot(dx, dy) < 0.05;
        if (stillNear) return null;

        // Midpoint of the drift line for the metric label.
        const midpoint: [number, number] = [
          (vessel.position[0] + projection.position[0]) / 2,
          (vessel.position[1] + projection.position[1]) / 2,
        ];

        // Show the micro label only when impact is meaningful (>30 min) or
        // the vessel is the user's current focus. Prevents label clutter.
        const showMicroLabel =
          Math.abs(projection.etaShiftHours) >= 0.5 || isHighlight;

        return (
          <React.Fragment key={`ghost-${vessel.id}`}>
            {/* Drift line: real → projected. Hover reveals the "why". */}
            <Polyline
              positions={[vessel.position, projection.position]}
              pathOptions={{
                color: '#3b82f6',
                weight: 1.5,
                opacity: dimmed ? 0.18 : 0.45,
                dashArray: '4 5',
                lineCap: 'round',
              }}
            >
              {/* Sticky tooltip explains *why* the drift occurred. */}
              <Tooltip sticky direction="top" offset={[0, -4]} className="mim-tooltip">
                <strong>{vessel.name}</strong> · drift
                <br />
                ETA shift {projection.etaShiftHours >= 0 ? '+' : '−'}
                {Math.abs(projection.etaShiftHours).toFixed(1)}h
                <br />
                <span style={{ color: '#737373', fontSize: 10 }}>
                  Caused by: congestion · risk-driven slowdown
                </span>
              </Tooltip>
            </Polyline>

            {/* Decision-grade micro label at drift midpoint */}
            {showMicroLabel && (
              <Marker
                position={midpoint}
                icon={driftLabelIcon(projection.etaShiftHours, isHighlight)}
                interactive={false}
                keyboard={false}
              />
            )}

            {/* Ghost vessel marker */}
            <Marker
              position={projection.position}
              opacity={dimmed ? 0.35 : 1}
              icon={ghostIcon({ heading: projection.heading, status: vessel.status })}
              interactive
            >
              <Tooltip direction="top" offset={[0, -14]} className="mim-tooltip">
                <strong>{vessel.name}</strong> · simulated
                <br />
                Buffer −{projection.bufferLossDays.toFixed(1)}d · ETA{' '}
                {projection.etaShiftHours >= 0 ? '+' : ''}
                {projection.etaShiftHours.toFixed(1)}h
              </Tooltip>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
}
