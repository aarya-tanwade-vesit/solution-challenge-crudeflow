import L from 'leaflet';

/**
 * Enterprise-grade maritime icons for SaaS applications
 * Provides professional, high-quality icons for vessel types and risk zones
 */

// Professional Ship Icon SVG
export const ShipIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
</svg>
`;

// Tanker Icon SVG
export const TankerIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4v-4h2V4c0-1.1-.9-2-2-2zm-2 12H6V4h12v10z"/>
  <circle cx="8" cy="13" r="1.5"/>
  <circle cx="14" cy="13" r="1.5"/>
</svg>
`;

// Cargo Ship Icon SVG
export const CargoShipIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <rect x="2" y="11" width="20" height="2"/>
  <rect x="4" y="3" width="2" height="8"/>
  <rect x="10" y="3" width="2" height="8"/>
  <rect x="16" y="3" width="2" height="8"/>
  <path d="M3 15c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2H3v2z"/>
  <path d="M3 13h18V3H3v10zm2-8h2v6H5V5zm6 0h2v6h-2V5zm6 0h2v6h-2V5z"/>
</svg>
`;

// LNG Carrier Icon SVG
export const LNGCarrierIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path d="M8 12h8M12 8v8"/>
</svg>
`;

// Risk Zone Icon SVG
export const RiskZoneIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
</svg>
`;

// Warning/Alert Icon SVG
export const AlertIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
</svg>
`;

// Create vessel icon with enhanced styling
export const createEnterpriseVesselIcon = (status: string, vesselType: string = 'Tanker') => {
  const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    normal: { bg: '#10b981', border: '#059669', text: '#ffffff' },
    delayed: { bg: '#f59e0b', border: '#d97706', text: '#000000' },
    'at-risk': { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
    critical: { bg: '#dc2626', border: '#991b1b', text: '#ffffff' },
  };

  const colors = statusColors[status] || statusColors.normal;

  return L.divIcon({
    html: `
      <div class="relative">
        <div class="flex flex-col items-center">
          <!-- Outer glow circle -->
          <div class="absolute -inset-1 rounded-full" 
               style="background: ${colors.bg}; opacity: 0.2; filter: blur(4px);"></div>
          
          <!-- Main marker circle with vessel icon -->
          <div class="relative w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg transform transition-transform hover:scale-110"
               style="background-color: ${colors.bg}; border-color: ${colors.border};">
            <!-- Vessel icon -->
            <svg class="w-5 h-5" fill="${colors.text}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm2.5-9.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
            </svg>
          </div>
          
          <!-- Status label badge -->
          <div class="mt-2 bg-[#262626] text-[#e5e5e5] px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap shadow-md border border-[#404040]">
            ${status.toUpperCase()}
          </div>
        </div>
      </div>
    `,
    className: 'enterprise-vessel-marker',
    iconSize: [40, 56],
    popupAnchor: [0, -28],
  });
};

// Create risk zone icon
export const createRiskZoneIcon = (severity: 'low' | 'medium' | 'high') => {
  const colors: Record<string, string> = {
    low: '#fbbf24',
    medium: '#f97316',
    high: '#ef4444',
  };

  const severity_labels: Record<string, string> = {
    low: 'LOW',
    medium: 'MED',
    high: 'HIGH',
  };

  return L.divIcon({
    html: `
      <div class="flex flex-col items-center">
        <div class="w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg transform transition-transform"
             style="background-color: ${colors[severity]};">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="text-[8px] font-bold mt-1 text-white" style="color: ${colors[severity]};">
          ${severity_labels[severity]}
        </div>
      </div>
    `,
    className: 'risk-zone-marker',
    iconSize: [24, 32],
    popupAnchor: [0, -16],
  });
};

// Create custom divider/corridor icon
export const createCorridorIcon = () => {
  return L.divIcon({
    html: `
      <div class="flex items-center gap-1">
        <div class="w-1.5 h-1.5 rounded-full bg-[#3b82f6] opacity-70"></div>
        <div class="w-1.5 h-1.5 rounded-full bg-[#3b82f6] opacity-70"></div>
        <div class="w-1.5 h-1.5 rounded-full bg-[#3b82f6] opacity-70"></div>
      </div>
    `,
    className: 'corridor-marker',
    iconSize: [16, 8],
  });
};

// Status badge colors
export const statusColorMap: Record<string, { bg: string; text: string }> = {
  normal: { bg: '#10b981', text: '#ffffff' },
  delayed: { bg: '#f59e0b', text: '#000000' },
  'at-risk': { bg: '#ef4444', text: '#ffffff' },
  critical: { bg: '#dc2626', text: '#ffffff' },
};

// Risk level color map
export const riskColorMap: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};
