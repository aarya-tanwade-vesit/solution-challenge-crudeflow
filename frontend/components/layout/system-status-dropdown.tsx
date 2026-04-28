'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSystemStatus } from '@/contexts';

interface SystemStatusDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

const statusConfig = {
  normal: { label: 'NORMAL', color: '#10b981' },
  warning: { label: 'WARNING', color: '#f59e0b' },
  critical: { label: 'CRITICAL', color: '#ef4444' },
};

export function SystemStatusDropdown({ isOpen, onClose, anchorRef }: SystemStatusDropdownProps) {
  const { status, systemScore, riskContributors, affectedRoutes, impactProjection, suggestedFocus } = useSystemStatus();
  const config = statusConfig[status];
  const [position, setPosition] = useState({ top: 0, right: 0 });

  // Calculate position based on anchor element
  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  const riskScore = systemScore ?? 72;
  const avgDelay = impactProjection.avgDelay;
  const productionRisk = impactProjection.productionRisk;
  const riskFactors = riskContributors.map((factor) => ({
    name: factor.category,
    percentage: 'score' in factor && typeof factor.score === 'number'
      ? factor.score
      : factor.severity === 'high'
      ? 45
      : factor.severity === 'medium'
      ? 25
      : 10,
  }));

  const dropdownContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={onClose}
        style={{ backgroundColor: 'transparent' }}
      />
      
      {/* Dropdown Panel */}
      <div 
        className="fixed w-[420px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-2xl z-[9999] overflow-hidden"
        style={{ 
          top: position.top,
          right: position.right,
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between bg-[#171717]">
          <div className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-sm font-semibold" style={{ color: config.color }}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737373]">Risk Score</span>
            <span className="text-sm font-mono font-bold text-[#e5e5e5]">{riskScore}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[480px] overflow-y-auto">
          {/* Risk Factors */}
          <div className="px-4 py-3 border-b border-[#2a2a2a]">
            <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-3">
              Contributing Factors
            </p>
            <div className="space-y-2.5">
              {riskFactors.map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-xs text-[#a3a3a3]">{factor.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-[#262626] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${factor.percentage}%`,
                          backgroundColor: factor.percentage > 30 ? '#ef4444' : factor.percentage > 20 ? '#f59e0b' : '#3b82f6',
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-[#737373] w-8 text-right">{factor.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Affected Routes */}
          <div className="px-4 py-3 border-b border-[#2a2a2a]">
            <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-3">
              Affected Routes
            </p>
            <div className="space-y-2">
              {affectedRoutes.map((route, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 bg-[#262626] rounded">
                  <span className="text-xs text-[#e5e5e5]">
                    {route.from} <span className="text-[#525252] mx-1">&rarr;</span> {route.to}
                  </span>
                  <span className={`text-[10px] font-semibold ${route.risk === 'HIGH' ? 'text-red-400' : 'text-amber-400'}`}>
                    {route.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Projection */}
          <div className="px-4 py-3 border-b border-[#2a2a2a]">
            <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-3">
              Impact Projection
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="px-3 py-2 bg-[#262626] rounded">
                <p className="text-[10px] text-[#525252] uppercase">Avg Delay</p>
                <p className="text-sm font-mono font-bold text-amber-400">{avgDelay}</p>
              </div>
              <div className="px-3 py-2 bg-[#262626] rounded">
                <p className="text-[10px] text-[#525252] uppercase">Production Risk</p>
                <p className="text-sm font-mono font-bold text-red-400">{productionRisk}</p>
              </div>
            </div>
          </div>

          {/* Suggested Actions */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-3">
              Suggested Actions
            </p>
            <div className="space-y-2">
              {suggestedFocus.map((focus, idx) => (
                <button
                  key={idx}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors ${
                    focus.priority === 'high'
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : focus.priority === 'medium'
                      ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                  }`}
                >
                  {focus.action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Use portal to render outside the normal DOM hierarchy
  return createPortal(dropdownContent, document.body);
}
