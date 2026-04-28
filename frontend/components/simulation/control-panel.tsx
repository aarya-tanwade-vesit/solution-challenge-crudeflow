'use client';

import React, { useState } from 'react';
import {
  Zap, Waves, Factory, ShieldAlert, Anchor, RotateCcw, Gauge, Droplet, Container, Activity, Ban, Cpu,
  ChevronDown, ChevronRight, Ship,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useSimulation } from '@/contexts';
import { FLEET } from '@/contexts/simulation-context';
import type { ScenarioId, SimulationSliders } from '@/contexts/simulation-context';

const SCENARIOS: { id: ScenarioId; label: string; sub: string; icon: React.ElementType; accent: string }[] = [
  { id: 'hormuz-blockade',  label: 'Hormuz Blockade',     sub: 'Chokepoint closure',         icon: Ban,     accent: 'red' },
  { id: 'arabian-cyclone',  label: 'Arabian Cyclone',     sub: 'Severe weather',             icon: Waves,   accent: 'amber' },
  { id: 'refinery-shutdown',label: 'Refinery Shutdown',   sub: 'CDU trip event',             icon: Factory, accent: 'amber' },
  { id: 'cyber-attack',     label: 'Port Cyber Incident', sub: 'Terminal offline',           icon: Cpu,     accent: 'red' },
  { id: 'jetty-strike',     label: 'Kochi Jetty Strike',  sub: '48h labor disruption',       icon: Anchor,  accent: 'amber' },
];

const ACCENT_STYLES: Record<string, { border: string; bg: string; icon: string }> = {
  red:    { border: 'hover:border-red-500/40',    bg: 'hover:bg-red-500/5',    icon: 'text-red-400 bg-red-500/10' },
  amber:  { border: 'hover:border-amber-500/40',  bg: 'hover:bg-amber-500/5',  icon: 'text-amber-400 bg-amber-500/10' },
  blue:   { border: 'hover:border-[#3b82f6]/40',  bg: 'hover:bg-[#3b82f6]/5',  icon: 'text-[#3b82f6] bg-[#3b82f6]/10' },
};

interface SliderRowProps {
  icon: React.ElementType;
  label: string;
  scope?: 'fleet' | 'vessel';
  value: string | number;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  sliderValue: number;
  onChange: (value: number) => void;
  severity?: 'normal' | 'warning' | 'critical';
}

function SliderRow({ icon: Icon, label, scope, value, unit, min, max, step = 1, sliderValue, onChange, severity = 'normal' }: SliderRowProps) {
  const severityColor =
    severity === 'critical' ? 'text-red-400' : severity === 'warning' ? 'text-amber-400' : 'text-[#e5e5e5]';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#a3a3a3] min-w-0">
          <Icon className="w-3 h-3 text-[#737373] flex-shrink-0" />
          <span className="text-[11px] font-medium truncate">{label}</span>
          {scope && (
            <span className={`text-[8px] font-mono px-1 py-px rounded ${
              scope === 'fleet' ? 'bg-[#262626] text-[#737373]' : 'bg-[#3b82f6]/10 text-[#3b82f6]'
            }`}>
              {scope.toUpperCase()}
            </span>
          )}
        </div>
        <span className={`text-xs font-mono font-semibold tabular-nums ${severityColor}`}>
          {value}
          {unit && <span className="text-[10px] text-[#525252] ml-0.5">{unit}</span>}
        </span>
      </div>
      <Slider
        value={[sliderValue]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        className="[&_[data-slot=slider-track]]:bg-[#262626] [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-range]]:bg-[#3b82f6] [&_[data-slot=slider-thumb]]:border-[#3b82f6] [&_[data-slot=slider-thumb]]:bg-[#0f0f0f] [&_[data-slot=slider-thumb]]:size-3"
      />
    </div>
  );
}

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-[#2a2a2a]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors"
      >
        <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">{title}</span>
        {open ? <ChevronDown className="w-3 h-3 text-[#525252]" /> : <ChevronRight className="w-3 h-3 text-[#525252]" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </section>
  );
}

