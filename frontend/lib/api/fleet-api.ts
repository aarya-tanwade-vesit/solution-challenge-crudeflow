import { apiGet, apiPost } from './client';
import { FLEET_SUMMARY_FALLBACK, FLEET_VESSELS_FALLBACK } from './fallbacks';
import type { Vessel } from '@/components/map/map-data';

export async function getFleetSummary() {
  return apiGet('/fleet/summary', FLEET_SUMMARY_FALLBACK);
}

export async function getFleetVessels() {
  // Backend returns an envelope like `{ vessels: Vessel[], count: number, ... }`.
  // Normalize here so pages can safely assume an array.
  const data = await apiGet<{ vessels: Vessel[] } | Vessel[]>('/fleet/vessels', FLEET_VESSELS_FALLBACK);
  return Array.isArray(data) ? data : data?.vessels ?? FLEET_VESSELS_FALLBACK;
}

export async function getVesselDetail(vesselId: string) {
  const vessels = await getFleetVessels();
  const vessel = vessels.find(v => v.id === vesselId);
  return apiGet<Vessel | null>(`/fleet/vessels/${vesselId}`, vessel || null);
}

export async function exportFleet(format: 'pdf' | 'excel' | 'csv') {
  return apiPost('/fleet/export', { format }, { success: true, jobId: 'export_' + Date.now() });
}
