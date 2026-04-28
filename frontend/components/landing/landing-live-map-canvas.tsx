'use client';

/**
 * landing-live-map-canvas.tsx
 *
 * The real, leaflet-powered theatre map for the landing page.
 *
 * Why a separate file (and `'use client'`):
 *   - Leaflet touches `window` on import, so it must be client-only.
 *   - The parent section (`landing-india-map.tsx`) is server-rendered
 *     and pulls this in via `next/dynamic({ ssr: false })`.
 *
 * Visual story (matches the brief):
 *   - Tiles: dark CARTO basemap (matches the in-app map for consistency)
 *   - Centered on the Persian Gulf → West India corridor
 *   - Hormuz "tension" zone rendered as a translucent red polygon
 *   - Two routes from Hormuz to BPCL Mumbai:
 *       · Original route  — red dashed (the "bad" path through the strait)
 *       · NEMO-optimized  — cyan solid arc (wider, safer, real)
 *   - Animated tanker dot interpolates along the NEMO route on a loop
 *   - Refineries pinned across India; BPCL Mumbai is the labelled hero
 *
 * Animation is rAF-driven (not interval) so it stays smooth and respects
 * `prefers-reduced-motion` (we kill the loop in that case).
 */

import 'leaflet/dist/leaflet.css';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  CircleMarker,
  Marker,
  Tooltip,
} from 'react-leaflet';
import L from 'leaflet';

/* ─── Geography ─────────────────────────────────────────────────── */

const HORMUZ: [number, number] = [26.566, 56.25];
const MUMBAI_BPCL: [number, number] = [19.04, 72.92]; // Mahul / Trombay refinery

/**
 * Indian refining backbone we want pinned. `primary: true` is the
 * BPCL Mumbai destination — labelled, larger, cyan.
 */
const REFINERIES: Array<{
  name: string;
  brand: string;
  lat: number;
  lng: number;
  primary?: boolean;
}> = [
  { name: 'BPCL Mumbai', brand: 'BPCL · 12.0 MMTPA', lat: 19.04, lng: 72.92, primary: true },
  { name: 'HPCL Mumbai', brand: 'HPCL · 9.5 MMTPA', lat: 19.06, lng: 72.91 },
  { name: 'Reliance Jamnagar', brand: 'RIL · 68.2 MMTPA', lat: 22.34, lng: 69.74 },
  { name: 'Nayara Vadinar', brand: 'Nayara · 20.0 MMTPA', lat: 22.46, lng: 69.69 },
  { name: 'BPCL Kochi', brand: 'BPCL · 15.5 MMTPA', lat: 9.97, lng: 76.27 },
  { name: 'MRPL Mangalore', brand: 'MRPL · 15.0 MMTPA', lat: 12.91, lng: 74.86 },
  { name: 'CPCL Chennai', brand: 'CPCL · 11.5 MMTPA', lat: 13.0, lng: 80.18 },
  { name: 'HPCL Visakhapatnam', brand: 'HPCL · 8.3 MMTPA', lat: 17.69, lng: 83.21 },
  { name: 'IOCL Paradip', brand: 'IOCL · 15.0 MMTPA', lat: 20.31, lng: 86.61 },
];

/**
 * Rough Hormuz "elevated risk" polygon — covers the narrow part of
 * the strait between Iran and Oman. Just an illustrative footprint;
 * production data would come from the threat-intel feed.
 */
const HORMUZ_ZONE: [number, number][] = [
  [26.95, 56.05],
  [26.85, 56.7],
  [26.0, 57.0],
  [25.6, 56.6],
  [25.55, 56.0],
  [26.2, 55.7],
];

/**
 * Original ("bad") route — straight south-east hugging the Iranian
 * coast through the strait. Drawn dashed red to signal "what we used
 * to do".
 */
const ORIGINAL_ROUTE: [number, number][] = [
  HORMUZ,
  [25.6, 58.0],
  [24.0, 61.0],
  [22.0, 65.0],
  [20.0, 69.0],
  [19.5, 71.5],
  MUMBAI_BPCL,
];

/**
 * NEMO-optimized route — drops further south into open Arabian Sea
 * around the danger envelope, then climbs back to Mumbai. Drawn solid
 * cyan as the "live" path the tanker actually takes.
 */
const OPTIMIZED_ROUTE: [number, number][] = [
  HORMUZ,
  [25.0, 57.0],
  [23.0, 59.0],
  [20.5, 61.0],
  [18.0, 63.5],
  [16.5, 66.0],
  [16.5, 69.0],
  [17.5, 71.0],
  [18.5, 72.4],
  MUMBAI_BPCL,
];

