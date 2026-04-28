import { apiGet, apiPost } from './client';
import { adaptDecisionState } from './adapters';

export type DecisionPayload = {
  decisionId?: string;
  vesselId?: string;
  approvedBy?: string;
  rejectedBy?: string;
  reason?: string;
};

export async function getDecisionVessel(id: string) {
  return apiGet<any | null>(`/decision/vessel/${id}`, null);
}

export async function getRouteComparison(id: string) {
  return apiGet<any | null>(`/decision/compare/${id}`, null);
}

export async function applyRoute(vesselId: string) {
  return apiPost<any | null, { vesselId: string }>('/decision/apply-route', { vesselId }, null);
}

export async function approveDecision(payload: DecisionPayload) {
  return apiPost<any | null, DecisionPayload>('/decision/approve', payload, null);
}

export async function rejectDecision(payload: DecisionPayload) {
  return apiPost<any | null, DecisionPayload>('/decision/reject', payload, null);
}

export async function getDecisionState() {
  const data = await apiGet<any | null>('/decision/active-state', null);
  return data ? adaptDecisionState(data) : null;
}

export async function getDecisionHistory() {
  return apiGet<any | null>('/decision/history', null);
}

