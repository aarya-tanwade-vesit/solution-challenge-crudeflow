'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  Ship, 
  Zap, 
  ChevronLeft,
  HelpCircle,
  Settings,
  Brain,
  Map as MapIcon
} from 'lucide-react';
import { CrudeFlowLogo } from '@/components/branding/crudeflow-logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LeftSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: MapIcon, label: 'Intelligence Map', href: '/map' },
  { icon: Brain, label: 'Decision Engine', href: '/decisions' },
  { icon: Zap, label: 'Simulation Lab', href: '/simulation' },
  { icon: Ship, label: 'Shipments', href: '/shipments' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
];

const bottomNavItems = [
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help' },
];

export function LeftSidebar({ isExpanded, onToggle }: LeftSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for top-level routes that would otherwise greedily
    // claim deeper paths (e.g. '/dashboard' should not stay highlighted
    // when on '/dashboard-archive', and '/' is no longer a nav target).
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={`flex-shrink-0 border-r border-[#2a2a2a] bg-[#1a1a1a] flex flex-col transition-[width] duration-300 ease-in-out ${
          isExpanded ? 'w-60' : 'w-[72px]'
        }`}
      >
        {/* Logo Section - Fixed height container for visual stability */}
        <div className="h-16 flex items-center px-4 border-b border-[#2a2a2a] flex-shrink-0">
          <div className={`flex items-center ${isExpanded ? 'justify-between w-full' : 'justify-center w-full'}`}>
            {/*
              Inside the application shell, the logo should return the
              user to the operational dashboard, not the marketing
              landing page. The marketing landing remains accessible
              via the public root URL.
            */}
            <Link href="/dashboard">
              <CrudeFlowLogo showText={isExpanded} />
            </Link>
            
            {/* Collapse Toggle - Only visible when expanded */}
            {isExpanded && (
              <button
                onClick={onToggle}
                className="p-1.5 hover:bg-[#2a2a2a] rounded-md transition-colors group"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-[#737373] group-hover:text-[#a3a3a3] transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 flex flex-col py-4 overflow-y-auto">
          {/* Primary Navigation */}
          <div className="px-3 space-y-1">
            {!isExpanded && (
              <div className="h-6 flex items-center justify-center mb-2">
                <button
                  onClick={onToggle}
                  className="p-1 hover:bg-[#2a2a2a] rounded-md transition-colors group"
                  title="Expand sidebar"
                >
                  <ChevronLeft className="w-4 h-4 text-[#737373] group-hover:text-[#a3a3a3] transition-colors rotate-180" />
                </button>
              </div>
            )}
            
            {isExpanded && (
              <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider px-3 mb-3">
                Main Menu
              </p>
            )}
            
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const navLink = (
                <Link
                  key={idx}
                  href={item.href}
                  className={`w-full flex items-center gap-3 rounded-lg cursor-pointer transition-all duration-200 group relative ${
                    isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
                  } ${
                    active
                      ? 'bg-[#3b82f6]/10 text-[#3b82f6]'
                      : 'text-[#a3a3a3] hover:bg-[#262626] hover:text-[#e5e5e5]'
                  }`}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#3b82f6] rounded-r-full" />
                  )}
                  
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-[#3b82f6]' : ''}`} />
                  
                  {isExpanded && (
                    <span className={`text-sm font-medium whitespace-nowrap ${active ? 'text-[#3b82f6]' : ''}`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );

              if (!isExpanded) {
                return (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      {navLink}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#262626] text-[#e5e5e5] border-[#404040]">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return navLink;
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Secondary Navigation */}
          <div className="px-3 space-y-1 pb-2">
            {isExpanded && (
              <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider px-3 mb-3">
                Support
              </p>
            )}
            
            {bottomNavItems.map((item, idx) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const navLink = (
                <Link
                  key={idx}
                  href={item.href}
                  className={`w-full flex items-center gap-3 rounded-lg cursor-pointer transition-all duration-200 relative ${
                    isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
                  } ${
                    active
                      ? 'bg-[#3b82f6]/10 text-[#3b82f6]'
                      : 'text-[#737373] hover:bg-[#262626] hover:text-[#a3a3a3]'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-[#3b82f6]' : ''}`} />
                  
                  {isExpanded && (
                    <span className={`text-sm font-medium whitespace-nowrap ${active ? 'text-[#3b82f6]' : ''}`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );

              if (!isExpanded) {
                return (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      {navLink}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#262626] text-[#e5e5e5] border-[#404040]">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return navLink;
            })}
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
}