export function ControlPanel() {
  const {
    activeScenario, setActiveScenario, sliders, setSlider, resetSliders,
    targetVessel, setTargetVessel, getEffectiveSliders,
  } = useSimulation();

  const [vesselMenuOpen, setVesselMenuOpen] = useState(false);

  // When a specific vessel is targeted, show its effective sliders for vessel-scoped controls
  const effective = targetVessel === 'fleet' ? sliders : getEffectiveSliders(targetVessel);

  const getSeverity = (v: number, warning: number, critical: number, inverse = false): 'normal' | 'warning' | 'critical' => {
    if (inverse) {
      if (v < critical) return 'critical';
      if (v < warning) return 'warning';
      return 'normal';
    }
    if (v > critical) return 'critical';
    if (v > warning) return 'warning';
    return 'normal';
  };

  const targetVesselName = targetVessel === 'fleet'
    ? 'Apply to Entire Fleet'
    : FLEET.find((v) => v.id === targetVessel)?.name || 'Fleet';

  return (
    <aside className="w-[300px] flex-shrink-0 bg-[#141414] border-r border-[#2a2a2a] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#2a2a2a] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span className="text-xs font-semibold text-[#e5e5e5] uppercase tracking-wider">Controls</span>
        </div>
        <button
          onClick={resetSliders}
          className="flex items-center gap-1 text-[10px] text-[#525252] hover:text-[#a3a3a3] transition-colors"
          title="Reset all variables"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Vessel Target Selector */}
      <div className="px-4 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a] flex-shrink-0">
        <div className="text-[9px] font-bold text-[#737373] uppercase tracking-wider mb-1.5">
          Apply Vessel-Scoped Variables To
        </div>
        <div className="relative">
          <button
            onClick={() => setVesselMenuOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-2 bg-[#0f0f0f] border border-[#2a2a2a] hover:border-[#3b82f6]/40 rounded text-left transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Ship className="w-3.5 h-3.5 text-[#3b82f6] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#e5e5e5] truncate">{targetVesselName}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#525252] flex-shrink-0" />
          </button>

          {vesselMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setVesselMenuOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-2xl z-40 overflow-hidden">
                <button
                  onClick={() => { setTargetVessel('fleet'); setVesselMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#262626] transition-colors text-left ${
                    targetVessel === 'fleet' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'text-[#e5e5e5]'
                  }`}
                >
                  <Ship className="w-3 h-3" />
                  <span className="font-semibold">Entire Fleet</span>
                  <span className="ml-auto text-[10px] text-[#525252] font-mono">5 vessels</span>
                </button>
                <div className="border-t border-[#2a2a2a]">
                  {FLEET.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => { setTargetVessel(v.id); setVesselMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#262626] transition-colors text-left border-t border-[#2a2a2a] ${
                        targetVessel === v.id ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'text-[#e5e5e5]'
                      }`}
                    >
                      <Ship className="w-3 h-3" />
                      <span className="font-semibold truncate">{v.name}</span>
                      <span className="ml-auto text-[10px] text-[#525252] font-mono flex-shrink-0">{v.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <p className="text-[10px] text-[#525252] mt-1.5 leading-snug">
          Vessel-scoped sliders (speed, discharge rate) apply only to selected target.
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <Section title="Predefined Scenarios">
          <div className="flex items-center justify-end mb-2 -mt-1">
            {activeScenario !== 'baseline' && (
              <button
                onClick={() => setActiveScenario('baseline')}
                className="text-[10px] text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
              >
                Clear scenario
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {SCENARIOS.map((s) => {
              const active = activeScenario === s.id;
              const style = ACCENT_STYLES[s.accent];
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveScenario(s.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md border text-left transition-all ${
                    active
                      ? 'bg-[#3b82f6]/5 border-[#3b82f6]/40'
                      : `bg-[#1a1a1a] border-[#2a2a2a] ${style.border} ${style.bg}`
                  }`}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${style.icon}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-semibold truncate ${active ? 'text-[#3b82f6]' : 'text-[#e5e5e5]'}`}>
                      {s.label}
                    </div>
                    <div className="text-[9px] text-[#525252] truncate">{s.sub}</div>
                  </div>
                  {active && <span className="w-1 h-1 bg-[#3b82f6] rounded-full animate-pulse flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Vessel-Scoped Variables">
          <div className="space-y-4">
            <SliderRow
              icon={Gauge}
              label="Vessel Speed"
              scope={targetVessel === 'fleet' ? 'fleet' : 'vessel'}
              value={effective.vesselSpeed}
              unit="kt"
              min={8}
              max={20}
              sliderValue={effective.vesselSpeed}
              onChange={(v) => setSlider('vesselSpeed', v)}
              severity={getSeverity(effective.vesselSpeed, 14, 10, true)}
            />
            <SliderRow
              icon={Gauge}
              label="Discharge Rate"
              scope={targetVessel === 'fleet' ? 'fleet' : 'vessel'}
              value={effective.dischargeRate.toLocaleString()}
              unit="MT/h"
              min={1000}
              max={6000}
              step={250}
              sliderValue={effective.dischargeRate}
              onChange={(v) => setSlider('dischargeRate', v)}
              severity={getSeverity(effective.dischargeRate, 3500, 2500, true)}
            />
          </div>
        </Section>

        <Section title="Network-Wide Variables">
          <div className="space-y-4">
            <SliderRow
              icon={Activity}
              label="Port Congestion"
              scope="fleet"
              value={sliders.portCongestion}
              unit="%"
              min={0}
              max={100}
              sliderValue={sliders.portCongestion}
              onChange={(v) => setSlider('portCongestion', v)}
              severity={getSeverity(sliders.portCongestion, 50, 75)}
            />
            <SliderRow
              icon={ShieldAlert}
              label="Geopolitical Risk"
              scope="fleet"
              value={sliders.riskLevel}
              unit="%"
              min={0}
              max={100}
              sliderValue={sliders.riskLevel}
              onChange={(v) => setSlider('riskLevel', v)}
              severity={getSeverity(sliders.riskLevel, 50, 75)}
            />
            <SliderRow
              icon={Factory}
              label="Refinery Throughput"
              scope="fleet"
              value={sliders.refineryThroughput}
              unit="%"
              min={30}
              max={100}
              sliderValue={sliders.refineryThroughput}
              onChange={(v) => setSlider('refineryThroughput', v)}
              severity={getSeverity(sliders.refineryThroughput, 70, 50, true)}
            />
            <SliderRow
              icon={Container}
              label="Inventory Ullage"
              scope="fleet"
              value={sliders.inventoryCapacity}
              unit="% free"
              min={0}
              max={100}
              sliderValue={sliders.inventoryCapacity}
              onChange={(v) => setSlider('inventoryCapacity', v)}
              severity={getSeverity(sliders.inventoryCapacity, 30, 15, true)}
            />
          </div>
        </Section>

        <Section title="Port & Cargo">
          <div className="space-y-4">
            {/* Jetty toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-[#a3a3a3]">
                  <Anchor className="w-3 h-3 text-[#737373]" />
                  <span className="text-[11px] font-medium">Jetty 4 Kochi</span>
                </div>
                <span className={`text-[10px] font-mono font-semibold ${sliders.jettyAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                  {sliders.jettyAvailable ? 'ONLINE' : 'CLOSED'}
                </span>
              </div>
              <div className="flex gap-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded p-0.5">
                <button
                  onClick={() => setSlider('jettyAvailable', true)}
                  className={`flex-1 text-[10px] font-semibold py-1 rounded transition-colors ${
                    sliders.jettyAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'text-[#525252] hover:text-[#a3a3a3]'
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => setSlider('jettyAvailable', false)}
                  className={`flex-1 text-[10px] font-semibold py-1 rounded transition-colors ${
                    !sliders.jettyAvailable ? 'bg-red-500/10 text-red-400' : 'text-[#525252] hover:text-[#a3a3a3]'
                  }`}
                >
                  Shutdown
                </button>
              </div>
            </div>

            {/* Crude type */}
            <div>
              <div className="flex items-center gap-1.5 text-[#a3a3a3] mb-1.5">
                <Droplet className="w-3 h-3 text-[#737373]" />
                <span className="text-[11px] font-medium">Crude Substitution</span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded p-0.5">
                {(['low-sulphur', 'medium-sulphur', 'high-sulphur'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSlider('crudeType', type)}
                    className={`text-[10px] font-medium py-1 rounded transition-colors capitalize ${
                      sliders.crudeType === type ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'text-[#525252] hover:text-[#a3a3a3]'
                    }`}
                  >
                    {type.split('-')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <div className="px-4 py-3 text-[10px] text-[#525252] leading-snug">
          All changes propagate through the timeline in real-time.
        </div>
      </div>
    </aside>
  );
}
