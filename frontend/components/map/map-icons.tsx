'use client';

import L from 'leaflet';
import type { VesselStatus } from './map-data';

const STATUS_COLORS: Record<VesselStatus, { fill: string; ring: string }> = {
  normal: { fill: '#10b981', ring: '#10b98140' },
  onTrack: { fill: '#10b981', ring: '#10b98140' },
  delayed: { fill: '#f59e0b', ring: '#f59e0b40' },
  'high-risk': { fill: '#ef4444', ring: '#ef444440' },
  highRisk: { fill: '#ef4444', ring: '#ef444440' },
  critical: { fill: '#ef4444', ring: '#ef444440' },
};

/**
 * Vessel icon: professional "chevron" pointing in heading direction,
 * inside a status-ringed circle. Crisp at zoom levels 4-12.
 */
export function vesselIcon(opts: {
  status: VesselStatus;
  heading: number;
  selected?: boolean;
  isBpcl?: boolean;
}) {
  const meta = (opts.status && STATUS_COLORS[opts.status]) ? STATUS_COLORS[opts.status] : STATUS_COLORS.normal;
  const { fill, ring } = meta;
  const size = 34;
  const strokeW = opts.isBpcl ? 2 : 1.25;
  const bpclOutline = opts.isBpcl ? '#3b82f6' : '#525252';

  const html = `
    <div class="vessel-marker" style="width:${size}px;height:${size}px;position:relative;">
      <div style="
        position:absolute; inset:0;
        background:${ring};
        border-radius:50%;
        box-shadow: 0 0 0 1px ${bpclOutline} inset;
      "></div>
      <svg
        viewBox="0 0 24 24"
        width="${size}"
        height="${size}"
        style="position:absolute; inset:0; transform:rotate(${opts.heading}deg); transition:transform 400ms ease;"
      >
        <circle cx="12" cy="12" r="9.5" fill="#0a0a0a" stroke="${bpclOutline}" stroke-width="${strokeW}"/>
        <path
          d="M12 4.5 L17 17 L12 14.2 L7 17 Z"
          fill="${fill}"
          stroke="#0a0a0a"
          stroke-width="0.6"
          stroke-linejoin="round"
        />
        ${
          opts.selected
            ? `<circle cx="12" cy="12" r="11" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="2 2"/>`
            : ''
        }
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'vessel-divicon',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/**
 * Port icon: glowing node. Pulse intensity proportional to congestion.
 */
export function portIcon(opts: { congestionPct: number; isBpclHub?: boolean }) {
  const { congestionPct, isBpclHub } = opts;
  const color =
    congestionPct >= 80 ? '#ef4444' : congestionPct >= 60 ? '#f59e0b' : '#10b981';
  const pulseClass = congestionPct >= 80 ? 'port-pulse-high' : 'port-pulse';
  const size = 28;

  const html = `
    <div class="${pulseClass}" style="width:${size}px;height:${size}px;position:relative;">
      <svg viewBox="0 0 24 24" width="${size}" height="${size}">
        <circle cx="12" cy="12" r="10" fill="${color}22" stroke="${color}" stroke-width="1.2"/>
        <circle cx="12" cy="12" r="5" fill="${color}" />
        ${
          isBpclHub
            ? `<circle cx="12" cy="12" r="2" fill="#0a0a0a"/><circle cx="12" cy="12" r="1" fill="#3b82f6"/>`
            : `<circle cx="12" cy="12" r="2" fill="#0a0a0a"/>`
        }
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'port-divicon',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/**
 * Historic Match pin: Professional tactical square with similarity tag.
 * Matches user's high-fidelity reference screenshot.
 */
export function raeIcon(opts: { match: number }) {
  const size = 32;
  const html = `
    <div style="width:${size}px;height:${size}px;position:relative;display:flex;align-items:center;justify-content:center;">
      <!-- Similarity Tag -->
      <div style="
        position:absolute; top:-6px; left:50%; transform:translateX(-50%);
        background:#3b82f6; color:#fff; font:700 10px/1 system-ui;
        padding:2px 5px; border-radius:4px; z-index:3;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${opts.match}%</div>

      <!-- Tactical Icon -->
      <div style="
        width:24px; height:24px; border-radius:6px;
        background:#0a0a0a; border:1.5px solid #3b82f6;
        display:flex; align-items:center; justify-content:center;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
        z-index:2;
      ">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round">
          <line x1="12" y1="6" x2="12" y2="14" />
          <line x1="12" y1="18" x2="12" y2="18.01" />
        </svg>
      </div>

      <!-- Anchor Triangle -->
      <div style="
        position:absolute; bottom:0px; left:50%; transform:translateX(-50%);
        width:0; height:0; border-left:4px solid transparent;
        border-right:4px solid transparent; border-top:4px solid #3b82f6;
        z-index:1;
      "></div>
    </div>
  `;
  return L.divIcon({
    className: 'rae-divicon',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size - 2],
    popupAnchor: [0, -size + 4],
  });
}
