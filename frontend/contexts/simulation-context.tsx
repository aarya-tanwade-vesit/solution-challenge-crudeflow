'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { runModule2Optimization, type Module2OptimizeResult } from '@/lib/optimization-api';
import { getSimulationScenarios, runSimulationApi, saveSimulationScenarioApi, type BackendSimulationRun } from '@/lib/simulation-api';
import { useActivityFeed } from './activity-feed-context';
import { useSystemStatus } from './system-status-context';

// ----- Types -----
export type ScenarioId =
  | 'baseline'
  | 'hormuz-blockade'
  | 'arabian-cyclone'
  | 'refinery-shutdown'
  | 'cyber-attack'
  | 'jetty-strike';

export type StrategicOptionId = 'cost' | 'time' | 'risk' | 'emergency';

export type AIPresetId = 'worst-case' | 'lowest-cost' | 'minimize-delay' | 'maximize-resilience';

export type PlaybackStepHours = 1 | 3 | 6 | 12 | 24;

export type VesselTarget = 'fleet' | string; // 'fleet' or vessel id

export interface SimVessel {
  id: string;
  name: string;
  type: 'VLCC' | 'Suezmax' | 'Aframax';
  origin: string;
  destination: string;
  cargo: string;
  baseProgress: number;
  baseEtaDays: number;
  baseSpeedKnots: number;
  demurrageRate: number;
}

export interface SimulationSliders {
  vesselSpeed: number;
  portCongestion: number;
  riskLevel: number;
  refineryThroughput: number;
  jettyAvailable: boolean;
  crudeType: 'high-sulphur' | 'low-sulphur' | 'medium-sulphur';
  inventoryCapacity: number;
  dischargeRate: number;
}

export interface Snapshot {
  id: string;
  day: number;
  label: string;
  scenario: ScenarioId;
  bufferDays: number;
  demurrage: number;
  revenueLoss: number;
  riskIndex: number;
}

export interface StrategicOption {
  id: StrategicOptionId;
  code: 'A' | 'B' | 'C' | 'D';
  title: string;
  subtitle: string;
  delayHours: number;
  costDelta: number;
  riskScore: number;
  bufferImpact: number;
  fuelImpact: string;
  recommendation: string;
  recommended?: boolean;
}

export interface ScenarioOption {
  id: ScenarioId;
  label: string;
  description: string;
  severity?: string;
}

export interface SimFleetState {
  id: string;
  name: string;
  type: 'VLCC' | 'Suezmax' | 'Aframax';
  origin: string;
  destination: string;
  cargo: string;
  progress: number;
  delayHours: number;
  status: 'transit' | 'critical' | 'waiting' | 'berthed' | 'reroute' | 'protected';
  demurrageAccum: number;
}

export interface AppliedSimulationImpact {
  id: string;
  scenarioId: ScenarioId;
  scenarioLabel: string;
  optionId: StrategicOptionId;
  optionCode: 'A' | 'B' | 'C' | 'D';
  optionTitle: string;
  appliedAt: number;
  kpis: {
    bufferDays: number;
    demurrage: number;
    revenueLoss: number;
    riskIndex: number;
    costOfInaction: number;
  };
  selectedVessel: {
    id: string;
    name: string;
  };
  routePreview: {
    vesselId: string;
    currentRouteLabel: string;
    optimizedRouteLabel: string;
    currentRoute: Array<[number, number]>;
    optimizedRoute: Array<[number, number]>;
  };
}

export interface SavedScenario {
  id: string;
  name: string;
  description: string;
  scenario: ScenarioId;
  sliders: SimulationSliders;
  targetVessel: VesselTarget;
  vesselOverrides: Record<string, Partial<SimulationSliders>>;
  createdAt: number;
  lastRun?: number;
}

export const FLEET: SimVessel[] = [
  { id: 'v-volgograd',       name: 'MT Volgograd',       type: 'VLCC',     origin: 'Novorossiysk', destination: 'Jamnagar / Sikka', cargo: 'Urals Crude',   baseProgress: 0.85, baseEtaDays: 2.2, baseSpeedKnots: 12.6, demurrageRate: 18000 },
  { id: 'v-basrah-star',     name: 'MT Basrah Star',     type: 'Suezmax',  origin: 'Basrah',      destination: 'Mumbai',       cargo: 'Basrah Medium', baseProgress: 0.40, baseEtaDays: 5.8, baseSpeedKnots: 10.8, demurrageRate: 12500 },
  { id: 'v-fujairah-king',   name: 'MT Fujairah King',   type: 'Aframax',  origin: 'Fujairah',    destination: 'Kochi',        cargo: 'Murban Crude',  baseProgress: 0.65, baseEtaDays: 3.4, baseSpeedKnots: 13.9, demurrageRate: 16000 },
  { id: 'v-houston-voyager', name: 'MT Houston Voyager', type: 'VLCC',     origin: 'Houston',     destination: 'Mumbai',       cargo: 'WTI Midland',   baseProgress: 0.92, baseEtaDays: 1.1, baseSpeedKnots: 14.2, demurrageRate: 19500 },
];

