'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useSimulation } from './simulation-context';
import { useKPI } from './kpi-context';
import { getDashboardDecision } from '@/lib/dashboard-api';

export type DecisionStatus = 'pending' | 'approved' | 'rejected' | 'auto-approved' | 'expired';
export type DecisionPriority = 'low' | 'medium' | 'high' | 'critical';
export type DecisionCategory = 'reroute' | 'schedule' | 'inventory' | 'crude-mix' | 'commercial' | 'throughput' | 'port-change';

// Evidence card types — matches the spec: News / AIS / Port / Weather / Internal
export type EvidenceType = 'news' | 'ais' | 'port' | 'weather' | 'internal' | 'market';

export interface EvidenceCard {
  id: string;
  type: EvidenceType;
  source: string;            // "UKMTO Advisory", "AIS Kpler", "Kochi Port Auth", etc.
  summary: string;
  confidence: number;        // 0-100
  timestamp: number;
  url?: string;
}

export interface ReasoningFactor {
  factor: string;            // "Geopolitical Risk"
  weight: number;            // 0-1 contribution weight
  direction: 'positive' | 'negative' | 'neutral';
  summary: string;           // "Hormuz risk index breached 85/100"
}

export interface ConfidenceBreakdown {
  riskSignal: number;        // 0-100
  delayForecast: number;
  costEstimate: number;
  bufferPrediction: number;
}

export interface DecisionAlternative {
  id: string;
  label: string;
  deltaDelayHours: number;
  deltaCost: number;
  deltaRisk: number;
  rejectionReason: string;   // "Why not this?"
  feasible: boolean;
}

export interface ComparisonMetrics {
  current: { delayHours: number; cost: number; risk: number; bufferDays: number };
  recommended: { delayHours: number; cost: number; risk: number; bufferDays: number };
}

export interface DecisionRecord {
  id: string;
  title: string;
  category: DecisionCategory;
  priority: DecisionPriority;
  status: DecisionStatus;
  createdAt: number;
  resolvedAt?: number;
  vesselId?: string;
  vesselName?: string;
  cause: string;
  oneLineReason: string;     // Short impactful reason
  reasoning: string[];       // Legacy bullet list
  reasoningFactors?: ReasoningFactor[];  // XAI factors with weights
  confidenceBreakdown?: ConfidenceBreakdown;
  evidence?: EvidenceCard[];
  alternatives?: DecisionAlternative[];
  comparison?: ComparisonMetrics;
  effect: string;
  recommendation: string;
  alternativeCount: number;
  confidence: number;
  costImpact: number;
  delayHoursImpact: number;
  riskDelta: number;
  bufferImpactDays?: number;
  co2DeltaTons?: number;     // ESG trade-off
  source: 'live' | 'simulation';
  approvedBy?: string;
  rejectionReason?: string;
}

interface DecisionsContextType {
  decisions: DecisionRecord[];
  pendingCount: number;
  criticalCount: number;
  approve: (id: string, by?: string) => void;
  reject: (id: string, reason?: string) => void;
  add: (d: Omit<DecisionRecord, 'id' | 'createdAt' | 'status'>) => DecisionRecord;
  filter: { status: DecisionStatus | 'all'; priority: DecisionPriority | 'all'; source: 'live' | 'simulation' | 'all' };
  setFilter: (f: Partial<DecisionsContextType['filter']>) => void;
  metrics: {
    approvalRate: number;
    avgConfidence: number;
    avgCostSaved: number;
    avgResponseTimeMinutes: number;
    totalCostSavedYTD: number;
  };
}

const NOW = Date.now();
const MIN = 60_000;
const HOUR = 60 * MIN;

