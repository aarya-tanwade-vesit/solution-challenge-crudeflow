'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/main-layout';

// Leaflet hits `window` on import, so the map MUST be client-only.
const MaritimeIntelligenceMap = dynamic(
  () => import('@/components/map/maritime-intelligence-map'),
  {
    ssr: false,
    loading: () => <MapLoader />,
  }
);

function MapLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-[#3b82f6] rounded-full animate-spin" />
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
          Loading maritime intelligence
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <MainLayout>
      <div className="page-transition h-full w-full">
        <MaritimeIntelligenceMap />
      </div>
    </MainLayout>
  );
}
