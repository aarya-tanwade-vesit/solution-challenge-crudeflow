'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type SimulationViewMode = 'integrated' | 'isolated';
export type RefreshInterval = 30 | 60 | 120 | 300; // seconds
export type UnitSystem = 'metric' | 'imperial';

export interface PortPhysics {
  id: string;
  name: string;
  jettyCount: number;
  maxBerthLength: number; // meters
  maxDraft: number; // meters
  dischargeRate: number; // MT/hr
  laycanWindowHours: number;
  storageCapacity: number; // KMT
}

export interface AIThresholds {
  bufferCritical: number;        // days
  bufferWarning: number;         // days
  demurrageWarning: number;      // USD
  demurrageCritical: number;     // USD
  riskHighThreshold: number;     // 0-100
  rerouteCostThreshold: number;  // USD
  confidenceMinimum: number;     // 0-100
  autoApproveThreshold: number;  // 0-100 (auto-approve if confidence above)
}

export interface IntegrationStatus {
  id: string;
  name: string;
  category: 'data' | 'erp' | 'risk' | 'comms';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: number;
  description: string;
}

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  lastActive: number;
}

export interface Preferences {
  simulationViewMode: SimulationViewMode;
  refreshInterval: RefreshInterval;
  unitSystem: UnitSystem;
  notifications: boolean;
  emailDigest: boolean;
  reduceMotion: boolean;
  showSimulationCue: boolean;
  defaultDashboardTab: 'overview' | 'vessels' | 'analytics';
}

interface SettingsContextType {
  preferences: Preferences;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  resetPreferences: () => void;

  thresholds: AIThresholds;
  setThreshold: <K extends keyof AIThresholds>(key: K, value: AIThresholds[K]) => void;

  ports: PortPhysics[];
  updatePort: (id: string, patch: Partial<PortPhysics>) => void;

  integrations: IntegrationStatus[];
  toggleIntegration: (id: string) => void;

  members: OrgMember[];
  updateMemberRole: (id: string, role: OrgMember['role']) => void;
  removeMember: (id: string) => void;

  isHydrated: boolean;
}

const DEFAULT_PREFS: Preferences = {
  simulationViewMode: 'isolated',
  refreshInterval: 60,
  unitSystem: 'metric',
  notifications: true,
  emailDigest: false,
  reduceMotion: false,
  showSimulationCue: true,
  defaultDashboardTab: 'overview',
};

const DEFAULT_THRESHOLDS: AIThresholds = {
  bufferCritical: 2.0,
  bufferWarning: 4.0,
  demurrageWarning: 250000,
  demurrageCritical: 1000000,
  riskHighThreshold: 70,
  rerouteCostThreshold: 500000,
  confidenceMinimum: 65,
  autoApproveThreshold: 92,
};

const DEFAULT_PORTS: PortPhysics[] = [
  { id: 'kochi',   name: 'Kochi BPCL',    jettyCount: 4, maxBerthLength: 320, maxDraft: 16.5, dischargeRate: 5000, laycanWindowHours: 72, storageCapacity: 850 },
  { id: 'mumbai',  name: 'Mumbai BPCL',   jettyCount: 6, maxBerthLength: 350, maxDraft: 17.5, dischargeRate: 6500, laycanWindowHours: 48, storageCapacity: 1200 },
  { id: 'vadinar', name: 'Vadinar',       jettyCount: 3, maxBerthLength: 290, maxDraft: 16.0, dischargeRate: 4500, laycanWindowHours: 60, storageCapacity: 720 },
  { id: 'paradip', name: 'Paradip IOCL',  jettyCount: 4, maxBerthLength: 310, maxDraft: 18.0, dischargeRate: 5500, laycanWindowHours: 72, storageCapacity: 980 },
];

