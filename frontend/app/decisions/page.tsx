'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { useDecisions } from '@/contexts';
import type { DecisionRecord } from '@/contexts/decisions-context';
import { DecisionsKpiBar } from '@/components/decisions/decisions-kpi-bar';
import { DecisionsFilterBar } from '@/components/decisions/decisions-filter-bar';
import { DecisionQueueRail } from '@/components/decisions/decision-queue-rail';
import { DecisionCorePanel } from '@/components/decisions/decision-core-panel';
import { EvidencePanel } from '@/components/decisions/evidence-panel';
import { AICopilotPanel } from '@/components/decisions/ai-copilot-panel';
import { Brain, Inbox, Database, Sparkles, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';

export default function DecisionsPage() {
  const { decisions, filter } = useDecisions();
  const [selectedId, setSelectedId] = useState<string | null>(decisions[0]?.id ?? null);
  const [queueOpen, setQueueOpen] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(true);

  // Active tab for mobile/narrow viewports
  const [mobileTab, setMobileTab] = useState<'queue' | 'core' | 'evidence' | 'copilot'>('core');

  const visible = useMemo<DecisionRecord[]>(() => {
    return decisions.filter((d) => {
      if (filter.status !== 'all' && d.status !== filter.status) return false;
      if (filter.priority !== 'all' && d.priority !== filter.priority) return false;
      if (filter.source !== 'all' && d.source !== filter.source) return false;
      return true;
    });
  }, [decisions, filter]);

  const selected = useMemo(
    () => decisions.find((d) => d.id === selectedId) ?? visible[0] ?? null,
    [decisions, selectedId, visible]
  );

  return (
    <MainLayout>
      <div className="page-transition flex flex-1 flex-col min-h-0 bg-[#0a0a0a]">
        {/* Page header */}
        <header className="flex-none border-b border-[#2a2a2a] bg-[#0f0f0f]/80 px-4 py-3 xl:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3b82f6]/30 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Brain className="h-4 w-4 text-[#3b82f6]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold tracking-tight text-[#f5f5f5]">Decision Engine</h1>
              <p className="text-[10px] uppercase tracking-widest text-[#737373] font-medium">
                Recommend <span className="text-[#404040]">/</span> Prove <span className="text-[#404040]">/</span> Compare <span className="text-[#404040]">/</span> Discuss
              </p>
            </div>

            {/* Panel toggles — desktop only */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setQueueOpen((v) => !v)}
                className="flex items-center gap-1 rounded border border-[#2a2a2a] bg-[#141414] px-2 py-1 text-[10px] text-[#a3a3a3] hover:text-[#e5e5e5]"
                title={queueOpen ? 'Hide queue' : 'Show queue'}
              >
                {queueOpen ? <PanelLeftClose className="h-3 w-3" /> : <PanelLeftOpen className="h-3 w-3" />}
                Queue
              </button>
              <button
                onClick={() => setCopilotOpen((v) => !v)}
                className="flex items-center gap-1 rounded border border-[#2a2a2a] bg-[#141414] px-2 py-1 text-[10px] text-[#a3a3a3] hover:text-[#e5e5e5]"
                title={copilotOpen ? 'Hide copilot' : 'Show copilot'}
              >
                {copilotOpen ? <PanelRightClose className="h-3 w-3" /> : <PanelRightOpen className="h-3 w-3" />}
                Copilot
              </button>
            </div>
          </div>
        </header>

        {/* KPI strip */}
        <div className="flex-none border-b border-[#2a2a2a] px-4 py-3 xl:px-6">
          <DecisionsKpiBar />
        </div>

        {/* Filter bar — collapses with the queue. Filters are queue-driven,
            so showing them when the queue is hidden is just visual noise. */}
        {queueOpen && (
          <div className="flex-none border-b border-[#2a2a2a] bg-[#0f0f0f]/50 px-4 py-2 xl:px-6">
            <DecisionsFilterBar />
          </div>
        )}

        {/* Mobile tab strip (<lg) */}
        <div className="flex-none border-b border-[#2a2a2a] bg-[#0f0f0f]/80 lg:hidden">
          <div className="flex">
            {(
              [
                { id: 'queue',    label: 'Queue',    icon: Inbox    },
                { id: 'core',     label: 'Decision', icon: Brain    },
                { id: 'evidence', label: 'Evidence', icon: Database },
                { id: 'copilot',  label: 'Copilot',  icon: Sparkles },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              const isActive = mobileTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setMobileTab(t.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    isActive ? 'border-[#3b82f6] text-[#3b82f6]' : 'border-transparent text-[#737373] hover:text-[#a3a3a3]'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace — 3 (or 4 with queue) column layout */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Queue rail */}
          <aside
            className={`flex-none overflow-y-auto border-r border-[#2a2a2a] bg-[#0a0a0a] ${
              mobileTab !== 'queue' ? 'hidden lg:block' : ''
            } ${queueOpen ? 'w-full lg:w-[280px]' : 'lg:hidden'}`}
          >
            <div className="sticky top-0 z-10 border-b border-[#2a2a2a] bg-[#0f0f0f]/80 px-3 py-2">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                  Decision Queue
                </h2>
                <span className="text-[10px] font-mono text-[#525252]">{visible.length}</span>
              </div>
            </div>
            <DecisionQueueRail
              decisions={visible}
              selectedId={selected?.id ?? null}
              onSelect={(id) => {
                setSelectedId(id);
                setMobileTab('core');
              }}
            />
          </aside>

          {/* Decision Core */}
          <section
            className={`min-w-0 overflow-hidden border-r border-[#2a2a2a] bg-[#0a0a0a] ${
              mobileTab !== 'core' ? 'hidden lg:flex' : 'flex'
            } flex-1 lg:flex-none lg:w-[480px] 2xl:w-[520px]`}
          >
            <div className="flex h-full w-full flex-col">
              <DecisionCorePanel decision={selected} />
            </div>
          </section>

          {/* Evidence & XAI — flex-1 on desktop */}
          <section
            className={`min-w-0 overflow-hidden bg-[#0a0a0a] ${
              mobileTab !== 'evidence' ? 'hidden lg:flex' : 'flex'
            } flex-1 ${copilotOpen ? 'lg:border-r lg:border-[#2a2a2a]' : ''}`}
          >
            <div className="flex h-full w-full flex-col">
              <EvidencePanel decision={selected} />
            </div>
          </section>

          {/* AI Copilot */}
          <aside
            className={`flex-none overflow-hidden border-l border-[#2a2a2a] bg-[#0a0a0a] shadow-[-10px_0_30px_rgba(0,0,0,0.2)] ${
              mobileTab !== 'copilot' ? 'hidden lg:block' : ''
            } ${copilotOpen ? 'w-full lg:w-[340px] 2xl:w-[380px]' : 'lg:hidden'}`}
          >
            <AICopilotPanel decision={selected} />
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
