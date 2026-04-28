'use client';

/**
 * RouteComparisonOverlay
 * ──────────────────────
 * Renders a high-contrast visual diff between a vessel's CURRENT (AIS) route
 * and its AI-RECOMMENDED route. Designed to live as a child of <MapContainer>.
 *
 *   • Diff polygon  → translucent cyan fill marking the area between paths
 *   • Current route → solid red, full opacity (this is what's happening now)
 *   • AI route      → dashed cyan, full opacity (this is what's recommended)
 *   • Midpoint pins → small markers anchored to each route at the divergence
 *
 * Together they answer "what's the AI suggesting and how does it differ?"
 * in a single glance — without competing with the broader map context.
 */

import React, { useMemo } from 'react';
import { Polygon, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

import type { Vessel } from '../map-data';
import { compareRoutes } from './compare-routes';

interface Props {
  vessel: Vessel;
  /**
   * If true, the map auto-fits to the bounding box of both routes the
   * moment comparison opens — so the user sees the full divergence.
   */
  fitOnMount?: boolean;
}

// ──────────────────────────────────────────────────────────
// Camera fit on mount
// ──────────────────────────────────────────────────────────
function FitToRoutes({
  current,
  recommended,
}: {
  current: Array<[number, number]>;
  recommended: Array<[number, number]>;
}) {
  const map = useMap();
  useEffect(() => {
    const all = [...current, ...recommended];
    if (all.length < 2) return;
    const bounds = L.latLngBounds(all.map(([lat, lng]) => [lat, lng]));
    map.flyToBounds(bounds, {
      padding: [80, 80],
      duration: 0.7,
      maxZoom: 6.5,
    });
    // Run once per vessel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function RouteComparisonOverlay({ vessel, fitOnMount = true }: Props) {
  const cmp = useMemo(() => compareRoutes(vessel), [vessel]);

  if (!cmp.hasDivergence) return null;

  return (
    <>
      {fitOnMount && (
        <FitToRoutes
          current={vessel.currentRoute}
          recommended={vessel.recommendedRoute}
        />
      )}

      {/* Diff polygon — fills the area of divergence with a soft cyan tint */}
      {cmp.diffPolygon.length > 2 && (
        <Polygon
          positions={cmp.diffPolygon}
          pathOptions={{
            color: 'transparent',
            fillColor: '#06b6d4',
            fillOpacity: 0.08,
            interactive: false,
          }}
        />
      )}

      {/* Current (AIS) route — solid red, dominant */}
      <Polyline
        positions={vessel.currentRoute}
        pathOptions={{
          color: '#ef4444',
          weight: 3.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />

      {/* AI-recommended route — bold dashed cyan */}
      <Polyline
        positions={vessel.recommendedRoute}
        pathOptions={{
          color: '#06b6d4',
          weight: 3.5,
          opacity: 1,
          dashArray: '8 6',
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />

      {/* Endpoint pins — origin (green) and destination (blue) */}
      {vessel.currentRoute.length > 0 && (
        <CircleMarker
          center={vessel.currentRoute[0]}
          radius={5}
          pathOptions={{
            color: '#10b981',
            weight: 2,
            fillColor: '#0a0a0a',
            fillOpacity: 1,
          }}
        />
      )}
      {vessel.currentRoute.length > 0 && (
        <CircleMarker
          center={vessel.currentRoute[vessel.currentRoute.length - 1]}
          radius={5}
          pathOptions={{
            color: '#3b82f6',
            weight: 2,
            fillColor: '#0a0a0a',
            fillOpacity: 1,
          }}
        />
      )}
    </>
  );
}
