'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getSystemStatus, type SystemStatusData } from '@/lib/dashboard-api';

export type SystemStatus = 'normal' | 'warning' | 'critical';

export interface RiskContributor {
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  score?: number;
}

export interface AffectedEntity {
  name: string;
  type: string;
  riskChange: number; // percentage change
  current: number;
}

export interface SuggestedFocus {
  action: string;
  priority: 'high' | 'medium' | 'low';
  link?: string;
}

interface SystemStatusContextType {
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
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined);

const LOCAL_STATUS: SystemStatusData = {
  status: 'normal',
  lastUpdated: new Date(),
  systemScore: 72,
  riskContributors: [
    { category: 'Geopolitical', severity: 'high', description: 'Hormuz corridor risk escalation' },
    { category: 'Weather', severity: 'medium', description: 'Cyclone approaching Indian coast' },
    { category: 'Port Congestion', severity: 'low', description: 'Kochi port queue at 80% capacity' },
  ],
  affectedEntities: [
    { name: 'MT Rajput', type: 'Vessel', riskChange: 15, current: 85 },
    { name: 'MT Yamuna', type: 'Vessel', riskChange: 8, current: 42 },
    { name: 'Kochi Port', type: 'Port', riskChange: 5, current: 68 },
  ],
  affectedRoutes: [
    { from: 'Hormuz', to: 'Mumbai', risk: 'HIGH' },
    { from: 'Qatar', to: 'Singapore', risk: 'MEDIUM' },
    { from: 'Ras Tanura', to: 'Kochi', risk: 'HIGH' },
  ],
  impactProjection: {
    avgDelay: '+2.3 days',
    productionRisk: 'ELEVATED',
  },
  suggestedFocus: [
    { action: 'Monitor Hormuz corridor', priority: 'high' },
    { action: 'Review MT Rajput decision', priority: 'high' },
    { action: 'Check port queue at Kochi', priority: 'medium' },
  ],
};

export function SystemStatusProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SystemStatusData>(LOCAL_STATUS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      setData(await getSystemStatus({ ...LOCAL_STATUS, lastUpdated: new Date() }));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <SystemStatusContext.Provider
      value={{
        status: data.status,
        systemScore: data.systemScore,
        lastUpdated: data.lastUpdated,
        riskContributors: data.riskContributors,
        affectedEntities: data.affectedEntities,
        affectedRoutes: data.affectedRoutes,
        impactProjection: data.impactProjection,
        suggestedFocus: data.suggestedFocus,
        refresh,
        isRefreshing,
      }}
    >
      {children}
    </SystemStatusContext.Provider>
  );
}

export function useSystemStatus() {
  const context = useContext(SystemStatusContext);
  if (!context) {
    throw new Error('useSystemStatus must be used within SystemStatusProvider');
  }
  return context;
}