interface SimulationContextType {
  // Mode
  isSimulationMode: boolean;
  enterSimulationMode: () => void;
  exitSimulationMode: () => void;

  // Scenario
  activeScenario: ScenarioId;
  availableScenarios: ScenarioOption[];
  setActiveScenario: (s: ScenarioId) => void;

  // Sliders (fleet-level defaults)
  sliders: SimulationSliders;
  setSlider: <K extends keyof SimulationSliders>(key: K, value: SimulationSliders[K]) => void;
  resetSliders: () => void;

  // Per-vessel targeting
  targetVessel: VesselTarget;
  setTargetVessel: (id: VesselTarget) => void;
  vesselOverrides: Record<string, Partial<SimulationSliders>>;
  getEffectiveSliders: (vesselId: string) => SimulationSliders;

  // Run state
  isRunning: boolean;
  runSimulation: () => Promise<void>;
  resetToLive: () => void;

  // Timeline (fractional day 1.0 - 30.0)
  currentDay: number;
  setCurrentDay: (d: number) => void;
  isPlaying: boolean;
  playbackStepHours: PlaybackStepHours;
  setPlaybackStepHours: (h: PlaybackStepHours) => void;
  playbackSpeed: 1 | 1.5 | 2 | 4;
  setPlaybackSpeed: (s: 1 | 1.5 | 2 | 4) => void;
  togglePlayback: () => void;
  pausePlayback: () => void;

  // Derived
  bufferDays: number;
  bufferDeathDay: number | null;
  demurrageAccum: number;
  revenueLoss: number;
  opportunityCost: number;
  riskIndex: number;
  simulationRun: BackendSimulationRun | null;
  fleetState: SimFleetState[];

  // Snapshots
  snapshots: Snapshot[];
  pinSnapshot: (label: string) => void;
  removeSnapshot: (id: string) => void;

  // Strategic options
  strategicOptions: StrategicOption[];
  selectedOption: StrategicOptionId | null;
  selectOption: (id: StrategicOptionId | null) => void;
  recommendedOption: StrategicOption | null;
  applySelectedStrategy: () => AppliedSimulationImpact | null;
  appliedImpact: AppliedSimulationImpact | null;

  // AI presets
  runAIPreset: (preset: AIPresetId) => void;
  lastAIPreset: AIPresetId | null;

  // Saved scenarios (persisted)
  savedScenarios: SavedScenario[];
  saveScenario: (name: string, description: string) => SavedScenario;
  loadScenario: (id: string) => void;
  deleteScenario: (id: string) => void;

  // Toasts (lightweight inline notifications)
  lastToast: { id: string; type: 'success' | 'info' | 'warning'; message: string } | null;
}

const DEFAULT_SLIDERS: SimulationSliders = {
  vesselSpeed: 12,
  portCongestion: 25,
  riskLevel: 30,
  refineryThroughput: 85,
  jettyAvailable: true,
  crudeType: 'high-sulphur',
  inventoryCapacity: 40,
  dischargeRate: 5000,
};

const SCENARIO_PRESETS: Record<ScenarioId, Partial<SimulationSliders>> = {
  baseline: DEFAULT_SLIDERS,
  'hormuz-blockade':    { vesselSpeed: 9,  portCongestion: 60, riskLevel: 85, refineryThroughput: 70 },
  'arabian-cyclone':    { vesselSpeed: 8,  portCongestion: 45, riskLevel: 65, refineryThroughput: 80 },
  'refinery-shutdown':  { refineryThroughput: 40, inventoryCapacity: 15, dischargeRate: 2500 },
  'cyber-attack':       { portCongestion: 75, dischargeRate: 2000, refineryThroughput: 60 },
  'jetty-strike':       { jettyAvailable: false, portCongestion: 80, dischargeRate: 3000 },
};

