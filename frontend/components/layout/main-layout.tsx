'use client';

import React, { useState } from 'react';
import { LeftSidebar } from './left-sidebar';
import { TopBar } from './top-bar';
import { useSimulation } from '@/contexts';
import { SimulationToast } from './simulation-toast';
import { CommandPalette } from './command-palette';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { isSimulationMode } = useSimulation();

  return (
    <>
      {/* Blue frame overlay — fixed position, all 4 edges, entire screen */}
      {isSimulationMode && <div className="sim-frame" />}

      <div
        className={`flex h-screen w-screen bg-[#0f0f0f] text-[#e5e5e5] font-sans`}
      >
        <LeftSidebar isExpanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar sidebarExpanded={sidebarExpanded} />

          <div className="flex-1 flex flex-col min-h-0 bg-[#0f0f0f] page-transition">
            {children}
          </div>
        </div>

        <SimulationToast />
        <CommandPalette />
      </div>
    </>
  );
}
