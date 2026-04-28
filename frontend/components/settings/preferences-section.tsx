'use client';

import React from 'react';
import { useSettings } from '@/contexts';
import { SettingsCard, ToggleRow, RadioRow, RadioOption } from './settings-primitives';
import { Layers3, Shield, RotateCcw } from 'lucide-react';

export function PreferencesSection() {
  const { preferences, setPreference, resetPreferences } = useSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#e5e5e5]">Preferences</h2>
          <p className="mt-1 text-xs text-[#737373]">Display, refresh, and simulation behavior. Saved to your browser.</p>
        </div>
        <button
          onClick={resetPreferences}
          className="flex items-center gap-1.5 rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-1.5 text-xs text-[#a3a3a3] hover:text-[#e5e5e5]"
        >
          <RotateCcw className="h-3 w-3" />
          Reset to defaults
        </button>
      </div>

      {/* Simulation Behavior */}
      <SettingsCard title="Simulation Behavior" icon={Layers3}>
        <RadioRow
          label="Simulation view mode"
          description="Isolated: simulation stays within the Lab. Integrated: simulation cascades across the entire app (dashboard KPIs, map, decisions, alerts)."
        >
          <RadioOption
            selected={preferences.simulationViewMode === 'isolated'}
            onSelect={() => setPreference('simulationViewMode', 'isolated')}
            label="Isolated"
            description="Simulation confined to Lab"
          />
          <RadioOption
            selected={preferences.simulationViewMode === 'integrated'}
            onSelect={() => setPreference('simulationViewMode', 'integrated')}
            label="Integrated (system-wide)"
            description="Cascade simulation state across app"
            recommended
          />
        </RadioRow>

        <ToggleRow
          label="Show simulation cue"
          description="Display a blue glow and badge when simulation mode is active"
          checked={preferences.showSimulationCue}
          onChange={(v) => setPreference('showSimulationCue', v)}
        />
      </SettingsCard>

      {/* Display */}
      <SettingsCard title="Display" icon={Shield}>
        <RadioRow
          label="Unit system"
          description="Units used across the app for distance, volume, and weight."
        >
          <RadioOption
            selected={preferences.unitSystem === 'metric'}
            onSelect={() => setPreference('unitSystem', 'metric')}
            label="Metric"
            description="km, MT, °C"
          />
          <RadioOption
            selected={preferences.unitSystem === 'imperial'}
            onSelect={() => setPreference('unitSystem', 'imperial')}
            label="Imperial"
            description="miles, BBL, °F"
          />
        </RadioRow>

        <ToggleRow
          label="Reduce motion"
          description="Minimize animations for accessibility"
          checked={preferences.reduceMotion}
          onChange={(v) => setPreference('reduceMotion', v)}
        />

        <RadioRow
          label="Data refresh interval"
          description="How often live data feeds update automatically."
        >
          {[30, 60, 120, 300].map((s) => (
            <RadioOption
              key={s}
              selected={preferences.refreshInterval === s}
              onSelect={() => setPreference('refreshInterval', s as 30 | 60 | 120 | 300)}
              label={s < 60 ? `${s}s` : s === 60 ? '1 min' : s === 120 ? '2 min' : '5 min'}
              description={s === 60 ? 'Default' : ''}
            />
          ))}
        </RadioRow>
      </SettingsCard>

      {/* Notifications */}
      <SettingsCard title="Notifications">
        <ToggleRow
          label="In-app notifications"
          description="Toast alerts for critical events and decisions"
          checked={preferences.notifications}
          onChange={(v) => setPreference('notifications', v)}
        />
        <ToggleRow
          label="Daily email digest"
          description="Summary of decisions, KPI changes, and alerts"
          checked={preferences.emailDigest}
          onChange={(v) => setPreference('emailDigest', v)}
        />
      </SettingsCard>
    </div>
  );
}
