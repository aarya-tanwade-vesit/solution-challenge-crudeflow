'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle, Zap, RefreshCw } from 'lucide-react';
import { useActivityFeed } from '@/contexts';
import type { EventType } from '@/contexts/activity-feed-context';

interface ActivityFeedDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

const eventIcons: Record<EventType, React.ReactNode> = {
  alert: <AlertTriangle className="w-3.5 h-3.5" />,
  decision: <CheckCircle className="w-3.5 h-3.5" />,
  simulation: <Zap className="w-3.5 h-3.5" />,
  update: <RefreshCw className="w-3.5 h-3.5" />,
};

const eventColors: Record<EventType, { icon: string; bg: string }> = {
  alert: { icon: 'text-red-400', bg: 'bg-red-500/10' },
  decision: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  simulation: { icon: 'text-blue-400', bg: 'bg-blue-500/10' },
  update: { icon: 'text-[#737373]', bg: 'bg-[#262626]' },
};

const eventLabels: Record<EventType, string> = {
  alert: 'Alert',
  decision: 'Decision',
  simulation: 'Simulation',
  update: 'Update',
};

export function ActivityFeedDropdown({ isOpen, onClose, anchorRef }: ActivityFeedDropdownProps) {
  const { events, markEventAsRead } = useActivityFeed();
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

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

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
        className="fixed w-[380px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-2xl z-[9999] overflow-hidden"
        style={{ 
          top: position.top,
          right: position.right,
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between bg-[#171717]">
          <span className="text-xs font-semibold text-[#e5e5e5] uppercase tracking-wide">Activity Timeline</span>
          <span className="text-[10px] text-[#525252]">{events.length} events</span>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {events.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <span className="text-xs text-[#525252]">No events yet</span>
            </div>
          ) : (
            <div className="divide-y divide-[#2a2a2a]">
              {events.map(event => {
                const colors = eventColors[event.type];
                return (
                  <button
                    key={event.id}
                    onClick={() => markEventAsRead(event.id)}
                    className={`w-full px-4 py-3 hover:bg-[#262626] transition-colors text-left ${
                      !event.read ? 'bg-[#262626]/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${colors.bg} ${colors.icon}`}>
                        {eventIcons[event.type]}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-semibold uppercase tracking-wide ${colors.icon}`}>
                            {eventLabels[event.type]}
                          </span>
                          {!event.read && (
                            <span className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full" />
                          )}
                          <span className="text-[10px] text-[#525252] ml-auto">{formatTime(event.timestamp)}</span>
                        </div>
                        <div className={`text-xs font-medium mb-0.5 ${!event.read ? 'text-[#e5e5e5]' : 'text-[#a3a3a3]'}`}>
                          {event.title}
                        </div>
                        <div className="text-[11px] text-[#525252] leading-snug">
                          {event.description}
                        </div>
                        {event.metadata?.vesselName && (
                          <div className="text-[10px] text-[#404040] mt-1 font-mono">
                            Vessel: {event.metadata.vesselName}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[#2a2a2a] bg-[#171717]">
          <button className="text-[11px] text-[#3b82f6] hover:text-[#60a5fa] transition-colors font-medium">
            View all activity
          </button>
        </div>
      </div>
    </>
  );

  // Use portal to render outside the normal DOM hierarchy
  return createPortal(dropdownContent, document.body);
}
