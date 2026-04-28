'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useKPI } from '@/contexts/kpi-context';
import type { Vessel, RiskZone } from '@/types/vessel';
import 'leaflet/dist/leaflet.css';

// Mock vessel data based on SECTION 6 spec
const mockVessels: Vessel[] = [
  {
    id: 'v1',
    name: 'MT Rajput',
    imo: '9876543',
    mmsi: '123456789',
    flag: 'IN',
    type: 'Crude Tanker',
    dwt: 318000,
    grossTonnage: 160000,
    netTonnage: 95000,
    length: 330,
    owner: 'BPCL',
    commercialManager: 'BPCL Trading',
    currentLocation: { lat: 24.5, lng: 54.5, timestamp: new Date() },
    origin: 'Ras Tanura',
    destination: 'Kochi',
    eta: new Date(Date.now() + 86400000 * 2),
    cargoVolume: 1200000,
    cargoType: 'Arab Light',
    riskScore: 75,
    delayProbability: 65,
    currentRoute: {
      waypoints: [
        { lat: 24.5, lng: 54.5 },
        { lat: 20.0, lng: 55.0 },
        { lat: 15.0, lng: 60.0 },
        { lat: 9.98, lng: 76.3 },
      ],
      distance: 2500,
    },
    recommendedRoute: {
      waypoints: [
        { lat: 24.5, lng: 54.5 },
        { lat: 20.0, lng: 56.0 },
        { lat: 12.0, lng: 65.0 },
        { lat: 9.98, lng: 76.3 },
      ],
      distance: 2200,
      rationale: 'Avoid Strait of Hormuz congestion',
    },
    recommendedAction: 'reroute',
    confidence: 87,
    demurrageExposure: 450000,
    bufferImpact: -1.2,
    status: 'at-risk',
    alerts: ['High risk zone detected', 'Delayed ETA expected'],
    workspaceId: 'bpcl-mumbai',
  },
  {
    id: 'v2',
    name: 'MT Yamuna',
    imo: '9876544',
    mmsi: '123456790',
    flag: 'IN',
    type: 'Crude Tanker',
    dwt: 298000,
    grossTonnage: 150000,
    netTonnage: 89000,
    length: 320,
    owner: 'BPCL',
    commercialManager: 'BPCL Trading',
    currentLocation: { lat: 22.0, lng: 62.0, timestamp: new Date() },
    origin: 'Ras Tanura',
    destination: 'Mumbai',
    eta: new Date(Date.now() + 86400000 * 4),
    cargoVolume: 900000,
    cargoType: 'Arab Medium',
    riskScore: 45,
    delayProbability: 35,
    currentRoute: { waypoints: [{ lat: 22.0, lng: 62.0 }, { lat: 19.0, lng: 72.8 }], distance: 2200 },
    recommendedRoute: { waypoints: [{ lat: 22.0, lng: 62.0 }, { lat: 19.0, lng: 72.8 }], distance: 2200, rationale: 'Optimal route' },
    recommendedAction: 'monitor',
    confidence: 72,
    demurrageExposure: 315000,
    bufferImpact: -0.8,
    status: 'normal',
    alerts: [],
    workspaceId: 'bpcl-mumbai',
  },
];

const mockRiskZones: RiskZone[] = [
  {
    id: 'rz1',
    name: 'Strait of Hormuz',
    type: 'geopolitical',
    severity: 'high',
    polygon: [
      { lat: 26.5, lng: 56.0 },
      { lat: 26.5, lng: 57.0 },
      { lat: 25.5, lng: 57.0 },
      { lat: 25.5, lng: 56.0 },
    ],
    description: 'Geopolitical tensions in region',
    affectedRoutes: ['current', 'recommended'],
    affectedVessels: ['v1'],
  },
  {
    id: 'rz2',
    name: 'Piracy Zone - Gulf of Aden',
    type: 'piracy',
    severity: 'high',
    polygon: [
      { lat: 11.0, lng: 48.0 },
      { lat: 11.0, lng: 52.0 },
      { lat: 13.0, lng: 52.0 },
      { lat: 13.0, lng: 48.0 },
    ],
    description: 'High piracy risk zone',
    affectedRoutes: ['current'],
    affectedVessels: ['v1'],
  },
];

