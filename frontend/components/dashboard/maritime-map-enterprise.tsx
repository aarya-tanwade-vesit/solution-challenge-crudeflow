'use client';

import React from 'react';
import MaritimeIntelligenceMap from '@/components/map/maritime-intelligence-map';
import type { Vessel as TypeVessel } from '@/types/vessel';
import type { Vessel as MapVessel } from '@/components/map/map-data';

interface Props {
  onVesselSelect?: (vessel: TypeVessel | null) => void;
}

/**
 * Dashboard "compact" wrapper around the canonical Maritime Intelligence
 * Map. Both the dashboard and the dedicated /map page now render the
 * SAME map component with the SAME data, so vessels, routes, ports and
 * risk zones stay in sync. The wrapper translates the map's own Vessel
 * shape to the legacy dashboard Vessel shape for downstream panels.
 */
function adaptVessel(v: MapVessel | null): TypeVessel | null {
  if (!v) return null;

  // Parse "DD/MM HH:mm IST" — fall back to 48h from now.
  const etaDate = (() => {
    const parsed = Date.parse(v.etaIst);
    return Number.isNaN(parsed) ? new Date(Date.now() + 48 * 3600_000) : new Date(parsed);
  })();

  // Derive risk-aligned exposures so downstream panels render meaningfully.
  const demurrageExposure = Math.round(
    (v.riskScore / 100) * 90_000 + (v.delayProbability / 100) * 60_000
  );
  const bufferImpact = -Math.max(0, (v.riskScore - 35) / 25);

  const status: TypeVessel['status'] =
    (v.status === 'high-risk' || v.status === 'highRisk' || v.status === 'critical')
      ? v.riskScore > 80
        ? 'critical'
        : 'at-risk'
      : v.status === 'delayed'
      ? 'delayed'
      : 'normal';

  const recommendedAction: TypeVessel['recommendedAction'] =
    v.riskScore > 65 ? 'reroute' : v.riskScore > 45 ? 'monitor' : 'none';

  return {
    id: v.id,
    name: v.name,
    imo: v.imo,
    mmsi: v.mmsi,
    flag: v.flag,
    type: 'Crude Tanker',
    dwt: v.dwt,
    grossTonnage: v.gt,
    netTonnage: v.nt,
    length: v.length,
    owner: v.isBpcl ? 'BPCL' : 'Third Party',
    commercialManager: v.isBpcl ? 'BPCL Trading' : '—',
    currentLocation: {
      lat: v.position[0],
      lng: v.position[1],
      timestamp: new Date(),
    },
    origin: v.origin,
    destination: v.destination,
    eta: etaDate,
    cargoVolume: Math.round(v.dwt * 7.33), // metric → barrels (approx for crude)
    cargoType: 'Crude',
    riskScore: v.riskScore,
    delayProbability: v.delayProbability,
    currentRoute: {
      waypoints: v.currentRoute.map(([lat, lng]) => ({ lat, lng })),
      distance: 0,
    },
    recommendedRoute: {
      waypoints: v.recommendedRoute.map(([lat, lng]) => ({ lat, lng })),
      distance: 0,
      rationale: 'AI-optimized risk-adjusted path',
    },
    recommendedAction,
    confidence: 88,
    demurrageExposure,
    bufferImpact: Number(bufferImpact.toFixed(1)),
    status,
    alerts: v.status === 'high-risk' ? ['High risk zone'] : v.status === 'delayed' ? ['Delayed ETA'] : [],
    workspaceId: 'bpcl-mumbai',
  };
}

export const MaritimeMapEnterprise: React.FC<Props> = ({ onVesselSelect }) => {
  return (
    <MaritimeIntelligenceMap
      compact
      onVesselSelect={(v) => onVesselSelect?.(adaptVessel(v))}
    />
  );
};
