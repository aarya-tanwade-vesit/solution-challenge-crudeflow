'use client';

import React, { useState } from 'react';
import { AlertCircle, TrendingUp, Anchor, MapPin } from 'lucide-react';
import type { Vessel } from '@/types/vessel';

const mockVessels: Vessel[] = [
  {
    id: 'v1',
    name: 'MT Volgograd',
    imo: '9876543',
    mmsi: '123456789',
    flag: 'IN',
    type: 'Crude Tanker',
    dwt: 318000,
    grossTonnage: 160000,
    netTonnage: 95000,
    length: 330,
    owner: 'BPCL',
    commercialManager: 'BPCL Trading',
    currentLocation: { lat: 20.5, lng: 63.5, timestamp: new Date() },
    origin: 'Novorossiysk',
    destination: 'Jamnagar / Sikka',
    eta: new Date(Date.now() + 86400000 * 2),
    cargoVolume: 1200000,
    cargoType: 'Urals Crude',
    riskScore: 75,
    delayProbability: 65,
    currentRoute: { waypoints: [], distance: 2500 },
    recommendedAction: 'reroute',
    confidence: 87,
    demurrageExposure: 450000,
    bufferImpact: -1.2,
    status: 'at-risk',
    alerts: ['High risk zone', 'Delayed ETA'],
    workspaceId: 'bpcl-mumbai',
  },
  {
    id: 'v2',
    name: 'MT Yamuna',
    imo: '9876544',
    mmsi: '123456790',
    flag: 'IN',
    type: 'Crude Tanker',
    dwt: 298000,
    grossTonnage: 150000,
    netTonnage: 89000,
    length: 320,
    owner: 'BPCL',
    commercialManager: 'BPCL Trading',
    currentLocation: { lat: 18.0, lng: 60.0, timestamp: new Date() },
    origin: 'Ras Tanura',
    destination: 'Mumbai',
    eta: new Date(Date.now() + 86400000 * 4),
    cargoVolume: 900000,
    cargoType: 'Arab Medium',
    riskScore: 45,
    delayProbability: 35,
    currentRoute: { waypoints: [], distance: 2200 },
    recommendedAction: 'monitor',
    confidence: 72,
    demurrageExposure: 315000,
    bufferImpact: -0.8,
    status: 'normal',
    alerts: [],
    workspaceId: 'bpcl-mumbai',
  },
  {
    id: 'v3',
    name: 'MT Houston Voyager',
    imo: '9542180',
    mmsi: '419002222',
    flag: 'PA',
    type: 'Crude Tanker',
    dwt: 280000,
    grossTonnage: 145000,
    netTonnage: 86000,
    length: 315,
    owner: 'Chartered',
    commercialManager: 'BPCL Trading',
    currentLocation: { lat: 20.1, lng: 65.4, timestamp: new Date() },
    origin: 'Houston',
    destination: 'Mumbai',
    eta: new Date(Date.now() + 86400000 * 1),
    cargoVolume: 2050000,
    cargoType: 'WTI Midland',
    riskScore: 91,
    delayProbability: 79,
    currentRoute: { waypoints: [], distance: 1800 },
    recommendedAction: 'reroute',
    confidence: 94,
    demurrageExposure: 780000,
    bufferImpact: -1.6,
    status: 'critical',
    alerts: ['High risk corridor', 'Route diversion recommended'],
    workspaceId: 'bpcl-mumbai',
  },
];

interface OperationsTableProps {
  onVesselSelect?: (vessel: Vessel) => void;
}

export function OperationsTable({ onVesselSelect }: OperationsTableProps) {
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);

  const handleRowClick = (vessel: Vessel) => {
    setSelectedVesselId(vessel.id);
    onVesselSelect?.(vessel);
  };

  const riskColors: Record<string, string> = {
    normal: 'text-emerald-400',
    delayed: 'text-amber-400',
    'at-risk': 'text-orange-400',
    critical: 'text-red-400',
  };

  const actionStyles: Record<string, string> = {
    reroute: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    monitor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    delay: 'bg-red-500/10 text-red-400 border-red-500/20',
    none: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4 text-[#525252]" />
          <span className="text-xs uppercase tracking-wider text-[#a3a3a3] font-semibold">Active Shipments</span>
        </div>
        <span className="text-[10px] text-[#525252] font-mono">
          {mockVessels.length} vessels in transit
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-[#171717] border-b border-[#2a2a2a] sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[#525252] uppercase tracking-wider text-[10px]">Vessel</th>
              <th className="px-4 py-3 text-left font-semibold text-[#525252] uppercase tracking-wider text-[10px]">Route</th>
              <th className="px-4 py-3 text-center font-semibold text-[#525252] uppercase tracking-wider text-[10px]">Risk</th>
              <th className="px-4 py-3 text-center font-semibold text-[#525252] uppercase tracking-wider text-[10px]">Delay</th>
              <th className="px-4 py-3 text-center font-semibold text-[#525252] uppercase tracking-wider text-[10px]">Buffer</th>
              <th className="px-4 py-3 text-left font-semibold text-[#525252] uppercase tracking-wider text-[10px]">Action</th>
              <th className="px-4 py-3 text-right font-semibold text-[#525252] uppercase tracking-wider text-[10px]">ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {mockVessels.map((vessel) => (
              <tr
                key={vessel.id}
                onClick={() => handleRowClick(vessel)}
                className={`cursor-pointer hover:bg-[#262626] transition-colors ${
                  selectedVesselId === vessel.id ? 'bg-[#262626]' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {vessel.alerts.length > 0 && (
                      <div className="w-5 h-5 rounded bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-3 h-3 text-red-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-[#e5e5e5]">{vessel.name}</div>
                      <div className="text-[10px] text-[#525252] font-mono">{vessel.imo}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[#a3a3a3]">
                    <MapPin className="w-3 h-3 text-[#404040]" />
                    <span>{vessel.origin}</span>
                    <span className="text-[#404040]">&rarr;</span>
                    <span className="text-[#e5e5e5]">{vessel.destination}</span>
                  </div>
                  <div className="text-[10px] text-[#525252] mt-0.5">
                    {(vessel.cargoVolume / 1000000).toFixed(2)}M bbl &middot; {vessel.cargoType}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold font-mono ${riskColors[vessel.status]}`}>
                    {vessel.riskScore}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-mono ${vessel.delayProbability > 50 ? 'text-amber-400' : 'text-[#a3a3a3]'}`}>
                    {vessel.delayProbability}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-mono font-semibold ${vessel.bufferImpact < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {vessel.bufferImpact > 0 ? '+' : ''}{vessel.bufferImpact.toFixed(1)}d
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 border rounded text-[10px] font-semibold uppercase ${actionStyles[vessel.recommendedAction]}`}>
                    {vessel.recommendedAction !== 'none' && <TrendingUp className="w-2.5 h-2.5" />}
                    {vessel.recommendedAction === 'none' ? 'On Track' : vessel.recommendedAction}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono text-[#a3a3a3]">
                    {vessel.eta.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
