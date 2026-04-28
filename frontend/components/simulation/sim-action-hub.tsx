'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play, Pause, RotateCcw, Save, FlaskConical, Loader2, X, Sparkles,
  ChevronDown, AlertOctagon, Banknote, Timer, Shield,
} from 'lucide-react';
import { useSimulation } from '@/contexts';
import { SaveScenarioDialog } from './save-scenario-dialog';
import type { AIPresetId } from '@/contexts/simulation-context';

const AI_PRESETS: { id: AIPresetId; label: string; description: string; icon: React.ElementType; accent: string }[] = [
  { id: 'worst-case',          label: 'Simulate worst case',     description: 'Hormuz blockade + cyclone + jetty strike',          icon: AlertOctagon, accent: 'red' },
  { id: 'lowest-cost',         label: 'Optimize for cost',       description: 'Minimize total operating expense across fleet',     icon: Banknote,     accent: 'emerald' },
  { id: 'minimize-delay',      label: 'Minimize delay impact',   description: 'Time-optimized profile, accept fuel premium',       icon: Timer,        accent: 'blue' },
  { id: 'maximize-resilience', label: 'Maximize resilience',     description: 'Balanced risk and buffer protection',               icon: Shield,       accent: 'amber' },
];

export function SimActionHub() {
  const router = useRouter();
  const {
    isPlaying, isRunning, runSimulation, togglePlayback, resetToLive, exitSimulationMode,
    activeScenario, currentDay, runAIPreset, lastAIPreset,
  } = useSimulation();
  const [aiOpen, setAiOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const aiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (aiRef.current && !aiRef.current.contains(e.target as Node)) setAiOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleExit = () => {
    exitSimulationMode();
    router.push('/');
  };

  const scenarioLabel = activeScenario === 'baseline' ? 'Baseline' : activeScenario.replace('-', ' ');

  return (
    <header className="flex-shrink-0 border-b border-[#2a2a2a] bg-[#0f0f0f] px-5 py-2.5 flex items-center justify-between gap-4 relative z-30">
      {/* Left: Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-md bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-4 h-4 text-[#3b82f6]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-[#e5e5e5] truncate">Simulation Lab</h1>
            <span className="px-1.5 py-0.5 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded text-[9px] font-bold uppercase tracking-wider text-[#3b82f6]">
              Sandbox
            </span>
            {isPlaying && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                Playing
              </span>
            )}
            {lastAIPreset && (
              <span className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[9px] font-mono text-[#a3a3a3]">
                <Sparkles className="w-2.5 h-2.5 text-[#3b82f6]" />
                AI: {lastAIPreset.replace('-', ' ')}
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#737373] truncate capitalize">
            {scenarioLabel} &middot; Day {Math.round(currentDay)}/30 &middot; Scenario Mock Data
          </p>
        </div>
      </div>

      {/* Right: Action Hub */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* AI presets */}
        <div ref={aiRef} className="relative">
          <button
            onClick={() => setAiOpen((o) => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#3b82f6]/30 text-[#3b82f6] text-xs font-semibold rounded hover:bg-[#3b82f6]/10 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">AI Presets</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {aiOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-2xl z-40 overflow-hidden">
              <div className="px-3 py-2 border-b border-[#2a2a2a]">
                <div className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider">NEMO AI Auto-Configure</div>
                <div className="text-[10px] text-[#525252]">Auto-adjusts variables and runs scenario</div>
              </div>
              {AI_PRESETS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => { runAIPreset(p.id); setAiOpen(false); }}
                    className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-[#262626] transition-colors text-left border-b border-[#2a2a2a] last:border-b-0"
                  >
                    <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${
                      p.accent === 'red' ? 'bg-red-500/10 text-red-400' :
                      p.accent === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                      p.accent === 'amber' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-[#3b82f6]/10 text-[#3b82f6]'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[#e5e5e5]">{p.label}</div>
                      <div className="text-[10px] text-[#737373] mt-0.5 leading-snug">{p.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Run / Pause */}
        {isPlaying ? (
          <button
            onClick={togglePlayback}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#e5e5e5] text-xs font-semibold rounded hover:bg-[#262626] transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>
        ) : (
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b82f6] text-white text-xs font-semibold rounded hover:bg-[#2563eb] transition-colors disabled:opacity-60"
          >
            {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Initializing' : currentDay > 1 ? 'Resume' : 'Run'}
          </button>
        )}

        {/* Save */}
        <button
          onClick={() => setSaveOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#a3a3a3] text-xs font-semibold rounded hover:bg-[#262626] hover:text-[#e5e5e5] transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Save</span>
        </button>

        {/* Reset */}
        <button
          onClick={resetToLive}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#a3a3a3] text-xs font-semibold rounded hover:bg-[#262626] hover:text-[#e5e5e5] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset</span>
        </button>

        {/* Exit */}
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#a3a3a3] text-xs font-semibold rounded hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Exit</span>
        </button>
      </div>

      <SaveScenarioDialog open={saveOpen} onClose={() => setSaveOpen(false)} />
    </header>
  );
}
