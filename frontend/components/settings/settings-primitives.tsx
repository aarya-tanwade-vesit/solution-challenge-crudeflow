'use client';

import React from 'react';
import { Check } from 'lucide-react';

export function SettingsCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#2a2a2a] bg-[#141414]">
      <header className="flex items-center gap-2 border-b border-[#2a2a2a] px-4 py-3">
        {Icon && <Icon className="h-3.5 w-3.5 text-[#3b82f6]" />}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e5e5e5]">{title}</h3>
      </header>
      <div className="divide-y divide-[#1f1f1f]">{children}</div>
    </section>
  );
}

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[#e5e5e5]">{label}</div>
        {description && <p className="mt-0.5 text-[11px] text-[#737373]">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 flex-none rounded-full transition-colors ${
          checked ? 'bg-[#3b82f6]' : 'bg-[#2a2a2a]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function RadioRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <div className="text-sm font-medium text-[#e5e5e5]">{label}</div>
      {description && <p className="mt-0.5 text-[11px] text-[#737373]">{description}</p>}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function RadioOption({
  selected,
  onSelect,
  label,
  description,
  recommended,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex items-start gap-2 rounded-md border px-3 py-2.5 text-left transition-all ${
        selected
          ? 'border-[#3b82f6] bg-[#3b82f6]/10'
          : 'border-[#2a2a2a] bg-[#0f0f0f] hover:border-[#404040]'
      }`}
    >
      <div
        className={`mt-0.5 flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full border ${
          selected ? 'border-[#3b82f6] bg-[#3b82f6]' : 'border-[#404040]'
        }`}
      >
        {selected && <Check className="h-2.5 w-2.5 text-white" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-semibold ${selected ? 'text-[#3b82f6]' : 'text-[#e5e5e5]'}`}>
          {label}
          {recommended && (
            <span className="ml-1.5 rounded bg-emerald-500/15 px-1 py-px text-[9px] font-bold uppercase tracking-wider text-emerald-400">
              Recommended
            </span>
          )}
        </div>
        {description && <p className="mt-0.5 text-[10px] text-[#737373]">{description}</p>}
      </div>
    </button>
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  width = 'w-24',
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  width?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`${width} rounded-md border border-[#2a2a2a] bg-[#0f0f0f] px-2 py-1 text-right font-mono text-xs text-[#e5e5e5] focus:border-[#3b82f6] focus:outline-none`}
      />
      {suffix && <span className="text-[10px] text-[#737373]">{suffix}</span>}
    </div>
  );
}