/* ─── Animated ship marker ──────────────────────────────────────── */

/**
 * Linear-interpolates a position along the optimized route given a
 * 0..1 progress value. Segment-by-segment so the path looks like a
 * real cumulative voyage rather than a constant-speed great circle.
 */
function pointOnRoute(progress: number): [number, number] {
  const route = OPTIMIZED_ROUTE;
  const segs = route.length - 1;
  const t = Math.min(Math.max(progress, 0), 0.9999) * segs;
  const i = Math.floor(t);
  const f = t - i;
  const a = route[i];
  const b = route[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

function buildShipIcon(): L.DivIcon {
  return L.divIcon({
    className: 'nemo-ship-icon',
    html: `
      <div style="position:relative; width:0; height:0;">
        <span style="
          position:absolute;
          left:-12px; top:-12px;
          width:24px; height:24px;
          border-radius:50%;
          background: radial-gradient(circle, rgba(34,211,238,0.55) 0%, rgba(34,211,238,0) 70%);
          animation: nemo-ship-ping 1.8s ease-out infinite;
        "></span>
        <span style="
          position:absolute;
          left:-5px; top:-5px;
          width:10px; height:10px;
          border-radius:50%;
          background:#22d3ee;
          box-shadow: 0 0 12px rgba(34,211,238,0.85), 0 0 24px rgba(34,211,238,0.45);
          border: 1.5px solid #0a0a0a;
        "></span>
      </div>
    `,
    iconSize: [0, 0],
  });
}

/* ─── Main canvas ───────────────────────────────────────────────── */

export default function LandingLiveMapCanvas() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Honour reduced-motion: ship parks at ~70% along the route.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setProgress(0.7);
      return;
    }

    let raf = 0;
    const DURATION = 16_000; // a full Hormuz→Mumbai loop in 16s
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) % DURATION;
      setProgress(elapsed / DURATION);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const shipPos = pointOnRoute(progress);

  return (
    <MapContainer
      center={[19.5, 64]}
      zoom={5}
      minZoom={4}
      maxZoom={7}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      zoomControl={false}
      attributionControl={false}
      style={{ height: '100%', width: '100%', background: '#050505' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution=""
      />

      {/* Hormuz tension envelope */}
      <Polygon
        positions={HORMUZ_ZONE}
        pathOptions={{
          color: '#ef4444',
          weight: 1.25,
          opacity: 0.85,
          fillColor: '#ef4444',
          fillOpacity: 0.18,
          dashArray: '4 4',
        }}
      />

      {/* Original route — abandoned */}
      <Polyline
        positions={ORIGINAL_ROUTE}
        pathOptions={{
          color: '#ef4444',
          weight: 1.25,
          opacity: 0.55,
          dashArray: '6 6',
        }}
      />

      {/* NEMO-optimized route — chosen */}
      <Polyline
        positions={OPTIMIZED_ROUTE}
        pathOptions={{
          color: '#22d3ee',
          weight: 2.5,
          opacity: 0.95,
        }}
      />

      {/* Hormuz strait pin */}
      <CircleMarker
        center={HORMUZ}
        radius={5}
        pathOptions={{
          color: '#ef4444',
          weight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.6,
        }}
      >
        <Tooltip permanent direction="top" offset={[0, -6]} className="nemo-leaflet-tip nemo-leaflet-tip-danger">
          Strait of Hormuz · risk 74/100
        </Tooltip>
      </CircleMarker>

      {/* Indian refineries */}
      {REFINERIES.map((r) => (
        <CircleMarker
          key={r.name}
          center={[r.lat, r.lng]}
          radius={r.primary ? 7 : 3.5}
          pathOptions={{
            color: r.primary ? '#22d3ee' : '#a3a3a3',
            weight: r.primary ? 2 : 1,
            fillColor: r.primary ? '#22d3ee' : '#262626',
            fillOpacity: r.primary ? 0.9 : 1,
          }}
        >
          <Tooltip
            permanent={r.primary}
            direction="top"
            offset={[0, r.primary ? -10 : -6]}
            className={`nemo-leaflet-tip ${r.primary ? 'nemo-leaflet-tip-primary' : ''}`}
          >
            {r.primary ? <strong>{r.name}</strong> : r.name}
            {r.primary ? (
              <>
                <br />
                <span style={{ opacity: 0.7 }}>{r.brand}</span>
              </>
            ) : null}
          </Tooltip>
        </CircleMarker>
      ))}

      {/* The animated tanker */}
      <Marker position={shipPos} icon={buildShipIcon()} interactive={false} />
    </MapContainer>
  );
}
