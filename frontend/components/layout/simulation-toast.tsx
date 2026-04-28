'use client';

import React from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useSimulation } from '@/contexts';

export function SimulationToast() {
  const { lastToast } = useSimulation();
  if (!lastToast) return null;

  const styles = {
    success: { border: 'border-emerald-500/40', icon: 'text-emerald-400', Icon: CheckCircle2 },
    info:    { border: 'border-[#3b82f6]/40',   icon: 'text-[#3b82f6]',   Icon: Info },
    warning: { border: 'border-amber-500/40',   icon: 'text-amber-400',   Icon: AlertTriangle },
  }[lastToast.type];

  const Icon = styles.Icon;

  return (
    <div
      key={lastToast.id}
      className={`fixed bottom-6 right-6 z-[300] flex items-center gap-2.5 px-3.5 py-2.5 bg-[#1a1a1a] border ${styles.border} rounded-lg shadow-2xl shadow-black/50 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200`}
      role="status"
      aria-live="polite"
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${styles.icon}`} />
      <span className="text-xs text-[#e5e5e5] font-medium">{lastToast.message}</span>
    </div>
  );
}
