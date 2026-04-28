'use client';

import React from 'react';
import { useSettings } from '@/contexts';
import type { IntegrationStatus } from '@/contexts/settings-context';
import { Plug, CheckCircle2, AlertTriangle, Circle, Database, Satellite, Radio, Briefcase } from 'lucide-react';

const CATEGORY_META: Record<IntegrationStatus['category'], { label: string; icon: React.ElementType }> = {
  data:  { label: 'Data Feeds',     icon: Satellite },
  erp:   { label: 'ERP Systems',    icon: Briefcase },
  risk:  { label: 'Risk & Advisory', icon: Database },
  comms: { label: 'Communications', icon: Radio },
};

function fmtSync(ts?: number): string {
  if (!ts) return 'never';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export function IntegrationsSection() {
  const { integrations, toggleIntegration } = useSettings();

  const grouped = integrations.reduce<Record<string, IntegrationStatus[]>>((acc, i) => {
    (acc[i.category] ||= []).push(i);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#e5e5e5]">Integrations</h2>
        <p className="mt-1 text-xs text-[#737373]">
          External data sources powering CrudeFlow. Connected integrations sync in the background.
        </p>
      </div>

      {Object.keys(CATEGORY_META).map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        const { label, icon: Icon } = CATEGORY_META[cat as IntegrationStatus['category']];
        return (
          <section key={cat} className="rounded-lg border border-[#2a2a2a] bg-[#141414]">
            <header className="flex items-center gap-2 border-b border-[#2a2a2a] px-4 py-3">
              <Icon className="h-3.5 w-3.5 text-[#3b82f6]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e5e5e5]">{label}</h3>
            </header>
            <ul className="divide-y divide-[#1f1f1f]">
              {items.map((i) => (
                <IntegrationRow key={i.id} integration={i} onToggle={() => toggleIntegration(i.id)} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function IntegrationRow({ integration, onToggle }: { integration: IntegrationStatus; onToggle: () => void }) {
  const status = integration.status;
  const meta = {
    connected:    { Icon: CheckCircle2,  label: 'Connected',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    disconnected: { Icon: Circle,        label: 'Disconnected', color: 'text-[#737373]',   bg: 'bg-[#262626] border-[#2a2a2a]' },
    error:        { Icon: AlertTriangle, label: 'Error',        color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30' },
  }[status];
  const Icon = meta.Icon;

  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <div className={`flex h-8 w-8 flex-none items-center justify-center rounded-md border ${meta.bg}`}>
        <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-[#e5e5e5]">{integration.name}</h4>
          <span className={`text-[10px] font-mono font-semibold ${meta.color}`}>{meta.label}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-[#737373]">{integration.description}</p>
        {status === 'connected' && integration.lastSync && (
          <p className="mt-0.5 text-[10px] font-mono text-[#525252]">Last sync: {fmtSync(integration.lastSync)}</p>
        )}
      </div>
      <button
        onClick={onToggle}
        className={`flex-none rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
          status === 'connected'
            ? 'border-[#2a2a2a] bg-[#141414] text-[#a3a3a3] hover:border-red-500/40 hover:text-red-400'
            : 'border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6] hover:bg-[#3b82f6]/20'
        }`}
      >
        {status === 'connected' ? 'Disconnect' : 'Connect'}
      </button>
    </li>
  );
}
