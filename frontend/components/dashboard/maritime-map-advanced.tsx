'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useKPI } from '@/contexts/kpi-context';
import type { Vessel, RiskZone } from '@/types/vessel';
import { createEnterpriseVesselIcon, createRiskZoneIcon } from '@/utils/maritime-icons';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Mock vessel data
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

// Use enterprise vessel icons with vessel type support
const getVesselTypeForIcon = (vesselType: string): string => {
  const typeMap: Record<string, string> = {
    'Crude Tanker': 'Tanker',
    'Product Tanker': 'Tanker',
    'LNG Carrier': 'LNGCarrier',
    'General Cargo': 'CargoShip',
  };
  return typeMap[vesselType] || 'Tanker';
};

interface MaritimeMapAdvancedProps {
  onVesselSelect?: (vessel: Vessel) => void;
}

interface MapFilters {
  showRiskZones: boolean;
  showRoutes: boolean;
  showWeather: boolean;
  showCongestion: boolean;
  showETACorridor: boolean;
  riskLevel: 'all' | 'high' | 'medium' | 'low';
  vesselStatus: 'all' | 'normal' | 'delayed' | 'at-risk' | 'critical';
}

export function MaritimeIntelligenceMapAdvanced({ onVesselSelect }: MaritimeMapAdvancedProps) {
  const { kpiData } = useKPI();
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [filters, setFilters] = useState<MapFilters>({
    showRiskZones: true,
    showRoutes: true,
    showWeather: true,
    showCongestion: true,
    showETACorridor: false,
    riskLevel: 'all',
    vesselStatus: 'all',
  });
  const [vesselRoutes, setVesselRoutes] = useState<Record<string, any>>({});
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [expandedControls, setExpandedControls] = useState(false);
  const mapRef = useRef(null);

  // Fetch realistic sea routes
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const routes: Record<string, any> = {};

        for (const vessel of mockVessels) {
          try {
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
            routes[`${vessel.id}-current`] = vessel.currentRoute?.waypoints || [];
            routes[`${vessel.id}-recommended`] = vessel.recommendedRoute?.waypoints || [];
          }
        }

        setVesselRoutes(routes);
      } catch (error) {
        console.error('[Maritime Map] Error in route fetching:', error);
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

  // Filter vessels based on current filters
  const filteredVessels = mockVessels.filter((vessel) => {
    if (filters.vesselStatus !== 'all' && vessel.status !== filters.vesselStatus) return false;
    if (filters.riskLevel === 'high' && vessel.riskScore < 70) return false;
    if (filters.riskLevel === 'medium' && (vessel.riskScore < 40 || vessel.riskScore >= 70)) return false;
    if (filters.riskLevel === 'low' && vessel.riskScore >= 40) return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    normal: '#10b981',
    delayed: '#f59e0b',
    'at-risk': '#ef4444',
    critical: '#dc2626',
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Advanced Controls Header */}
      <div className="px-4 py-3 border-b border-[#404040] bg-[#262626] space-y-3">
        {/* Main Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Map Controls</h3>
            <button
              onClick={() => setExpandedControls(!expandedControls)}
              className="text-[#737373] hover:text-[#e5e5e5] transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform ${expandedControls ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>{filteredVessels.length} active vessels</span>
            {loadingRoutes && <span className="text-[#666] ml-2">Loading routes...</span>}
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="grid grid-cols-5 gap-3">
          <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-[#e5e5e5] transition-colors">
            <input
              type="checkbox"
              checked={filters.showRiskZones}
              onChange={(e) => setFilters({ ...filters, showRiskZones: e.target.checked })}
              className="w-4 h-4 cursor-pointer accent-[#3b82f6]"
            />
            <span className="text-[#a3a3a3]">Risk Zones</span>
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-[#e5e5e5] transition-colors">
            <input
              type="checkbox"
              checked={filters.showRoutes}
              onChange={(e) => setFilters({ ...filters, showRoutes: e.target.checked })}
              className="w-4 h-4 cursor-pointer accent-[#3b82f6]"
            />
            <span className="text-[#a3a3a3]">Routes</span>
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-[#e5e5e5] transition-colors">
            <input
              type="checkbox"
              checked={filters.showWeather}
              onChange={(e) => setFilters({ ...filters, showWeather: e.target.checked })}
              className="w-4 h-4 cursor-pointer accent-[#3b82f6]"
            />
            <span className="text-[#a3a3a3]">Weather</span>
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-[#e5e5e5] transition-colors">
            <input
              type="checkbox"
              checked={filters.showCongestion}
              onChange={(e) => setFilters({ ...filters, showCongestion: e.target.checked })}
              className="w-4 h-4 cursor-pointer accent-[#3b82f6]"
            />
            <span className="text-[#a3a3a3]">Congestion</span>
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer hover:text-[#e5e5e5] transition-colors">
            <input
              type="checkbox"
              checked={filters.showETACorridor}
              onChange={(e) => setFilters({ ...filters, showETACorridor: e.target.checked })}
              className="w-4 h-4 cursor-pointer accent-[#3b82f6]"
            />
            <span className="text-[#a3a3a3]">ETA Corridors</span>
          </label>
        </div>

        {/* Expanded Filters */}
        {expandedControls && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#404040]">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#525252] font-semibold block mb-2">
                Risk Level
              </label>
              <select
                value={filters.riskLevel}
                onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value as any })}
                className="w-full px-2 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-xs text-[#e5e5e5] hover:border-[#404040] transition-colors"
              >
                <option value="all">All Levels</option>
                <option value="high">High Risk Only</option>
                <option value="medium">Medium Risk Only</option>
                <option value="low">Low Risk Only</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#525252] font-semibold block mb-2">
                Vessel Status
              </label>
              <select
                value={filters.vesselStatus}
                onChange={(e) => setFilters({ ...filters, vesselStatus: e.target.value as any })}
                className="w-full px-2 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-xs text-[#e5e5e5] hover:border-[#404040] transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="normal">Normal</option>
                <option value="delayed">Delayed</option>
                <option value="at-risk">At Risk</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Leaflet Map Container */}
      <div className="flex-1 relative overflow-hidden" style={{ isolation: 'isolate', zIndex: 0 }}>
        <MapContainer
          center={[18, 63]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-container z-0"
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CartoDB'
            className="leaflet-tile-layer-dark"
          />

          {/* Risk Zones Layer */}
          {filters.showRiskZones && (
            <LayerGroup>
              {mockRiskZones.map((zone) => (
                <Polyline
                  key={zone.id}
                  positions={zone.polygon.map((p) => [p.lat, p.lng] as L.LatLngExpression)}
                  color={zone.severity === 'high' ? '#ef4444' : '#f59e0b'}
                  weight={2.5}
                  dashArray="5, 5"
                  fillColor={zone.severity === 'high' ? '#ef4444' : '#f59e0b'}
                  fillOpacity={0.15}
                >
                  <Popup className="risk-zone-popup">
                    <div className="text-xs space-y-2 w-48">
                      <div className="font-bold text-[#e5e5e5]">{zone.name}</div>
                      <div className="text-[#a3a3a3]">{zone.description}</div>
                      <div className="flex items-center gap-2 text-[10px] text-[#525252]">
                        <span className="text-[#a3a3a3]">Type:</span>
                        <span className="capitalize">{zone.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-[#a3a3a3]">Severity:</span>
                        <span
                          className={`font-semibold ${
                            zone.severity === 'high' ? 'text-red-400' : 'text-amber-400'
                          }`}
                        >
                          {zone.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              ))}
            </LayerGroup>
          )}

          {/* Clustered Vessel Markers */}
          <MarkerClusterGroup
            chunkedLoading
            disableClusteringAtZoom={8}
            maxClusterRadius={80}
          >
            {filteredVessels.map((vessel) => {
              const currentWaypoints = vesselRoutes[`${vessel.id}-current`] || vessel.currentRoute?.waypoints || [];
              const recommendedWaypoints = vesselRoutes[`${vessel.id}-recommended`] || vessel.recommendedRoute?.waypoints || [];

              return (
                <React.Fragment key={vessel.id}>
                  {/* Routes */}
                  {filters.showRoutes && (
                    <>
                      {currentWaypoints && currentWaypoints.length > 0 && (
                        <Polyline
                          positions={currentWaypoints.map((p: any) => [p.lat, p.lng] as L.LatLngExpression)}
                          color="#f97316"
                          weight={2.5}
                          dashArray="8, 5"
                          opacity={0.6}
                          interactive={false}
                        />
                      )}
                      {recommendedWaypoints && recommendedWaypoints.length > 0 && (
                        <Polyline
                          positions={recommendedWaypoints.map((p: any) => [p.lat, p.lng] as L.LatLngExpression)}
                          color="#3b82f6"
                          weight={2.5}
                          opacity={0.8}
                          interactive={false}
                        />
                      )}
                    </>
                  )}

                  {/* Vessel Marker */}
                  <Marker
                    position={[vessel.currentLocation.lat, vessel.currentLocation.lng] as L.LatLngExpression}
                    icon={createEnterpriseVesselIcon(vessel.status, vessel.type)}
                    eventHandlers={{
                      click: () => handleVesselClick(vessel),
                    }}
                  >
                    <Popup className="vessel-popup-enhanced" maxWidth={320} minWidth={280}>
                      <div className="text-xs space-y-3 bg-[#1a1a1a] rounded-lg">
                        {/* Header with Status */}
                        <div className="flex justify-between items-start border-b border-[#404040] pb-2">
                          <div>
                            <div className="font-bold text-[#e5e5e5] text-sm">{vessel.name}</div>
                            <div className="text-[#a3a3a3] text-xs mt-0.5">IMO: {vessel.imo}</div>
                          </div>
                          <span
                            className="px-2 py-1 rounded text-xs font-bold text-white whitespace-nowrap"
                            style={{ backgroundColor: statusColors[vessel.status] }}
                          >
                            {vessel.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Vessel Details Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#262626] p-2 rounded">
                            <span className="text-[#525252] text-[10px]">DWT</span>
                            <div className="text-[#e5e5e5] font-mono text-xs font-semibold">{(vessel.dwt / 1000).toFixed(0)}k</div>
                          </div>
                          <div className="bg-[#262626] p-2 rounded">
                            <span className="text-[#525252] text-[10px]">Length</span>
                            <div className="text-[#e5e5e5] font-mono text-xs font-semibold">{vessel.length}m</div>
                          </div>
                          <div className="bg-[#262626] p-2 rounded">
                            <span className="text-[#525252] text-[10px]">Type</span>
                            <div className="text-[#e5e5e5] text-xs font-semibold">{vessel.type}</div>
                          </div>
                          <div className="bg-[#262626] p-2 rounded">
                            <span className="text-[#525252] text-[10px]">Cargo</span>
                            <div className="text-[#e5e5e5] text-xs font-semibold">{(vessel.cargoVolume / 1000000).toFixed(1)}M bbl</div>
                          </div>
                        </div>

                        {/* Route & ETA */}
                        <div className="border-t border-[#404040] pt-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[#a3a3a3] text-xs">{vessel.origin} → {vessel.destination}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#a3a3a3] text-xs">ETA:</span>
                            <span className="text-[#e5e5e5] font-mono text-xs font-semibold">{vessel.eta.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#a3a3a3] text-xs">Delay Prob:</span>
                            <span className={`font-semibold text-xs ${vessel.delayProbability > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {vessel.delayProbability}%
                            </span>
                          </div>
                        </div>

                        {/* Risk & Financial */}
                        <div className="border-t border-[#404040] pt-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[#a3a3a3] text-xs">Risk Score:</span>
                            <span className={`font-bold text-xs ${vessel.riskScore > 70 ? 'text-red-400' : vessel.riskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {vessel.riskScore}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#a3a3a3] text-xs">Demurrage:</span>
                            <span className="text-red-400 font-mono text-xs font-semibold">${(vessel.demurrageExposure / 1000).toFixed(0)}K</span>
                          </div>
                        </div>

                        {/* Alerts */}
                        {vessel.alerts.length > 0 && (
                          <div className="border-t border-[#404040] pt-2 space-y-1">
                            <span className="text-[#a3a3a3] text-xs font-semibold">Alerts:</span>
                            {vessel.alerts.map((alert, i) => (
                              <div key={i} className="text-[10px] text-amber-400 flex items-start gap-1">
                                <span className="text-amber-400 mt-0.5">•</span>
                                <span>{alert}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="border-t border-[#404040] pt-2 flex gap-2">
                          <button className="flex-1 px-2 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-semibold rounded transition-colors">
                            View Details
                          </button>
                          <button className="flex-1 px-2 py-1.5 bg-[#262626] hover:bg-[#2f2f2f] text-[#a3a3a3] text-xs font-semibold rounded border border-[#3a3a3a] transition-colors">
                            Track
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Selected Vessel Footer */}
      {selectedVessel && (
        <div className="px-4 py-4 border-t border-[#404040] bg-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: statusColors[selectedVessel.status] }}
            ></div>
            <div className="flex-1">
              <div className="font-semibold text-[#e5e5e5] text-sm">{selectedVessel.name}</div>
              <div className="text-[#a3a3a3] text-xs">{selectedVessel.origin} → {selectedVessel.destination}</div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <div className="text-[#a3a3a3] text-xs">Risk Score</div>
              <div className={`font-bold text-sm ${selectedVessel.riskScore > 70 ? 'text-red-400' : 'text-amber-400'}`}>
                {selectedVessel.riskScore}%
              </div>
            </div>
            <div>
              <div className="text-[#a3a3a3] text-xs">Demurrage Exposure</div>
              <div className="text-red-400 font-bold text-sm">${(selectedVessel.demurrageExposure / 1000000).toFixed(2)}M</div>
            </div>
            <button
              onClick={() => setSelectedVessel(null)}
              className="text-[#737373] hover:text-[#e5e5e5] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
