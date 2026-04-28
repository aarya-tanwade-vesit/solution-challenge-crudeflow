'use client';

import React, { useState } from 'react';
import type { DecisionRecord } from '@/contexts/decisions-context';
import { useDecisions } from '@/contexts';
import {
  Brain, CheckCircle2, XCircle, AlertOctagon, Lightbulb, GitBranch, Clock, DollarSign, Shield,
  Ship, ArrowRight, Bot, Info, Beaker, FileText,
} from 'lucide-react';

interface Props {
  decision: DecisionRecord | null;
}

const PRIORITY_META = {
  critical: { label: 'Critical', badge: 'bg-red-500/15 text-red-400 border-red-500/30' },
  high:     { label: 'High',     badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  medium:   { label: 'Medium',   badge: 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30' },
  low:      { label: 'Low',      badge: 'bg-[#262626] text-[#a3a3a3] border-[#2a2a2a]' },
};

function fmtCost(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? '−' : v > 0 ? '+' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function DecisionDetail({ decision }: Props) {
  const { approve, reject } = useDecisions();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  if (!decision) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <Brain className="mx-auto h-10 w-10 text-[#404040]" />
          <h3 className="mt-3 text-sm font-semibold text-[#a3a3a3]">Select a decision to review</h3>
          <p className="mt-1 text-xs text-[#525252]">Detailed reasoning, alternatives, and approval flow appear here.</p>
        </div>
      </div>
    );
  }

  const d = decision;
  const priorityMeta = PRIORITY_META[d.priority];
  const pending = d.status === 'pending';

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-none border-b border-[#2a2a2a] bg-[#0f0f0f]/50 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${priorityMeta.badge}`}>
                {priorityMeta.label}
              </span>
              <span className="rounded bg-[#262626] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
                {d.category.replace('-', ' ')}
              </span>
              {d.source === 'simulation' && (
                <span className="inline-flex items-center gap-1 rounded border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6]">
                  <Beaker className="h-2.5 w-2.5" />
                  Simulation
                </span>
              )}
            </div>
            <h2 className="mt-2 text-lg font-semibold text-[#e5e5e5]">{d.title}</h2>
            {d.vesselName && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-[#737373]">
                <Ship className="h-3 w-3" />
                {d.vesselName}
              </div>
            )}
          </div>

          <div className="flex flex-none flex-col items-end">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Confidence</div>
            <div className="mt-0.5 flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#262626]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]" style={{ width: `${d.confidence}%` }} />
              </div>
              <span className="font-mono text-sm font-bold text-[#3b82f6]">{d.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Cause -> Effect -> Decision */}
        <section>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
            <GitBranch className="h-3 w-3" />
            Cause &middot; Effect &middot; Decision
          </div>
          <div className="space-y-2">
            {[
              { label: 'Cause', dot: 'bg-red-400', body: d.cause },
              { label: 'Effect', dot: 'bg-amber-400', body: d.effect },
              { label: 'Decision', dot: 'bg-[#3b82f6]', body: d.recommendation },
            ].map((r) => (
              <div key={r.label} className="flex items-start gap-3 rounded-md border border-[#2a2a2a] bg-[#141414] p-3">
                <div className={`mt-1 h-2 w-2 flex-none rounded-full ${r.dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">{r.label}</div>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-[#e5e5e5]">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Impact metrics */}
        <section>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
            <Info className="h-3 w-3" />
            Impact Metrics
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: DollarSign, label: 'Cost Impact', value: fmtCost(d.costImpact), color: d.costImpact < 0 ? 'text-emerald-400' : 'text-amber-400' },
              { icon: Clock, label: 'Delay Impact', value: `${d.delayHoursImpact >= 0 ? '+' : ''}${d.delayHoursImpact}h`, color: d.delayHoursImpact > 0 ? 'text-amber-400' : 'text-emerald-400' },
              { icon: Shield, label: 'Risk Delta', value: `${d.riskDelta >= 0 ? '+' : ''}${d.riskDelta}`, color: d.riskDelta < 0 ? 'text-emerald-400' : 'text-red-400' },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="rounded-md border border-[#2a2a2a] bg-[#141414] p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                    <Icon className="h-3 w-3" />
                    {m.label}
                  </div>
                  <div className={`mt-1 font-mono text-lg font-bold tabular-nums ${m.color}`}>{m.value}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Reasoning */}
        <section>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
            <Lightbulb className="h-3 w-3" />
            AI Reasoning
          </div>
          <ul className="space-y-1.5 rounded-md border border-[#2a2a2a] bg-[#141414] p-3">
            {d.reasoning.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-[#e5e5e5]">
                <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-[#525252]" />
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-[#525252]">
            {d.alternativeCount} alternative path{d.alternativeCount === 1 ? '' : 's'} considered before final recommendation.
          </p>
        </section>

        {/* Audit trail */}
        {!pending && (
          <section>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
              <FileText className="h-3 w-3" />
              Audit Trail
            </div>
            <div className="rounded-md border border-[#2a2a2a] bg-[#141414] p-3 space-y-2 text-[12px]">
              <div className="flex items-center justify-between text-[#a3a3a3]">
                <span>Created</span>
                <span className="font-mono text-[#737373]">{new Date(d.createdAt).toLocaleString()}</span>
              </div>
              {d.resolvedAt && (
                <div className="flex items-center justify-between text-[#a3a3a3]">
                  <span>Resolved</span>
                  <span className="font-mono text-[#737373]">{new Date(d.resolvedAt).toLocaleString()}</span>
                </div>
              )}
              {d.approvedBy && (
                <div className="flex items-center justify-between text-[#a3a3a3]">
                  <span>{d.status === 'auto-approved' ? 'Auto-Approved by' : d.status === 'rejected' ? 'Rejected by' : 'Approved by'}</span>
                  <span className="text-[#e5e5e5]">
                    {d.status === 'auto-approved' ? (
                      <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> {d.approvedBy}</span>
                    ) : d.approvedBy}
                  </span>
                </div>
              )}
              {d.rejectionReason && (
                <div className="mt-2 border-t border-[#2a2a2a] pt-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#525252]">Rejection Reason</div>
                  <p className="mt-1 text-[#a3a3a3]">{d.rejectionReason}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Approval footer - only for pending */}
      {pending && (
        <div className="flex-none border-t border-[#2a2a2a] bg-[#0f0f0f]/80 px-5 py-4">
          {showReject ? (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#525252]">Rejection reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this recommendation is being rejected..."
                className="w-full rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-xs text-[#e5e5e5] placeholder:text-[#525252] focus:border-[#3b82f6] focus:outline-none"
                rows={3}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => { setShowReject(false); setRejectionReason(''); }}
                  className="rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-1.5 text-xs text-[#a3a3a3] hover:text-[#e5e5e5]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { reject(d.id, rejectionReason || 'Operator override'); setShowReject(false); setRejectionReason(''); }}
                  className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="flex-1 text-[11px] text-[#737373]">
                Review and approve or reject this AI recommendation. Approvals are logged with your identity.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReject(true)}
                  className="flex items-center gap-1.5 rounded-md border border-[#2a2a2a] bg-[#141414] px-4 py-2 text-xs font-semibold text-[#a3a3a3] hover:border-red-500/40 hover:text-red-400"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => approve(d.id)}
                  className="flex items-center gap-1.5 rounded-md bg-[#3b82f6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2563eb]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve Recommendation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
