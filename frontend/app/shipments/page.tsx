'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { VESSELS as FLEET_VESSELS, PORTS, type Vessel as MapVessel } from '@/components/map/map-data';
import {
  Ship, Filter, Search, Anchor, Navigation, AlertTriangle, Clock,
  TrendingUp, ArrowUpRight, MapPin, Fuel, Calendar, Gauge,
  CheckCircle2, AlertOctagon, X, ExternalLink, FileText, Download, Loader2
} from 'lucide-react';
import { getFleetVessels, getFleetSummary, exportFleet } from '@/lib/api/fleet-api';
import { useToast } from '@/components/ui/use-toast';

type StatusFilter = 'all' | 'onTrack' | 'delayed' | 'highRisk' | 'critical';
type FleetFilter = 'all' | 'bpcl' | 'chartered';

const STATUS_META: Record<string, { label: string; cls: string; dot: string; Icon: React.ElementType }> = {
  // ── backend camelCase variants (primary) ──────────────────────────────────
  onTrack:     { label: 'On track',  cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400', Icon: CheckCircle2 },
  delayed:     { label: 'Delayed',   cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30',       dot: 'bg-amber-400',   Icon: Clock },
  highRisk:    { label: 'High risk', cls: 'text-red-400 bg-red-500/10 border-red-500/30',             dot: 'bg-red-400',     Icon: AlertOctagon },
  critical:    { label: 'Critical',  cls: 'text-rose-400 bg-rose-500/10 border-rose-500/30',          dot: 'bg-rose-500',    Icon: AlertTriangle },
  // ── legacy / fallback aliases ─────────────────────────────────────────────
  normal:      { label: 'On track',  cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400', Icon: CheckCircle2 },
  'high-risk': { label: 'High risk', cls: 'text-red-400 bg-red-500/10 border-red-500/30',             dot: 'bg-red-400',     Icon: AlertOctagon },
};

const FALLBACK_STATUS = STATUS_META.onTrack;
function getStatus(s: string) { return STATUS_META[s] ?? FALLBACK_STATUS; }

function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
}
export default function ShipmentsPage() {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [fleet, setFleet] = useState<FleetFilter>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<MapVessel | null>(null);

  const [vessels, setVessels] = useState<MapVessel[]>(FLEET_VESSELS);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getFleetVessels(),
      getFleetSummary()
    ]).then(([vData, sData]) => {
      setVessels(vData);
      setSummary(sData);
    }).catch(err => {
      console.error('Failed to fetch fleet data', err);
      toast({
        title: 'Fleet Data Error',
        description: 'Using local fallback fleet data.',
        variant: 'destructive',
      });
    }).finally(() => {
      setIsLoading(false);
    });
  }, [toast]);

  const filtered = useMemo(() => {
    return vessels.filter((v) => {
      if (status !== 'all' && v.status !== status) return false;
      if (fleet === 'bpcl' && !v.isBpcl) return false;
      if (fleet === 'chartered' && v.isBpcl) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          v.name.toLowerCase().includes(q) ||
          v.imo.includes(q) ||
          v.mmsi.includes(q) ||
          v.origin.toLowerCase().includes(q) ||
          v.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vessels, status, fleet, query]);

  const counts = useMemo(() => {
    if (summary) return summary;
    const by = (f: (v: MapVessel) => boolean) => vessels.filter(f).length;
    return {
      all: vessels.length,
      onTrack:  by((v) => v.status === 'onTrack'  || v.status === 'normal'),
      delayed:  by((v) => v.status === 'delayed'),
      highRisk: by((v) => v.status === 'highRisk' || v.status === 'high-risk'),
      critical: by((v) => v.status === 'critical'),
      bpcl:     by((v) => v.isBpcl),
      chartered: by((v) => !v.isBpcl),
    };
  }, [vessels, summary]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const res = await exportFleet(format);
      toast({
        title: 'Export Started',
        description: `Exporting fleet data as ${format.toUpperCase()}. Job ID: ${res.jobId}`,
      });
    } catch (err) {
      toast({
        title: 'Export Failed',
        description: 'Failed to start fleet export.',
        variant: 'destructive',
      });
    }
  };

  return (
    <MainLayout>
      <div className="page-transition flex flex-col h-full bg-[#0a0a0a]">
        {/* Header */}
        <header className="flex-none border-b border-[#2a2a2a] bg-[#0f0f0f] px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Ship className="h-4 w-4 text-[#3b82f6]" />
                <h1 className="text-lg font-semibold text-[#f5f5f5]">Fleet &amp; Shipments</h1>
              </div>
              <p className="mt-0.5 text-xs text-[#737373]">
                Live AIS-tracked tankers, charters, and in-transit cargo assignments.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-1.5 rounded border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-semibold text-[#a3a3a3] hover:border-[#3a3a3a] hover:text-[#e5e5e5]"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              <Link
                href="/map"
                className="flex items-center gap-1.5 rounded border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-3 py-1.5 text-[11px] font-semibold text-[#3b82f6] hover:bg-[#3b82f6]/20"
              >
                <MapPin className="h-3.5 w-3.5" />
                View on map
              </Link>
            </div>
          </div>

          {/* Summary cards */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label="Total fleet" value={counts.all} sublabel="vessels" tint="blue" />
            <SummaryCard label="On track" value={counts.onTrack} sublabel={`of ${counts.all}`} tint="emerald" />
            <SummaryCard label="Delayed" value={counts.delayed} sublabel={`of ${counts.all}`} tint="amber" />
            <SummaryCard label="High risk" value={counts.highRisk} sublabel="need action" tint="red" />
          </div>
        </header>

        {/* Filters */}
        <div className="flex-none border-b border-[#2a2a2a] bg-[#0a0a0a] px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#525252]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vessel, IMO, MMSI, port…"
                className="w-full rounded border border-[#2a2a2a] bg-[#141414] py-1.5 pl-8 pr-3 text-[12px] text-[#e5e5e5] placeholder-[#525252] focus:border-[#3b82f6] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1 rounded border border-[#2a2a2a] bg-[#141414] p-0.5">
              <FilterChip label="All" active={status === 'all'} onClick={() => setStatus('all')} />
              <FilterChip label="On track" active={status === 'onTrack'} onClick={() => setStatus('onTrack')} />
              <FilterChip label="Delayed" active={status === 'delayed'} onClick={() => setStatus('delayed')} />
              <FilterChip label="High risk" active={status === 'highRisk'} onClick={() => setStatus('highRisk')} />
              <FilterChip label="Critical" active={status === 'critical'} onClick={() => setStatus('critical')} />
            </div>
            <div className="flex items-center gap-1 rounded border border-[#2a2a2a] bg-[#141414] p-0.5">
              <FilterChip label={`Full (${counts.all})`} active={fleet === 'all'} onClick={() => setFleet('all')} />
              <FilterChip label={`BPCL (${counts.bpcl})`} active={fleet === 'bpcl'} onClick={() => setFleet('bpcl')} />
              <FilterChip label={`Chartered (${counts.chartered})`} active={fleet === 'chartered'} onClick={() => setFleet('chartered')} />
            </div>
            <span className="ml-auto text-[11px] text-[#525252]">
              Showing <span className="text-[#e5e5e5] font-mono">{filtered.length}</span> of <span className="font-mono">{counts.all}</span>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 z-10 bg-[#0f0f0f] border-b border-[#2a2a2a]">
              <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
                <th className="px-4 py-3">Vessel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">ETA</th>
                <th className="px-4 py-3">Speed</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className={isLoading ? 'opacity-50' : ''}>
              {isLoading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="px-6 py-16 text-center">
                      <Loader2 className="mx-auto h-8 w-8 text-[#3b82f6] animate-spin" />
                      <p className="mt-3 text-sm text-[#737373]">Loading fleet data...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="px-6 py-16 text-center">
                      <Filter className="mx-auto h-8 w-8 text-[#404040]" />
                      <p className="mt-3 text-sm text-[#737373]">No vessels match your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const s = getStatus(v.status);
                  const riskColor = v.riskScore >= 70 ? 'text-red-400' : v.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400';
                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelected(v)}
                      className="border-b border-[#1a1a1a] hover:bg-[#141414] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded border border-[#2a2a2a] bg-[#1a1a1a]">
                            <Ship className="h-3.5 w-3.5 text-[#3b82f6]" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[#e5e5e5] truncate">{v.name}</div>
                            <div className="text-[10px] font-mono text-[#525252]">
                              {v.type} &middot; IMO {v.imo}
                              {v.isBpcl && <span className="ml-1.5 rounded bg-[#3b82f6]/10 px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-[#3b82f6]">BPCL</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${s.cls}`}>
                          <s.Icon className="h-3 w-3" />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#a3a3a3]">
                        <div className="flex items-center gap-1.5">
                          <Anchor className="h-3 w-3 text-[#525252]" />
                          <span className="truncate">{v.origin}</span>
                          <Navigation className="h-3 w-3 text-[#525252]" />
                          <span className="truncate font-medium text-[#e5e5e5]">{v.destination}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#a3a3a3]">{formatTime(v.etaIst)}</td>
                      <td className="px-4 py-3 font-mono text-[#a3a3a3]">{v.speedKnots.toFixed(1)} kn</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-1.5 w-12 overflow-hidden rounded-full bg-[#1a1a1a]">
                            <div
                              className={`h-full ${v.riskScore >= 70 ? 'bg-red-500' : v.riskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${v.riskScore}%` }}
                            />
                          </div>
                          <span className={`font-mono text-[11px] font-semibold ${riskColor}`}>{v.riskScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-mono text-[#525252]">
                        {v.lastUpdateMin === 0 ? 'just now' : `${v.lastUpdateMin}m ago`}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ArrowUpRight className="h-3.5 w-3.5 text-[#525252]" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && <VesselDetailDrawer vessel={selected} onClose={() => setSelected(null)} />}
    </MainLayout>
  );
}

/* ——— Sub-components ——— */

function SummaryCard({
  label, value, sublabel, tint,
}: { label: string; value: number; sublabel: string; tint: 'blue' | 'emerald' | 'amber' | 'red' }) {
  const tints = {
    blue: 'text-[#3b82f6]',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };
  return (
    <div className="rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#525252]">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={`text-xl font-bold font-mono ${tints[tint]}`}>{value}</span>
        <span className="text-[10px] text-[#525252]">{sublabel}</span>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
        active
          ? 'bg-[#3b82f6]/15 text-[#3b82f6]'
          : 'text-[#a3a3a3] hover:bg-[#1f1f1f] hover:text-[#e5e5e5]'
      }`}
    >
      {label}
    </button>
  );
}

function VesselDetailDrawer({ vessel, onClose }: { vessel: MapVessel; onClose: () => void }) {
  const s = getStatus(vessel.status);
  const port = PORTS.find((p) => p.name === vessel.destination);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-[#2a2a2a] bg-[#0a0a0a] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[#2a2a2a] bg-[#0f0f0f]/95 backdrop-blur-sm px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#525252]">{vessel.type}</div>
              <h2 className="text-base font-semibold text-[#f5f5f5] truncate">{vessel.name}</h2>
              <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-[#737373]">
                <span>IMO {vessel.imo}</span>
                <span>&middot;</span>
                <span>MMSI {vessel.mmsi}</span>
                <span>&middot;</span>
                <span>Flag {vessel.flag}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded border border-[#2a2a2a] text-[#737373] hover:border-[#3a3a3a] hover:text-[#e5e5e5]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${s.cls}`}>
              <s.Icon className="h-3 w-3" />
              {s.label}
            </span>
            {vessel.isBpcl && (
              <span className="rounded border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#3b82f6]">
                BPCL Fleet
              </span>
            )}
          </div>
        </div>

        {/* Voyage */}
        <section className="px-5 py-4 border-b border-[#1a1a1a]">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#525252] mb-3">Current voyage</h3>
          <div className="rounded-md border border-[#2a2a2a] bg-[#141414] p-3">
            <div className="flex items-center gap-2">
              <Anchor className="h-3.5 w-3.5 text-[#3b82f6]" />
              <span className="text-[13px] font-semibold text-[#e5e5e5]">{vessel.origin}</span>
              <div className="h-px flex-1 border-t border-dashed border-[#3a3a3a]" />
              <Navigation className="h-3.5 w-3.5 text-[#3b82f6]" />
              <span className="text-[13px] font-semibold text-[#e5e5e5]">{vessel.destination}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat label="ETA (IST)" value={formatTime(vessel.etaIst)} icon={Calendar} />
              <Stat label="Speed" value={`${vessel.speedKnots.toFixed(1)} kn`} icon={Gauge} />
              <Stat label="Heading" value={`${vessel.headingDeg}°`} icon={Navigation} />
              <Stat label="DWT" value={`${formatNumber(vessel.dwt)} t`} icon={Fuel} />
            </div>
          </div>
        </section>

        {/* Risk */}
        <section className="px-5 py-4 border-b border-[#1a1a1a]">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#525252] mb-3">Risk profile</h3>
          <div className="space-y-2.5">
            <MetricBar label="Risk score" value={vessel.riskScore} tint={vessel.riskScore >= 70 ? 'red' : vessel.riskScore >= 40 ? 'amber' : 'emerald'} />
            <MetricBar label="Delay probability" value={vessel.delayProbability} tint={vessel.delayProbability >= 60 ? 'red' : vessel.delayProbability >= 30 ? 'amber' : 'emerald'} />
          </div>
        </section>

        {/* Destination port */}
        {port && (
          <section className="px-5 py-4 border-b border-[#1a1a1a]">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#525252] mb-3">Destination port state</h3>
            <div className="rounded-md border border-[#2a2a2a] bg-[#141414] p-3">
              <div className="text-[13px] font-semibold text-[#e5e5e5]">{port.name}, {port.country}</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <div className="text-[#525252]">Congestion</div>
                  <div className="font-mono text-amber-400">{port.congestionPct}%</div>
                </div>
                <div>
                  <div className="text-[#525252]">Wait</div>
                  <div className="font-mono text-[#e5e5e5]">{port.avgWaitHours}h</div>
                </div>
                <div>
                  <div className="text-[#525252]">Jetty occ.</div>
                  <div className="font-mono text-[#e5e5e5]">{port.jettyOccupancyPct}%</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Actions */}
        <section className="px-5 py-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#525252] mb-3">Actions</h3>
          <div className="space-y-2">
            <Link
              href={`/map?vessel=${vessel.id}`}
              className="flex w-full items-center justify-between rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-2.5 text-[12px] font-medium text-[#e5e5e5] hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#3b82f6]" />
                Open on intelligence map
              </span>
              <ExternalLink className="h-3 w-3 text-[#525252]" />
            </Link>
            <Link
              href={`/decisions?vessel=${vessel.id}`}
              className="flex w-full items-center justify-between rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-2.5 text-[12px] font-medium text-[#e5e5e5] hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-[#3b82f6]" />
                View active decisions
              </span>
              <ExternalLink className="h-3 w-3 text-[#525252]" />
            </Link>
            <Link
              href={`/simulation?vesselId=${vessel.id}`}
              className="flex w-full items-center justify-between rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-2.5 text-[12px] font-medium text-[#e5e5e5] hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5"
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-[#3b82f6]" />
                Simulate reroute scenarios
              </span>
              <ExternalLink className="h-3 w-3 text-[#525252]" />
            </Link>
          </div>
        </section>
      </aside>
    </>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded border border-[#2a2a2a] bg-[#0f0f0f] p-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#525252]">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 text-[12px] font-mono text-[#e5e5e5]">{value}</div>
    </div>
  );
}

function MetricBar({ label, value, tint }: { label: string; value: number; tint: 'emerald' | 'amber' | 'red' }) {
  const c = { emerald: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500' }[tint];
  const t = { emerald: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400' }[tint];
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#a3a3a3]">{label}</span>
        <span className={`font-mono font-semibold ${t}`}>{value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-[#141414] overflow-hidden">
        <div className={`h-full ${c}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
