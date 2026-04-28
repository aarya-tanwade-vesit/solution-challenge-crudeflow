'use client';

import 'leaflet/dist/leaflet.css';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Polygon,
  Popup,
  Tooltip,
  useMap,
} from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

import { VESSELS, PORTS, RISK_ZONES, RAE_PINS, type Vessel, Port } from './map-data';
import { vesselIcon, portIcon, raeIcon } from './map-icons';
import { ViewSwitcher, TILE_SOURCES, type MapView } from './view-switcher';
import { LayerControls, type MapLayers } from './layer-controls';
import { FilterHub, type MapFilters } from './filter-hub';
import { VesselDetailDrawer } from './vessel-detail-drawer';
import { MapLegend } from './map-legend';
import { LiveStatusPill } from './live-status-pill';
import { SimulationOverlay } from './simulation-overlay';
import { SimControlPanel } from './sim-control-panel';
import { TrackMiniLegend } from './track-mini-legend';
import { useVesselTrack } from './vessel-tracking/use-vessel-track';
import { VesselTrackLayers } from './vessel-tracking/vessel-track-layers';
import { TrackPlaybackBar } from './vessel-tracking/track-playback-bar';
import { RouteComparisonOverlay } from './route-comparison/route-comparison-overlay';
import { RouteComparisonCard } from './route-comparison/route-comparison-card';
import { compareRoutes } from './route-comparison/compare-routes';
import { useSimulation } from '@/contexts';
import { runModule2Optimization, type Module2RouteOption } from '@/lib/optimization-api';
import { getDecisions } from '@/lib/decisions-api';

const DEFAULT_CENTER: LatLngExpression = [18, 62];
const DEFAULT_ZOOM = 4;

const DEFAULT_FILTERS: MapFilters = {
  query: '',
  bpclOnly: false,
  statuses: [],
  types: [],
  destinationPort: null,
};

const DEFAULT_LAYERS: MapLayers = {
  vessels: true,
  currentRoutes: true,
  aiRoutes: true,
  riskZones: true,
  ports: true,
  historicMatches: true,
  costHeat: false,
};

// Imperative helper to let external actions fly the map.
function MapController({ focus }: { focus: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.flyTo(focus, Math.max(map.getZoom(), 6), { duration: 0.7 });
  }, [focus, map]);
  return null;
}

function riskZoneColor(severity: string) {
  switch (severity) {
    case 'critical':
      return '#ef4444';
    case 'high':
      return '#f97316';
    case 'medium':
      return '#f59e0b';
    default:
      return '#fbbf24';
  }
}

export interface MaritimeIntelligenceMapProps {
  /** Compact mode renders fewer controls — used inside the dashboard widget. */
  compact?: boolean;
  /** External vessel select handler — receives the live Vessel record or null. */
  onVesselSelect?: (vessel: Vessel | null) => void;
}

