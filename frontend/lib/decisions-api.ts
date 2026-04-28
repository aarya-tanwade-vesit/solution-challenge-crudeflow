import { apiGet, apiPost } from './api-client';
import type { DecisionRecord, DecisionStatus } from '@/contexts/decisions-context';

export type DecisionsResponse = {
  decisions: any[];
  metrics: any;
  count: number;
  asOf: string;
};

function parseTime(value?: string) {
  const time = value ? new Date(value).getTime() : Date.now();
  return Number.isNaN(time) ? Date.now() : time;
}

function adaptDecision(d: any): DecisionRecord {
  return {
    ...d,
    createdAt: parseTime(d.createdAt),
    resolvedAt: d.resolvedAt ? parseTime(d.resolvedAt) : undefined,
    evidence: d.evidence?.map((e: any) => ({
      ...e,
      timestamp: parseTime(e.timestamp)
    })),
    // Map backend categories if needed
    category: d.category || (d.type === 'RE-ROUTE' ? 'reroute' : 'schedule'),
    source: d.source === 'Module 2 Optimization Engine' ? 'live' : d.source || 'live',
    title: d.title || `${d.type}: ${d.vesselName || 'Unnamed Vessel'}`
  };
}

export async function getDecisions(status: string = 'all'): Promise<DecisionsResponse | null> {
  const data = await apiGet<DecisionsResponse | null>(`/decisions?status=${status}`, null);
  if (data) {
    return {
      ...data,
      decisions: data.decisions.map(adaptDecision)
    };
  }
  return null;
}

export async function setDecisionStatus(id: string, status: DecisionStatus, reason?: string) {
  return apiPost<any, any>(`/decisions/${id}/status`, { status, reason }, null);
}
