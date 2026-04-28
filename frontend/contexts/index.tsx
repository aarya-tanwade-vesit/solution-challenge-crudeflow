'use client';

import React from 'react';
import { WorkspaceProvider } from './workspace-context';
import { SystemStatusProvider } from './system-status-context';
import { ActivityFeedProvider } from './activity-feed-context';
import { UserProvider } from './user-context';
import { KPIProvider } from './kpi-context';
import { SimulationProvider } from './simulation-context';
import { NavigationProvider } from './navigation-context';
import { SettingsProvider } from './settings-context';
import { DecisionsProvider } from './decisions-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider>
      <UserProvider>
        <SettingsProvider>
          <WorkspaceProvider>
            <SystemStatusProvider>
              <ActivityFeedProvider>
                <SimulationProvider>
                  <KPIProvider>
                    <DecisionsProvider>
                      {children}
                    </DecisionsProvider>
                  </KPIProvider>
                </SimulationProvider>
              </ActivityFeedProvider>
            </SystemStatusProvider>
          </WorkspaceProvider>
        </SettingsProvider>
      </UserProvider>
    </NavigationProvider>
  );
}

export { useWorkspace } from './workspace-context';
export { useSystemStatus } from './system-status-context';
export { useActivityFeed } from './activity-feed-context';
export { useUser } from './user-context';
export { useKPI } from './kpi-context';
export { useSimulation } from './simulation-context';
export { useNavigation } from './navigation-context';
export { useSettings } from './settings-context';
export { useDecisions } from './decisions-context';
