import { apiGet, apiPost } from './api-client';
import type { ScenarioId, SimulationSliders, VesselTarget } from '@/contexts/simulation-context';

export type BackendStrategicOption = {
  id: 'A' | 'B' | 'C' | 'D';
  name: string;
  focus: string;
  delayHours: number;
  costDeltaUsd: number;
  riskScore: number;
  bufferImpactDays: number;
  summary: string;
  recommended?: boolean;
};

export type BackendFleetState = {
  vesselId: string;
  vessel: string;
  type: 'VLCC' | 'Suezmax' | 'Aframax';
  cargo: string;
  origin?: string;
  destination?: string;
  routeProgress: number;
  status: string;
  delayHours: number;
  demurrageUsd: number;
};

export type BackendSimulationRun = {
  simulationId: string;
  scenarioId: ScenarioId | string;
  horizonDays: number;
  day: number;
  sliders: SimulationSliders;
  kpis: {
    bufferDaysRemaining: { baseline: number; simulated: number; delta: number };
    demurrageCost: { baseline: number; simulated: number; delta: number };
    revenueAtRisk: { baseline: number; simulated: number; delta: number };
    maritimeRiskScore: { baseline: number; simulated: number; delta: number };
  };
  fleetState: BackendFleetState[];
  strategicOptions: BackendStrategicOption[];
  impactDamage: {
    financialDamageUsd: number;
    opportunityCostUsd: number;
    refineryStarvationProbability: number;
    totalExposureUsd: number;
  };
  simulatedDecision: {
    title: string;
    confidence: number;
    recommendation: string;
    riskDelta: number;
  };
  asOf: string;
};

export type SimulationRunPayload = {
  scenarioId: ScenarioId;
  targetVessel: VesselTarget;
  day: number;
  sliders: SimulationSliders;
};

export type BackendScenario = {
  id: string;
  name: string;
  description: string;
  severity?: string;
};

const DEMO_SCENARIOS: BackendScenario[] = [
  {
    id: 'hormuz-blockade',
    name: 'Jamnagar Congestion / Hormuz Disruption',
    description: 'Demo scenario: Jamnagar/Sikka congestion plus Hormuz risk affects MT Volgograd.',
    severity: 'critical',
  },
  { id: 'arabian-cyclone', name: 'Arabian Sea Cyclone', description: 'Severe weather disrupts India-bound tanker arrivals.', severity: 'high' },
  { id: 'refinery-shutdown', name: 'Refinery Unit Shutdown', description: 'CDU throughput reduction creates inventory pressure.', severity: 'high' },
  { id: 'cyber-attack', name: 'Port Cyber Incident', description: 'Terminal systems degradation slows discharge operations.', severity: 'critical' },
  { id: 'jetty-strike', name: 'Kochi Jetty Strike', description: 'Labor disruption reduces berth availability.', severity: 'high' },
];