const AI_PRESETS: Record<AIPresetId, { sliders: Partial<SimulationSliders>; scenario: ScenarioId; label: string }> = {
  'worst-case':           { sliders: { vesselSpeed: 8,  portCongestion: 90, riskLevel: 95, refineryThroughput: 50, jettyAvailable: false, inventoryCapacity: 10, dischargeRate: 2000 }, scenario: 'hormuz-blockade', label: 'Worst-case stress test' },
  'lowest-cost':          { sliders: { vesselSpeed: 11, portCongestion: 30, riskLevel: 35, refineryThroughput: 90, jettyAvailable: true,  inventoryCapacity: 50, dischargeRate: 5500 }, scenario: 'baseline',         label: 'Cost-minimized routing' },
  'minimize-delay':       { sliders: { vesselSpeed: 16, portCongestion: 25, riskLevel: 45, refineryThroughput: 95, jettyAvailable: true,  inventoryCapacity: 60, dischargeRate: 6000 }, scenario: 'baseline',         label: 'Time-optimized profile' },
  'maximize-resilience':  { sliders: { vesselSpeed: 13, portCongestion: 40, riskLevel: 30, refineryThroughput: 75, jettyAvailable: true,  inventoryCapacity: 70, dischargeRate: 4500 }, scenario: 'baseline',         label: 'Resilience-optimized' },
};