const DEFAULT_INTEGRATIONS: IntegrationStatus[] = [
  { id: 'ais',         name: 'AIS Vessel Tracking',  category: 'data',  status: 'connected',    lastSync: Date.now() - 60_000,    description: 'Real-time vessel positions via global AIS feed' },
  { id: 'noaa',        name: 'NOAA Weather',         category: 'data',  status: 'connected',    lastSync: Date.now() - 180_000,   description: 'Maritime weather, swells, cyclone advisories' },
  { id: 'sap-erp',     name: 'SAP ERP',              category: 'erp',   status: 'connected',    lastSync: Date.now() - 300_000,   description: 'Inventory, contracts, refinery throughput' },
  { id: 'oracle-tms',  name: 'Oracle TMS',           category: 'erp',   status: 'disconnected', description: 'Transportation Management System' },
  { id: 'lloyds',      name: "Lloyd's List Intel",   category: 'risk',  status: 'connected',    lastSync: Date.now() - 900_000,   description: 'Geopolitical and chokepoint risk feed' },
  { id: 'pagerduty',   name: 'PagerDuty',            category: 'comms', status: 'connected',    lastSync: Date.now() - 30_000,    description: 'Critical incident escalation' },
  { id: 'slack',       name: 'Slack',                category: 'comms', status: 'error',        description: 'Team notifications - reauth required' },
];

const DEFAULT_MEMBERS: OrgMember[] = [
  { id: 'm1', name: 'BPCL Admin',     email: 'admin@bpcl.com',     role: 'admin',   lastActive: Date.now() - 60_000 },
  { id: 'm2', name: 'Priya Sharma',   email: 'p.sharma@bpcl.com',  role: 'manager', lastActive: Date.now() - 3600_000 },
  { id: 'm3', name: 'Arjun Mehta',    email: 'a.mehta@bpcl.com',   role: 'analyst', lastActive: Date.now() - 1800_000 },
  { id: 'm4', name: 'Kavya Iyer',     email: 'k.iyer@bpcl.com',    role: 'analyst', lastActive: Date.now() - 7200_000 },
  { id: 'm5', name: 'Rahul Singh',    email: 'r.singh@bpcl.com',   role: 'viewer',  lastActive: Date.now() - 86400_000 },
];

const PREFS_KEY = 'crudeflow:preferences';
const THRESH_KEY = 'crudeflow:thresholds';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFS);
  const [thresholds, setThresholds] = useState<AIThresholds>(DEFAULT_THRESHOLDS);
  const [ports, setPorts] = useState<PortPhysics[]>(DEFAULT_PORTS);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>(DEFAULT_INTEGRATIONS);
  const [members, setMembers] = useState<OrgMember[]>(DEFAULT_MEMBERS);
  const [isHydrated, setIsHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const p = window.localStorage.getItem(PREFS_KEY);
      if (p) setPreferences({ ...DEFAULT_PREFS, ...JSON.parse(p) });
      const t = window.localStorage.getItem(THRESH_KEY);
      if (t) setThresholds({ ...DEFAULT_THRESHOLDS, ...JSON.parse(t) });
    } catch (e) {
      console.error('[v0] Failed to hydrate settings:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setPreference = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value };
      try { window.localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFS);
    try { window.localStorage.setItem(PREFS_KEY, JSON.stringify(DEFAULT_PREFS)); } catch {}
  }, []);

  const setThreshold = useCallback(<K extends keyof AIThresholds>(key: K, value: AIThresholds[K]) => {
    setThresholds((prev) => {
      const next = { ...prev, [key]: value };
      try { window.localStorage.setItem(THRESH_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const updatePort = useCallback((id: string, patch: Partial<PortPhysics>) => {
    setPorts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const toggleIntegration = useCallback((id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === 'connected' ? 'disconnected' : 'connected', lastSync: Date.now() } : i))
    );
  }, []);

  const updateMemberRole = useCallback((id: string, role: OrgMember['role']) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        preferences,
        setPreference,
        resetPreferences,
        thresholds,
        setThreshold,
        ports,
        updatePort,
        integrations,
        toggleIntegration,
        members,
        updateMemberRole,
        removeMember,
        isHydrated,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