function localRunSimulation(payload: SimulationRunPayload): BackendSimulationRun {
  const sliders = payload.sliders;
  const day = payload.day || 1;
  const throughputFactor = sliders.refineryThroughput / 85;
  const congestionFactor = 1 + (sliders.portCongestion - 25) / 100;
  const speedFactor = 12 / Math.max(sliders.vesselSpeed, 6);
  const riskFactor = 1 + (sliders.riskLevel - 30) / 120;
  const jettyFactor = sliders.jettyAvailable ? 1 : 1.6;
  const dischargeFactor = 5000 / Math.max(sliders.dischargeRate, 500);
  const ullageFactor = sliders.inventoryCapacity < 20 ? 1.4 : 1;
  const depletionPerDay = (0.12 * congestionFactor * speedFactor * jettyFactor * dischargeFactor * ullageFactor) / Math.max(throughputFactor, 0.35);
  const bufferDays = Math.max(0.1, Number((6.2 - depletionPerDay * day).toFixed(1)));
  const demurrage = Math.round(45000 * congestionFactor * jettyFactor * riskFactor * day);
  const throughputGap = Math.max(0, 100 - sliders.refineryThroughput) / 100;
  const revenueLoss = Math.round(180000 * throughputGap * ullageFactor * day);
  const riskIndex = Math.min(100, Math.round(sliders.riskLevel * 0.6 + sliders.portCongestion * 0.25 + (100 - sliders.refineryThroughput) * 0.4));
  const baseDelay = Math.max(0, Math.round((sliders.portCongestion - 35) * 0.6 + (sliders.riskLevel - 45) * 0.35));

  return {
    simulationId: `local-sim-${Date.now()}`,
    scenarioId: payload.scenarioId,
    horizonDays: 30,
    day,
    sliders,
    kpis: {
      bufferDaysRemaining: { baseline: 6.2, simulated: bufferDays, delta: Number((bufferDays - 6.2).toFixed(1)) },
      demurrageCost: { baseline: 0, simulated: demurrage, delta: demurrage },
      revenueAtRisk: { baseline: 0, simulated: revenueLoss, delta: revenueLoss },
      maritimeRiskScore: { baseline: 28, simulated: riskIndex, delta: riskIndex - 28 },
    },
    fleetState: [
      { vesselId: 'v-volgograd', vessel: 'MT Volgograd', type: 'VLCC', cargo: 'Urals Crude', origin: 'Novorossiysk', destination: 'Jamnagar / Sikka', routeProgress: Math.min(99, 85 + Math.round(day * 0.35)), status: riskIndex > 70 ? 'Critical' : 'At Risk', delayHours: baseDelay + 18, demurrageUsd: Math.round((48000 / 24) * (baseDelay + 18)) },
      { vesselId: 'v-basrah-star', vessel: 'MT Basrah Star', type: 'Suezmax', cargo: 'Basrah Medium', origin: 'Basrah', destination: 'Mumbai', routeProgress: Math.min(95, 40 + Math.round(day * 0.8)), status: sliders.portCongestion > 65 ? 'Delayed' : 'Transit', delayHours: Math.max(0, baseDelay - 8), demurrageUsd: Math.round((32000 / 24) * Math.max(0, baseDelay - 8)) },
      { vesselId: 'v-fujairah-king', vessel: 'MT Fujairah King', type: 'Aframax', cargo: 'Murban Crude', origin: 'Fujairah', destination: 'Kochi', routeProgress: Math.min(100, 65 + Math.round(day * 0.65)), status: sliders.riskLevel > 70 ? 'At Risk' : 'Transit', delayHours: Math.max(0, baseDelay - 3), demurrageUsd: Math.round((24000 / 24) * Math.max(0, baseDelay - 3)) },
      { vesselId: 'v-houston-voyager', vessel: 'MT Houston Voyager', type: 'VLCC', cargo: 'WTI Midland', origin: 'Houston', destination: 'Mumbai', routeProgress: Math.min(100, 92 + Math.round(day * 0.2)), status: 'At Risk', delayHours: baseDelay + 6, demurrageUsd: Math.round((52000 / 24) * (baseDelay + 6)) },
    ],
    strategicOptions: [
      { id: 'A', name: 'Cost Optimized', focus: 'Hold speed and preserve bunker cost', delayHours: 120, costDeltaUsd: -Math.round(demurrage * 0.28), riskScore: Math.max(45, riskIndex - 16), bufferImpactDays: -1.0, summary: 'Cheapest operating profile but leaves Volgograd exposed to Jamnagar queue.', recommended: false },
      { id: 'B', name: 'Time Optimized', focus: 'Speed up and force berth recovery', delayHours: -36, costDeltaUsd: 360000, riskScore: Math.max(52, riskIndex - 8), bufferImpactDays: 0.9, summary: 'Restores ETA fastest, at premium fuel and congestion cost.', recommended: false },
      { id: 'C', name: 'Risk Optimized', focus: 'Divert Volgograd to Mumbai and bypass Jamnagar', delayHours: 42, costDeltaUsd: 110000, riskScore: Math.max(12, riskIndex - 58), bufferImpactDays: 0.6, summary: 'Best resilience-adjusted option. Reduces route risk while protecting refinery buffer.', recommended: true },
      { id: 'D', name: 'Emergency Logistics', focus: 'Activate spot cargo and emergency ullage plan', delayHours: -12, costDeltaUsd: 920000, riskScore: Math.max(20, riskIndex - 46), bufferImpactDays: 1.8, summary: 'Highest-cost continuity play for near-stockout conditions.', recommended: false },
    ],
    impactDamage: {
      financialDamageUsd: demurrage + revenueLoss,
      opportunityCostUsd: Math.round((demurrage + revenueLoss) * 0.35),
      refineryStarvationProbability: Math.max(0, Math.min(100, Math.round((2.5 - bufferDays) * 18))),
      totalExposureUsd: Math.round((demurrage + revenueLoss) * 1.35),
    },
    simulatedDecision: {
      title: 'Simulation decision: adopt Risk Optimized Option C',
      confidence: 93,
      recommendation: 'Apply Risk Optimized routing for MT Volgograd and preview Mumbai diversion.',
      riskDelta: -Math.max(20, riskIndex - 24),
    },
    asOf: new Date().toISOString(),
  };
}

export async function getSimulationScenarios() {
  return apiGet<{ scenarios: BackendScenario[]; activeDemoScenario: string; asOf: string }>('/simulation/scenarios', {
    scenarios: DEMO_SCENARIOS,
    activeDemoScenario: 'hormuz-blockade',
    asOf: new Date().toISOString(),
  });
}

export async function runSimulationApi(payload: SimulationRunPayload) {
  return apiPost<BackendSimulationRun, SimulationRunPayload>('/simulation/run', payload, localRunSimulation(payload));
}

export async function saveSimulationScenarioApi(payload: {
  name: string;
  description: string;
  scenarioId: ScenarioId;
  sliders: SimulationSliders;
  targetVessel: VesselTarget;
}) {
  return apiPost('/simulation/saved', payload, null);
}