const STORAGE_KEY = 'crudeflow:saved-scenarios';

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const activityFeed = useActivityFeed();
  const systemStatus = useSystemStatus();
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeScenario, setActiveScenarioState] = useState<ScenarioId>('baseline');
  const [availableScenarios, setAvailableScenarios] = useState<ScenarioOption[]>([]);
  const [sliders, setSliders] = useState<SimulationSliders>(DEFAULT_SLIDERS);
  const [vesselOverrides, setVesselOverrides] = useState<Record<string, Partial<SimulationSliders>>>({});
  const [targetVessel, setTargetVessel] = useState<VesselTarget>('fleet');
  const [currentDay, setCurrentDayState] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStepHours, setPlaybackStepHours] = useState<PlaybackStepHours>(6);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2 | 4>(1);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedOption, setSelectedOption] = useState<StrategicOptionId | null>(null);
  const [module2Result, setModule2Result] = useState<Module2OptimizeResult | null>(null);
  const [simulationRun, setSimulationRun] = useState<BackendSimulationRun | null>(null);
  const [appliedImpact, setAppliedImpact] = useState<AppliedSimulationImpact | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [lastAIPreset, setLastAIPreset] = useState<AIPresetId | null>(null);
  const [lastToast, setLastToast] = useState<{ id: string; type: 'success' | 'info' | 'warning'; message: string } | null>(null);

  // Hydrate saved scenarios from localStorage
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setSavedScenarios(JSON.parse(raw));
    } catch (e) {
      console.error('[v0] Failed to hydrate saved scenarios:', e);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getSimulationScenarios().then((res) => {
      if (!active) return;
      const scenarios = (res.scenarios || [])
        .filter((item) => item.id !== 'baseline')
        .map((item) => ({
          id: item.id as ScenarioId,
          label: item.id === 'hormuz-blockade' ? 'Jamnagar Congestion / Hormuz Disruption' : item.name,
          description: item.description,
          severity: item.severity,
        }))
        .filter((item) => SCENARIO_PRESETS[item.id]);
      setAvailableScenarios(scenarios);
    });
    return () => {
      active = false;
    };
  }, []);

  const persistScenarios = useCallback((next: SavedScenario[]) => {
    setSavedScenarios(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('[v0] Failed to persist scenarios:', e);
    }
  }, []);

  const showToast = useCallback((type: 'success' | 'info' | 'warning', message: string) => {
    const id = `toast-${Date.now()}`;
    setLastToast({ id, type, message });
    setTimeout(() => {
      setLastToast((t) => (t?.id === id ? null : t));
    }, 3500);
  }, []);

  // Mode
  const enterSimulationMode = useCallback(() => setIsSimulationMode(true), []);
  const exitSimulationMode = useCallback(() => {
    setIsSimulationMode(false);
    setIsRunning(false);
    setIsPlaying(false);
  }, []);

  // Scenario
  const setActiveScenario = useCallback((s: ScenarioId) => {
    setActiveScenarioState(s);
    setSliders(() => ({ ...DEFAULT_SLIDERS, ...SCENARIO_PRESETS[s] } as SimulationSliders));
    setVesselOverrides({});
    setSelectedOption(null);
    setSimulationRun(null);
  }, []);

  // Sliders
  const setSlider = useCallback(
    <K extends keyof SimulationSliders>(key: K, value: SimulationSliders[K]) => {
      if (targetVessel === 'fleet') {
        setSliders((prev) => ({ ...prev, [key]: value }));
      } else {
        setVesselOverrides((prev) => ({
          ...prev,
          [targetVessel]: { ...(prev[targetVessel] || {}), [key]: value },
        }));
      }
      setSimulationRun(null);
    },
    [targetVessel]
  );
  const resetSliders = useCallback(() => {
    setSliders(DEFAULT_SLIDERS);
    setVesselOverrides({});
    setActiveScenarioState('baseline');
    setSelectedOption(null);
    setSimulationRun(null);
  }, []);

  const getEffectiveSliders = useCallback(
    (vesselId: string): SimulationSliders => {
      const overrides = vesselOverrides[vesselId] || {};
      return { ...sliders, ...overrides };
    },
    [sliders, vesselOverrides]
  );

  // Run / reset
  const runSimulation = useCallback(async () => {
    setIsRunning(true);
    setIsPlaying(true);
    setCurrentDayState(1);
    setSelectedOption(null);
    showToast('info', `Simulation running: ${activeScenario === 'baseline' ? 'Baseline' : activeScenario.replace('-', ' ')}`);
    try {
      const result = await runSimulationApi({
        scenarioId: activeScenario,
        targetVessel,
        day: 1,
        sliders,
      });
      setSimulationRun(result);
    } finally {
      setIsRunning(false);
    }
  }, [activeScenario, showToast, sliders, targetVessel]);

  const resetToLive = useCallback(() => {
    setIsPlaying(false);
    setIsRunning(false);
    setCurrentDayState(1);
    resetSliders();
    setSnapshots([]);
    setSelectedOption(null);
    setSimulationRun(null);
    setAppliedImpact(null);
    setLastAIPreset(null);
    systemStatus.clearSimulationImpact();
    showToast('success', 'Reset to live data source');
  }, [resetSliders, showToast, systemStatus]);

  // Timeline
  const setCurrentDay = useCallback((d: number) => {
    setCurrentDayState(Math.max(1, Math.min(30, d)));
  }, []);
  const togglePlayback = useCallback(() => setIsPlaying((p) => !p), []);
  const pausePlayback = useCallback(() => setIsPlaying(false), []);

  // Auto-play - advances by playbackStepHours converted to fractional days
  useEffect(() => {
    if (!isPlaying) return;
    const tickMs = 600 / playbackSpeed;
    const interval = setInterval(() => {
      setCurrentDayState((d) => {
        const next = d + playbackStepHours / 24;
        if (next >= 30) {
          setIsPlaying(false);
          return 30;
        }
        return next;
      });
    }, tickMs);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, playbackStepHours]);

  // ----- Derived simulation math -----
  const baseDerived = useMemo(() => {
    const throughputFactor = sliders.refineryThroughput / 85;
    const congestionFactor = 1 + (sliders.portCongestion - 25) / 100;
    const speedFactor = 12 / Math.max(sliders.vesselSpeed, 6);
    const riskFactor = 1 + (sliders.riskLevel - 30) / 120;
    const jettyFactor = sliders.jettyAvailable ? 1 : 1.6;
    const dischargeFactor = 5000 / Math.max(sliders.dischargeRate, 500);
    const ullageFactor = sliders.inventoryCapacity < 20 ? 1.4 : 1;

    const depletionPerDay = (0.12 * congestionFactor * speedFactor * jettyFactor * dischargeFactor * ullageFactor) / throughputFactor;
    const startBuffer = 6.2;
    const bufferDays = Math.max(0, startBuffer - depletionPerDay * currentDay);
    const bufferDeathDay = depletionPerDay > 0 ? Math.min(30, startBuffer / depletionPerDay) : null;

    const dailyDemurrage = 45000 * congestionFactor * jettyFactor * riskFactor;
    const demurrageAccum = Math.round(dailyDemurrage * currentDay);

    const throughputGap = Math.max(0, 100 - sliders.refineryThroughput) / 100;
    const dailyRevLoss = 180000 * throughputGap * ullageFactor;
    const revenueLoss = Math.round(dailyRevLoss * currentDay);

    const opportunityCost = Math.round((demurrageAccum + revenueLoss) * 0.35);
    const riskIndex = Math.min(100, Math.round(sliders.riskLevel * 0.6 + sliders.portCongestion * 0.25 + (100 - sliders.refineryThroughput) * 0.4));

    return {
      bufferDays,
      bufferDeathDay: bufferDeathDay !== null ? Math.round(bufferDeathDay * 10) / 10 : null,
      demurrageAccum,
      revenueLoss,
      opportunityCost,
      riskIndex,
    };
  }, [sliders, currentDay]);

  const strategicOptions = useMemo<StrategicOption[]>(() => {
    const idByCode: Record<'A' | 'B' | 'C' | 'D', StrategicOptionId> = {
      A: 'cost',
      B: 'time',
      C: 'risk',
      D: 'emergency',
    };
    const titleById: Record<StrategicOptionId, string> = {
      cost: 'Cost Optimized',
      time: 'Time Optimized',
      risk: 'Risk Optimized',
      emergency: 'Emergency Logistics',
    };
    if (simulationRun?.strategicOptions?.length) {
      return simulationRun.strategicOptions
        .filter((option) => option.id === 'A' || option.id === 'B' || option.id === 'C' || option.id === 'D')
        .sort((left, right) => left.id.localeCompare(right.id))
        .map((option) => {
          const id = idByCode[option.id];
          return {
            id,
            code: option.id,
            title: titleById[id],
            subtitle: option.focus,
            delayHours: option.delayHours,
            costDelta: option.costDeltaUsd,
            riskScore: option.riskScore,
            bufferImpact: option.bufferImpactDays,
            fuelImpact: option.costDeltaUsd > 0 ? 'Premium response' : 'Fuel conserved',
            recommendation: option.summary,
            recommended: option.recommended,
          };
        });
    }

    const module2Options = module2Result?.decision?.rankedOptions?.length
      ? module2Result.decision.rankedOptions
      : module2Result?.options;
    if (module2Options?.length) {
      const normalized = module2Options
        .filter((option) => option.option === 'A' || option.option === 'B' || option.option === 'C')
        .sort((left, right) => left.option.localeCompare(right.option))
        .slice(0, 3)
        .map((option) => {
          const id = idByCode[option.option];
          const fuelK = Math.round(option.fuelCost / 1000);
          return {
            id,
            code: option.option,
            title: titleById[id],
            subtitle: option.optionName,
            delayHours: Math.round(option.delayHours),
            costDelta: Math.round(option.validation?.costDeltaUsd ?? 0),
            riskScore: Math.round(option.weightedRiskScore),
            bufferImpact: option.refineryImpact?.bufferDeltaDays ?? 0,
            fuelImpact: `$${fuelK.toLocaleString()}K fuel`,
            recommendation: option.explanation,
            recommended: module2Result?.decision?.selectedOption === option.option,
          };
        });
      const hasEmergency = normalized.some((option) => option.id === 'emergency');
      if (!hasEmergency) {
        normalized.push({
          id: 'emergency',
          code: 'D',
          title: 'Emergency Logistics',
          subtitle: 'Activate spot cargo + emergency ullage plan',
          delayHours: -12,
          costDelta: 920000,
          riskScore: Math.max(20, baseDerived.riskIndex - 46),
          bufferImpact: 1.8,
          fuelImpact: 'Premium response',
          recommendation: 'Highest-cost continuity play if refinery buffer nears stockout.',
          recommended: false,
        });
      }
      return normalized;
    }

    const base = baseDerived.demurrageAccum;
    return [
      { id: 'cost', code: 'A', title: 'Cost Optimized', subtitle: 'Hold speed and preserve bunker cost', delayHours: 120, costDelta: Math.round(-base * 0.28), riskScore: Math.max(45, baseDerived.riskIndex - 16), bufferImpact: -1.0, fuelImpact: 'Fuel conserved', recommendation: 'Cheapest operating profile but leaves Volgograd exposed to Jamnagar queue.', recommended: false },
      { id: 'time', code: 'B', title: 'Time Optimized', subtitle: 'Speed up and force berth recovery', delayHours: -36, costDelta: 360000, riskScore: Math.max(52, baseDerived.riskIndex - 8), bufferImpact: 0.9, fuelImpact: '+$280K fuel', recommendation: 'Restores ETA fastest, at premium fuel and congestion cost.', recommended: false },
      { id: 'risk', code: 'C', title: 'Risk Optimized', subtitle: 'Divert Volgograd to Mumbai and bypass Jamnagar', delayHours: 42, costDelta: 110000, riskScore: Math.max(12, baseDerived.riskIndex - 58), bufferImpact: 0.6, fuelImpact: 'Moderate premium', recommendation: 'Best resilience-adjusted option. Reduces route risk while protecting refinery buffer.', recommended: true },
      { id: 'emergency', code: 'D', title: 'Emergency Logistics', subtitle: 'Activate spot cargo + emergency ullage plan', delayHours: -12, costDelta: 920000, riskScore: Math.max(20, baseDerived.riskIndex - 46), bufferImpact: 1.8, fuelImpact: 'Premium response', recommendation: 'Highest-cost continuity play for near-stockout conditions.', recommended: false },
    ];
  }, [baseDerived.demurrageAccum, baseDerived.riskIndex, module2Result, simulationRun]);

  const recommendedOption = useMemo(() => {
    if (!strategicOptions.length) return null;
    const flagged = strategicOptions.find((option) => option.recommended);
    if (flagged) return flagged;
    return strategicOptions.reduce((best, option) => {
      const score = Math.abs(option.costDelta) / 100000 + option.riskScore + Math.abs(option.delayHours) / 24 - Math.max(option.bufferImpact, 0) * 2;
      const bestScore = Math.abs(best.costDelta) / 100000 + best.riskScore + Math.abs(best.delayHours) / 24 - Math.max(best.bufferImpact, 0) * 2;
      return score < bestScore ? option : best;
    }, strategicOptions[0]);
  }, [strategicOptions]);

  const selectedOptionData = useMemo(
    () => strategicOptions.find((option) => option.id === selectedOption) || null,
    [selectedOption, strategicOptions]
  );

  const derived = useMemo(() => {
    if (!selectedOptionData) return baseDerived;
    const bufferDays = Math.max(0.1, baseDerived.bufferDays + selectedOptionData.bufferImpact);
    const demurrageAccum = Math.max(0, Math.round(baseDerived.demurrageAccum + selectedOptionData.costDelta));
    const revenueMultiplier = selectedOptionData.bufferImpact > 0 ? 0.82 : 1.12;
    const revenueLoss = Math.max(0, Math.round(baseDerived.revenueLoss * revenueMultiplier));
    const opportunityCost = Math.round((demurrageAccum + revenueLoss) * 0.35);
    const riskIndex = Math.max(0, Math.min(100, selectedOptionData.riskScore));
    const bufferDeathDay =
      baseDerived.bufferDeathDay && bufferDays < 3
        ? Math.min(30, Math.round((baseDerived.bufferDeathDay + selectedOptionData.bufferImpact) * 10) / 10)
        : null;
    return {
      bufferDays,
      bufferDeathDay,
      demurrageAccum,
      revenueLoss,
      opportunityCost,
      riskIndex,
    };
  }, [baseDerived, selectedOptionData]);

  const fleetState = useMemo<SimFleetState[]>(() => {
    const source = simulationRun?.fleetState?.length
      ? simulationRun.fleetState.map((item) => ({
          id: item.vesselId,
          name: item.vessel,
          type: item.type,
          origin: item.origin || 'Origin',
          destination: item.destination || 'Destination',
          cargo: item.cargo,
          progress: item.routeProgress / 100,
          delayHours: item.delayHours,
          status: item.status.toLowerCase().includes('critical')
            ? 'critical'
            : item.status.toLowerCase().includes('risk')
            ? 'critical'
            : item.status.toLowerCase().includes('wait')
            ? 'waiting'
            : 'transit',
          demurrageAccum: item.demurrageUsd,
        }))
      : FLEET.map((vessel) => {
          const effective = getEffectiveSliders(vessel.id);
          const speedFactor = effective.vesselSpeed / 12;
          const congestionSlowdown = 1 - (sliders.portCongestion - 25) / 200;
          const progressGain = ((currentDay - 1) / vessel.baseEtaDays) * 0.28 * speedFactor * congestionSlowdown;
          const progress = Math.min(1, vessel.baseProgress + progressGain);
          const expectedProgress = Math.min(1, vessel.baseProgress + ((currentDay - 1) / vessel.baseEtaDays) * 0.28);
          const delayHours = Math.max(0, Math.round((expectedProgress - progress) * vessel.baseEtaDays * 24 + Math.max(0, sliders.riskLevel - 60) * 0.35));
          const status: SimFleetState['status'] =
            progress >= 1
              ? sliders.jettyAvailable
                ? 'berthed'
                : 'waiting'
              : delayHours > 12 || sliders.riskLevel > 70 || (activeScenario === 'hormuz-blockade' && vessel.id === 'v-volgograd')
              ? 'critical'
              : 'transit';
          return {
            id: vessel.id,
            name: vessel.name,
            type: vessel.type,
            origin: vessel.origin,
            destination: vessel.destination,
            cargo: vessel.cargo,
            progress,
            delayHours,
            status,
            demurrageAccum: status === 'critical' || status === 'waiting' ? Math.round((vessel.demurrageRate / 24) * Math.max(delayHours, currentDay * 3)) : 0,
          };
        });

    if (!selectedOptionData) return source;
    return source.map((item) => {
      if (item.id !== 'v-volgograd') return item;
      const status: SimFleetState['status'] =
        selectedOptionData.id === 'risk' ? 'reroute' : selectedOptionData.id === 'emergency' ? 'protected' : item.status;
      return {
        ...item,
        destination: selectedOptionData.id === 'risk' ? 'Mumbai Port / JNPT' : item.destination,
        delayHours: Math.max(0, item.delayHours + selectedOptionData.delayHours),
        demurrageAccum: Math.max(0, Math.round(item.demurrageAccum + Math.max(0, selectedOptionData.costDelta) * 0.25)),
        status,
      };
    });
  }, [activeScenario, currentDay, getEffectiveSliders, selectedOptionData, simulationRun, sliders]);

  useEffect(() => {
    if (!isSimulationMode) return;
    const vessel = targetVessel === 'fleet' ? FLEET[0] : FLEET.find((item) => item.id === targetVessel) ?? FLEET[0];
    const dailyConsumption = Math.max(180_000, 310_000 * (sliders.refineryThroughput / 85));
    const payload = {
      vesselId: vessel.id,
      vesselName: vessel.name,
      scenario: activeScenario,
      origin: vessel.origin,
      destination: vessel.destination,
      vesselType: vessel.type,
      vesselSpeedKnots: sliders.vesselSpeed,
      portCongestion: sliders.portCongestion,
      weatherRisk: activeScenario === 'arabian-cyclone' ? Math.max(sliders.riskLevel, 70) : Math.round(sliders.riskLevel * 0.45),
      geopoliticalRisk: sliders.riskLevel,
      insurancePremiumIncreasePct: Math.max(8, Math.round(sliders.riskLevel * 0.45)),
      currentInventoryBbl: Math.round(derived.bufferDays * dailyConsumption),
      dailyConsumptionBbl: Math.round(dailyConsumption),
      minimumBufferDays: 3,
    };
    const timer = window.setTimeout(() => {
      runModule2Optimization(payload, null).then(res => {
          setModule2Result(res);
          // Check for buffer breach and show recovery toast
          if (res?.decision?.selectedRoute?.shortageRisk) {
              showToast('warning', `CRITICAL: ${vessel.name} arrival delayed. Suggesting Recovery Plan: Throughput Reduction.`);
          }
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [activeScenario, derived.bufferDays, isSimulationMode, sliders, targetVessel]);

  const pinSnapshot = useCallback((label: string) => {
    const snap: Snapshot = {
      id: `snap-${Date.now()}`,
      day: currentDay,
      label,
      scenario: activeScenario,
      bufferDays: derived.bufferDays,
      demurrage: derived.demurrageAccum,
      revenueLoss: derived.revenueLoss,
      riskIndex: derived.riskIndex,
    };
    setSnapshots((prev) => [...prev.slice(-2), snap]);
    showToast('success', `Snapshot pinned at Day ${Math.round(currentDay)}`);
  }, [currentDay, activeScenario, derived, showToast]);

  const removeSnapshot = useCallback((id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const selectOption = useCallback((id: StrategicOptionId | null) => setSelectedOption(id), []);

  const applySelectedStrategy = useCallback((): AppliedSimulationImpact | null => {
    if (!selectedOptionData) {
      showToast('warning', 'Select a strategic option before applying the scenario');
      return null;
    }

    const scenarioLabel =
      activeScenario === 'hormuz-blockade'
        ? 'Jamnagar Congestion / Hormuz Disruption'
        : activeScenario === 'baseline'
        ? 'Baseline Operations'
        : activeScenario.replace('-', ' ');

    const impact: AppliedSimulationImpact = {
      id: `applied-${Date.now()}`,
      scenarioId: activeScenario,
      scenarioLabel,
      optionId: selectedOptionData.id,
      optionCode: selectedOptionData.code,
      optionTitle: selectedOptionData.title,
      appliedAt: Date.now(),
      kpis: {
        bufferDays: derived.bufferDays,
        demurrage: derived.demurrageAccum,
        revenueLoss: derived.revenueLoss,
        riskIndex: derived.riskIndex,
        costOfInaction: Math.round((derived.demurrageAccum + derived.revenueLoss) / Math.max(currentDay, 1)),
      },
      selectedVessel: {
        id: 'v-volgograd',
        name: 'MT Volgograd',
      },
      routePreview: {
        vesselId: 'v-volgograd',
        currentRouteLabel: 'Current route: Novorossiysk to Jamnagar / Sikka',
        optimizedRouteLabel:
          selectedOptionData.id === 'risk'
            ? 'Risk optimized route: Volgograd to Mumbai'
            : `${selectedOptionData.title}: active simulation preview`,
        currentRoute: [[18.22, 59.04], [22.42, 69.8]],
        optimizedRoute: [[18.22, 59.04], [20.0838, 64.5005], [20.0, 70.0], [19.0, 72.4], [18.9433, 72.9486]],
      },
    };

    setAppliedImpact(impact);
    activityFeed.addEvent({
      type: 'simulation',
      title: 'Simulation scenario applied',
      description: `${selectedOptionData.title} applied to ${impact.selectedVessel.name}; dashboard KPIs and decision context updated.`,
      timestamp: new Date(),
      metadata: {
        vesselName: impact.selectedVessel.name,
        location: 'Jamnagar / Sikka',
        decisionId: impact.id,
      },
      actionLink: '/dashboard',
    });
    activityFeed.addEvent({
      type: 'alert',
      title: 'Jamnagar/Hormuz risk propagated',
      description: `Risk ${derived.riskIndex}/100, buffer ${derived.bufferDays.toFixed(1)}d, demurrage $${Math.round(derived.demurrageAccum / 1000)}K.`,
      timestamp: new Date(),
      metadata: {
        vesselName: impact.selectedVessel.name,
        location: 'Jamnagar / Sikka',
      },
      actionLink: '/decisions',
    });
    systemStatus.applySimulationImpact({
      status: derived.riskIndex > 70 || derived.bufferDays < 2 ? 'critical' : 'warning',
      systemScore: derived.riskIndex,
      scenarioLabel,
      optionTitle: selectedOptionData.title,
      vesselName: impact.selectedVessel.name,
      bufferDays: derived.bufferDays,
      delayHours: selectedOptionData.delayHours,
      riskDelta: selectedOptionData.riskScore - baseDerived.riskIndex,
    });
    showToast('success', `${selectedOptionData.title} applied to shared state`);
    return impact;
  }, [activeScenario, activityFeed, baseDerived.riskIndex, currentDay, derived, selectedOptionData, showToast, systemStatus]);

  // AI presets
  const runAIPreset = useCallback((preset: AIPresetId) => {
    const cfg = AI_PRESETS[preset];
    setActiveScenarioState(cfg.scenario);
    setSliders({ ...DEFAULT_SLIDERS, ...cfg.sliders } as SimulationSliders);
    setVesselOverrides({});
    setLastAIPreset(preset);
    setSelectedOption(null);
    setSimulationRun(null);
    setAppliedImpact(null);
    setCurrentDayState(1);
    setIsPlaying(true);
    showToast('info', `AI preset applied: ${cfg.label}`);
  }, [showToast]);

  // Save / Load / Delete
  const saveScenario = useCallback(
    (name: string, description: string): SavedScenario => {
      const item: SavedScenario = {
        id: `sc-${Date.now()}`,
        name: name || `Scenario ${savedScenarios.length + 1}`,
        description,
        scenario: activeScenario,
        sliders: { ...sliders },
        targetVessel,
        vesselOverrides: { ...vesselOverrides },
        createdAt: Date.now(),
      };
      persistScenarios([item, ...savedScenarios]);
      saveSimulationScenarioApi({
        name: item.name,
        description: item.description,
        scenarioId: item.scenario,
        sliders: item.sliders,
        targetVessel: item.targetVessel,
      });
      showToast('success', `Saved scenario: ${item.name}`);
      return item;
    },
    [activeScenario, sliders, targetVessel, vesselOverrides, savedScenarios, persistScenarios, showToast]
  );

  const loadScenario = useCallback(
    (id: string) => {
      const item = savedScenarios.find((s) => s.id === id);
      if (!item) return;
      setActiveScenarioState(item.scenario);
      setSliders(item.sliders);
      setVesselOverrides(item.vesselOverrides);
      setTargetVessel(item.targetVessel);
      setCurrentDayState(1);
      const updated = savedScenarios.map((s) => (s.id === id ? { ...s, lastRun: Date.now() } : s));
      persistScenarios(updated);
      showToast('info', `Loaded: ${item.name}`);
    },
    [savedScenarios, persistScenarios, showToast]
  );

  const deleteScenario = useCallback(
    (id: string) => {
      persistScenarios(savedScenarios.filter((s) => s.id !== id));
    },
    [savedScenarios, persistScenarios]
  );

  return (
    <SimulationContext.Provider
      value={{
        isSimulationMode,
        enterSimulationMode,
        exitSimulationMode,
        activeScenario,
        availableScenarios,
        setActiveScenario,
        sliders,
        setSlider,
        resetSliders,
        targetVessel,
        setTargetVessel,
        vesselOverrides,
        getEffectiveSliders,
        isRunning,
        runSimulation,
        resetToLive,
        currentDay,
        setCurrentDay,
        isPlaying,
        playbackStepHours,
        setPlaybackStepHours,
        playbackSpeed,
        setPlaybackSpeed,
        togglePlayback,
        pausePlayback,
        ...derived,
        simulationRun,
        fleetState,
        snapshots,
        pinSnapshot,
        removeSnapshot,
        strategicOptions,
        selectedOption,
        selectOption,
        recommendedOption,
        applySelectedStrategy,
        appliedImpact,
        runAIPreset,
        lastAIPreset,
        savedScenarios,
        saveScenario,
        loadScenario,
        deleteScenario,
        lastToast,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within SimulationProvider');
  return context;
}
