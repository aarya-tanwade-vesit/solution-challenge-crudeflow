'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Insight {
  id: string;
  kind: 'opportunity' | 'warning' | 'observation' | 'benchmark';
  title: string;
  body: string;
  impact: string;
  confidence: number;
  cta?: { label: string; href: string };
}

const INSIGHTS: Insight[] = [
  {
    id: 'i1',
    kind: 'warning',
    title: 'Demurrage trending 23% above peer benchmark at Mumbai',
    body: 'Avg wait-time has climbed from 28h to 42h over last 30d. Jetty 4 maintenance window extended twice without schedule adjustment.',
    impact: '+$1.8M/mo exposure',
    confidence: 94,
    cta: { label: 'Open Mumbai decisions', href: '/decisions?port=mumbai' },
  },
  {
    id: 'i2',
    kind: 'opportunity',
    title: 'Switching 2 VLCCs from Hormuz to Cape route cuts risk by 61%',
    body: 'Simulation of current Hormuz posture shows 3 vessels at critical exposure. Cape reroute adds 4 days but eliminates geopolitical delay risk.',
    impact: '-$2.3M risk reserve',
    confidence: 89,
    cta: { label: 'Run simulation', href: '/simulation' },
  },
  {
    id: 'i3',
    kind: 'observation',
    title: 'Refinery yield dropped 1.8pp when high-sulphur mix exceeded 62%',
    body: 'Historical correlation across 47 crude parcels. Optimal band is 55-60%. Currently running at 64% on Kochi CDU-2.',
    impact: '-0.9% daily margin',
    confidence: 82,
  },
  {
    id: 'i4',
    kind: 'benchmark',
    title: 'On-time arrival 94.2% - above 91.5% peer median',
    body: 'BPCL fleet outperforming regional operators on schedule adherence. Arabian Dawn and Maru Star drove improvement.',
    impact: 'Positive KPI variance',
    confidence: 97,
  },
  {
    id: 'i5',
    kind: 'opportunity',
    title: 'Crude substitution can absorb 38h delay on NEMO Voyager',
    body: 'Low-sulphur tanks at Kochi have 4.2 days buffer. Delaying discharge to Day 7 avoids emergency spot purchase.',
    impact: '-$640K spot exposure',
    confidence: 86,
    cta: { label: 'View scenario', href: '/simulation' },
  },
  {
    id: 'i6',
    kind: 'warning',
    title: 'Cyclone projected path crosses 2 BPCL routes in 48h',
    body: 'IMD models converging on Cat-2 intensification. Crimson Crude and Maru Star on affected corridor.',
    impact: '+36h projected delay',
    confidence: 78,
    cta: { label: 'Evaluate reroute', href: '/decisions' },
  },
];

const KIND_META = {
  opportunity: { color: '#10b981', bg: '#10b98115', Icon: Target, label: 'Opportunity' },
  warning: { color: '#ef4444', bg: '#ef444415', Icon: TrendingDown, label: 'Warning' },
  observation: { color: '#3b82f6', bg: '#3b82f615', Icon: Sparkles, label: 'Observation' },
  benchmark: { color: '#f59e0b', bg: '#f59e0b15', Icon: TrendingUp, label: 'Benchmark' },
};

export function AIInsightsStrip() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState(0);

  const visible = INSIGHTS.filter((i) => !dismissed.has(i.id));
  const pageSize = 3;
  const page = visible.slice(cursor, cursor + pageSize);
  const hasMore = cursor + pageSize < visible.length;
  const hasPrev = cursor > 0;

  if (visible.length === 0) return null;

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] overflow-hidden">
      <div className="h-11 flex items-center justify-between px-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-[#3b82f6]/15">
            <Sparkles className="h-3 w-3 text-[#3b82f6]" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#e5e5e5]">
            AI insights
          </span>
          <span className="text-[10px] font-mono text-[#737373]">
            {visible.length} active
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor((c) => Math.max(0, c - pageSize))}
            disabled={!hasPrev}
            className="p-1 rounded hover:bg-[#1a1a1a] text-[#737373] disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCursor((c) => Math.min(visible.length - pageSize, c + pageSize))}
            disabled={!hasMore}
            className="p-1 rounded hover:bg-[#1a1a1a] text-[#737373] disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-[#1f1f1f] divide-y md:divide-y-0">
        {page.map((insight) => {
          const meta = KIND_META[insight.kind];
          const Icon = meta.Icon;
          return (
            <div key={insight.id} className="p-4 group relative">
              {/* dismiss */}
              <button
                onClick={() => setDismissed((d) => new Set(d).add(insight.id))}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#1a1a1a] text-[#525252] hover:text-[#a3a3a3]"
                title="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex items-center justify-center w-5 h-5 rounded"
                  style={{ background: meta.bg }}
                >
                  <Icon className="h-3 w-3" style={{ color: meta.color }} />
                </div>
                <span
                  className="text-[9px] font-semibold uppercase tracking-wider"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>
                <span className="ml-auto text-[9px] font-mono text-[#525252]">
                  {insight.confidence}%
                </span>
              </div>

              <h4 className="text-[13px] font-semibold text-[#e5e5e5] leading-tight mb-2 pr-5">
                {insight.title}
              </h4>
              <p className="text-[11px] text-[#a3a3a3] leading-relaxed mb-3 line-clamp-2">
                {insight.body}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f]">
                <span className="text-[10px] font-mono font-semibold" style={{ color: meta.color }}>
                  {insight.impact}
                </span>
                {insight.cta && (
                  <Link
                    href={insight.cta.href}
                    className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6] hover:text-[#60a5fa]"
                  >
                    {insight.cta.label}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
