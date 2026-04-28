import type { DecisionRecord, EvidenceType } from '@/contexts/decisions-context';

function parseTime(value?: string | number) {
  if (typeof value === 'number') return value;
  const time = value ? new Date(value).getTime() : Date.now();
  return Number.isNaN(time) ? Date.now() : time;
}

function normalizeEvidenceType(type?: string): EvidenceType {
  if (type === 'news' || type === 'ais' || type === 'port' || type === 'weather' || type === 'internal' || type === 'market') {
    return type;
  }
  if (type === 'refinery') return 'internal';
  return 'internal';
}

function normalizeComparison(comparison: any) {
  if (!comparison) return undefined;
  if (comparison.current?.delayHours !== undefined) return comparison;

  return {
    current: {
      delayHours: comparison.current?.etaHours ?? 0,
      cost: comparison.current?.costUsd ?? 0,
      risk: comparison.current?.riskScore ?? 0,
      bufferDays: comparison.current?.bufferDays ?? 0,
    },
    recommended: {
      delayHours: comparison.optimized?.etaHours ?? comparison.recommended?.etaHours ?? 0,
      cost: comparison.optimized?.costUsd ?? comparison.recommended?.costUsd ?? 0,
      risk: comparison.optimized?.riskScore ?? comparison.recommended?.riskScore ?? 0,
      bufferDays: comparison.optimized?.bufferDays ?? comparison.recommended?.bufferDays ?? 0,
    },
  };
}

export function adaptDecisionRecord(d: any): DecisionRecord {
  const kpiDelta = d.kpiDelta || d.comparison?.delta || {};
  const comparison = normalizeComparison(d.comparison);

  return {
    ...d,
    id: d.id,
    title: d.title || d.recommendation || 'Decision recommendation',
    category: d.category || 'reroute',
    priority: d.priority || 'critical',
    status: d.status || 'pending',
    createdAt: parseTime(d.createdAt),
    resolvedAt: d.resolvedAt || d.approvedAt || d.rejectedAt ? parseTime(d.resolvedAt || d.approvedAt || d.rejectedAt) : undefined,
    vesselId: d.vesselId,
    vesselName: d.vesselName,
    cause: d.cause || d.oneLineReason || '',
    oneLineReason: d.oneLineReason || d.effect || d.cause || '',
    reasoning: d.reasoning || [],
    reasoningFactors:
      d.reasoningFactors ||
      d.xaiEvidence?.map((e: any, index: number) => ({
        factor: e.type === 'news' ? 'News signal' : e.type === 'port' ? 'Port operations' : e.type === 'refinery' ? 'Refinery buffer' : e.type || 'Signal',
        weight: Math.max(0.1, Math.min(0.95, (e.confidence || 80) / 100)),
        direction: index === 2 ? 'positive' : 'negative',
        summary: e.summary,
      })),
    confidenceBreakdown: d.confidenceBreakdown || {
      riskSignal: d.confidence || 91,
      delayForecast: d.confidence || 91,
      costEstimate: d.confidence || 91,
      bufferPrediction: d.confidence || 91,
    },
    evidence: (d.evidence || d.xaiEvidence || []).map((e: any) => ({
      ...e,
      type: normalizeEvidenceType(e.type),
      timestamp: parseTime(e.timestamp),
    })),
    alternatives: d.alternatives || [],
    comparison,
    effect: d.effect || 'Route activation reduces congestion, demurrage, and risk exposure.',
    recommendation: d.recommendation || d.title || 'Approve optimized route',
    alternativeCount: d.alternativeCount ?? d.alternatives?.length ?? 0,
    confidence: d.confidence || 91,
    costImpact: d.costImpact ?? kpiDelta.demurrageForecastUsd ?? 0,
    delayHoursImpact: d.delayHoursImpact ?? -33,
    riskDelta: d.riskDelta ?? kpiDelta.fleetRiskScore ?? -20,
    bufferImpactDays: d.bufferImpactDays ?? kpiDelta.refineryBufferDays,
    source: d.source || 'live',
    approvedBy: d.approvedBy,
    rejectionReason: d.rejectionReason,
  };
}

export function adaptDecisionState(data: any) {
  return {
    ...data,
    decisionState: {
      ...data?.decisionState,
      decisions: (data?.decisionState?.decisions || []).map(adaptDecisionRecord),
      pending: (data?.decisionState?.pending || []).map(adaptDecisionRecord),
    },
  };
}

