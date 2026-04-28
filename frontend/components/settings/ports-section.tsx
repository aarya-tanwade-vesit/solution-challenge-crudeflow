'use client';

import React, { useState } from 'react';
import { useSettings } from '@/contexts';
import type { PortPhysics } from '@/contexts/settings-context';
import { SettingsCard, NumberInput } from './settings-primitives';
import { Anchor, ChevronDown } from 'lucide-react';

export function PortsSection() {
  const { ports, updatePort } = useSettings();
  const [expandedId, setExpandedId] = useState<string>(ports[0]?.id ?? '');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#e5e5e5]">Ports</h2>
        <p className="mt-1 text-xs text-[#737373]">
          Physical capabilities of destination ports. These values feed the simulation model and influence
          berth scheduling, draft constraints, and discharge timing.
        </p>
      </div>

      {ports.map((port) => (
        <PortCard
          key={port.id}
          port={port}
          expanded={expandedId === port.id}
          onToggle={() => setExpandedId(expandedId === port.id ? '' : port.id)}
          onUpdate={(patch) => updatePort(port.id, patch)}
        />
      ))}
    </div>
  );
}

function PortCard({
  port,
  expanded,
  onToggle,
  onUpdate,
}: {
  port: PortPhysics;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<PortPhysics>) => void;
}) {
  return (
    <section className="rounded-lg border border-[#2a2a2a] bg-[#141414]">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#1a1a1a]"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3b82f6]/10">
          <Anchor className="h-3.5 w-3.5 text-[#3b82f6]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[#e5e5e5]">{port.name}</div>
          <div className="mt-0.5 flex items-center gap-3 text-[10px] font-mono text-[#737373]">
            <span>{port.jettyCount} jetties</span>
            <span>{port.maxDraft}m draft</span>
            <span>{port.storageCapacity} KMT storage</span>
          </div>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-[#737373] transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="divide-y divide-[#1f1f1f] border-t border-[#2a2a2a]">
          <Row label="Jetty count" description="Number of berthing slots available" value={port.jettyCount}
            onChange={(v) => onUpdate({ jettyCount: v })} min={1} max={20} step={1} />
          <Row label="Max berth length" description="Largest vessel berth length supported" value={port.maxBerthLength}
            onChange={(v) => onUpdate({ maxBerthLength: v })} min={100} max={500} step={10} suffix="m" />
          <Row label="Max draft" description="Deepest supported vessel draft" value={port.maxDraft}
            onChange={(v) => onUpdate({ maxDraft: v })} min={8} max={25} step={0.5} suffix="m" />
          <Row label="Discharge rate" description="Typical discharge throughput per jetty" value={port.dischargeRate}
            onChange={(v) => onUpdate({ dischargeRate: v })} min={500} max={12_000} step={100} suffix="MT/hr" />
          <Row label="Laycan window" description="Flexibility on vessel arrival window" value={port.laycanWindowHours}
            onChange={(v) => onUpdate({ laycanWindowHours: v })} min={12} max={168} step={12} suffix="hrs" />
          <Row label="Storage capacity" description="Total tank farm capacity at this port" value={port.storageCapacity}
            onChange={(v) => onUpdate({ storageCapacity: v })} min={100} max={3000} step={10} suffix="KMT" />
        </div>
      )}
    </section>
  );
}

function Row({
  label, description, value, onChange, min, max, step, suffix,
}: {
  label: string; description: string; value: number;
  onChange: (v: number) => void;
  min?: number; max?: number; step?: number; suffix?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-[#e5e5e5]">{label}</div>
        <p className="mt-0.5 text-[10px] text-[#737373]">{description}</p>
      </div>
      <NumberInput value={value} onChange={onChange} min={min} max={max} step={step} suffix={suffix} width="w-28" />
    </div>
  );
}