// Custom vessel marker icons
const createVesselIcon = (status: string) => {
  const colors: Record<string, string> = {
    normal: '#10b981',
    delayed: '#f59e0b',
    'at-risk': '#ef4444',
    critical: '#dc2626',
  };

  return L.divIcon({
    html: `
      <div class="flex flex-col items-center gap-1">
        <div class="w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-lg" 
             style="background-color: ${colors[status] || '#10b981'}">
          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [28, 28],
    popupAnchor: [0, -14],
  });
};

interface MaritimeMapProps {
  onVesselSelect?: (vessel: Vessel) => void;
}

export function MaritimeIntelligenceMap({ onVesselSelect }: MaritimeMapProps) {
  const { kpiData } = useKPI();
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [vesselRoutes, setVesselRoutes] = useState<Record<string, any>>({});
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const mapRef = useRef(null);

  // Fetch realistic sea routes using searoute API
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const routes: Record<string, any> = {};

        for (const vessel of mockVessels) {
          try {
            // Fetch current route
            const currentRes = await fetch('/api/routes/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                originLat: vessel.currentLocation.lat,
                originLng: vessel.currentLocation.lng,
                destLat: vessel.currentLocation.lat + (vessel.destination === 'Kochi' ? -14 : -2),
                destLng: vessel.destination === 'Kochi' ? 76.3 : 72.8,
              }),
            });

            const currentData = await currentRes.json();
            routes[`${vessel.id}-current`] = currentData.waypoints || [];

            // Fetch recommended route
            const recommendedRes = await fetch('/api/routes/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                originLat: vessel.currentLocation.lat,
                originLng: vessel.currentLocation.lng,
                destLat: vessel.destination === 'Kochi' ? 9.98 : 19.0,
                destLng: vessel.destination === 'Kochi' ? 76.3 : 72.8,
              }),
            });

            const recommendedData = await recommendedRes.json();
            routes[`${vessel.id}-recommended`] = recommendedData.waypoints || [];
          } catch (error) {
            console.error(`[Maritime Map] Error fetching routes for ${vessel.name}:`, error);
            // Use fallback routes if API fails
            routes[`${vessel.id}-current`] = vessel.currentRoute?.waypoints || [];
            routes[`${vessel.id}-recommended`] = vessel.recommendedRoute?.waypoints || [];
          }
        }

        setVesselRoutes(routes);
      } catch (error) {
        console.error('[Maritime Map] Error in route fetching:', error);
        // Use mock vessel routes as fallback
        const fallbackRoutes: Record<string, any> = {};
        for (const vessel of mockVessels) {
          fallbackRoutes[`${vessel.id}-current`] = vessel.currentRoute?.waypoints || [];
          fallbackRoutes[`${vessel.id}-recommended`] = vessel.recommendedRoute?.waypoints || [];
        }
        setVesselRoutes(fallbackRoutes);
      } finally {
        setLoadingRoutes(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleVesselClick = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    onVesselSelect?.(vessel);
  };

  const statusColors: Record<string, string> = {
    normal: '#10b981',
    delayed: '#f59e0b',
    'at-risk': '#ef4444',
    critical: '#dc2626',
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Controls Header */}
      <div className="px-4 py-3 border-b border-[#404040] flex items-center justify-between bg-[#262626]">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-[#e5e5e5] transition-colors">
            <input
              type="checkbox"
              checked={showRiskZones}
              onChange={(e) => setShowRiskZones(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-[#a3a3a3]">Risk Zones</span>
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-[#e5e5e5] transition-colors">
            <input
              type="checkbox"
              checked={showRoutes}
              onChange={(e) => setShowRoutes(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-[#a3a3a3]">Routes</span>
          </label>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span>{mockVessels.length} active vessels</span>
          {loadingRoutes && <span className="text-[#666] ml-2">Loading routes...</span>}
        </div>
      </div>

      {/* Leaflet Map - Contained to prevent z-index leakage */}
      <div className="flex-1 relative overflow-hidden" style={{ isolation: 'isolate', zIndex: 0 }}>
        <MapContainer
          center={[18, 63]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-container"
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CartoDB'
            className="leaflet-tile-layer-dark"
          />

          {/* Risk Zones */}
          {showRiskZones &&
            mockRiskZones.map((zone) => (
              <Polyline
                key={zone.id}
                positions={zone.polygon.map((p) => [p.lat, p.lng])}
                color={zone.severity === 'high' ? '#ef4444' : '#f59e0b'}
                weight={2}
                dashArray="5, 5"
                fillColor={zone.severity === 'high' ? '#ef4444' : '#f59e0b'}
                fillOpacity={0.12}
                interactive={false}
              >
                <Popup>{zone.name}</Popup>
              </Polyline>
            ))}

          {/* Routes and Vessel Markers */}
          {mockVessels.map((vessel) => {
            const currentWaypoints = vesselRoutes[`${vessel.id}-current`] || vessel.currentRoute.waypoints;
            const recommendedWaypoints = vesselRoutes[`${vessel.id}-recommended`] || vessel.recommendedRoute?.waypoints || [];

            return (
              <React.Fragment key={vessel.id}>
                {/* Current Route - Dashed Orange */}
                {showRoutes && currentWaypoints && currentWaypoints.length > 0 && (
                  <Polyline
                    positions={currentWaypoints.map((p: any) => [p.lat, p.lng])}
                    color="#f97316"
                    weight={2.5}
                    dashArray="8, 5"
                    opacity={0.7}
                    interactive={false}
                  />
                )}

                {/* Recommended Route - Solid Blue */}
                {showRoutes && recommendedWaypoints && recommendedWaypoints.length > 0 && (
                  <Polyline
                    positions={recommendedWaypoints.map((p: any) => [p.lat, p.lng])}
                    color="#3b82f6"
                    weight={2.5}
                    opacity={0.9}
                    interactive={false}
                  />
                )}

                {/* Vessel Marker */}
                <Marker
                  position={[vessel.currentLocation.lat, vessel.currentLocation.lng]}
                  icon={createVesselIcon(vessel.status)}
                  eventHandlers={{
                    click: () => handleVesselClick(vessel),
                  }}
                >
                  <Popup className="vessel-popup">
                    <div className="text-xs space-y-2 w-60">
                      <div className="flex justify-between items-start border-b border-[#404040] pb-2">
                        <div>
                          <div className="font-bold text-[#e5e5e5]">{vessel.name}</div>
                          <div className="text-[#a3a3a3] text-xs">IMO: {vessel.imo}</div>
                        </div>
                        <span
                          className="px-2 py-1 rounded text-xs font-bold text-white"
                          style={{ backgroundColor: statusColors[vessel.status] }}
                        >
                          {vessel.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[#a3a3a3]">DWT:</span>
                          <div className="text-[#e5e5e5] font-mono text-xs">{(vessel.dwt / 1000).toFixed(0)}k</div>
                        </div>
                        <div>
                          <span className="text-[#a3a3a3]">Length:</span>
                          <div className="text-[#e5e5e5] font-mono text-xs">{vessel.length}m</div>
                        </div>
                      </div>

                      <div className="border-t border-[#404040] pt-2 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#a3a3a3]">{vessel.origin} → {vessel.destination}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a3a3a3]">ETA:</span>
                          <span className="text-[#e5e5e5] font-mono text-xs">{vessel.eta.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a3a3a3]">Risk:</span>
                          <span className="text-red-500 font-bold text-xs">{vessel.riskScore}%</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Vessel Details Footer */}
      {selectedVessel && (
        <div className="px-4 py-3 border-t border-[#404040] bg-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusColors[selectedVessel.status] }}
            ></div>
            <div className="text-xs">
              <div className="font-semibold text-[#e5e5e5]">{selectedVessel.name}</div>
              <div className="text-[#a3a3a3]">{selectedVessel.origin} → {selectedVessel.destination}</div>
            </div>
          </div>
          <div className="text-xs text-right">
            <div className="text-[#a3a3a3]">Demurrage Exposure</div>
            <div className="text-red-500 font-bold">${(selectedVessel.demurrageExposure / 1000000).toFixed(2)}M</div>
          </div>
        </div>
      )}
    </div>
  );
}
