'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { DecisionRecord } from '@/contexts/decisions-context';
import { useDecisions } from '@/contexts';
import {
  Anchor, CheckCircle2, XCircle, Beaker, Ship, ArrowRight, Zap, Clock, DollarSign, Shield, Battery,
  AlertOctagon, Bot,
} from 'lucide-react';

interface Props {
  decision: DecisionRecord | null;
}

const PRIORITY_META = {
  critical: { label: 'Critical', dot: 'bg-red-500', badge: 'bg-red-500/15 text-red-400 border-red-500/30' },
  high:     { label: 'High',     dot: 'bg-amber-500', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  medium:   { label: 'Medium',   dot: 'bg-[#3b82f6]', badge: 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30' },
  low:      { label: 'Low',      dot: 'bg-[#737373]', badge: 'bg-[#262626] text-[#a3a3a3] border-[#2a2a2a]' },
};

const CATEGORY_ICON = {
  reroute: Ship,
  'port-change': Anchor,
  schedule: Clock,
  throughput: Zap,
  inventory: Battery,
  'crude-mix': Zap,
  commercial: DollarSign,
} as const;

function fmtCost(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? '−' : v > 0 ? '+' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function DecisionCorePanel({ decision }: Props) {
  const { approve, reject } = useDecisions();
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!decision) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <AlertOctagon className="mx-auto h-10 w-10 text-[#404040]" />
          <h3 className="mt-3 text-sm font-semibold text-[#a3a3a3]">Select a decision from the queue</h3>
          <p className="mt-1 text-xs text-[#525252]">The Decision Core surfaces the recommended action with reasoning and impact.</p>
        </div>
      </div>
    );
  }

  const d = decision;
  const priorityMeta = PRIORITY_META[d.priority];
  const pending = d.status === 'pending';
  const CatIcon = CATEGORY_ICON[d.category] || Ship;

  // Comparison rows - falls back to core metrics if no detailed comparison
  const comparison = d.comparison;

  return (
    <div className="flex h-full flex-col">
      {/* Header — Professional Enterprise SaaS Grade */}
      <div className="flex-none border-b border-[#2a2a2a] bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] px-5 py-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${priorityMeta.badge}`}>
              <span className={`h-1 w-1 rounded-full animate-pulse ${priorityMeta.dot}`} />
              {priorityMeta.label}
            </span>
            <span className="rounded-full bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#525252]">
              {d.category.replace('-', ' ')}
            </span>
            <div className="ml-1 flex items-center gap-1">
              <div className="h-3 w-[1px] bg-[#2a2a2a]" />
              <span className="text-[10px] font-black text-[#3b82f6]">{d.confidence}%</span>
            </div>
          </div>
        </div>

        {/* Recommended Action Section */}
        <div className="mt-5 flex items-start gap-4">
          <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-2xl border border-[#3b82f6]/20 bg-gradient-to-br from-[#3b82f6]/10 to-transparent">
            <CatIcon className="h-5 w-5 text-[#3b82f6]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#404040]">Action Intent</span>
              <div className="h-[1px] flex-1 bg-[#1a1a1a]" />
            </div>
            <h2 className="mt-1.5 text-xl font-bold leading-[1.2] tracking-tight text-[#f5f5f5]">
              {d.recommendation}
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[#a3a3a3] font-medium max-w-[90%]">
              {d.oneLineReason || d.effect}
            </p>
          </div>
        </div>


      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Impact Summary — structured */}
        <section>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
            Impact Summary
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ImpactTile
              icon={Clock}
              label="Delay"
              value={`${d.delayHoursImpact >= 0 ? '+' : ''}${d.delayHoursImpact}h`}
              tone={d.delayHoursImpact > 0 ? 'warn' : 'good'}
            />
            <ImpactTile
              icon={DollarSign}
              label="Cost"
              value={fmtCost(d.costImpact)}
              tone={d.costImpact < 0 ? 'good' : 'warn'}
            />
            <ImpactTile
              icon={Shield}
              label="Risk"
              value={`${d.riskDelta >= 0 ? '+' : ''}${d.riskDelta}`}
              tone={d.riskDelta < 0 ? 'good' : 'warn'}
            />
            <ImpactTile
              icon={Battery}
              label="Buffer"
              value={d.bufferImpactDays !== undefined ? `${d.bufferImpactDays >= 0 ? '+' : ''}${d.bufferImpactDays.toFixed(1)}d` : '—'}
              tone={(d.bufferImpactDays ?? 0) >= 0 ? 'good' : 'warn'}
            />
          </div>
        </section>

        {/* Current vs Recommended comparison table */}
        {comparison && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
                Current Course vs Recommended
              </div>
              <span className="text-[10px] text-[#737373]">side-by-side</span>
            </div>
            <div className="overflow-hidden rounded-md border border-[#2a2a2a]">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[#2a2a2a] bg-[#141414]">
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[#737373]">Metric</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[#737373]">Current</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6]">Recommended</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  <CompareRow label="Delay" current={`${comparison.current.delayHours}h`} recommended={`${comparison.recommended.delayHours}h`} betterIsLower currentVal={comparison.current.delayHours} recommendedVal={comparison.recommended.delayHours} />
                  <CompareRow label="Cost impact" current={fmtCost(comparison.current.cost)} recommended={fmtCost(comparison.recommended.cost)} betterIsLower currentVal={comparison.current.cost} recommendedVal={comparison.recommended.cost} />
                  <CompareRow label="Risk index" current={`${comparison.current.risk}/100`} recommended={`${comparison.recommended.risk}/100`} betterIsLower currentVal={comparison.current.risk} recommendedVal={comparison.recommended.risk} />
                  <CompareRow label="Buffer days" current={`${comparison.current.bufferDays}d`} recommended={`${comparison.recommended.bufferDays}d`} betterIsLower={false} currentVal={comparison.current.bufferDays} recommendedVal={comparison.recommended.bufferDays} />
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Alternatives preview — top 2 with "why not" */}
        {d.alternatives && d.alternatives.length > 0 && (
          <section>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
              Alternatives Considered ({d.alternatives.length})
            </div>
            <ul className="space-y-1.5">
              {d.alternatives.slice(0, 2).map((alt) => (
                <li key={alt.id} className="rounded-md border border-[#2a2a2a] bg-[#141414] p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${alt.feasible ? 'bg-amber-400' : 'bg-red-400'}`} />
                        <span className="text-[12px] font-medium text-[#e5e5e5]">{alt.label}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#737373]">
                        <span className="font-semibold text-[#a3a3a3]">Why not:</span> {alt.rejectionReason}
                      </p>
                    </div>
                    <div className="flex flex-none flex-col items-end gap-0.5 text-[10px] font-mono text-[#a3a3a3]">
                      <span>Δ {alt.deltaDelayHours > 0 ? '+' : ''}{alt.deltaDelayHours}h</span>
                      <span className={alt.deltaCost > 0 ? 'text-amber-400' : 'text-emerald-400'}>{fmtCost(alt.deltaCost)}</span>
                    </div>
                  </div>
                </li>
              ))}
              {d.alternatives.length > 2 && (
                <li className="text-center text-[10px] text-[#525252]">
                  + {d.alternatives.length - 2} more in Evidence &amp; XAI panel
                </li>
              )}
            </ul>
          </section>
        )}

        {/* Audit if resolved */}
        {!pending && (
          <section>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
              Audit
            </div>
            <div className="rounded-md border border-[#2a2a2a] bg-[#141414] p-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#a3a3a3]"><span>Created</span><span className="font-mono text-[#737373]">{new Date(d.createdAt).toLocaleString()}</span></div>
              {d.resolvedAt && (
                <div className="flex justify-between text-[#a3a3a3]"><span>Resolved</span><span className="font-mono text-[#737373]">{new Date(d.resolvedAt).toLocaleString()}</span></div>
              )}
              {d.approvedBy && (
                <div className="flex justify-between text-[#a3a3a3]">
                  <span>{d.status === 'auto-approved' ? 'Auto-approved' : d.status === 'rejected' ? 'Rejected' : 'Approved'} by</span>
                  <span className="text-[#e5e5e5]">{d.approvedBy}</span>
                </div>
              )}
              {d.rejectionReason && (
                <div className="mt-2 border-t border-[#2a2a2a] pt-2 text-[11px]">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Rejection reason</div>
                  <p className="mt-1 text-[#a3a3a3]">{d.rejectionReason}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Action footer */}
      {pending ? (
        <div className="flex-none border-t border-[#2a2a2a] bg-[#0f0f0f] px-5 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
          {showReject ? (
            <div className="space-y-3">
              <label className="text-[9px] font-bold uppercase tracking-widest text-[#525252]">Rejection reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this recommendation is being rejected..."
                className="w-full resize-none rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-xs text-[#e5e5e5] placeholder:text-[#525252] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 focus:outline-none transition-all"
                rows={3}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => { setShowReject(false); setRejectionReason(''); }}
                  className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-4 py-2 text-xs font-bold text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { reject(d.id, rejectionReason || 'Operator override'); setShowReject(false); setRejectionReason(''); }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setShowReject(true)}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2.5 text-xs font-bold text-[#a3a3a3] hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5 transition-all"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
              <Link
                href={`/simulation?from=${d.id}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-3 py-2.5 text-xs font-bold text-[#3b82f6] hover:bg-[#3b82f6]/20 transition-all"
              >
                <Beaker className="h-4 w-4" />
                Simulate
              </Link>
              <button
                onClick={() => approve(d.id)}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#3b82f6] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#2563eb] transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ——— tiles ——— */

function ImpactTile({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: 'good' | 'warn' | 'neutral' }) {
  const toneColor = tone === 'good' ? 'text-emerald-400' : tone === 'warn' ? 'text-amber-400' : 'text-[#e5e5e5]';
  return (
    <div className="rounded-md border border-[#2a2a2a] bg-[#141414] p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={`mt-0.5 font-mono text-base font-bold tabular-nums ${toneColor}`}>{value}</div>
    </div>
  );
}

function CompareRow({
  label, current, recommended, betterIsLower, currentVal, recommendedVal,
}: {
  label: string; current: string; recommended: string; betterIsLower: boolean; currentVal: number; recommendedVal: number;
}) {
  const betterRec = betterIsLower ? recommendedVal < currentVal : recommendedVal > currentVal;
  return (
    <tr>
      <td className="px-3 py-2 text-[11px] text-[#a3a3a3]">{label}</td>
      <td className="px-3 py-2 text-right font-mono text-[11px] text-[#e5e5e5] tabular-nums">{current}</td>
      <td className={`px-3 py-2 text-right font-mono text-[11px] tabular-nums ${betterRec ? 'text-emerald-400' : 'text-amber-400'}`}>
        {recommended}
      </td>
    </tr>
  );
}
