'use client';

/**
 * Hydration-safe relative-time renderer.
 * Returns a placeholder on SSR/first render, then formats after mount.
 * Re-ticks every 30s so the label stays fresh.
 */

import React, { useEffect, useState } from 'react';

interface Props {
  ts: number;
  className?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
}

function fmt(ts: number): string {
  const diff = Date.now() - ts;
  const abs = Math.abs(diff);
  const sign = diff >= 0 ? '' : '-';
  const m = Math.floor(abs / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${sign}${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${sign}${h}h ago`;
  const d = Math.floor(h / 24);
  return `${sign}${d}d ago`;
}

export function RelativeTime({ ts, className = '', placeholder = '—', prefix = '', suffix = '' }: Props) {
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return <span className={className}>{placeholder}</span>;
  return <span className={className}>{prefix}{fmt(ts)}{suffix}</span>;
}
