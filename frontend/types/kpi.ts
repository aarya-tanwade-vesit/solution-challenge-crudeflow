// KPI Types matching SECTION 2 specification
export interface KPIMetric {
  id: string;
  label: string;
  value: number;
  currency?: string;
  unit?: string;
  trend: 'up' | 'down' | 'neutral';
  trendPercentage: number;
  impact: string; // 1-sentence explanation
  color: 'red' | 'amber' | 'blue' | 'purple';
  status: 'normal' | 'warning' | 'critical';
  timestamp: Date;
}

export interface DemurrageForecast extends KPIMetric {
  breakdown: Array<{
    vesselName: string;
    waitTime: number; // hours
    dailyRate: number; // $/day
    forecast: number; // $
  }>;
  portCongestion: 'low' | 'medium' | 'high';
}

export interface BufferDaysRemaining extends KPIMetric {
  currentInventory: number; // barrels
  dailyConsumption: number; // barrels/day
  incomingShipments: Array<{
    vesselName: string;
    etaDate: Date;
    cargoVolume: number;
  }>;
  riskThreshold: number; // days
}

export interface MaritimeRiskIndex extends KPIMetric {
  breakdown: {
    geopolitical: number; // 0-100
    weather: number;
    congestion: number;
    routeSecurity: number;
    weights: {
      geopolitical: 0.4;
      weather: 0.2;
      congestion: 0.2;
      routeSecurity: 0.2;
    };
  };
  affectedVessels: string[];
  riskZones: string[];
}

export interface CostOfInaction extends KPIMetric {
  breakdown: {
    demurrageDaily: number;
    productionLossDaily: number;
    opportunityCostDaily: number;
  };
  delayDays: number;
  projectedCost: number; // total if inaction
}

export interface KPIData {
  demurrageForecast: DemurrageForecast;
  bufferDaysRemaining: BufferDaysRemaining;
  maritimeRiskIndex: MaritimeRiskIndex;
  costOfInaction: CostOfInaction;
  timestamp: Date;
  workspaceId: string;
  isSimulated: boolean;
}
