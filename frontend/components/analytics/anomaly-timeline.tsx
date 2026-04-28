'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Activity, Info, Zap } from 'lucide-react';

type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

interface Anomaly {
  id: string;
  hoursAgo: number;
  metric: string;
  severity: AnomalySeverity;
  delta: string;
  description: string;
  entity: string;
}

const ANOMALIES: Anomaly[] = [
  { id: 'a1', hoursAgo: 2, metric: 'Port wait time', severity: 'critical', delta: '+187%', description: 'Mumbai port wait jumped from 14h to 42h within the last 6 hours', entity: 'Mumbai Port' },
  { id: 'a2', hoursAgo: 4, metric: 'Vessel speed', severity: 'high', delta: '-31%', description: 'NEMO Voyager reduced speed from 14.2 to 9.8 knots approaching Hormuz', entity: 'NEMO Voyager' },
  { id: 'a3', hoursAgo: 8, metric: 'Buffer days', severity: 'high', delta: '-1.8d', description: 'Kochi refinery buffer dropped sharply from 7.2 to 5.4 days', entity: 'Kochi Refinery' },
  { id: 'a4', hoursAgo: 12, metric: 'Risk score', severity: 'medium', delta: '+22', description: 'Hormuz risk index increased following weekly OSINT update', entity: 'Strait of Hormuz' },
  { id: 'a5', hoursAgo: 16, metric: 'Jetty occupancy', severity: 'critical', delta: '+28pp', description: 'Mumbai jetty occupancy hit 94% - demurrage cascade likely', entity: 'Mumbai Jetty 4' },
  { id: 'a6', hoursAgo: 22, metric: 'Discharge rate', severity: 'low', delta: '-4%', description: 'Discharge rate dipped during shift handover window', entity: 'Kochi Jetty 2' },
  { id: 'a7', hoursAgo: 30, metric: 'Crude price', severity: 'medium', delta: '+3.8%', description: 'Brent benchmark moved on Middle East tension escalation', entity: 'Brent Benchmark' },
  { id: 'a8', hoursAgo: 38, metric: 'ETA variance', severity: 'medium', delta: '+18h', description: 'Gulf Pioneer ETA slipped 18h after Fujairah anchorage delay', entity: 'Gulf Pioneer' },
  { id: 'a9', hoursAgo: 46, metric: 'Throughput', severity: 'high', delta: '-8%', description: 'Mumbai refinery throughput dropped on feedstock constraint', entity: 'Mumbai Refinery' },
  { id: 'a10', hoursAgo: 58, metric: 'Wind speed', severity: 'medium', delta: '+42%', description: 'Arabian Sea wind speed up 42% - cyclone precursor signals', entity: 'Arabian Sea' },
];

const SEVERITY_META: Record<AnomalySeverity, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: '#ef4444', bg: '#ef444420', border: '#ef444460', label: 'Critical' },
  high: { color: '#f97316', bg: '#f9731620', border: '#f9731660', label: 'High' },
  medium: { color: '#f59e0b', bg: '#f59e0b20', border: '#f59e0b60', label: 'Medium' },
  low: { color: '#3b82f6', bg: '#3b82f620', border: '#3b82f660', label: 'Low' },
};

const WINDOWS = [
  { label: '24h', hours: 24 },
  { label: '48h', hours: 48 },
  { label: '7d', hours: 168 },
];

