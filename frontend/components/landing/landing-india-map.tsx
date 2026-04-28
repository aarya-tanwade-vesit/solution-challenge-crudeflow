'use client';

/**
 * landing-india-map.tsx — "The Theatre" section.
 *
 * Premium, real-map version. The previous iteration drew a hand-rolled
 * SVG outline of India which read as illustrative rather than real;
 * a refinery procurement lead loses trust there. This version renders
 * an actual basemap of the Persian Gulf → West India corridor via
 * Leaflet (already used by the in-app `/map` page) so the visual
 * texture across landing → app is consistent.
 *
 * Layout (Apple-grade restraint):
 *   1. Eyebrow + headline + sub
 *   2. Four data-source chips (AIS / Weather / News / Sentiment) with
 *      live counters — these are the THREE THINGS we promise to track
 *   3. Hero map canvas (Leaflet, dynamic-imported, ssr:false)
 *      with corner overlays (legend + voyage card)
 *   4. Bottom result strip (ETA delta · Risk delta · Cost delta)
 */

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  Satellite,
  CloudFog,
  Newspaper,
  Gauge,
} from 'lucide-react';

// Leaflet must be client-only (touches `window` on import).
const LiveMapCanvas = dynamic(() => import('./landing-live-map-canvas'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-[#2a2a2a] border-t-[#22d3ee] rounded-full animate-spin" />
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#737373]">
          Loading theatre
        </div>
      </div>
    </div>
  ),
});

/* ─── Live counters (cosmetic — ticks once a second) ─────────────── */

function useTicker(initial: number, step: number, intervalMs = 1500) {
  const [v, setV] = useState(initial);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = setInterval(() => setV((x) => x + step), intervalMs);
    return () => clearInterval(id);
  }, [step, intervalMs]);
  return v;
}

/* ─── Section ────────────────────────────────────────────────────── */

