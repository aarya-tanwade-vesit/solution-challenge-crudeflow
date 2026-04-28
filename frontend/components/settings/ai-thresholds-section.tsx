'use client';

import React from 'react';
import { useSettings } from '@/contexts';
import { SettingsCard, NumberInput } from './settings-primitives';
import { AlertOctagon, DollarSign, Shield, Brain } from 'lucide-react';

interface RowProps {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  width?: string;
}

function ThresholdRow({ label, description, value, onChange, min, max, step, suffix, width }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[#e5e5e5]">{label}</div>
        <p className="mt-0.5 text-[11px] text-[#737373]">{description}</p>
      </div>
      <NumberInput
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        suffix={suffix}
        width={width}
      />
    </div>
  );
}

export function AiThresholdsSection() {
  const { thresholds, setThreshold } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#e5e5e5]">AI Thresholds</h2>
        <p className="mt-1 text-xs text-[#737373]">
          Control when the decision engine surfaces recommendations and when it auto-approves.
          These values drive the severity bands across the dashboard, simulation, and decision feed.
        </p>
      </div>

      <SettingsCard title="Buffer Days" icon={AlertOctagon}>
        <ThresholdRow
          label="Critical buffer threshold"
          description="Buffer days below this trigger a critical alert (default 2.0 days)"
          value={thresholds.bufferCritical}
          onChange={(v) => setThreshold('bufferCritical', v)}
          min={0} max={20} step={0.5}
          suffix="days"
        />
        <ThresholdRow
          label="Warning buffer threshold"
          description="Buffer days below this trigger a warning alert (default 4.0 days)"
          value={thresholds.bufferWarning}
          onChange={(v) => setThreshold('bufferWarning', v)}
          min={0} max={20} step={0.5}
          suffix="days"
        />
      </SettingsCard>

      <SettingsCard title="Financial" icon={DollarSign}>
        <ThresholdRow
          label="Demurrage warning"
          description="Cumulative demurrage above this triggers warning tier"
          value={thresholds.demurrageWarning}
          onChange={(v) => setThreshold('demurrageWarning', v)}
          min={0} max={10_000_000} step={10_000}
          suffix="USD" width="w-32"
        />
        <ThresholdRow
          label="Demurrage critical"
          description="Cumulative demurrage above this triggers critical tier"
          value={thresholds.demurrageCritical}
          onChange={(v) => setThreshold('demurrageCritical', v)}
          min={0} max={20_000_000} step={50_000}
          suffix="USD" width="w-32"
        />
        <ThresholdRow
          label="Reroute cost ceiling"
          description="AI will prefer slower alternatives beyond this reroute cost"
          value={thresholds.rerouteCostThreshold}
          onChange={(v) => setThreshold('rerouteCostThreshold', v)}
          min={0} max={10_000_000} step={50_000}
          suffix="USD" width="w-32"
        />
      </SettingsCard>

      <SettingsCard title="Risk" icon={Shield}>
        <ThresholdRow
          label="High-risk threshold"
          description="Maritime risk index above this escalates to critical routing decisions"
          value={thresholds.riskHighThreshold}
          onChange={(v) => setThreshold('riskHighThreshold', v)}
          min={0} max={100} step={5}
          suffix="index"
        />
      </SettingsCard>

      <SettingsCard title="Decision Engine" icon={Brain}>
        <ThresholdRow
          label="Minimum confidence"
          description="AI recommendations below this confidence are suppressed"
          value={thresholds.confidenceMinimum}
          onChange={(v) => setThreshold('confidenceMinimum', v)}
          min={0} max={100} step={5}
          suffix="%"
        />
        <ThresholdRow
          label="Auto-approve threshold"
          description="AI will auto-approve low-risk decisions above this confidence"
          value={thresholds.autoApproveThreshold}
          onChange={(v) => setThreshold('autoApproveThreshold', v)}
          min={0} max={100} step={1}
          suffix="%"
        />
      </SettingsCard>
    </div>
  );
}
