'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { KPIData, DemurrageForecast, BufferDaysRemaining, MaritimeRiskIndex, CostOfInaction } from '@/types/kpi';
import { useWorkspace } from './workspace-context';
import { useSimulation } from './simulation-context';
import { useSettings } from './settings-context';
import { getDashboardKpis } from '@/lib/dashboard-api';

interface KPIContextType {
  kpiData: KPIData | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  refreshing: boolean;
  isCascading: boolean;
}

const KPIContext = createContext<KPIContextType | undefined>(undefined);

function baselineDemurrage(): DemurrageForecast {
  return {
    id: 'demurrage',
    label: 'Demurrage Liability Forecast',
    value: 1200000,
    currency: 'USD',
    trend: 'up',
    trendPercentage: 18,
    impact: 'High congestion at Kochi port increasing wait times',
    color: 'red',
    status: 'warning',
    timestamp: new Date(),
    breakdown: [
      { vesselName: 'MT Rajput', waitTime: 24, dailyRate: 45000, forecast: 450000 },
      { vesselName: 'MT Yamuna', waitTime: 18, dailyRate: 42000, forecast: 315000 },
      { vesselName: 'MT Ganges', waitTime: 12, dailyRate: 40000, forecast: 240000 },
    ],
    portCongestion: 'high',
  };
}

function baselineBuffer(): BufferDaysRemaining {
  return {
    id: 'buffer',
    label: 'Buffer Days Remaining',
    value: 3.8,
    unit: 'Days',
    trend: 'down',
    trendPercentage: 5,
    impact: 'Refinery can survive 3.8 days without new crude input',
    color: 'amber',
    status: 'warning',
    timestamp: new Date(),
    currentInventory: 2400000,
    dailyConsumption: 630000,
    incomingShipments: [
      { vesselName: 'MT Rajput', etaDate: new Date(Date.now() + 86400000 * 2), cargoVolume: 1200000 },
      { vesselName: 'MT Yamuna', etaDate: new Date(Date.now() + 86400000 * 4), cargoVolume: 900000 },
    ],
    riskThreshold: 5,
  };
}

function baselineRisk(): MaritimeRiskIndex {
  return {
    id: 'risk',
    label: 'Maritime Risk Index',
    value: 68,
    unit: '%',
    trend: 'up',
    trendPercentage: 12,
    impact: 'Combined geopolitical, weather, and route risks elevating system exposure',
    color: 'blue',
    status: 'warning',
    timestamp: new Date(),
    breakdown: {
      geopolitical: 75,
      weather: 55,
      congestion: 70,
      routeSecurity: 62,
      weights: { geopolitical: 0.4, weather: 0.2, congestion: 0.2, routeSecurity: 0.2 },
    },
    affectedVessels: ['MT Rajput', 'MT Yamuna', 'MT Ganges'],
    riskZones: ['Strait of Hormuz', 'North Arabian Sea'],
  };
}

function baselineInaction(): CostOfInaction {
  return {
    id: 'inaction',
    label: 'Cost of Inaction',
    value: 450000,
    currency: 'USD',
    unit: '/day',
    trend: 'up',
    trendPercentage: 25,
    impact: 'Financial loss escalating if no corrective action taken',
    color: 'purple',
    status: 'critical',
    timestamp: new Date(),
    breakdown: { demurrageDaily: 250000, productionLossDaily: 150000, opportunityCostDaily: 50000 },
    delayDays: 3,
    projectedCost: 1350000,
  };
}

function baselineKPIData(workspaceId: string): KPIData {
  return {
    demurrageForecast: baselineDemurrage(),
    bufferDaysRemaining: baselineBuffer(),
    maritimeRiskIndex: baselineRisk(),
    costOfInaction: baselineInaction(),
    timestamp: new Date(),
    workspaceId,
    isSimulated: false,
  };
}