const SEED_DECISIONS: DecisionRecord[] = [
  {
    id: 'd-001',
    title: 'Reroute MT Rajput via Cape of Good Hope',
    category: 'reroute',
    priority: 'critical',
    status: 'pending',
    createdAt: NOW - 7 * MIN,
    vesselId: 'v1',
    vesselName: 'MT Rajput',
    cause: 'Strait of Hormuz risk index elevated to 85/100',
    oneLineReason: 'Avoid +48h delay at Hormuz and remove $1.4M insurance exposure while preserving refinery buffer.',
    reasoning: [
      'Risk index breached threshold of 70',
      'Insurance war-risk premium up 240% YoY',
      'Alternate route adds 7 days but reduces total exposure by $1.4M',
      'Buffer at Kochi sufficient (4.2 days) to absorb arrival delay',
    ],
    reasoningFactors: [
      { factor: 'Geopolitical Risk', weight: 0.42, direction: 'negative', summary: 'UKMTO advisory issued; Hormuz risk index at 85/100' },
      { factor: 'Insurance Premium', weight: 0.25, direction: 'negative', summary: 'War-risk cover up 240% YoY for Hormuz transits' },
      { factor: 'Buffer Days', weight: 0.18, direction: 'positive', summary: 'Kochi refinery buffer at 4.2d absorbs rerouting delay' },
      { factor: 'Fuel Cost', weight: 0.10, direction: 'negative', summary: 'Cape route adds $420K bunker vs Hormuz' },
      { factor: 'Weather', weight: 0.05, direction: 'neutral', summary: 'Cape route seasonal swell within operating limits' },
    ],
    confidenceBreakdown: {
      riskSignal: 92,
      delayForecast: 84,
      costEstimate: 78,
      bufferPrediction: 88,
    },
    evidence: [
      { id: 'e1', type: 'news', source: 'UKMTO Advisory #2847', summary: 'Commercial traffic advised to avoid Hormuz between 18:00-06:00 UTC', confidence: 95, timestamp: NOW - 2 * HOUR },
      { id: 'e2', type: 'ais', source: 'AIS Kpler Stream', summary: '12 tankers diverted from Hormuz in last 6h; avg speed down 18%', confidence: 91, timestamp: NOW - 90 * MIN },
      { id: 'e3', type: 'market', source: 'Lloyds List War-Risk Index', summary: 'War-risk premium for Hormuz up 240% YoY; underwriters tightening cover', confidence: 88, timestamp: NOW - 4 * HOUR },
      { id: 'e4', type: 'internal', source: 'Kochi Refinery Model', summary: 'Current buffer 4.2d; reroute ETA still arrives before stockout threshold', confidence: 94, timestamp: NOW - 30 * MIN },
      { id: 'e5', type: 'weather', source: 'ECMWF HRES', summary: 'Cape of Good Hope: 2.8m swell, 22kt wind — within vessel operating envelope', confidence: 86, timestamp: NOW - 45 * MIN },
    ],
    alternatives: [
      { id: 'a1', label: 'Hold at current speed via Hormuz', deltaDelayHours: 48, deltaCost: 1_400_000, deltaRisk: 45, rejectionReason: 'Unacceptable risk exposure; war-risk premium and security threat', feasible: false },
      { id: 'a2', label: 'Reduce speed to 10kt and wait for window', deltaDelayHours: 72, deltaCost: 640_000, deltaRisk: 30, rejectionReason: 'Still exposes vessel to Hormuz risk window; buffer would fall to 1.5d', feasible: false },
      { id: 'a3', label: 'Transship to coaster at Fujairah', deltaDelayHours: 36, deltaCost: 890_000, deltaRisk: 15, rejectionReason: 'No coaster capacity available; increases cargo handling risk', feasible: false },
    ],
    comparison: {
      current: { delayHours: 48, cost: 1_400_000, risk: 85, bufferDays: 1.5 },
      recommended: { delayHours: 168, cost: 420_000, risk: 18, bufferDays: 4.0 },
    },
    effect: 'Adds +168h to ETA, +$420K fuel, removes $1.4M insurance/risk exposure',
    recommendation: 'Reroute via Cape of Good Hope departing 02:00 UTC',
    alternativeCount: 3,
    confidence: 70,
    costImpact: -980_000,
    delayHoursImpact: 168,
    riskDelta: -67,
    bufferImpactDays: 2.5,
    co2DeltaTons: 412,
    source: 'live',
  },
  {
    id: 'd-002',
    title: 'Slow steam MT Yamuna to 11 knots',
    category: 'schedule',
    priority: 'medium',
    status: 'pending',
    createdAt: NOW - 22 * MIN,
    vesselId: 'v2',
    vesselName: 'MT Yamuna',
    cause: 'Mumbai port congestion at 60%, berth slot 4 unavailable until D+3',
    oneLineReason: 'Align arrival to confirmed berth slot, save $196K combined fuel + demurrage.',
    reasoning: [
      'Speed reduction saves $84K fuel',
      'Avoids waiting demurrage estimated at $112K',
      'Aligns ETA with confirmed berth window',
    ],
    reasoningFactors: [
      { factor: 'Port Congestion', weight: 0.48, direction: 'negative', summary: 'Mumbai at 60% utilization; no berth until D+3' },
      { factor: 'Fuel Burn', weight: 0.30, direction: 'positive', summary: '4kt speed reduction saves $84K bunker' },
      { factor: 'Demurrage', weight: 0.22, direction: 'positive', summary: 'Avoids 48h anchoring at $112K demurrage' },
    ],
    confidenceBreakdown: { riskSignal: 78, delayForecast: 91, costEstimate: 88, bufferPrediction: 82 },
    evidence: [
      { id: 'e1', type: 'port', source: 'Mumbai JNPT Control', summary: 'Berth 4 unavailable until D+3 06:00 IST; confirmed by port authority', confidence: 96, timestamp: NOW - 35 * MIN },
      { id: 'e2', type: 'ais', source: 'AIS Feed', summary: '8 tankers currently at anchor awaiting berths', confidence: 92, timestamp: NOW - 20 * MIN },
      { id: 'e3', type: 'internal', source: 'Fuel Optimizer', summary: '4kt reduction yields 19% fuel savings on remaining 720nm leg', confidence: 89, timestamp: NOW - 15 * MIN },
    ],
    alternatives: [
      { id: 'a1', label: 'Maintain current speed', deltaDelayHours: 0, deltaCost: 196_000, deltaRisk: 5, rejectionReason: 'Arrives 48h before berth — incurs demurrage', feasible: true },
      { id: 'a2', label: 'Reroute to Kochi', deltaDelayHours: 16, deltaCost: 84_000, deltaRisk: -3, rejectionReason: 'Creates cross-over with other fleet; disrupts Kochi crude slate', feasible: false },
    ],
    comparison: {
      current: { delayHours: 0, cost: 196_000, risk: 35, bufferDays: 3.8 },
      recommended: { delayHours: 24, cost: 0, risk: 28, bufferDays: 3.6 },
    },
    effect: '+24h ETA, -$196K total cost',
    recommendation: 'Reduce speed to 11kt at next waypoint',
    alternativeCount: 2,
    confidence: 70,
    costImpact: -196_000,
    delayHoursImpact: 24,
    riskDelta: -8,
    bufferImpactDays: -0.2,
    co2DeltaTons: -62,
    source: 'live',
  },
  {
    id: 'd-003',
    title: 'Substitute Arabian Heavy with Murban for D+5 to D+10',
    category: 'crude-mix',
    priority: 'high',
    status: 'approved',
    createdAt: NOW - 4 * HOUR,
    resolvedAt: NOW - 2 * HOUR,
    cause: 'MT Rajput delayed; refinery requires feedstock by D+5',
    oneLineReason: 'Substitute in-tank Murban to avoid CDU unit shutdown.',
    reasoning: [
      'Murban inventory at 78% (within blending tolerance)',
      'CDU yield variance < 0.4% per refinery model',
      'Avoids unit shutdown costing $620K/day',
    ],
    confidenceBreakdown: { riskSignal: 96, delayForecast: 92, costEstimate: 94, bufferPrediction: 95 },
    effect: 'No throughput loss, +$45K crude differential',
    recommendation: 'APPROVED by Priya Sharma',
    alternativeCount: 2,
    confidence: 70,
    costImpact: -575_000,
    delayHoursImpact: 0,
    riskDelta: -22,
    source: 'live',
    approvedBy: 'Priya Sharma',
  },
  {
    id: 'd-004',
    title: 'Hold MT Saraswati discharge until 06:00 IST',
    category: 'inventory',
    priority: 'low',
    status: 'auto-approved',
    createdAt: NOW - 12 * HOUR,
    resolvedAt: NOW - 12 * HOUR + 90_000,
    vesselId: 'v4',
    vesselName: 'MT Saraswati',
    cause: 'Vadinar tank ullage at 95%; needs 4h to draw down',
    oneLineReason: 'Low-risk operational hold pending ullage; auto-approved under threshold.',
    reasoning: [
      'Confidence > 92% threshold for auto-approval',
      'Low-risk operational decision',
      'No commercial counter-party impact',
    ],
    effect: '+4h discharge delay, $0 incremental cost',
    recommendation: 'AUTO-APPROVED: Pump start at 06:00 IST',
    alternativeCount: 0,
    confidence: 70,
    costImpact: 0,
    delayHoursImpact: 4,
    riskDelta: 0,
    source: 'live',
    approvedBy: 'AI Auto-Approval',
  },
  {
    id: 'd-005',
    title: 'Cancel spot purchase from Trafigura',
    category: 'commercial',
    priority: 'high',
    status: 'rejected',
    createdAt: NOW - 18 * HOUR,
    resolvedAt: NOW - 17 * HOUR,
    cause: 'AI detected 60-day inventory cushion; spot purchase deemed redundant',
    oneLineReason: 'Rejected — Q1 refinery turnaround requires reserve build.',
    reasoning: [
      'Forecast model overweighted historical Q4 demand',
      'Manual override: planned refinery turnaround Q1 requires extra reserves',
    ],
    effect: 'Decision rejected by manager',
    recommendation: 'REJECTED: Strategic reserve building required',
    alternativeCount: 1,
    confidence: 70,
    costImpact: -2_400_000,
    delayHoursImpact: 0,
    riskDelta: 12,
    source: 'live',
    approvedBy: 'Priya Sharma',
    rejectionReason: 'Q1 turnaround prep requires 5-day inventory cushion',
  },
];

