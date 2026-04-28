import { apiGet } from './api-client';
import type { KPIData } from '@/types/kpi';
import type { ActivityEvent } from '@/contexts/activity-feed-context';
import type {
  AffectedEntity,
  RiskContributor,
  SuggestedFocus,
  SystemStatus,
} from '@/contexts/system-status-context';
import type { DecisionRecord } from '@/contexts/decisions-context';

type BackendKPIData = Omit<
  KPIData,
  'timestamp' | 'demurrageForecast' | 'bufferDaysRemaining' | 'maritimeRiskIndex' | 'costOfInaction'
> & {
  asOf?: string;
  timestamp?: string;
  demurrageForecast: Omit<KPIData['demurrageForecast'], 'timestamp'> & { updatedAt?: string };
  bufferDaysRemaining: Omit<KPIData['bufferDaysRemaining'], 'timestamp' | 'incomingShipments'> & {
    updatedAt?: string;
    incomingShipments: Array<{
      vesselName: string;
      etaDate: string;
      cargoVolume: number;
    }>;
  };
  maritimeRiskIndex: Omit<KPIData['maritimeRiskIndex'], 'timestamp' | 'breakdown'> & {
    updatedAt?: string;
    breakdown: {
      geopolitical: number;
      weather: number;
      congestion: number;
      routeSecurity?: number;
      insurance?: number;
      weights?: Record<string, number>;
    };
  };
  costOfInaction: Omit<KPIData['costOfInaction'], 'timestamp'> & { updatedAt?: string };
};

type DashboardSummary = {
  status?: SystemStatus;
  affectedRoutes?: Array<{ from?: string; to?: string; routeName?: string; risk?: string; status?: string }>;
  impactTrajectory?: Array<{ hour: number; avgDelayHours: number; productionRisk: number }>;
  asOf?: string;
};

export type SystemStatusData = {
  status: SystemStatus;
  systemScore?: number;
  lastUpdated: Date;
  riskContributors: RiskContributor[];
  affectedEntities: AffectedEntity[];
  affectedRoutes: Array<{ from: string; to: string; risk: string }>;
  impactProjection: {
    avgDelay: string;
    productionRisk: string;
    confidence?: number;
  };
  suggestedFocus: SuggestedFocus[];
};

type BackendSystemStatus = Omit<SystemStatusData, 'lastUpdated'> & {
  lastUpdated: string;
};

type BackendActivity = {
  events: Array<Omit<ActivityEvent, 'timestamp'> & { timestamp: string }>;
  unreadCount: number;
  asOf?: string;
};

type BackendDecisionEngine = {
  pendingCount: number;
  criticalCount: number;
  topDecision: Omit<DecisionRecord, 'createdAt' | 'resolvedAt' | 'evidence'> & {
    createdAt: string;
    resolvedAt?: string;
    evidence?: Array<Omit<NonNullable<DecisionRecord['evidence']>[number], 'timestamp'> & { timestamp: string }>;
  };
};

function parseDate(value?: string) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function parseTime(value?: string) {
  const time = value ? new Date(value).getTime() : Date.now();
  return Number.isNaN(time) ? Date.now() : time;
}

function adaptKpis(data: BackendKPIData): KPIData {
  const timestamp = parseDate(data.asOf || data.timestamp);

  return {
    demurrageForecast: {
      ...data.demurrageForecast,
      timestamp: parseDate(data.demurrageForecast.updatedAt) || timestamp,
    },
    bufferDaysRemaining: {
      ...data.bufferDaysRemaining,
      timestamp: parseDate(data.bufferDaysRemaining.updatedAt) || timestamp,
      incomingShipments: data.bufferDaysRemaining.incomingShipments.map((shipment) => ({
        ...shipment,
        etaDate: parseDate(shipment.etaDate),
      })),
    },
    maritimeRiskIndex: {
      ...data.maritimeRiskIndex,
      timestamp: parseDate(data.maritimeRiskIndex.updatedAt) || timestamp,
      breakdown: {
        geopolitical: data.maritimeRiskIndex.breakdown.geopolitical,
        weather: data.maritimeRiskIndex.breakdown.weather,
        congestion: data.maritimeRiskIndex.breakdown.congestion,
        routeSecurity:
          data.maritimeRiskIndex.breakdown.routeSecurity ??
          data.maritimeRiskIndex.breakdown.insurance ??
          0,
        weights: {
          geopolitical: 0.4,
          weather: 0.2,
          congestion: 0.2,
          routeSecurity: 0.2,
        },
      },
    },
    costOfInaction: {
      ...data.costOfInaction,
      timestamp: parseDate(data.costOfInaction.updatedAt) || timestamp,
    },
    timestamp,
    workspaceId: data.workspaceId,
    isSimulated: data.isSimulated,
  };
}

function adaptSystemStatus(status: BackendSystemStatus, summary: DashboardSummary | null): SystemStatusData {
  const summaryRoutes = summary?.affectedRoutes?.map((route) => {
    if (route.from && route.to) {
      return { from: route.from, to: route.to, risk: route.risk || route.status || 'MEDIUM' };
    }

    const [from = 'Unknown', to = 'Unknown'] = (route.routeName || '').split(/\s*→\s*/);
    return { from, to, risk: route.risk || route.status || 'MEDIUM' };
  });

  return {
    ...status,
    lastUpdated: parseDate(status.lastUpdated || summary?.asOf),
    affectedRoutes: status.affectedRoutes?.length ? status.affectedRoutes : summaryRoutes || [],
  };
}

function adaptActivity(data: BackendActivity): ActivityEvent[] {
  return data.events.map((event) => ({
    ...event,
    timestamp: parseDate(event.timestamp),
  }));
}

function adaptDecisionEngine(data: BackendDecisionEngine): DecisionRecord {
  return {
    ...data.topDecision,
    createdAt: parseTime(data.topDecision.createdAt),
    resolvedAt: data.topDecision.resolvedAt ? parseTime(data.topDecision.resolvedAt) : undefined,
    evidence: data.topDecision.evidence?.map((evidence) => ({
      ...evidence,
      timestamp: parseTime(evidence.timestamp),
    })),
  };
}

export async function getDashboardKpis(fallback: KPIData): Promise<KPIData> {
  const data = await apiGet<BackendKPIData | null>('/dashboard/kpis', null);
  return data ? adaptKpis(data) : fallback;
}

export async function getSystemStatus(
  fallback: SystemStatusData
): Promise<SystemStatusData> {
  const [status, summary] = await Promise.all([
    apiGet<BackendSystemStatus | null>('/system/status', null),
    apiGet<DashboardSummary | null>('/dashboard/summary', null),
  ]);

  return status ? adaptSystemStatus(status, summary) : fallback;
}

export async function getActivityEvents(fallback: ActivityEvent[]): Promise<ActivityEvent[]> {
  const data = await apiGet<BackendActivity | null>('/activity', null);
  return data ? adaptActivity(data) : fallback;
}

export async function getDashboardDecision(fallback: DecisionRecord | null): Promise<DecisionRecord | null> {
  const data = await apiGet<BackendDecisionEngine | null>('/dashboard/decision-engine', null);
  return data ? adaptDecisionEngine(data) : fallback;
}
