import { apiGet, apiPost } from './client';
import { 
  ANALYTICS_SUMMARY_FALLBACK, 
  ANALYTICS_INSIGHTS_FALLBACK, 
  ANALYTICS_ANOMALIES_FALLBACK,
  SCENARIO_COMPARISON_FALLBACK 
} from './fallbacks';

export async function getAnalyticsSummary() {
  return apiGet('/analytics/summary', ANALYTICS_SUMMARY_FALLBACK);
}

export async function getAnalyticsInsights() {
  return apiGet('/analytics/insights', ANALYTICS_INSIGHTS_FALLBACK);
}

export async function getAnalyticsAnomalies() {
  return apiGet('/analytics/anomalies', ANALYTICS_ANOMALIES_FALLBACK);
}

export async function getScenarioComparison() {
  return apiGet('/analytics/scenario-comparison', SCENARIO_COMPARISON_FALLBACK);
}

export async function exportAnalytics(format: 'pdf' | 'excel' | 'csv') {
  return apiPost('/analytics/export', { format }, { success: true, jobId: 'export_' + Date.now() });
}