const DecisionsContext = createContext<DecisionsContextType | undefined>(undefined);

import { getDecisions, setDecisionStatus } from '@/lib/decisions-api';

function inferVesselIdFromDecision(target: DecisionRecord | null): string | null {
  if (!target) return null;
  if (target.vesselId) return target.vesselId;

  const hay = `${target.vesselName || ''} ${target.title || ''} ${target.recommendation || ''}`.toLowerCase();
  if (hay.includes('houston')) return 'v-houston-voyager';
  if (hay.includes('volgograd') || hay.includes('voldogor')) return 'v-volgograd';
  if (hay.includes('fujairah')) return 'v-fujairah-king';
  if (hay.includes('basrah')) return 'v-basrah-star';
  return null;
}

function inferRouteKindFromDecision(target: DecisionRecord | null): 'houston-kochi' | 'generic' {
  if (!target) return 'generic';
  const hay = `${target.vesselName || ''} ${target.title || ''} ${target.recommendation || ''}`.toLowerCase();
  if (hay.includes('houston') || hay.includes('kochi')) return 'houston-kochi';
  return 'generic';
}


export function DecisionsProvider({ children }: { children: React.ReactNode }) {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilterState] = useState<DecisionsContextType['filter']>({
    status: 'all',
    priority: 'all',
    source: 'all',
  });

  const sim = useSimulation();
  const kpi = useKPI();

  const fetchDecisions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getDecisions(filter.status);
      if (res) {
        setDecisions(res.decisions);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filter.status]);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  // When simulation enters crisis mode, surface a synthetic decision
  useEffect(() => {
    if (!sim.isSimulationMode) return;
    const isCrisis = sim.bufferDays < 2.5 || sim.riskIndex > 70 || !sim.sliders.jettyAvailable;
    if (!isCrisis) return;
    setDecisions((prev) => {
      const hasOpenSim = prev.some((d) => d.source === 'simulation' && d.status === 'pending');
      if (hasOpenSim) return prev;
      const synthetic: DecisionRecord = {
        id: `sim-${Date.now()}`,
        title: 'Simulation crisis: Reroute fleet via Cape',
        category: 'reroute',
        priority: 'critical',
        status: 'pending',
        createdAt: Date.now(),
        cause: `Simulation detected: buffer ${sim.bufferDays.toFixed(1)}d, risk ${sim.riskIndex}`,
        oneLineReason: 'Simulation produced cascading crisis; reroute mitigates exposure.',
        reasoning: [
          `Buffer days at ${sim.bufferDays.toFixed(1)} (threshold 2.5)`,
          `Risk index at ${sim.riskIndex} (threshold 70)`,
          !sim.sliders.jettyAvailable ? 'Jetty 4 offline' : `Port congestion at ${sim.sliders.portCongestion}%`,
        ],
        effect: `Demurrage projected at $${(sim.demurrageAccum / 1000).toFixed(0)}K`,
        recommendation: 'Reroute via Cape of Good Hope',
        alternativeCount: 2,
        confidence: 94,
        costImpact: -(sim.demurrageAccum * 0.6),
        delayHoursImpact: 168,
        riskDelta: -50,
        source: 'simulation',
      };
      return [synthetic, ...prev];
    });
  }, [sim.isSimulationMode, sim.bufferDays, sim.riskIndex, sim.sliders.jettyAvailable, sim.sliders.portCongestion, sim.demurrageAccum]);

  const approve = useCallback(async (id: string, by = 'BPCL Admin') => {
    try {
      let approvedVesselId: string | null = null;
      let approvedVesselName: string | null = null;
      let approvedCategory: DecisionCategory | null = null;
      let approvedTitle: string | null = null;
      let approvedRecommendation: string | null = null;

      const currentDecision = decisions.find((d) => d.id === id) || null;
      approvedVesselId = currentDecision?.vesselId ?? null;
      approvedVesselName = currentDecision?.vesselName ?? null;
      approvedCategory = currentDecision?.category ?? null;
      approvedTitle = currentDecision?.title ?? null;
      approvedRecommendation = currentDecision?.recommendation ?? null;

      // Optimistically dispatch route-approval so map swaps instantly on click.
      const optimisticVesselId = inferVesselIdFromDecision(currentDecision);
      const optimisticKind = inferRouteKindFromDecision(currentDecision);
      const optimisticShouldCommit =
        (currentDecision?.category === 'reroute') ||
        `${currentDecision?.vesselName || ''} ${currentDecision?.title || ''} ${currentDecision?.recommendation || ''}`
          .toLowerCase()
          .includes('houston');
      if (optimisticVesselId && optimisticShouldCommit) {
        window.dispatchEvent(
          new CustomEvent('crudeflow:route-approved', {
            detail: { vesselId: optimisticVesselId, kind: optimisticKind, decisionId: id },
          })
        );
      }

      await setDecisionStatus(id, 'approved');

      setDecisions((prev) => {
        const target = prev.find((d) => d.id === id) || null;
        approvedVesselId = target?.vesselId ?? null;
        approvedVesselName = target?.vesselName ?? null;
        approvedCategory = target?.category ?? null;
        approvedTitle = target?.title ?? null;
        approvedRecommendation = target?.recommendation ?? null;

        return prev.map((d) =>
          d.id === id ? { ...d, status: 'approved' as const, resolvedAt: Date.now(), approvedBy: by } : d
        );
      });

      const vesselId = inferVesselIdFromDecision({
        id,
        title: approvedTitle || '',
        category: approvedCategory || 'reroute',
        priority: 'high',
        status: 'approved',
        createdAt: Date.now(),
        vesselId: approvedVesselId || undefined,
        vesselName: approvedVesselName || undefined,
        cause: '',
        oneLineReason: '',
        reasoning: [],
        effect: '',
        recommendation: approvedRecommendation || '',
        alternativeCount: 0,
        confidence: 80,
        costImpact: 0,
        delayHoursImpact: 0,
        riskDelta: 0,
        source: 'live',
      });

      const shouldCommitRoute =
        approvedCategory === 'reroute' ||
        (approvedVesselName?.toLowerCase().includes('houston') ?? false);

      if (vesselId && shouldCommitRoute) {
        const routeKind = inferRouteKindFromDecision({
          id,
          title: approvedTitle || '',
          category: approvedCategory || 'reroute',
          priority: 'high',
          status: 'approved',
          createdAt: Date.now(),
          vesselId: approvedVesselId || undefined,
          vesselName: approvedVesselName || undefined,
          cause: '',
          oneLineReason: '',
          reasoning: [],
          effect: '',
          recommendation: approvedRecommendation || '',
          alternativeCount: 0,
          confidence: 80,
          costImpact: 0,
          delayHoursImpact: 0,
          riskDelta: 0,
          source: 'live',
        });
        window.dispatchEvent(
          new CustomEvent('crudeflow:route-approved', {
            detail: { vesselId, kind: routeKind, decisionId: id },
          })
        );
      }

      await kpi.refresh();
    } catch (err) {
      console.error('Failed to approve decision:', err);
    }
  }, [kpi]);

  const reject = useCallback(async (id: string, reason = 'Operator override') => {
    try {
      await setDecisionStatus(id, 'rejected', reason);
      setDecisions((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: 'rejected' as const, resolvedAt: Date.now(), rejectionReason: reason } : d
        )
      );
    } catch (err) {
      console.error('Failed to reject decision:', err);
    }
  }, []);

  const add = useCallback((d: Omit<DecisionRecord, 'id' | 'createdAt' | 'status'>): DecisionRecord => {
    const item: DecisionRecord = { ...d, id: `d-${Date.now()}`, createdAt: Date.now(), status: 'pending' };
    setDecisions((prev) => [item, ...prev]);
    return item;
  }, []);

  const setFilter = useCallback((f: Partial<DecisionsContextType['filter']>) => {
    setFilterState((prev) => ({ ...prev, ...f }));
  }, []);

  const pendingCount = decisions.filter((d) => d.status === 'pending').length;
  const criticalCount = decisions.filter((d) => d.priority === 'critical' && d.status === 'pending').length;

  const metrics = useMemo(() => {
    const resolved = decisions.filter((d) => d.status === 'approved' || d.status === 'auto-approved' || d.status === 'rejected');
    const approved = decisions.filter((d) => d.status === 'approved' || d.status === 'auto-approved');
    const approvalRate = resolved.length === 0 ? 0 : Math.round((approved.length / resolved.length) * 100);
    const avgConfidence = decisions.length === 0 ? 0 : Math.round(decisions.reduce((s, d) => s + d.confidence, 0) / decisions.length);
    const avgCostSaved = approved.length === 0 ? 0 : Math.round(approved.reduce((s, d) => s + Math.abs(Math.min(d.costImpact, 0)), 0) / approved.length);
    const totalCostSavedYTD = approved.reduce((s, d) => s + Math.abs(Math.min(d.costImpact, 0)), 0) + 4_200_000;
    const avgResponseTimeMinutes = resolved.length === 0
      ? 0
      : Math.round(
          resolved.reduce((s, d) => s + Math.max(((d.resolvedAt || d.createdAt) - d.createdAt) / 60_000, 1), 0) / resolved.length
        );
    return { approvalRate, avgConfidence, avgCostSaved, totalCostSavedYTD, avgResponseTimeMinutes };
  }, [decisions]);

  return (
    <DecisionsContext.Provider value={{ decisions, pendingCount, criticalCount, approve, reject, add, filter, setFilter, metrics }}>
      {children}
    </DecisionsContext.Provider>
  );
}

export function useDecisions() {
  const context = useContext(DecisionsContext);
  if (!context) throw new Error('useDecisions must be used within DecisionsProvider');
  return context;
}