export function LandingIndiaMap() {
  // Live "data ingested" counters — soft motion, not noisy.
  const aisPings = useTicker(248_113, 7, 1300);
  const newsItems = useTicker(1_482, 1, 4200);
  const weatherFrames = useTicker(312, 1, 5400);

  // Sentiment index: -100..+100; randomly drifts within a tight band
  // weighted toward "heightened" so the live Hormuz tone is preserved.
  const [sentiment, setSentiment] = useState(-42);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = setInterval(() => {
      setSentiment((s) => {
        const next = s + (Math.random() - 0.55) * 1.8;
        return Math.max(-72, Math.min(-18, next));
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="theatre"
      className="relative py-20 sm:py-24 border-t border-[#1f1f1f]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em]">
          <span className="text-[#3b82f6]">The theatre</span>
          <span className="h-px w-8 bg-[#2a2a2a]" />
          <span className="text-[#737373]">Persian Gulf → Mumbai</span>
        </div>

        {/* Headline + sub */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <h2 className="lg:col-span-8 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-[#e5e5e5] leading-[1.05] text-balance">
            Watch Hormuz. Move oil.{' '}
            <span className="text-[#a3a3a3]">Land in Mumbai.</span>
          </h2>
          <p className="lg:col-span-4 text-base text-[#a3a3a3] leading-relaxed">
            One tanker, three live data planes, one decision. AIS, weather and
            news fuse into a routing call our customers can ship —{' '}
            <span className="text-[#e5e5e5]">literally</span>.
          </p>
        </div>

        {/* Data-source chips — the three live feeds + derived sentiment. */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <SourceChip
            icon={<Satellite className="h-3.5 w-3.5" />}
            label="AIS"
            sub="Vessel telemetry"
            value={aisPings.toLocaleString('en-IN')}
            unit="pings · 24h"
            tone="cyan"
          />
          <SourceChip
            icon={<CloudFog className="h-3.5 w-3.5" />}
            label="Weather"
            sub="GFS · ECMWF"
            value={weatherFrames.toLocaleString('en-IN')}
            unit="frames · 24h"
            tone="blue"
          />
          <SourceChip
            icon={<Newspaper className="h-3.5 w-3.5" />}
            label="News"
            sub="Reuters · PIB · OPEC+"
            value={newsItems.toLocaleString('en-IN')}
            unit="items · 24h"
            tone="amber"
          />
          <SourceChip
            icon={<Gauge className="h-3.5 w-3.5" />}
            label="Sentiment"
            sub="−100 → +100"
            value={sentiment.toFixed(0)}
            unit={
              sentiment < -25 ? 'heightened' : sentiment < 0 ? 'cautious' : 'stable'
            }
            tone={sentiment < -25 ? 'red' : sentiment < 0 ? 'amber' : 'emerald'}
          />
        </div>

        {/* The map */}
        <div className="mt-6 relative rounded-2xl border border-[#1f1f1f] bg-[#050505] overflow-hidden">
          {/* Aspect-ratio sized map canvas */}
          <div className="relative h-[420px] sm:h-[520px] lg:h-[600px]">
            <LiveMapCanvas />

            {/* Top-left: voyage card */}
            <div className="pointer-events-none absolute top-4 left-4 max-w-[280px]">
              <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a]/92 backdrop-blur px-3.5 py-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#737373]">
                    Voyage · live
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#22d3ee]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inset-0 rounded-full bg-[#22d3ee] animate-ping opacity-50" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-[#22d3ee]" />
                    </span>
                    NEMO routing
                  </span>
                </div>
                <div className="mt-2 text-sm font-semibold text-[#e5e5e5] leading-tight">
                  VLCC <span className="font-mono">PRATIBHA SAVITA</span>
                </div>
                <div className="mt-1 text-[11px] text-[#a3a3a3]">
                  Hormuz → BPCL Mumbai · 1,684 nm
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2.5 text-[11px]">
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-wider text-[#737373]">
                      Original ETA
                    </div>
                    <div className="font-mono text-[#a3a3a3] line-through">
                      14 Mar · 18:40 IST
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-wider text-[#22d3ee]">
                      NEMO ETA
                    </div>
                    <div className="font-mono text-[#22d3ee]">14 Mar · 02:30 IST</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-left: legend */}
            <div className="pointer-events-none absolute bottom-4 left-4">
              <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a]/92 backdrop-blur px-3 py-2 text-[10px] font-mono">
                <div className="flex items-center gap-2 text-[#a3a3a3]">
                  <span className="h-px w-5 border-t border-dashed border-[#ef4444]" />
                  Original route
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[#22d3ee]">
                  <span className="h-px w-5 bg-[#22d3ee]" />
                  NEMO optimized
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[#fecaca]">
                  <span className="inline-block h-2 w-2 rounded-sm bg-[#ef4444]/30 border border-[#ef4444]/60" />
                  Hormuz tension zone
                </div>
              </div>
            </div>
          </div>

          {/* Result strip — what NEMO bought us on this voyage */}
          <div className="grid grid-cols-3 divide-x divide-[#1f1f1f] border-t border-[#1f1f1f] bg-[#0a0a0a]">
            <ResultCell
              icon={<Activity className="h-3.5 w-3.5 text-[#22d3ee]" />}
              label="ETA · gain"
              value="−16h 10m"
              sub="vs Hormuz-direct"
            />
            <ResultCell
              icon={<ShieldAlert className="h-3.5 w-3.5 text-[#3b82f6]" />}
              label="Risk · delta"
              value="−61"
              sub="exposure index"
            />
            <ResultCell
              icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
              label="Cost · delta"
              value="−₹2.4 Cr"
              sub="incl. demurrage"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── small chip / cell components ──────────────────────────────── */

function SourceChip({
  icon,
  label,
  sub,
  value,
  unit,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: string;
  unit: string;
  tone: 'cyan' | 'blue' | 'amber' | 'red' | 'emerald';
}) {
  const toneClasses: Record<typeof tone, string> = {
    cyan: 'text-[#22d3ee] border-[#22d3ee]/30 bg-[#22d3ee]/5',
    blue: 'text-[#3b82f6] border-[#3b82f6]/30 bg-[#3b82f6]/5',
    amber: 'text-amber-400 border-amber-400/30 bg-amber-400/5',
    red: 'text-red-400 border-red-400/30 bg-red-400/5',
    emerald: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
  };

  return (
    <div className="group relative rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3.5 py-3 transition-all duration-300 hover:border-[#2a2a2a] hover:bg-[#0c0c0c]">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded border text-[9.5px] font-mono uppercase tracking-[0.18em] ${toneClasses[tone]}`}
        >
          {icon}
          {label}
        </span>
        <span className="text-[9.5px] font-mono uppercase tracking-[0.16em] text-[#525252]">
          {sub}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2 font-mono">
        <span className="text-xl font-semibold text-[#e5e5e5] tabular-nums">
          {value}
        </span>
        <span className="text-[10px] text-[#737373] uppercase tracking-wider">
          {unit}
        </span>
      </div>
    </div>
  );
}

function ResultCell({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-[#737373]">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-mono text-lg sm:text-xl font-semibold text-[#e5e5e5] tabular-nums">
        {value}
      </div>
      <div className="text-[10.5px] text-[#525252] mt-0.5">{sub}</div>
    </div>
  );
}
