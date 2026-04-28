'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowUpRight } from 'lucide-react';
import type { KPIData } from '@/types/kpi';

interface KPIDrillDownDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  kpiType: 'demurrage' | 'buffer' | 'risk' | 'inaction';
  kpiData: KPIData;
}

// Map KPI types to Analytics tabs
const kpiToAnalyticsTab: Record<string, string> = {
  demurrage: 'financial',
  buffer: 'operations',
  risk: 'risk',
  inaction: 'financial',
};

export function KPIDrillDownDrawer({
  isOpen,
  onClose,
  kpiType,
  kpiData,
}: KPIDrillDownDrawerProps) {
  const router = useRouter();

  const handleViewFullAnalysis = () => {
    const tab = kpiToAnalyticsTab[kpiType] || 'financial';
    router.push(`/analytics?tab=${tab}`);
    onClose();
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (kpiType) {
      case 'demurrage':
        return (
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wide text-[#a3a3a3] font-bold">Vessel Breakdown</span>
              <div className="mt-2 space-y-2">
                {kpiData.demurrageForecast.breakdown.map((v, i) => (
                  <div key={i} className="flex justify-between items-center px-3 py-2 bg-[#171717] border border-[#404040] rounded-[0.375rem]">
                    <div>
                      <div className="text-xs font-semibold text-[#e5e5e5]">{v.vesselName}</div>
                      <div className="text-xs text-[#a3a3a3]">{v.waitTime}h wait • ${v.dailyRate}/day</div>
                    </div>
                    <div className="text-sm font-mono font-bold text-red-500">${(v.forecast / 1000).toFixed(0)}K</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wide text-[#a3a3a3] font-bold">Port Status</span>
              <div className="mt-2 px-3 py-2 bg-[#171717] border border-[#404040] rounded-[0.375rem]">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#e5e5e5]">Kochi Port Congestion</span>
                  <span className="text-xs font-bold text-amber-500 uppercase">{kpiData.demurrageForecast.portCongestion}</span>
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wide text-[#a3a3a3] font-bold">Recommended Actions</span>
              <div className="mt-2 space-y-1.5">
                <button className="w-full text-left px-3 py-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded text-xs text-[#3b82f6] hover:bg-[#3b82f6]/20 transition-colors">
                  Slow down vessel to avoid early arrival
                </button>
                <button className="w-full text-left px-3 py-2 bg-[#171717] border border-[#404040] rounded text-xs text-[#a3a3a3] hover:bg-[#262626] transition-colors">
                  Swap berth sequence
                </button>
                <button className="w-full text-left px-3 py-2 bg-[#171717] border border-[#404040] rounded text-xs text-[#a3a3a3] hover:bg-[#262626] transition-colors">
                  Reroute to alternate port
                </button>
              </div>
            </div>
          </div>
        );

      case 'buffer':
        return (
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wide text-[#a3a3a3] font-bold">Inventory Status</span>
              <div className="mt-2 space-y-2">
                <div className="px-3 py-2 bg-[#171717] border border-[#404040] rounded-[0.375rem]">
                  <div className="text-xs text-[#a3a3a3]">Current Inventory</div>
                  <div className="text-sm font-mono font-bold text-[#e5e5e5]">{(kpiData.bufferDaysRemaining.currentInventory / 1000000).toFixed(1)}M barrels</div>
                </div>
                <div className="px-3 py-2 bg-[#171717] border border-[#404040] rounded-[0.375rem]">
                  <div className="text-xs text-[#a3a3a3]">Daily Consumption</div>
                  <div className="text-sm font-mono font-bold text-[#e5e5e5]">{(kpiData.bufferDaysRemaining.dailyConsumption / 1000).toFixed(0)}K barrels/day</div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wide text-[#a3a3a3] font-bold">Incoming Shipments</span>
              <div className="mt-2 space-y-2">
                {kpiData.bufferDaysRemaining.incomingShipments.map((s, i) => (
                  <div key={i} className="px-3 py-2 bg-[#171717] border border-[#404040] rounded-[0.375rem]">
                    <div className="text-xs font-semibold text-[#e5e5e5]">{s.vesselName}</div>
                    <div className="text-xs text-[#a3a3a3]">ETA: {s.etaDate.toLocaleDateString()} • {(s.cargoVolume / 1000000).toFixed(1)}M barrels</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wide text-[#a3a3a3] font-bold">Recommended Actions</span>
              <div className="mt-2 space-y-1.5">
                <button className="w-full text-left px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400 hover:bg-amber-500/20 transition-colors">
                  Reduce throughput (throttle refinery)
                </button>
                <button className="w-full text-left px-3 py-2 bg-[#171717] border border-[#404040] rounded text-xs text-[#a3a3a3] hover:bg-[#262626] transition-colors">
                  Prioritize critical shipment
                </button>
                <button className="w-full text-left px-3 py-2 bg-[#171717] border border-[#404040] rounded text-xs text-[#a3a3a3] hover:bg-[#262626] transition-colors">
                  Trigger emergency sourcing
                </button>
              </div>
            </div>
          </div>
        );

      case 'risk':
        return (
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wide text-[#a3a3a3] font-bold">Risk Components</span>
              <div className="mt-2 space-y-2">
                <div className="px-3 py-2 bg-[#171717] border border-[#404040] rounded-[0.375rem]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#a3a3a3]">Geopolitical (40%)</span>
                    <span className="text-sm font-mono font-bold text-red-500">{kpiData.maritimeRiskIndex.breakdown.geopolitical}%</span>
                  </div>
                </div>
                <div className="px-3 py-2 bg-[#171717] border border-[#404040] rounded-[0.375rem]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#a3a3a3]">Weather (20%)</span>
                    <span className="text-sm font-mono font-bold text-amber-500">{kpiData.maritimeRiskIndex.breakdown.weather}%</span>
                  </div>
                </div>
                <div className="px-3 py-2 bg-[#171717] border border-[#404040] rounded-[0.375rem]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#a3a3a3]">Congestion (20%)</span>
                    <span className="text-sm font-mono font-bold text-amber-500">{kpiData.maritimeRiskIndex.breakdown.congestion}%</span>
                  </div>
                </div>
                <div className="px-3 py-2 bg-[#171717] border border-[#404040] rounded-[0.375rem]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#a3a3a3]">Route Security (20%)</span>
                    <span className="text-sm font-mono font-bold text-blue-500">{kpiData.maritimeRiskIndex.breakdown.routeSecurity}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wide text-[#a3a3a3] font-bold">Affected Zones</span>
              <div className="mt-2 space-y-1">
                {kpiData.maritimeRiskIndex.riskZones.map((zone, i) => (
                  <div key={i} className="text-xs px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-[0.375rem] text-red-500">
                    {zone}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wide text-[#a3a3a3] font-bold">Recommended Actions</span>
              <div className="mt-2 space-y-1.5">
                <button className="w-full text-left px-3 py-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded text-xs text-[#3b82f6] hover:bg-[#3b82f6]/20 transition-colors">
                  Reroute via alternate corridor
                </button>
                <button className="w-full text-left px-3 py-2 bg-[#171717] border border-[#404040] rounded text-xs text-[#a3a3a3] hover:bg-[#262626] transition-colors">
                  Delay shipment
                </button>
                <button className="w-full text-left px-3 py-2 bg-[#171717] border border-[#404040] rounded text-xs text-[#a3a3a3] hover:bg-[#262626] transition-colors">
                  Increase buffer safety
                </button>
              </div>
            </div>
          </div>
        );

      case 'inaction':
        return (
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wide text-[#a3a3a3] font-bold">Cost Breakdown</span>
              <div className="mt-2 space-y-2">
                <div className="px-3 py-2 bg-[#171717] border border-[#404040] rounded-[0.375rem]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#a3a3a3]">Demurrage Daily</span>
                    <span className="text-sm font-mono font-bold text-red-500">${(kpiData.costOfInaction.breakdown.demurrageDaily / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                <div className="px-3 py-2 bg-[#171717] border border-[#404040] rounded-[0.375rem]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#a3a3a3]">Production Loss Daily</span>
                    <span className="text-sm font-mono font-bold text-red-500">${(kpiData.costOfInaction.breakdown.productionLossDaily / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                <div className="px-3 py-2 bg-[#171717] border border-[#404040] rounded-[0.375rem]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#a3a3a3]">Opportunity Cost Daily</span>
                    <span className="text-sm font-mono font-bold text-red-500">${(kpiData.costOfInaction.breakdown.opportunityCostDaily / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-[0.375rem]">
              <div className="text-xs text-[#a3a3a3]">Projected Cost in {kpiData.costOfInaction.delayDays} Days</div>
              <div className="text-lg font-mono font-bold text-purple-500 mt-1">${(kpiData.costOfInaction.projectedCost / 1000000).toFixed(1)}M</div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wide text-[#a3a3a3] font-bold">Recommended Actions</span>
              <div className="mt-2 space-y-1.5">
                <button className="w-full text-left px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-500/20 transition-colors">
                  Approve reroute immediately
                </button>
                <button className="w-full text-left px-3 py-2 bg-[#171717] border border-[#404040] rounded text-xs text-[#a3a3a3] hover:bg-[#262626] transition-colors">
                  Accept cost if cheaper than alternative
                </button>
                <button className="w-full text-left px-3 py-2 bg-[#171717] border border-[#404040] rounded text-xs text-[#a3a3a3] hover:bg-[#262626] transition-colors">
                  Trigger escalation
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-64 h-96 w-80 bg-[#262626] border-l border-[#404040] z-50 flex flex-col shadow-2xl rounded-l-lg">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#404040] flex items-center justify-between shrink-0">
          <span className="text-xs uppercase tracking-wide text-[#a3a3a3] font-bold">KPI Details</span>
          <button onClick={onClose} className="p-1 hover:bg-[#404040] rounded-sm transition-colors">
            <X className="w-4 h-4 text-[#a3a3a3]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#404040] shrink-0">
          <button 
            onClick={handleViewFullAnalysis}
            className="w-full px-3 py-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] text-xs font-medium rounded-[0.375rem] hover:bg-[#3b82f6]/20 transition-colors flex items-center justify-center gap-2"
          >
            View Full Analysis
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