export function KPIProvider({ children }: { children: React.ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const sim = useSimulation();
  const { preferences } = useSettings();

  const [baseLoading, setBaseLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [baseData, setBaseData] = useState<KPIData | null>(null);
  const [approvalBoost, setApprovalBoost] = useState<{
    until: number;
    deltas: { demurragePct: number; bufferDays: number; risk: number; inactionUsd: number };
  } | null>(null);

  // Determine if simulation should cascade into the wider system
  const isCascading = sim.isSimulationMode && preferences.simulationViewMode === 'integrated';

  const calculateKPIs = async () => {
    setBaseLoading(true);
    try {
      const fallback = baselineKPIData(currentWorkspace.id);
      setBaseData(await getDashboardKpis(fallback));
    } finally {
      setBaseLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try { await calculateKPIs(); } finally { setRefreshing(false); }
  };

  useEffect(() => {
    calculateKPIs();
  }, [currentWorkspace.id]);

  // When a reroute is approved, nudge KPIs so the demo feels reactive even
  // while backend data remains mostly static. This is intentionally small
  // and time-bounded.
  useEffect(() => {
    const handler = (evt: Event) => {
      const detail = (evt as CustomEvent).detail as { vesselId?: string; kind?: string } | undefined;
      if (!detail?.vesselId) return;

      // Only apply a KPI nudge for route approvals (esp. the Houston reroute demo)
      setApprovalBoost({
        until: Date.now() + 5 * 60_000,
        deltas: {
          demurragePct: -0.12,
          bufferDays: 0.3,
          risk: -4,
          inactionUsd: -50_000,
        },
      });
    };

    window.addEventListener('crudeflow:route-approved', handler as EventListener);
    return () => window.removeEventListener('crudeflow:route-approved', handler as EventListener);
  }, []);

  // Build KPI data - either baseline or cascaded
  const kpiData = useMemo<KPIData | null>(() => {
    if (baseLoading) return null;

    if (isCascading) {
      const dem = baselineDemurrage();
      dem.value = Math.max(dem.value * 0.4, sim.demurrageAccum + 350_000);
      dem.color = sim.demurrageAccum > 1_000_000 ? 'red' : 'amber';
      dem.impact = `Simulation cascade: Day ${Math.round(sim.currentDay)} of ${sim.activeScenario.replace('-', ' ')}`;

      const buf = baselineBuffer();
      buf.value = Math.max(0.1, sim.bufferDays);
      buf.color = sim.bufferDays < 2 ? 'red' : sim.bufferDays < 4 ? 'amber' : 'blue';
      buf.impact = sim.bufferDeathDay
        ? `Buffer collapses on Day ${sim.bufferDeathDay} under current scenario`
        : 'Buffer stable under current scenario';

      const risk = baselineRisk();
      risk.value = sim.riskIndex;
      risk.color = sim.riskIndex > 70 ? 'red' : sim.riskIndex > 50 ? 'amber' : 'blue';
      risk.impact = 'Composite risk reflecting active simulation variables';

      const inaction = baselineInaction();
      inaction.value = Math.round((sim.demurrageAccum + sim.revenueLoss) / Math.max(sim.currentDay, 1));
      inaction.color = inaction.value > 600_000 ? 'red' : 'purple';
      inaction.impact = 'Daily loss rate computed from simulation cascade';

      return {
        demurrageForecast: dem,
        bufferDaysRemaining: buf,
        maritimeRiskIndex: risk,
        costOfInaction: inaction,
        timestamp: new Date(),
        workspaceId: currentWorkspace.id,
        isSimulated: true,
      };
    }

    const base = baseData || baselineKPIData(currentWorkspace.id);

    if (approvalBoost && Date.now() < approvalBoost.until) {
      return {
        ...base,
        demurrageForecast: {
          ...base.demurrageForecast,
          value: Math.max(0, Math.round(base.demurrageForecast.value * (1 + approvalBoost.deltas.demurragePct))),
          impact: `Approved reroute applied — demurrage exposure reduced.`,
          timestamp: new Date(),
        },
        bufferDaysRemaining: {
          ...base.bufferDaysRemaining,
          value: Math.max(0.1, Math.round((base.bufferDaysRemaining.value + approvalBoost.deltas.bufferDays) * 10) / 10),
          impact: `Approved reroute improves refinery buffer outlook.`,
          timestamp: new Date(),
        },
        maritimeRiskIndex: {
          ...base.maritimeRiskIndex,
          value: Math.max(0, Math.round(base.maritimeRiskIndex.value + approvalBoost.deltas.risk)),
          impact: `Approved reroute reduces route exposure risk.`,
          timestamp: new Date(),
        },
        costOfInaction: {
          ...base.costOfInaction,
          value: Math.max(0, Math.round(base.costOfInaction.value + approvalBoost.deltas.inactionUsd)),
          impact: `Lower daily loss rate after reroute approval.`,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      };
    }

    return base;
  }, [baseLoading, baseData, isCascading, sim.demurrageAccum, sim.revenueLoss, sim.bufferDays, sim.bufferDeathDay, sim.riskIndex, sim.currentDay, sim.activeScenario, currentWorkspace.id]);

  return (
    <KPIContext.Provider value={{ kpiData, isLoading: baseLoading, refresh, refreshing, isCascading }}>
      {children}
    </KPIContext.Provider>
  );
}

export function useKPI() {
  const context = useContext(KPIContext);
  if (!context) throw new Error('useKPI must be used within KPIProvider');
  return context;
}
