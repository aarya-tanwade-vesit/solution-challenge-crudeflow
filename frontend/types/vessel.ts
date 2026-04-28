// Vessel types based on SECTION 6 & 7 specifications
export interface Vessel {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  flag: string;
  type: 'Crude Tanker' | 'Product Tanker' | 'LNG Carrier' | 'General Cargo';
  dwt: number; // Dead Weight Tonnage
  grossTonnage: number;
  netTonnage: number;
  length: number;
  owner: string;
  commercialManager: string;
  currentLocation: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  origin: string;
  destination: string;
  eta: Date;
  cargoVolume: number; // barrels
  cargoType: string;
  riskScore: number; // 0-100
  delayProbability: number; // 0-100
  currentRoute: {
    waypoints: Array<{ lat: number; lng: number }>;
    distance: number;
  };
  recommendedRoute?: {
    waypoints: Array<{ lat: number; lng: number }>;
    distance: number;
    rationale: string;
  };
  recommendedAction: 'reroute' | 'monitor' | 'delay' | 'none';
  confidence: number; // 0-100
  demurrageExposure: number; // $
  bufferImpact: number; // days
  status: 'normal' | 'delayed' | 'at-risk' | 'critical';
  alerts: string[];
  workspaceId: string;
}

export interface Port {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  congestionLevel: 'low' | 'medium' | 'high';
  vesselCount: number;
  avgWaitTime: number; // hours
  jettyOccupancy: number; // percentage
}

export interface RiskZone {
  id: string;
  name: string;
  type: 'geopolitical' | 'weather' | 'piracy' | 'advisory';
  severity: 'low' | 'medium' | 'high';
  polygon: Array<{ lat: number; lng: number }>;
  description: string;
  affectedRoutes: string[];
  affectedVessels: string[];
}
