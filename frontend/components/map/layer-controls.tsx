'use client';

import React, { useState } from 'react';
import { Layers, Check, ChevronDown } from 'lucide-react';

export interface MapLayers {
  vessels: boolean;
  currentRoutes: boolean;
  aiRoutes: boolean;
  riskZones: boolean;
  ports: boolean;
  historicMatches: boolean;
  costHeat: boolean;
}

interface Props {
  layers: MapLayers;
  onChange: (l: MapLayers) => void;
}

const LAYER_DEFS: Array<{ key: keyof MapLayers; label: string; desc: string; swatch?: string }> = [
  { key: 'vessels', label: 'Vessels', desc: 'Live fleet positions', swatch: '#10b981' },
  { key: 'currentRoutes', label: 'Current route', desc: 'Solid line · active AIS trajectory', swatch: '#10b981' },
  { key: 'aiRoutes', label: 'AI-recommended route', desc: 'Dotted line · optimal alternative path', swatch: '#06b6d4' },
  { key: 'riskZones', label: 'Risk zones', desc: 'Geopolitical, piracy, weather', swatch: '#ef4444' },
  { key: 'ports', label: 'Ports', desc: 'Congestion & jetty status', swatch: '#3b82f6' },
  { key: 'historicMatches', label: 'Historic Matches', desc: 'Past disruption matches', swatch: '#3b82f6' },
  { key: 'costHeat', label: 'Cost-of-inaction heatmap', desc: 'Demurrage liability on routes', swatch: '#f87171' },
];

export function LayerControls({ layers, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(layers).filter(Boolean).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f]/90 backdrop-blur text-[11px] font-semibold uppercase tracking-wider text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#1a1a1a] shadow-lg"
      >
        <Layers className="h-3.5 w-3.5" />
        Layers
        <span className="text-[#737373] font-mono normal-case tracking-normal">
          {activeCount}/{LAYER_DEFS.length}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-72 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f]/95 backdrop-blur shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-[#2a2a2a]">
            <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider">
              Map Layers
            </p>
          </div>
          <div className="p-1.5">
            {LAYER_DEFS.map((def) => {
              const on = layers[def.key];
              return (
                <button
                  key={def.key}
                  onClick={() => onChange({ ...layers, [def.key]: !on })}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-[#1a1a1a] text-left"
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      on ? 'bg-[#3b82f6] border-[#3b82f6]' : 'border-[#404040] bg-transparent'
                    }`}
                  >
                    {on && <Check className="h-2.5 w-2.5 text-[#0a0a0a]" strokeWidth={3} />}
                  </div>
                  {def.swatch && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: def.swatch }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-[#e5e5e5]">{def.label}</div>
                    <div className="text-[10px] text-[#737373]">{def.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