export default function MaritimeIntelligenceMap({
  compact = false,
  onVesselSelect,
}: MaritimeIntelligenceMapProps) {
  const { isSimulationMode } = useSimulation();
  const [module2Route, setModule2Route] = useState<Module2RouteOption | null>(null);
  const [view, setView] = useState<MapView>('dark');
  const [layers, setLayers] = useState<MapLayers>(DEFAULT_LAYERS);
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [focus, setFocus] = useState<[number, number] | null>(null);

  /** Tracking mode = explicit user request via the drawer's "Track" action. */
  const [trackingId, setTrackingId] = useState<string | null>(null);

  /**
   * Simulation overlay visibility — independent from sim mode itself so the
   * user can momentarily hide the overlay without leaving sim mode.
   */
  const [simOverlayEnabled, setSimOverlayEnabled] = useState(true);

  /**
   * Route comparison mode — when set to a vessel id, the map enters a focused
   * "current vs AI recommended" diff view. Mutually exclusive with tracking
   * mode; opening one closes the other to keep cognitive load low.
   */
  const [compareId, setCompareId] = useState<string | null>(null);

  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [historicMatches, setHistoricMatches] = useState<RaePin[]>([]);
  const [loading, setLoading] = useState(true);

  // When the operator approves an AI reroute, other parts of the UI broadcast
  // an event. The map listens and "commits" the cyan dotted route into the
  // vessel's solid current route.
  const [approvedAiRoutes, setApprovedAiRoutes] = useState<Record<string, true>>({});

  const buildApprovedRoute = useCallback(
    (vessel: Vessel, kind?: string): Array<[number, number]> => {
      if (kind === 'houston-kochi' || vessel.id === 'v-houston-voyager') {
        return [vessel.position, [16.5, 73.2], [13.8, 74.5], [9.96, 76.23]];
      }
      if (vessel.recommendedRoute?.length) {
        return [vessel.position, ...vessel.recommendedRoute.slice(1)];
      }
      if (vessel.currentRoute?.length) {
        return [vessel.position, ...vessel.currentRoute.slice(1)];
      }
      return [vessel.position];
    },
    []
  );

  useEffect(() => {
    const handler = (evt: Event) => {
      const detail = (evt as CustomEvent).detail as { vesselId?: string; kind?: string } | undefined;
      const vesselId = detail?.vesselId;
      if (!vesselId) return;

      setVessels((prev) => {
        const vessel = prev.find((v) => v.id === vesselId) || null;
        if (!vessel) return prev;

        const nextRoute = buildApprovedRoute(vessel, detail?.kind);

        // Commit: recommended → current route so it becomes solid.
        return prev.map((v) =>
          v.id === vesselId ? { ...v, currentRoute: nextRoute, recommendedRoute: nextRoute } : v
        );
      });

      setApprovedAiRoutes((prev) => ({ ...prev, [vesselId]: true }));
      setCompareId((prev) => (prev === vesselId ? null : prev));
    };

    window.addEventListener('crudeflow:route-approved', handler as EventListener);
    return () => window.removeEventListener('crudeflow:route-approved', handler as EventListener);
  }, [buildApprovedRoute]);

  // Hard source of truth: reflect approved reroutes from Decision Engine state.
  // This guarantees map correctness even if approval happened on another page.
  useEffect(() => {
    let active = true;

    const syncApprovedRoutes = async () => {
      try {
        const res = await getDecisions('all');
        if (!active || !res) return;

        const approved = res.decisions.filter(
          (d) =>
            (d.status === 'approved' || d.status === 'auto-approved') &&
            d.category === 'reroute' &&
            !!d.vesselId
        );

        const approvedIds = new Set(approved.map((d) => d.vesselId as string));
        if (!approvedIds.size) return;

        setApprovedAiRoutes((prev) => {
          const next = { ...prev };
          approvedIds.forEach((id) => {
            next[id] = true;
          });
          return next;
        });

        setVessels((prev) =>
          prev.map((v) => {
            if (!approvedIds.has(v.id)) return v;
            const nextRoute = buildApprovedRoute(v, v.id === 'v-houston-voyager' ? 'houston-kochi' : 'generic');
            return { ...v, currentRoute: nextRoute, recommendedRoute: nextRoute };
          })
        );
      } catch (error) {
        console.warn('[map] Could not sync approved routes from decisions', error);
      }
    };

    syncApprovedRoutes();
    const interval = window.setInterval(syncApprovedRoutes, 2000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [buildApprovedRoute]);

  // Fetch all map data on mount
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [v, p, r, h] = await Promise.all([
          import('@/lib/fleet-api').then(m => m.getFleet()),
          import('@/lib/fleet-api').then(m => m.getPorts()),
          import('@/lib/fleet-api').then(m => m.getRiskZones()),
          import('@/lib/fleet-api').then(m => m.getHistoricalMatches()),
        ]);
        if (cancelled) return;
        setVessels(v.length ? v : VESSELS);
        setPorts(p.length ? p : PORTS);
        setRiskZones(r.length ? r : RISK_ZONES);
        setHistoricMatches(h.length ? h : RAE_PINS);
      } catch (e) {
        console.error('Failed to fetch map data:', e);
        if (cancelled) return;
        setVessels(VESSELS);
        setPorts(PORTS);
        setRiskZones(RISK_ZONES);
        setHistoricMatches(RAE_PINS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Apply filters
  const visibleVessels = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const source = vessels.length ? vessels : VESSELS;
    return source.filter((v) => {
      // Basic data validation to prevent crashes
      if (!v.position || !Array.isArray(v.position) || v.position.length < 2) return false;
      if (v.position.some(c => typeof c !== 'number' || isNaN(c))) return false;

      if (filters.bpclOnly && !v.isBpcl) return false;
      const statusMatch = filters.statuses.length ? filters.statuses.includes(v.status) : true;
      if (!statusMatch) return false;
      if (filters.types.length && !filters.types.includes(v.type)) return false;
      if (filters.destinationPort && v.destination !== filters.destinationPort) return false;
      if (q) {
        const hay = `${v.name} ${v.imo} ${v.mmsi} ${v.origin} ${v.destination} ${v.flag}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [filters, vessels]);

  const selectedVessel: Vessel | null =
    visibleVessels.find((v) => v.id === selectedVesselId) ||
    (vessels.length ? vessels : VESSELS).find((v) => v.id === selectedVesselId) ||
    null;

  const trackedVessel: Vessel | null = trackingId
    ? (vessels.length ? vessels : VESSELS).find((v) => v.id === trackingId) ?? null
    : null;

  const compareVessel: Vessel | null = compareId
    ? (vessels.length ? vessels : VESSELS).find((v) => v.id === compareId) ?? null
    : null;

  useEffect(() => {
    if (!compareVessel) {
      setModule2Route(null);
      return;
    }

    let cancelled = false;
    runModule2Optimization(
      {
        vesselId: compareVessel.id,
        vesselName: compareVessel.name,
        origin: compareVessel.origin,
        destination: compareVessel.destination,
        vesselType: compareVessel.type as any,
        vesselSpeedKnots: compareVessel.speedKnots,
        portCongestion: 45, // Placeholder or from state
        weatherRisk: compareVessel.riskScore * 0.4,
        geopoliticalRisk: compareVessel.riskScore * 0.6,
        insurancePremiumIncreasePct: 5.0,
      },
      null
    ).then((result) => {
      if (cancelled) return;
      setModule2Route(result?.decision?.selectedRoute ?? result?.options?.[0] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [compareVessel]);

  const optimizedRouteLatLng = useMemo<Array<[number, number]> | null>(() => {
    if (!module2Route?.mapCoordinates?.length) return null;
    // Ensure all points are valid number pairs [lat, lng]
    return module2Route.mapCoordinates.filter(p =>
      Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number' && !isNaN(p[0]) && !isNaN(p[1])
    ) as Array<[number, number]>;
  }, [module2Route]);

  const compareDisplayVessel: Vessel | null = useMemo(() => {
    if (!compareVessel) return null;
    if (compareVessel.id !== 'V001' || !optimizedRouteLatLng?.length) return compareVessel;
    return { ...compareVessel, recommendedRoute: optimizedRouteLatLng };
  }, [compareVessel, optimizedRouteLatLng]);

  // ETA delta vs baseline — surfaced as a dynamic suffix on the "Impact" CTA.
  const selectedDelay = useMemo(() => {
    if (!selectedVessel) return null;
    const cmp = compareRoutes(selectedVessel);
    // Prefer comparison-derived hours; fall back to delay-probability proxy.
    const hours = cmp.timeSavedHours > 0
      ? -cmp.timeSavedHours
      : (selectedVessel.delayProbability / 100) * 24;
    if (Math.abs(hours) < 0.5) return null;
    return hours;
  }, [selectedVessel]);

  // Playback state for the tracked vessel (null when no vessel tracked).
  const playback = useVesselTrack(trackedVessel);

  // Color used for past path & playhead — matches vessel's status palette.
  const trackedColor = useMemo(() => {
    if (!trackedVessel) return '#10b981';
    return (trackedVessel.status === 'high-risk' || trackedVessel.status === 'highRisk' || trackedVessel.status === 'critical')
      ? '#ef4444'
      : trackedVessel.status === 'delayed'
        ? '#f59e0b'
        : '#10b981';
  }, [trackedVessel]);

  const tiles = TILE_SOURCES[view];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={3}
        maxZoom={tiles.maxZoom}
        scrollWheelZoom
        zoomControl={false}
        preferCanvas
        style={{
          height: '100%',
          width: '100%',
          background: view === 'light' ? '#e5e5e5' : '#060a14',
        }}
      >
        <TileLayer attribution={tiles.attribution} url={tiles.url} />

        <MapController focus={focus} />

        {/* Risk zones */}
        {layers.riskZones &&
          riskZones.map((z) => {
            const color = riskZoneColor(z.severity);
            return (
              <Polygon
                key={z.id}
                positions={z.polygon}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.14,
                  weight: 1.4,
                  dashArray: '4 4',
                }}
              >
                <Tooltip sticky direction="top" offset={[0, -4]} className="mim-tooltip">
                  <strong>{z.name}</strong> · {z.severity}
                </Tooltip>
                <Popup>
                  <div className="mim-popup">
                    <div className="mim-popup-title">{z.name}</div>
                    <div className="mim-popup-sub">
                      {z.type.toUpperCase()} · {z.severity.toUpperCase()}
                    </div>
                    <p className="mim-popup-body">{z.description}</p>
                    <div className="mim-popup-meta">
                      Vessels affected: <strong>{z.vesselsAffected}</strong>
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

        {/*
          Current routes — SOLID lines, color reflects vessel status.
          When simulation overlay is active, fade the original "reality"
          routes so the simulated drift can dominate visually.
        */}
        {/* Passed route: shown only for selected vessel as a solid line trace */}
        {selectedVesselId && visibleVessels
          .filter(v => v.id === selectedVesselId && v.pastRoute?.length > 0)
          .map(v => {
            // Only show the most recent 5 waypoints of the past route to "erase" distant history
            const shortenedPast = v.pastRoute.slice(-5);
            const color = (v.status === 'high-risk' || v.status === 'highRisk' || v.status === 'critical')
              ? '#ef4444'
              : v.status === 'delayed'
                ? '#f59e0b'
                : '#10b981';
            
            return (
              <Polyline
                key={`past-${v.id}`}
                positions={shortenedPast}
                pathOptions={{
                  color,
                  weight: 3.5,
                  opacity: 0.15,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            );
          })
        }

        {layers.currentRoutes &&
          visibleVessels
            .filter((v) => (v.id === selectedVesselId || !selectedVesselId || v.id === compareId) && v.currentRoute?.length > 0)
            .map((v) => {
              const approvedRerouteActive = !!approvedAiRoutes[v.id];
              const approvedRoute = approvedRerouteActive
                ? buildApprovedRoute(v, v.id === 'v-houston-voyager' ? 'houston-kochi' : 'generic')
                : null;
              const routeToDraw = approvedRoute?.length ? approvedRoute : v.currentRoute;

              const fadeForSim = isSimulationMode && simOverlayEnabled;
              const isSelected = v.id === selectedVesselId;
              const isComparing = v.id === compareId;
              
              // If something is selected, dim others unless they are comparing
              const opacity = isSelected ? 0.9 : (isComparing ? 0.3 : (selectedVesselId ? 0.15 : (fadeForSim ? 0.4 : 0.8)));
              const weight = isSelected ? 3.5 : 2.5;

              return (
                <Polyline
                  key={`curr-${v.id}`}
                  positions={routeToDraw}
                  pathOptions={{
                    color:
                      (v.status === 'high-risk' || v.status === 'highRisk' || v.status === 'critical')
                        ? '#ef4444'
                        : v.status === 'delayed'
                          ? '#f59e0b'
                          : '#10b981',
                    weight,
                    opacity,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              );
            })}

        {/* Cost-of-inaction glow on current routes */}
        {layers.costHeat &&
          visibleVessels
            .filter((v) => v.riskScore > 50 && v.currentRoute?.length > 0)
            .map((v) => {
              const approvedRoute = approvedAiRoutes[v.id]
                ? buildApprovedRoute(v, v.id === 'v-houston-voyager' ? 'houston-kochi' : 'generic')
                : null;
              const routeToDraw = approvedRoute?.length ? approvedRoute : v.currentRoute;
              return (
                <Polyline
                  key={`heat-${v.id}`}
                  positions={routeToDraw}
                  pathOptions={{
                    color: '#ef4444',
                    weight: 12,
                    opacity: 0.18,
                  }}
                />
              );
            })}

        {/*
          AI-recommended routes — DOTTED cyan.
          Hidden for the vessel currently being compared so the dedicated
          comparison overlay can take over with high-contrast styling.
        */}
        {layers.aiRoutes &&
          visibleVessels
            .filter((v) => 
              v.id !== compareId &&
              !approvedAiRoutes[v.id] &&
              (v.id === 'v-volgograd' || v.id === 'v-houston-voyager')
            )
            .map((v) => {
              // Ensure AI route starts from EXACT ship position
              let aiPoints = v.recommendedRoute;
              
              if (v.id === 'v-volgograd' && optimizedRouteLatLng?.length) {
                aiPoints = [v.position, ...optimizedRouteLatLng.slice(1)];
              } else if (v.id === 'v-houston-voyager') {
                // Houston diversion to Kochi
                // From current position towards Kochi waypoints
                aiPoints = [v.position, [16.5, 73.2], [13.8, 74.5], [9.96, 76.23]];
              }
              
              return (
                <Polyline
                  key={`rec-${v.id}`}
                  positions={aiPoints}
                  pathOptions={{
                    color: '#06b6d4',
                    weight: 3.5,
                    opacity: 0.95,
                    dashArray: '4 8',
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              );
            })}

        {/* Ports */}
        {layers.ports &&
          ports.filter(p => p.position && p.position.length >= 2).map((p) => (
            <Marker
              key={p.id}
              position={p.position}
              icon={portIcon({ congestionPct: p.congestionPct, isBpclHub: p.isBpclHub })}
            >
              <Tooltip direction="top" offset={[0, -10]} className="mim-tooltip">
                <strong>{p.name}</strong> · {p.congestionPct}% congestion
              </Tooltip>
              <Popup>
                <div className="mim-popup">
                  <div className="mim-popup-title">
                    {p.name}
                    {p.isBpclHub && <span className="mim-popup-badge">BPCL</span>}
                  </div>
                  <div className="mim-popup-sub">{p.country}</div>
                  <div className="mim-popup-stats">
                    <div>
                      <span>{p.vesselsWaiting}</span>
                      <small>Vessels waiting</small>
                    </div>
                    <div>
                      <span>{p.avgWaitHours}h</span>
                      <small>Avg wait</small>
                    </div>
                    <div>
                      <span>{p.jettyOccupancyPct}%</span>
                      <small>Jetty occ.</small>
                    </div>
                  </div>
                  <div className="mim-popup-meta">
                    Congestion: <strong>{p.congestionPct}%</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}


        {/*
          Vessels — fade non-focal vessels in either tracking OR comparison mode.
          Focal vessel (tracked OR compared) stays at full opacity.
        */}
        {layers.vessels &&
          visibleVessels.map((v) => {
            const focusId = trackingId ?? compareId;
            const isFocal = focusId === v.id;
            const dimmed = focusId !== null && !isFocal;
            return (
              <Marker
                key={v.id}
                position={v.position}
                opacity={dimmed ? 0.35 : 1}
                icon={vesselIcon({
                  status: v.status,
                  heading: v.headingDeg,
                  selected: v.id === selectedVesselId,
                  isBpcl: v.isBpcl,
                })}
                eventHandlers={{
                  click: () => {
                    setSelectedVesselId(v.id);
                    onVesselSelect?.(v);
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -14]} className="mim-tooltip">
                  <strong>{v.name}</strong>
                  <br />
                  ETA {v.etaIst} · {v.destination}
                </Tooltip>
              </Marker>
            );
          })}

        {/* Vessel tracking layers — past (solid) + future (dashed) + playhead */}
        {playback.track && playback.current && (
          <VesselTrackLayers
            track={playback.track}
            current={playback.current}
            autoFollow={playback.autoFollow}
            pastColor={trackedColor}
            projectionConfidence={playback.projectionConfidence}
          />
        )}

        {/*
          Simulation overlay — ghost vessels at projected positions plus
          dashed drift lines. Suppressed during route comparison to keep
          the diff view free of competing visual signals.
        */}
        {!compareId && (
          <SimulationOverlay
            vessels={visibleVessels}
            enabled={simOverlayEnabled}
            highlightVesselId={trackingId}
          />
        )}

        {/* Route comparison: high-contrast diff between current and AI routes */}
        {compareDisplayVessel && !approvedAiRoutes[compareDisplayVessel.id] && (
          <RouteComparisonOverlay
            vessel={compareDisplayVessel}
          />
        )}

        {/* Historic Matches (Rendered last to stay on top) */}
        {layers.historicMatches &&
          historicMatches.filter(pin => pin.position && pin.position.length >= 2).map((pin) => (
            <Marker key={pin.id} position={pin.position} icon={raeIcon({ match: pin.match })}>
              <Popup className="historic-match-popup">
                <div className="p-3 bg-[#0a0a0a] text-white min-w-[280px] rounded-lg">
                  <div className="text-[17px] font-bold mb-1 leading-tight">{pin.title}</div>
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-3">
                    {pin.date.toUpperCase()} · {pin.match}% SIMILARITY TO PRESENT
                  </div>
                  <div className="text-[13px] text-neutral-300 leading-relaxed font-medium">
                    {pin.summary}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* === FLOATING UI LAYER === */}

      {/* Top-left: Filter hub (full mode only) */}
      {!compact && (
        <div className="absolute top-4 left-4 z-[999] pointer-events-auto">
          <FilterHub
            filters={filters}
            onChange={setFilters}
            vesselCount={visibleVessels.length}
            totalVessels={vessels.length || VESSELS.length}
            ports={ports.map((p) => ({ id: p.id, name: p.name }))}
          />
        </div>
      )}

      {/* Top-center: live status (full mode only — dashboard already shows status) */}
      {!compact && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] pointer-events-auto">
          <LiveStatusPill isSimulation={isSimulationMode} vesselCount={visibleVessels.length} />
        </div>
      )}

      {/* Top-right: view switcher + layer controls */}
      <div className={`absolute top-3 right-3 z-[999] pointer-events-auto flex items-center gap-2`}>
        <ViewSwitcher view={view} onChange={setView} />
        {!compact && <LayerControls layers={layers} onChange={setLayers} />}
      </div>

      {/*
        Bottom-left: legend.
        ─ Tracking active  → mini contextual legend (Past / Projected / Waypoints)
        ─ Otherwise         → full layer legend
      */}
      {!compact && (
        <div className="absolute bottom-4 left-4 z-[999] pointer-events-auto">
          {trackingId ? (
            <TrackMiniLegend
              pastColor={trackedColor}
              showSimulated={isSimulationMode && simOverlayEnabled}
            />
          ) : (
            <MapLegend />
          )}
        </div>
      )}

      {/*
        Right-side floating sim control panel — only mounts when sim mode
        is active. Positioned below the view switcher / layer controls so
        all map controls cluster on the right edge.
      */}
      {!compact && (
        <div className="absolute top-16 right-3 z-[999] w-[210px]">
          <SimControlPanel
            overlayEnabled={simOverlayEnabled}
            onToggleOverlay={() => setSimOverlayEnabled((v) => !v)}
          />
        </div>
      )}

      {/* Bottom: playback bar (only when tracking is active).
          When the vessel drawer is open, leave room for it on the right. */}
      {!compact && playback.track && (
        <div
          className="absolute bottom-3 left-3 z-[999] pointer-events-none"
          style={{ right: selectedVessel ? 396 : 12 }}
        >
          <TrackPlaybackBar
            track={playback.track}
            t={playback.t}
            isPlaying={playback.isPlaying}
            speed={playback.speed}
            autoFollow={playback.autoFollow}
            playable={playback.playable}
            projectionConfidence={playback.projectionConfidence}
            onPlayPause={playback.toggle}
            onSeek={playback.seek}
            onJumpToStart={playback.jumpToStart}
            onJumpToCurrent={playback.jumpToCurrent}
            onJumpToEnd={playback.jumpToEnd}
            onSpeedChange={playback.setSpeed}
            onAutoFollowToggle={() => playback.setAutoFollow(!playback.autoFollow)}
            onClose={() => setTrackingId(null)}
          />
        </div>
      )}

      {/*
        Floating route-comparison summary card. Anchored bottom-center so it
        sits clear of right-side controls and the bottom-left legend. Z-index
        keeps it above Leaflet but below modal layers.
      */}
      {!compact && compareDisplayVessel && !approvedAiRoutes[compareDisplayVessel.id] && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1001]">
          <RouteComparisonCard
            vessel={compareDisplayVessel}
            onClose={() => setCompareId(null)}
          />
        </div>
      )}

      {/* Vessel detail drawer (full mode only — dashboard renders its own panel) */}
      {!compact && (
        <VesselDetailDrawer
          vessel={selectedVessel}
          isTracking={selectedVessel?.id === trackingId}
          isComparing={selectedVessel?.id === compareId}
          impactDeltaHours={selectedDelay}
          onClose={() => {
            setSelectedVesselId(null);
            onVesselSelect?.(null);
          }}
          onFocus={(c) => setFocus(c)}
          onTrack={() => {
            if (!selectedVessel) return;
            setTrackingId(selectedVessel.id);
            // Tracking and comparison are mutually exclusive (cleaner UX).
            setCompareId(null);
          }}
          onUntrack={() => setTrackingId(null)}
          onCompareRoutes={() => {
            if (!selectedVessel) return;
            setCompareId(selectedVessel.id);
            setTrackingId(null);
          }}
          onStopComparing={() => setCompareId(null)}
        />
      )}

      {/* Scoped Leaflet overrides */}
      <style jsx global>{`
        .leaflet-container {
          font-family: inherit;
          background: transparent !important;
        }
        .leaflet-control-attribution {
          background: rgba(10, 10, 10, 0.7) !important;
          color: #525252 !important;
          font-size: 9px !important;
          backdrop-filter: blur(4px);
          padding: 2px 6px !important;
          border-radius: 4px 0 0 0;
        }
        .leaflet-control-attribution a {
          color: #737373 !important;
        }

        .leaflet-tooltip.mim-tooltip {
          background: rgba(15, 15, 15, 0.95);
          color: #e5e5e5;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 11px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(6px);
        }
        .leaflet-tooltip.mim-tooltip::before {
          display: none;
        }
        .leaflet-tooltip-top.mim-tooltip:before {
          display: none;
        }

        .leaflet-popup-content-wrapper {
          background: rgba(15, 15, 15, 0.98) !important;
          color: #e5e5e5 !important;
          border: 1px solid #2a2a2a;
          border-radius: 8px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(10px);
        }
        .leaflet-popup-content {
          margin: 0 !important;
          min-width: 220px;
        }
        .leaflet-popup-tip {
          background: #0f0f0f !important;
          border: 1px solid #2a2a2a;
        }
        .leaflet-popup-close-button {
          color: #737373 !important;
          padding: 6px 8px 0 0 !important;
        }
        .leaflet-popup-close-button:hover {
          color: #e5e5e5 !important;
        }

        .mim-popup {
          padding: 12px 14px;
        }
        .mim-popup-title {
          font-size: 13px;
          font-weight: 700;
          color: #e5e5e5;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mim-popup-badge {
          font-size: 9px;
          font-weight: 700;
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          padding: 2px 6px;
          border-radius: 3px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .mim-popup-sub {
          font-size: 10px;
          color: #737373;
          margin-top: 2px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .mim-popup-body {
          font-size: 11px;
          color: #a3a3a3;
          margin: 8px 0 0 0;
          line-height: 1.5;
        }
        .mim-popup-meta {
          font-size: 10px;
          color: #737373;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #1f1f1f;
        }
        .mim-popup-meta strong {
          color: #e5e5e5;
        }
        .mim-popup-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-top: 10px;
        }
        .mim-popup-stats > div {
          background: #0a0a0a;
          border: 1px solid #1f1f1f;
          border-radius: 4px;
          padding: 6px;
          text-align: center;
        }
        .mim-popup-stats span {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #e5e5e5;
        }
        .mim-popup-stats small {
          font-size: 9px;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        @keyframes portPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes portPulseHigh {
          0%, 100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.5)); }
          50% { transform: scale(1.15); opacity: 0.9; filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.8)); }
        }
        .port-pulse { animation: portPulse 3s ease-in-out infinite; }
        .port-pulse-high { animation: portPulseHigh 1.8s ease-in-out infinite; }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slideInRight 220ms ease-out; }
      `}</style>
    </div>
  );
}
