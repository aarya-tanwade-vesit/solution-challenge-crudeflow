'use client';

/**
 * SimControlPanel
 * ───────────────
 * Compact floating panel that appears on the map ONLY when simulation
 * mode is active. Gives the operator a single, non-intrusive surface to:
 *
 *   • Toggle the simulation overlay (Show / Hide)
 *   • Reset all simulation parameters (sliders, day, snapshots)
 *   • Exit simulation mode (returns to clean reality view)
 *
 * It also displays the current simulation day and active scenario so the
 * user always knows "what state am I in?" — a critical state-awareness
 * cue for enterprise UX.
 */

import React from 'react';
import Link from 'next/link';
import { Eye, EyeOff, RotateCcw, X, FlaskConical, ExternalLink } from 'lucide-react';
import { useSimulation } from '@/contexts';

interface Props {
  overlayEnabled: boolean;
  onToggleOverlay: () => void;
}

const SCENARIO_LABELS: Record<string, string> = {
  baseline: 'Baseline',
  'hormuz-blockade': 'Hormuz Blockade',
  'arabian-cyclone': 'Arabian Cyclone',
  'refinery-shutdown': 'Refinery Shutdown',
  'cyber-attack': 'Cyber Attack',
  'jetty-strike': 'Jetty Strike',
};

export function SimControlPanel({ overlayEnabled, onToggleOverlay }: Props) {
  const {
    isSimulationMode,
    activeScenario,
    currentDay,
    resetToLive,
    exitSimulationMode,
  } = useSimulation();

  if (!isSimulationMode) return null;

  return (
    <div className="rounded-lg border border-[#3b82f6]/20 bg-[#0a0a0a]/85 backdrop-blur-md shadow-lg overflow-hidden pointer-events-auto">
      {/* Header — control surface, not sidebar: subtle, no colored fill */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1f1f1f]">
        <FlaskConical className="h-3 w-3 text-[#3b82f6]" />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
          Simulation
        </span>
        <span className="ml-auto text-[9px] font-mono text-[#737373]">
          Day {currentDay.toFixed(1)}
        </span>
      </div>

      {/* Scenario label */}
      <div className="px-3 pt-1.5 pb-1">
        <div className="text-[8px] font-semibold uppercase tracking-wider text-[#525252]">
          Active scenario
        </div>
        <div className="text-[11px] font-semibold text-[#e5e5e5] truncate">
          {SCENARIO_LABELS[activeScenario] ?? activeScenario}
        </div>
      </div>

      {/* Actions */}
      <div className="p-1.5 grid grid-cols-2 gap-1">
        <button
          onClick={onToggleOverlay}
          title={overlayEnabled ? 'Hide simulation overlay' : 'Show simulation overlay'}
          className={`col-span-2 flex items-center justify-center gap-1.5 h-6 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${
            overlayEnabled
              ? 'border border-[#3b82f6]/25 bg-transparent text-[#3b82f6] hover:bg-[#3b82f6]/10'
              : 'border border-[#1f1f1f] bg-transparent text-[#737373] hover:text-[#e5e5e5] hover:border-[#2a2a2a]'
          }`}
        >
          {overlayEnabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          {overlayEnabled ? 'Overlay on' : 'Overlay hidden'}
        </button>

        <Link
          href="/simulation"
          className="flex items-center justify-center gap-1 h-6 rounded border border-[#1f1f1f] bg-transparent text-[#737373] hover:text-[#e5e5e5] hover:border-[#2a2a2a] text-[10px] font-semibold uppercase tracking-wider"
          title="Open Simulation Lab"
        >
          <ExternalLink className="h-3 w-3" />
          Lab
        </Link>

        <button
          onClick={resetToLive}
          title="Reset simulation parameters"
          className="flex items-center justify-center gap-1 h-6 rounded border border-[#1f1f1f] bg-transparent text-[#737373] hover:text-[#e5e5e5] hover:border-[#2a2a2a] text-[10px] font-semibold uppercase tracking-wider"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>

        <button
          onClick={exitSimulationMode}
          title="Exit simulation mode"
          className="col-span-2 flex items-center justify-center gap-1 h-6 rounded border border-[#ef4444]/20 bg-transparent text-[#ef4444]/85 hover:bg-[#ef4444]/10 hover:text-[#ef4444] text-[10px] font-semibold uppercase tracking-wider"
        >
          <X className="h-3 w-3" />
          Exit simulation
        </button>
      </div>
    </div>
  );
}
