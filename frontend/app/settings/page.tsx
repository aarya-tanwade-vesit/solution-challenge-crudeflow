'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { PreferencesSection } from '@/components/settings/preferences-section';
import { AiThresholdsSection } from '@/components/settings/ai-thresholds-section';
import { PortsSection } from '@/components/settings/ports-section';
import { IntegrationsSection } from '@/components/settings/integrations-section';
import { TeamSection } from '@/components/settings/team-section';
import { Settings, SlidersHorizontal, Anchor, Plug, Users } from 'lucide-react';

const TABS = [
  { id: 'preferences',  label: 'Preferences',   icon: Settings, description: 'Display, refresh cadence, simulation behavior' },
  { id: 'ai',           label: 'AI Thresholds', icon: SlidersHorizontal, description: 'Decision engine confidence and risk bands' },
  { id: 'ports',        label: 'Ports',         icon: Anchor, description: 'Physical port capabilities and capacity' },
  { id: 'integrations', label: 'Integrations',  icon: Plug, description: 'External data sources and ERP connections' },
  { id: 'team',         label: 'Team & Access', icon: Users, description: 'Organization members and roles' },
] as const;

type TabId = typeof TABS[number]['id'];

function SettingsBody() {
  const searchParams = useSearchParams();
  const requested = (searchParams.get('tab') as TabId | null) ?? null;
  const [active, setActive] = useState<TabId>(
    requested && TABS.some((t) => t.id === requested) ? requested : 'preferences'
  );

  useEffect(() => {
    if (requested && TABS.some((t) => t.id === requested) && requested !== active) {
      setActive(requested);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested]);

  return (
    <MainLayout>
      <div className="page-transition flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#0a0a0a]">
        {/* Header */}
        <header className="flex-none border-b border-[#2a2a2a] bg-[#0f0f0f]/80 px-4 py-4 xl:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/10">
              <Settings className="h-4 w-4 text-[#3b82f6]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#e5e5e5]">Settings</h1>
              <p className="text-[11px] text-[#737373]">
                Configure CrudeFlow preferences, AI thresholds, integrations, and team access
              </p>
            </div>
          </div>
        </header>

        {/* Tabs + Content */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar Tabs */}
          <aside className="w-64 flex-none border-r border-[#2a2a2a] bg-[#0f0f0f] p-3">
            <ul className="space-y-1">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = active === t.id;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => setActive(t.id)}
                      className={`w-full rounded-md px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'bg-[#3b82f6]/10 border-l-2 border-l-[#3b82f6]'
                          : 'border-l-2 border-l-transparent hover:bg-[#141414]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#3b82f6]' : 'text-[#737373]'}`} />
                        <span className={`text-xs font-semibold ${isActive ? 'text-[#e5e5e5]' : 'text-[#a3a3a3]'}`}>
                          {t.label}
                        </span>
                      </div>
                      <p className={`mt-0.5 pl-5 text-[10px] leading-tight ${isActive ? 'text-[#737373]' : 'text-[#525252]'}`}>
                        {t.description}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="max-w-3xl p-6">
              {active === 'preferences' && <PreferencesSection />}
              {active === 'ai' && <AiThresholdsSection />}
              {active === 'ports' && <PortsSection />}
              {active === 'integrations' && <IntegrationsSection />}
              {active === 'team' && <TeamSection />}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsBody />
    </Suspense>
  );
}
