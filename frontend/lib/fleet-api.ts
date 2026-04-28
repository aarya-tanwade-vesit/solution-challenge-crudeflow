import { apiGet } from './api-client';
import type { Vessel, Port, RiskZone, RaePin } from '@/components/map/map-data';

export interface FleetResponse {
  vessels: Vessel[];
  count: number;
  asOf: string;
}

export interface PortsResponse {
  ports: Port[];
  count: number;
  asOf: string;
}

export interface RiskZonesResponse {
  riskZones: RiskZone[];
  count: number;
  asOf: string;
}

export interface HistoricalMatchesResponse {
  historicalMatches: RaePin[];
  count: number;
  asOf: string;
}

export async function getFleet(): Promise<Vessel[]> {
  const data = await apiGet<FleetResponse | null>('/map/fleet', null);
  return data?.vessels || [];
}

export async function getPorts(): Promise<Port[]> {
  const data = await apiGet<PortsResponse | null>('/map/ports', null);
  return data?.ports || [];
}

export async function getRiskZones(): Promise<RiskZone[]> {
  const data = await apiGet<RiskZonesResponse | null>('/map/risk-zones', null);
  return data?.riskZones || [];
}

export async function getHistoricalMatches(): Promise<RaePin[]> {
  const data = await apiGet<HistoricalMatchesResponse | null>('/map/historical-matches', null);
  return data?.historicalMatches || [];
}
