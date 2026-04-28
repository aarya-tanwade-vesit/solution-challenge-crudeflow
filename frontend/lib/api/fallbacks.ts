import { VESSELS, PORTS } from '@/components/map/map-data';

export const ANALYTICS_SUMMARY_FALLBACK = {
  // Financial
  totalLandedCost: { value: 73200000, trend: 'down', trendValue: '-2.3%', subtitle: 'Avg per barrel: $77.40' },
  demurrageMTD: { value: 1800000, trend: 'up', trendValue: '+12%', subtitle: '5 vessels affected' },
  grossMargin: { value: 18.60, trend: 'down', trendValue: '-$0.40', subtitle: 'Per barrel processed' },
  warRiskPremium: { value: 420000, trend: 'up', trendValue: '+45%', subtitle: 'Red Sea transit impact' },
  
  // Operations
  etaVariance: { value: '+18h', trend: 'up', trendValue: '+6h', subtitle: 'Avg delay vs RTA' },
  jettyOccupancy: { value: '78%', trend: 'up', trendValue: '+5%', subtitle: 'Kochi SPM' },
  dischargeRate: { value: '12.4K', trend: 'down', trendValue: '-8%', subtitle: 'Barrels per hour' },
  bufferDays: { value: '4.2', trend: 'down', trendValue: '-0.8', subtitle: 'Days remaining' },
  
  // Risk
  maritimeRiskIndex: { value: '68', trend: 'up', trendValue: '+12', subtitle: 'Composite index' },
  geopoliticalExposure: { value: 'High', trend: 'up', trendValue: 'Stable', subtitle: 'Hormuz corridor' },
  routeVulnerability: { value: '72%', trend: 'up', trendValue: '+5%', subtitle: 'India-bound lanes' },
  insuranceLiability: { value: '$2.4M', trend: 'up', trendValue: '+$0.3M', subtitle: 'Active premiums' },
};

export const ANALYTICS_INSIGHTS_FALLBACK = [
  { id: 'i1', title: 'Demurrage Spike', content: 'Kochi SPM congestion is up 15%. Recommend rerouting MT Volgograd.', type: 'warning' },
  { id: 'i2', title: 'Cost Optimization', content: 'Route optimization saved $450K in freight costs this month.', type: 'success' },
  { id: 'i3', title: 'Supply Alert', content: 'Refinery buffer days dropped to 4.2. Low inventory risk.', type: 'critical' },
];

export const ANALYTICS_ANOMALIES_FALLBACK = [
  { id: 'a1', timestamp: Date.now() - 3600000, type: 'delay', severity: 'high', message: 'Unexpected 12h wait at Suez Canal' },
  { id: 'a2', timestamp: Date.now() - 86400000, type: 'route', severity: 'medium', message: 'Deviation detected for MT Fujairah' },
];

export const FLEET_SUMMARY_FALLBACK = {
  total: VESSELS.length,
  onTrack: VESSELS.filter(v => v.status === 'onTrack' || v.status === 'normal').length,
  delayed: VESSELS.filter(v => v.status === 'delayed').length,
  highRisk: VESSELS.filter(v => v.status === 'highRisk' || v.status === 'high-risk').length,
  critical: VESSELS.filter(v => v.status === 'critical').length,
};

export const FLEET_VESSELS_FALLBACK = VESSELS;

export const SCENARIO_COMPARISON_FALLBACK = {
  current: { delayHours: 48, cost: 1200000, risk: 85, bufferDays: 3.5 },
  recommended: { delayHours: 12, cost: 950000, risk: 30, bufferDays: 5.2 },
};