export function AnomalyTimeline() {
  const [window, setWindow] = useState(48);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity | null>(null);

  const filtered = useMemo(
    () =>
      ANOMALIES.filter(
        (a) =>
          a.hoursAgo <= window && (severityFilter === null || a.severity === severityFilter)
      ),
    [window, severityFilter]
  );

  const selected = filtered.find((a) => a.id === selectedId);
  const counts = useMemo(() => {
    const c: Record<AnomalySeverity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    ANOMALIES.filter((a) => a.hoursAgo <= window).forEach((a) => {
      c[a.severity]++;
    });
    return c;
  }, [window]);

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] overflow-hidden">
      <div className="h-11 flex items-center justify-between px-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-[#ef4444]/15">
            <Activity className="h-3 w-3 text-[#ef4444]" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#e5e5e5]">
            Anomaly timeline
          </span>
          <span className="text-[10px] font-mono text-[#737373]">
            {filtered.length} detected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Severity filter */}
          <div className="flex items-center gap-1 border border-[#2a2a2a] rounded overflow-hidden">
            {(['critical', 'high', 'medium', 'low'] as AnomalySeverity[]).map((s) => {
              const m = SEVERITY_META[s];
              const on = severityFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(on ? null : s)}
                  className="flex items-center gap-1 px-2 h-7 text-[10px] font-semibold uppercase tracking-wider transition-colors"
                  style={{
                    background: on ? m.bg : 'transparent',
                    color: on ? m.color : '#737373',
                  }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ background: m.color }} />
                  {counts[s]}
                </button>
              );
            })}
          </div>

          {/* Window */}
          <div className="flex items-center border border-[#2a2a2a] rounded overflow-hidden">
            {WINDOWS.map((w) => (
              <button
                key={w.label}
                onClick={() => setWindow(w.hours)}
                className={`px-2 h-7 text-[10px] font-mono ${
                  window === w.hours
                    ? 'bg-[#262626] text-[#e5e5e5]'
                    : 'text-[#737373] hover:text-[#a3a3a3]'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline row */}
      <div className="relative px-6 pt-6 pb-8">
        {/* Baseline */}
        <div className="absolute left-6 right-6 top-1/2 h-px bg-[#2a2a2a]" />

        {/* Markers */}
        <div className="relative h-0">
          {filtered.map((a) => {
            const pct = 100 - (a.hoursAgo / window) * 100;
            const m = SEVERITY_META[a.severity];
            const isSelected = selected?.id === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedId(isSelected ? null : a.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${pct}%`, top: '0px' }}
              >
                <div
                  className="rounded-full transition-all flex items-center justify-center"
                  style={{
                    width: isSelected ? 18 : 12,
                    height: isSelected ? 18 : 12,
                    background: m.bg,
                    border: `2px solid ${m.color}`,
                    boxShadow: isSelected ? `0 0 0 4px ${m.color}30` : 'none',
                  }}
                >
                  <span
                    className="rounded-full"
                    style={{ width: 4, height: 4, background: m.color }}
                  />
                </div>
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 text-[9px] font-mono text-[#525252] whitespace-nowrap">
                  -{a.hoursAgo}h
                </div>
              </button>
            );
          })}
        </div>

        {/* Scale labels */}
        <div className="relative mt-8 flex justify-between text-[9px] font-mono text-[#525252] uppercase tracking-wider">
          <span>-{window}h</span>
          <span>-{Math.round(window * 0.75)}h</span>
          <span>-{Math.round(window * 0.5)}h</span>
          <span>-{Math.round(window * 0.25)}h</span>
          <span className="text-[#10b981]">NOW</span>
        </div>
      </div>

      {/* Detail */}
      {selected ? (
        <AnomalyDetail anomaly={selected} />
      ) : (
        <div className="px-6 py-4 border-t border-[#1f1f1f] text-[11px] text-[#525252]">
          Select a marker to inspect the anomaly, root cause, and recommended action.
        </div>
      )}
    </div>
  );
}

function AnomalyDetail({ anomaly }: { anomaly: Anomaly }) {
  const meta = SEVERITY_META[anomaly.severity];
  return (
    <div className="border-t border-[#1f1f1f] bg-[#0a0a0a] p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
          style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
        >
          <AlertTriangle className="h-4 w-4" style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
            <span className="text-[11px] font-semibold text-[#e5e5e5]">{anomaly.metric}</span>
            <span
              className="text-[11px] font-mono font-semibold"
              style={{ color: meta.color }}
            >
              {anomaly.delta}
            </span>
            <span className="text-[10px] font-mono text-[#525252]">· {anomaly.entity}</span>
            <span className="text-[10px] font-mono text-[#525252] ml-auto">
              -{anomaly.hoursAgo}h
            </span>
          </div>
          <p className="text-[12px] text-[#a3a3a3] leading-relaxed mb-3">
            {anomaly.description}
          </p>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 h-7 px-2.5 rounded border border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6] hover:bg-[#3b82f6]/15 text-[10px] font-semibold uppercase tracking-wider">
              <Zap className="h-3 w-3" />
              Investigate
            </button>
            <button className="flex items-center gap-1 h-7 px-2.5 rounded border border-[#2a2a2a] bg-transparent text-[#a3a3a3] hover:border-[#404040] hover:text-[#e5e5e5] text-[10px] font-semibold uppercase tracking-wider">
              <Info className="h-3 w-3" />
              View in timeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
