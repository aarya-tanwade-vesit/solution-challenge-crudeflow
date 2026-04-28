import { apiPost } from './api-client';

export type Module2RouteOption = {
  option: 'A' | 'B' | 'C' | 'D';
  optionName: string;
  strategy: string;
  route: string[];
  distanceNm: number;
  etaHours: number;
  etaDays: number;
  delayHours: number;
  routeCoordinates: number[][];
  mapCoordinates: Array<[number, number]>;
  routingProvider: string;
  passagesTraversed: string[];
  warnings: string[];
  fuelCost: number;
  hireCost: number;
  demurrageCost: number;
  totalBaseCost: number;
  weightedRiskScore: number;
  warRiskPremium: number;
  refineryBufferDays: number;
  shortageRisk: boolean;
  finalRouteScore: number;
  routeQualityScore: number;
  decisionLabel: string;
  explanation: string;
  refineryImpact: {
    bufferDeltaDays: number;
  };
  validation: {
    costDeltaUsd?: number;
  };
};

export type Module2OptimizeResult = {
  request: Record<string, unknown>;
  options: Module2RouteOption[];
  decision: {
    selectedOption: 'A' | 'B' | 'C' | 'D' | null;
    solverStatus: string;
    solver: string;
    objectiveValue: number | null;
    selectedRoute: Module2RouteOption | null;
    rankedOptions: Module2RouteOption[];
  } | null;
};

export type Module2OptimizationPayload = {
  vesselId?: string;
  vesselName?: string;
  scenario?: string;
  origin?: string;
  destination?: string;
  vesselSpeedKnots?: number;
  vesselType?: 'VLCC' | 'Suezmax' | 'Aframax' | 'Panamax';
  portCongestion?: number;
  weatherRisk?: number;
  geopoliticalRisk?: number;
  insurancePremiumIncreasePct?: number;
  currentInventoryBbl?: number;
  dailyConsumptionBbl?: number;
  minimumBufferDays?: number;
};

export function runModule2Optimization(
  payload: Module2OptimizationPayload,
  fallback: Module2OptimizeResult | null = null
) {
  return apiPost<Module2OptimizeResult | null, Module2OptimizationPayload>('/optimization/optimize', payload, fallback);
}

