'use client';

/**
 * Command Palette — top-tier SaaS pattern (Linear, Notion, Raycast,
 * GitHub, C3 AI). Triggered via ⌘K / Ctrl+K from anywhere in the app.
 *
 * Provides:
 *   - Page navigation
 *   - Quick actions (toggle simulation, run scenarios)
 *   - Search across vessels & decisions (mock)
 *   - Hint hotkeys
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Map as MapIcon,
  Brain,
  FlaskConical,
  Ship,
  BarChart3,
  Settings as SettingsIcon,
  Play,
  Square,
  ChevronRight,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useSimulation } from '@/contexts';

interface Command {
  id: string;
  label: string;
  group: 'navigate' | 'action' | 'recent';
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
  keywords?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const sim = useSimulation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle on ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery('');
        setActive(0);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const commands: Command[] = useMemo(() => {
    const nav = (label: string, href: string, icon: any, keywords?: string): Command => ({
      id: `nav:${href}`,
      label,
      group: 'navigate',
      icon,
      keywords,
      hint: 'Go',
      run: () => router.push(href),
    });

    return [
      nav('Dashboard', '/', LayoutDashboard, 'home overview live'),
      nav('Intelligence Map', '/map', MapIcon, 'map vessels routes leaflet'),
      nav('Decision Engine', '/decisions', Brain, 'decisions ai recommendations queue'),
      nav('Simulation Lab', '/simulation', FlaskConical, 'simulation scenario hormuz cyclone'),
      nav('Shipments', '/shipments', Ship, 'shipments fleet vessels'),
      nav('Analytics', '/analytics', BarChart3, 'analytics financial operations risk'),
      nav('Settings', '/settings', SettingsIcon, 'settings preferences integrations team'),

      {
        id: 'action:enter-sim',
        label: sim.isSimulationMode ? 'Exit simulation mode' : 'Enter simulation mode',
        group: 'action',
        icon: sim.isSimulationMode ? Square : Play,
        hint: sim.isSimulationMode ? 'Exit' : 'Enter',
        keywords: 'simulation mode toggle',
        run: () => {
          if (sim.isSimulationMode) sim.exitSimulationMode();
          else {
            sim.enterSimulationMode();
            router.push('/simulation');
          }
        },
      },
      {
        id: 'action:run-worst',
        label: 'Run AI preset: Worst-case stress test',
        group: 'action',
        icon: FlaskConical,
        hint: 'Run',
        keywords: 'worst case stress test ai',
        run: () => {
          sim.enterSimulationMode();
          sim.runAIPreset('worst-case');
          router.push('/simulation');
        },
      },
      {
        id: 'action:run-cost',
        label: 'Run AI preset: Lowest cost',
        group: 'action',
        icon: FlaskConical,
        hint: 'Run',
        keywords: 'cost optimize lowest preset',
        run: () => {
          sim.enterSimulationMode();
          sim.runAIPreset('lowest-cost');
          router.push('/simulation');
        },
      },
    ];
  }, [router, sim]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || (c.keywords ?? '').toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset active row when filter changes
  useEffect(() => setActive(0), [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) {
        cmd.run();
        setOpen(false);
      }
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="pop-in mt-[12vh] w-full max-w-[560px] overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search */}
        <div className="flex items-center gap-2 border-b border-[#2a2a2a] px-3 py-2">
          <Search className="h-4 w-4 text-[#525252]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, actions, vessels..."
            className="flex-1 bg-transparent text-sm text-[#e5e5e5] outline-none placeholder:text-[#525252]"
          />
          <kbd className="rounded bg-[#262626] px-1.5 py-0.5 text-[9px] font-mono text-[#737373] border border-[#3a3a3a]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#525252]">No results</div>
          ) : (
            <>
              {(['navigate', 'action'] as const).map((group) => {
                const items = filtered.filter((c) => c.group === group);
                if (!items.length) return null;
                return (
                  <div key={group}>
                    <div className="px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-[#525252]">
                      {group === 'navigate' ? 'Navigate' : 'Quick actions'}
                    </div>
                    {items.map((cmd) => {
                      const idx = filtered.indexOf(cmd);
                      const isActive = idx === active;
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => {
                            cmd.run();
                            setOpen(false);
                          }}
                          className={`group flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                            isActive ? 'bg-[#3b82f6]/10' : 'hover:bg-[#1a1a1a]'
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 flex-none ${
                              isActive ? 'text-[#3b82f6]' : 'text-[#737373]'
                            }`}
                          />
                          <span
                            className={`flex-1 truncate text-sm ${
                              isActive ? 'text-[#e5e5e5]' : 'text-[#a3a3a3]'
                            }`}
                          >
                            {cmd.label}
                          </span>
                          {cmd.hint && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-[#525252]">
                              {cmd.hint}
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 text-[9px] font-mono text-[#525252]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded bg-[#1a1a1a] px-1 py-0.5 text-[#737373]">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="rounded bg-[#1a1a1a] px-1 py-0.5 text-[#737373]">↵</kbd> Run
            </span>
          </div>
          <span className="flex items-center gap-1">
            <ArrowRight className="h-3 w-3" />
            CrudeFlow Command Palette
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
