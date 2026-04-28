'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, ChevronDown, RotateCcw, Check, Play, Pause, X, ChevronRight, FlaskConical } from 'lucide-react';
import { useWorkspace, useSystemStatus, useActivityFeed, useUser, useSimulation } from '@/contexts';
import { SystemStatusDropdown } from './system-status-dropdown';
import { ActivityFeedDropdown } from './activity-feed-dropdown';
import { UserProfileDropdown } from './user-profile-dropdown';

interface TopBarProps {
  sidebarExpanded: boolean;
}

const breadcrumbMap: Record<string, { label: string; parent?: string }> = {
  '/dashboard': { label: 'Dashboard' },
  '/analytics': { label: 'Analytics', parent: '/dashboard' },
  '/shipments': { label: 'Shipments', parent: '/dashboard' },
  '/simulation': { label: 'Simulation Lab', parent: '/dashboard' },
  '/decisions': { label: 'Decision Engine', parent: '/dashboard' },
  '/settings': { label: 'Settings', parent: '/dashboard' },
};

export function TopBar({ sidebarExpanded }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentWorkspace, workspaces, switchWorkspace } = useWorkspace();
  const { status, lastUpdated, refresh, isRefreshing } = useSystemStatus();
  const { unreadCount } = useActivityFeed();
  const { user } = useUser();
  const {
    isSimulationMode,
    exitSimulationMode,
    isPlaying,
    togglePlayback,
    isRunning,
    runSimulation,
    activeScenario,
    currentDay,
  } = useSimulation();

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [relativeTime, setRelativeTime] = useState('2m ago');

  const statusRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const diff = now - lastUpdated.getTime();
      const minutes = Math.floor(diff / 60000);
      setRelativeTime(minutes === 0 ? 'now' : `${minutes}m ago`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (workspaceMenuOpen) setWorkspaceMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [workspaceMenuOpen]);

  const statusColorMap = {
    normal: { dot: 'bg-emerald-500', text: 'text-emerald-400' },
    warning: { dot: 'bg-amber-500', text: 'text-amber-400' },
    critical: { dot: 'bg-red-500', text: 'text-red-400' },
  };
  const statusColors = statusColorMap[status];

  const handleExit = () => {
    // Exit simulation mode without redirecting. The Simulation Lab page
    // detects the exit via context and renders an explicit empty state
    // with a Re-enter button. Other pages will simply lose the sim badge.
    exitSimulationMode();
  };

  const scenarioLabel = activeScenario === 'baseline' ? 'Baseline' : activeScenario.replace('-', ' ');

  return (
    <div className={`h-14 border-b bg-[#1a1a1a] flex items-center justify-between px-4 gap-4 transition-all duration-300 relative z-[100] ${
      isSimulationMode ? 'border-[#3b82f6]/50' : 'border-[#2a2a2a]'
    }`}>
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Workspace Switcher */}
        <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#262626] border border-[#2a2a2a] text-[#e5e5e5] text-xs rounded hover:border-[#404040] transition-colors"
          >
            <span className="font-semibold">{currentWorkspace.name}</span>
            <ChevronDown className="w-3 h-3 text-[#525252]" />
          </button>

          {workspaceMenuOpen && (
            <>
              <div className="fixed inset-0 z-[200]" onClick={() => setWorkspaceMenuOpen(false)} />
              <div className="absolute top-full mt-1 left-0 w-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-2xl z-[201] overflow-hidden">
                <div className="px-3 py-2 border-b border-[#2a2a2a]">
                  <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Workspaces</span>
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs hover:bg-[#262626] transition-colors flex items-center justify-between ${
                      currentWorkspace.id === ws.id ? 'bg-[#262626]' : ''
                    }`}
                  >
                    <div>
                      <div className={`font-semibold ${currentWorkspace.id === ws.id ? 'text-[#3b82f6]' : 'text-[#e5e5e5]'}`}>
                        {ws.name}
                      </div>
                      <div className="text-[#525252] text-[10px] mt-0.5">
                        {ws.region} &middot; {ws.activeShipments} vessels
                      </div>
                    </div>
                    {currentWorkspace.id === ws.id && <Check className="w-3.5 h-3.5 text-[#3b82f6]" />}
                  </button>
                ))}
                <div className="border-t border-[#2a2a2a]">
                  <button className="w-full text-left px-3 py-2.5 text-xs text-[#525252] hover:bg-[#262626] hover:text-[#a3a3a3] transition-colors">
                    + Create Workspace
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1 text-xs" aria-label="Breadcrumb">
          {(() => {
            const current = breadcrumbMap[pathname] || { label: 'Dashboard' };
            const breadcrumbs: { path: string; label: string }[] = [];
            if (current.parent) {
              const parent = breadcrumbMap[current.parent];
              if (parent) breadcrumbs.push({ path: current.parent, label: parent.label });
            }
            breadcrumbs.push({ path: pathname, label: current.label });
            return breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <ChevronRight className="w-3 h-3 text-[#404040] mx-0.5" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-[#e5e5e5] font-medium px-1.5 py-0.5 bg-[#262626] rounded">{crumb.label}</span>
                ) : (
                  <Link href={crumb.path} className="text-[#737373] hover:text-[#a3a3a3] transition-colors px-1">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ));
          })()}
        </nav>
      </div>

      {/* CENTER: Sim badge with full controls (only when in sim mode) */}
      {isSimulationMode && (
        <div className="flex items-center gap-1.5 flex-shrink-0 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-md pl-2 pr-1 py-1">
          <FlaskConical className="w-3.5 h-3.5 text-[#3b82f6]" />
          <div className="flex flex-col leading-tight pr-2 border-r border-[#3b82f6]/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3b82f6]">
              Simulation Active
            </span>
            <span className="text-[9px] text-[#737373] font-mono capitalize">
              {scenarioLabel} &middot; Day {Math.round(currentDay)}/30
            </span>
          </div>

          {/* Run / Pause toggle */}
          {isPlaying ? (
            <button
              onClick={togglePlayback}
              className="flex items-center gap-1 px-2 py-1 bg-[#1a1a1a] hover:bg-[#262626] text-[#e5e5e5] text-[10px] font-semibold rounded transition-colors"
              title="Pause simulation"
            >
              <Pause className="w-3 h-3" />
              Pause
            </button>
          ) : (
            <button
              onClick={isRunning ? undefined : (currentDay > 1 ? togglePlayback : runSimulation)}
              disabled={isRunning}
              className="flex items-center gap-1 px-2 py-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[10px] font-semibold rounded transition-colors disabled:opacity-60"
              title={currentDay > 1 ? 'Resume simulation' : 'Run simulation'}
            >
              <Play className="w-3 h-3" />
              {isRunning ? 'Initializing' : currentDay > 1 ? 'Resume' : 'Run'}
            </button>
          )}

          {/* Exit */}
          <button
            onClick={handleExit}
            className="flex items-center gap-1 px-2 py-1 bg-transparent hover:bg-red-500/10 text-[#a3a3a3] hover:text-red-400 text-[10px] font-semibold rounded transition-colors"
            title="Exit simulation mode"
          >
            <X className="w-3 h-3" />
            Exit
          </button>
        </div>
      )}

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* System Status */}
        <div className="relative" ref={statusRef}>
          <button
            onClick={() => {
              setStatusDropdownOpen(!statusDropdownOpen);
              setActivityDropdownOpen(false);
              setUserDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-[#262626] border border-[#2a2a2a] text-xs rounded hover:border-[#404040] transition-colors"
          >
            <div className={`w-2 h-2 ${statusColors.dot} rounded-full`} />
            <span className={`uppercase font-semibold ${statusColors.text}`}>{status}</span>
            <span className="text-[#525252] text-[10px] font-mono">{relativeTime}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); refresh(); }}
            disabled={isRefreshing}
            className="absolute -right-7 top-1/2 -translate-y-1/2 p-1 hover:bg-[#262626] rounded transition-colors disabled:opacity-50"
            title="Refresh status"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#525252] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <SystemStatusDropdown isOpen={statusDropdownOpen} onClose={() => setStatusDropdownOpen(false)} anchorRef={statusRef} />
        </div>

        <div className="w-4" />

        {/* Activity */}
        <div className="relative" ref={activityRef}>
          <button
            onClick={() => {
              setActivityDropdownOpen(!activityDropdownOpen);
              setStatusDropdownOpen(false);
              setUserDropdownOpen(false);
            }}
            className="relative w-8 h-8 bg-[#262626] border border-[#2a2a2a] rounded flex items-center justify-center text-[#737373] hover:text-[#a3a3a3] hover:border-[#404040] transition-colors"
            title="Activity Feed"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <ActivityFeedDropdown isOpen={activityDropdownOpen} onClose={() => setActivityDropdownOpen(false)} anchorRef={activityRef} />
        </div>

        {/* User */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setStatusDropdownOpen(false);
              setActivityDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-2 py-1.5 bg-[#262626] border border-[#2a2a2a] rounded hover:border-[#404040] transition-colors"
            title="User Profile"
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center text-[10px] font-bold text-white">
              {user?.avatar}
            </div>
            <span className="text-xs text-[#a3a3a3] hidden sm:inline">{user?.name?.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-[#525252]" />
          </button>

          <UserProfileDropdown isOpen={userDropdownOpen} onClose={() => setUserDropdownOpen(false)} anchorRef={userRef} />
        </div>
      </div>
    </div>
  );
}
