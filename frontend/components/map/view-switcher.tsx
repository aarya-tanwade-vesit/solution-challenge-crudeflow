'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';

export type MapView = 'dark' | 'light';

export interface TileSource {
  url: string;
  attribution: string;
  maxZoom: number;
}

export const TILE_SOURCES: Record<MapView, TileSource> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
  },
};

interface Props {
  view: MapView;
  onChange: (v: MapView) => void;
}

export function ViewSwitcher({ view, onChange }: Props) {
  const btn = (id: MapView, Icon: typeof Moon, label: string) => (
    <button
      key={id}
      onClick={() => onChange(id)}
      className={`flex items-center gap-1.5 px-3 h-8 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
        view === id
          ? 'bg-[#3b82f6]/15 text-[#3b82f6]'
          : 'text-[#a3a3a3] hover:bg-[#262626] hover:text-[#e5e5e5]'
      }`}
      title={`${label} view`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );

  return (
    <div className="flex items-center rounded-lg border border-[#2a2a2a] bg-[#0f0f0f]/90 backdrop-blur overflow-hidden divide-x divide-[#2a2a2a] shadow-lg">
      {btn('dark', Moon, 'Dark')}
      {btn('light', Sun, 'Light')}
    </div>
  );
}
