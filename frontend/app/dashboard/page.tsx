'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { KPIStrip } from '@/components/dashboard/kpi-cards';
import { MainContent } from '@/components/dashboard/main-content';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="page-transition flex flex-1 flex-col min-h-0 overflow-y-auto">
        {/* KPI Strip - Scrolls with content */}
        <KPIStrip />

        {/* Main Content Area - Scrollable */}
        <MainContent />
      </div>
    </MainLayout>
  );
}
