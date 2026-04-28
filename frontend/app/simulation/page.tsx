'use client';

import { useEffect, useRef, useState } from 'react';
import { useSimulation, useSettings } from '@/contexts';
import { MainLayout } from '@/components/layout/main-layout';
import { ControlPanel } from '@/components/simulation/control-panel';
import { SimKpiBar } from '@/components/simulation/sim-kpi-bar';
import { SimActionHub } from '@/components/simulation/sim-action-hub';
import { TimelineScrubber } from '@/components/simulation/timeline-scrubber';
import { ScenarioVisualization } from '@/components/simulation/scenario-visualization';
import { StrategicAlternatives } from '@/components/simulation/strategic-alternatives';
import { ImpactSummary } from '@/components/simulation/impact-summary';
import { FinancialTicker } from '@/components/simulation/financial-ticker';
import { DecisionEngineSim } from '@/components/simulation/decision-engine-sim';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Ship,
  GitCompare,
  Brain,
  FlaskConical,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  Play,
} from 'lucide-react';

const SCENARIO_LABELS: Record<string, string> = {
  baseline: 'Baseline Operations',
  'hormuz-blockade': 'Strait of Hormuz Blockade',
  'arabian-cyclone': 'Arabian Sea Cyclone',
  'refinery-shutdown': 'Refinery Unit Shutdown',
  'cyber-attack': 'Port Cyber Incident',
  'jetty-strike': 'Kochi Jetty Strike',
};

export default function SimulationPage() {
  const { isSimulationMode, enterSimulationMode, activeScenario, lastAIPreset } = useSimulation();
  const { preferences } = useSettings();
  const [rightOpen, setRightOpen] = useState(true);
  const [tab, setTab] = useState('fleet');

  // Only auto-enter on FIRST mount. After that, a user-initiated Exit
  // must keep the page in an explicit "exited" state without re-looping.
  const enteredOnceRef = useRef(false);
  useEffect(() => {
    if (!enteredOnceRef.current && !isSimulationMode) {
      enterSimulationMode();
      enteredOnceRef.current = true;
    }
  }, [isSimulationMode, enterSimulationMode]);

  // ── Exited state: stay on the page, show empty state, don't redirect ──
  if (!isSimulationMode) {
    return (
      <MainLayout>
        <div className="page-transition flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-[#0a0a0a] px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#141414]">
              <FlaskConical className="h-5 w-5 text-[#525252]" />
            </div>
            <h1 className="text-lg font-semibold text-[#e5e5e5]">Simulation Lab</h1>
            <p className="mt-2 text-sm text-[#737373]">
              You are not in simulation mode. Launching a simulation here keeps live
              dashboards untouched and explores hypothetical scenarios safely.
            </p>
            <button
              onClick={() => {
                enterSimulationMode();
                enteredOnceRef.current = true;
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2563eb] transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              Enter Simulation Lab
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page-transition flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#0a0a0a]">
        {/* ===== HEADER ===== */}
        <header className="flex flex-none flex-wrap items-center justify-between gap-3 border-b border-[#2a2a2a] bg-[#0f0f0f]/80 px-4 py-3 xl:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/10">
              <FlaskConical className="h-4 w-4 text-[#3b82f6]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-semibold text-[#e5e5e5]">Simulation Lab</h1>
                {preferences.simulationViewMode === 'integrated' && (
                  <span className="hidden items-center gap-1 rounded border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#3b82f6] sm:inline-flex">
                    System-wide cascade
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#737373]">
                <span className="truncate">{SCENARIO_LABELS[activeScenario] ?? activeScenario}</span>
                {lastAIPreset && (
                  <>
                    <span className="text-[#404040]">·</span>
                    <span className="flex items-center gap-1 text-[#3b82f6]">
                      <Sparkles className="h-3 w-3" />
                      AI: {lastAIPreset.replace('-', ' ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <SimActionHub />
        </header>

        {/* ===== COMPACT KPI BAR ===== */}
        <div className="flex-none border-b border-[#2a2a2a] px-4 py-3 xl:px-6">
          <SimKpiBar />
        </div>

        {/* ===== WORKSPACE ===== */}
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {/* LEFT CONTROL PANEL (self-contained aside, 300px) */}
          <ControlPanel />

          {/* CENTER TABBED AREA */}
          <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Tabs value={tab} onValueChange={setTab} className="tabs-dark flex h-full min-h-0 flex-col">
              <div className="flex-none border-b border-[#2a2a2a] bg-[#0f0f0f]/50 px-4 py-2">
                <TabsList className="h-8">
                  <TabsTrigger value="fleet" className="h-7 gap-1.5 text-xs px-3">
                    <Ship className="h-3 w-3" />
                    Fleet State
                  </TabsTrigger>
                  <TabsTrigger value="strategic" className="h-7 gap-1.5 text-xs px-3">
                    <Brain className="h-3 w-3" />
                    Strategic Options
                  </TabsTrigger>
                  <TabsTrigger value="impact" className="h-7 gap-1.5 text-xs px-3">
                    <GitCompare className="h-3 w-3" />
                    Impact & Damage
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="fleet" className="m-0 p-4 focus-visible:outline-none xl:p-6">
                  <ScenarioVisualization />
                </TabsContent>

                <TabsContent value="strategic" className="m-0 p-4 focus-visible:outline-none xl:p-6">
                  <StrategicAlternatives />
                </TabsContent>

                <TabsContent value="impact" className="m-0 flex-1 p-4 focus-visible:outline-none xl:p-6">
                  <div className="space-y-4">
                    <FinancialTicker />
                    <ImpactSummary />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </section>

          {/* RIGHT DECISION ENGINE (toggleable) */}
          <button
            type="button"
            onClick={() => setRightOpen((v) => !v)}
            className="absolute top-3 z-20 flex h-7 w-5 items-center justify-center rounded-l-md border border-r-0 border-[#2a2a2a] bg-[#0f0f0f] text-[#737373] hover:text-[#e5e5e5]"
            style={{ right: rightOpen ? '360px' : '0' }}
            aria-label={rightOpen ? 'Collapse decision engine' : 'Expand decision engine'}
          >
            {rightOpen ? <PanelRightClose className="h-3 w-3" /> : <PanelRightOpen className="h-3 w-3" />}
          </button>

          <div
            className={cn(
              'flex-none overflow-hidden transition-all duration-200',
              rightOpen ? 'w-[360px]' : 'w-0'
            )}
          >
            {rightOpen && <DecisionEngineSim />}
          </div>
        </div>

        {/* ===== BOTTOM TIMELINE ===== */}
        <TimelineScrubber />
      </div>
    </MainLayout>
  );
}
