'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { useWorkspace, useSimulation } from '@/contexts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Ship, 
  AlertTriangle,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  Droplets,
  Leaf,
  Shield,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  TrendLineChart,
  MultiLineTrendChart,
  BarChartComponent,
  StackedBarChart,
  AreaChartComponent,
  PieChartComponent,
  ComposedChartComponent,
  GaugeChartComponent,
} from '@/components/dashboard/charts/analytics-charts';
import { AnalyticsFilters } from '@/components/analytics/analytics-filters';
import { ScenarioComparison } from '@/components/analytics/scenario-comparison';
import { AIInsightsStrip } from '@/components/analytics/ai-insights-strip';
import { AnomalyTimeline } from '@/components/analytics/anomaly-timeline';
import { ExportMenu } from '@/components/analytics/export-menu';

import { getAnalyticsSummary, getAnalyticsInsights, getAnalyticsAnomalies, getScenarioComparison } from '@/lib/api/analytics-api';
import { useToast } from '@/components/ui/use-toast';

type TabType = 'financial' | 'operations' | 'risk' | 'esg' | 'refinery-fit';

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'financial', label: 'Financial', icon: DollarSign },
  { id: 'operations', label: 'Operations', icon: Activity },
  { id: 'risk', label: 'Risk', icon: Shield },
  { id: 'esg', label: 'ESG', icon: Leaf },
  { id: 'refinery-fit', label: 'Refinery Fit', icon: Droplets },
];

const timeRanges = ['24h', '7d', '30d', '90d'];

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'financial';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const { currentWorkspace } = useWorkspace();
  const { isSimulationMode, appliedImpact } = useSimulation();
  const { toast } = useToast();

  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getAnalyticsSummary()
      .then(data => {
        setSummaryData(data);
      })
      .catch(err => {
        console.error('Failed to fetch analytics summary', err);
        toast({
          title: 'Analytics Data Error',
          description: 'Using local fallback data for analytics.',
          variant: 'destructive',
        });
      })
      .finally(() => setIsLoading(false));
  }, [selectedTimeRange, toast]);

  // Adjust metrics based on applied simulation impact
  const adjustedSummary = React.useMemo(() => {
    if (!summaryData) return null;
    if (!isSimulationMode || !appliedImpact) return summaryData;

    // Apply simulation deltas to summary cards
    return {
      ...summaryData,
      totalLandedCost: {
        ...summaryData.totalLandedCost,
        value: summaryData.totalLandedCost.value + (appliedImpact.kpis.demurrage - 1800000),
        trend: appliedImpact.kpis.demurrage < 1800000 ? 'down' : 'up',
      },
      demurrageMTD: {
        ...summaryData.demurrageMTD,
        value: appliedImpact.kpis.demurrage,
        trend: appliedImpact.kpis.demurrage > 1500000 ? 'up' : 'down',
      }
    };
  }, [summaryData, isSimulationMode, appliedImpact]);

  return (
    <MainLayout>
      <div className="page-transition flex flex-col h-full bg-[#0a0a0a]">
        {/* Page Header */}
        <div className="flex-shrink-0 border-b border-[#1a1a1a] bg-[#0f0f0f] px-6 py-4">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-[#e5e5e5]">Analytics</h1>
                {isSimulationMode && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
                    Simulated
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[#525252]">{currentWorkspace.name}</span>
                <span className="text-[#2a2a2a]">|</span>
                <span className="text-xs text-[#525252]">Last {selectedTimeRange}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#737373] text-xs rounded hover:border-[#404040] hover:text-[#a3a3a3] transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
              <ExportMenu activeTab={activeTab} timeRange={selectedTimeRange} />
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#3b82f6] text-white'
                        : 'text-[#737373] hover:text-[#a3a3a3] hover:bg-[#262626]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Time Range */}
            <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                    selectedTimeRange === range
                      ? 'bg-[#262626] text-[#e5e5e5]'
                      : 'text-[#525252] hover:text-[#a3a3a3]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Advanced Filters Panel */}
          <div className="mb-6">
            <AnalyticsFilters
              onFilterChange={() => {
                // Filter state handled internally
              }}
            />
          </div>

          {/* AI Insights - C3-style auto-generated observations */}
          <div className="mb-6">
            <AIInsightsStrip />
          </div>

          {/* Anomaly Timeline */}
          <div className="mb-6">
            <AnomalyTimeline />
          </div>

          {/* Scenario Comparison (C3-style what-if) */}
          <div className="mb-6">
            <ScenarioComparison />
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'financial' && <FinancialAnalytics summary={adjustedSummary} isLoading={isLoading} />}
            {activeTab === 'operations' && <OperationsAnalytics summary={adjustedSummary} isLoading={isLoading} />}
            {activeTab === 'risk' && <RiskAnalytics summary={adjustedSummary} isLoading={isLoading} />}
            {activeTab === 'esg' && <ESGAnalytics summary={adjustedSummary} isLoading={isLoading} />}
            {activeTab === 'refinery-fit' && <RefineryFitAnalytics summary={adjustedSummary} isLoading={isLoading} />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Shared Components
function SummaryCard({ 
  title, 
  value, 
  trend, 
  trendValue,
  subtitle,
  icon: Icon,
  severity = 'neutral'
}: { 
  title: string; 
  value: string; 
  trend: 'up' | 'down';
  trendValue: string;
  subtitle: string;
  icon: React.ElementType;
  severity?: 'good' | 'bad' | 'neutral';
}) {
  const trendColor = severity === 'good' ? 'text-emerald-400' : severity === 'bad' ? 'text-red-400' : 'text-[#a3a3a3]';
  const iconBg = severity === 'good' ? 'bg-emerald-500/10 text-emerald-500' : severity === 'bad' ? 'bg-red-500/10 text-red-500' : 'bg-[#262626] text-[#737373]';
  
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5 hover:border-[#3a3a3a] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#525252]">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-[#e5e5e5] font-mono tabular-nums">{value}</span>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trendValue}
        </span>
      </div>
      <p className="text-[11px] text-[#525252]">{subtitle}</p>
    </div>
  );
}



function BreakdownTable({ title, items }: { title: string; items: { label: string; value: string; change: string; status: 'up' | 'down' }[] }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">{title}</h4>
      </div>
      <div className="divide-y divide-[#2a2a2a]">
        {items.map((item, i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-[#1f1f1f] transition-colors">
            <span className="text-xs text-[#a3a3a3]">{item.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-semibold text-[#e5e5e5]">{item.value}</span>
              <span className={`text-[10px] font-mono ${item.status === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContributorTable({ title, items }: { title: string; items: { name: string; value: string; impact: string }[] }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">{title}</h4>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2a2a2a]">
            <th className="px-4 py-2 text-left text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Name</th>
            <th className="px-4 py-2 text-right text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Value</th>
            <th className="px-4 py-2 text-right text-[10px] font-semibold text-[#525252] uppercase tracking-wider">Impact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2a2a2a]">
          {items.map((item, i) => (
            <tr key={i} className="hover:bg-[#1f1f1f] transition-colors">
              <td className="px-4 py-3 text-xs text-[#e5e5e5]">{item.name}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-[#a3a3a3]">{item.value}</td>
              <td className="px-4 py-3 text-right text-xs font-mono text-red-400">{item.impact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionBox({ title, actions }: { title: string; actions: { label: string; type: 'primary' | 'secondary' }[] }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">{title}</h4>
      </div>
      <div className="p-4 space-y-2">
        {actions.map((action, i) => (
          <button
            key={i}
            className={`w-full px-3 py-2 text-xs font-medium rounded transition-colors flex items-center justify-between ${
              action.type === 'primary'
                ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb]'
                : 'bg-[#262626] text-[#a3a3a3] hover:bg-[#2f2f2f] border border-[#3a3a3a]'
            }`}
          >
            {action.label}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ThresholdAlert({ metrics }: { metrics: { label: string; value: string; threshold: string; status: 'critical' | 'warning' | 'normal' }[] }) {
  const statusColors = {
    critical: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    normal: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Threshold Alerts</h4>
      </div>
      <div className="p-4 space-y-2">
        {metrics.map((metric, i) => (
          <div key={i} className={`px-3 py-2 rounded border ${statusColors[metric.status]}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs">{metric.label}</span>
              <span className="text-xs font-mono font-semibold">{metric.value}</span>
            </div>
            <p className="text-[10px] opacity-70 mt-0.5">Threshold: {metric.threshold}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tab Content Components
function FinancialAnalytics({ summary, isLoading }: { summary: any; isLoading: boolean }) {
  const data = summary || {};
  const cost = data.totalLandedCost || { value: 73200000, trend: 'down', trendValue: '-2.3%', subtitle: 'Avg per barrel: $77.40' };
  const demurrage = data.demurrageMTD || { value: 1800000, trend: 'up', trendValue: '+12%', subtitle: '5 vessels affected' };
  const margin = data.grossMargin || { value: 18.60, trend: 'down', trendValue: '-$0.40', subtitle: 'Per barrel processed' };
  const premium = data.warRiskPremium || { value: 420000, trend: 'up', trendValue: '+45%', subtitle: 'Red Sea transit impact' };

  const fmtMoney = (v: number) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    return `$${v}`;
  };

  return (
    <div className={`space-y-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard 
          title="Total Landed Cost" 
          value={fmtMoney(cost.value)} 
          trend={cost.trend} 
          trendValue={cost.trendValue} 
          subtitle={cost.subtitle}
          icon={DollarSign}
          severity={cost.trend === 'down' ? 'good' : 'bad'}
        />
        <SummaryCard 
          title="Demurrage MTD" 
          value={fmtMoney(demurrage.value)} 
          trend={demurrage.trend} 
          trendValue={demurrage.trendValue} 
          subtitle={demurrage.subtitle}
          icon={Clock}
          severity={demurrage.trend === 'down' ? 'good' : 'bad'}
        />
        <SummaryCard 
          title="Gross Margin" 
          value="$18.60" 
          trend="down" 
          trendValue="-$0.40" 
          subtitle="Per barrel processed"
          icon={TrendingUp}
          severity="bad"
        />
        <SummaryCard 
          title="War Risk Premium" 
          value="$420K" 
          trend="up" 
          trendValue="+45%" 
          subtitle="Red Sea transit impact"
          icon={AlertTriangle}
          severity="bad"
        />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-2 gap-4">
        <TrendLineChart
          title="Total Landed Cost Trend"
          data={data.landedCostTrend || [
            { name: 'Jan', 'Cost': 72.5 },
            { name: 'Feb', 'Cost': 73.1 },
            { name: 'Mar', 'Cost': 74.2 },
            { name: 'Apr', 'Cost': 73.8 },
            { name: 'May', 'Cost': 74.5 },
            { name: 'Jun', 'Cost': 73.2 },
          ]}
          dataKey="Cost"
          color="#3b82f6"
        />
        <AreaChartComponent
          title="Demurrage Trend"
          data={data.demurrageTrend || [
            { name: 'Week 1', 'Demurrage': 0.3 },
            { name: 'Week 2', 'Demurrage': 0.5 },
            { name: 'Week 3', 'Demurrage': 0.8 },
            { name: 'Week 4', 'Demurrage': 1.2 },
            { name: 'Week 5', 'Demurrage': 1.5 },
            { name: 'Week 6', 'Demurrage': 1.8 },
          ]}
          dataKey="Demurrage"
          color="#ef4444"
        />
      </div>

      {/* Breakdown + Contributors + Actions */}
      <div className="grid grid-cols-3 gap-4">
        <BreakdownTable 
          title="Cost Components" 
          items={data.costComponents || [
            { label: 'Freight Cost', value: '$42.3M', change: '+3.2%', status: 'up' },
            { label: 'Insurance', value: '$8.4M', change: '+12%', status: 'up' },
            { label: 'Port Charges', value: '$4.2M', change: '-1.5%', status: 'down' },
            { label: 'Demurrage', value: '$1.8M', change: '+24%', status: 'up' },
          ]}
        />
        <ContributorTable
          title="Top Demurrage Contributors"
          items={[
            { name: 'MT Volgograd', value: '24h wait', impact: '$450K' },
            { name: 'MT Basrah Star', value: '18h wait', impact: '$315K' },
            { name: 'MT Fujairah King', value: '12h wait', impact: '$240K' },
          ]}
        />
        <ActionBox
          title="Recommended Actions"
          actions={[
            { label: 'Review berth scheduling', type: 'primary' },
            { label: 'Negotiate demurrage rates', type: 'secondary' },
            { label: 'Optimize arrival windows', type: 'secondary' },
          ]}
        />
      </div>
    </div>
  );
}

function OperationsAnalytics({ summary, isLoading }: { summary: any; isLoading: boolean }) {
  const data = summary || ANALYTICS_SUMMARY_FALLBACK;

  return (
    <div className={`space-y-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard 
          title="ETA Variance" 
          value={data.etaVariance?.value || '+18h'} 
          trend={data.etaVariance?.trend || 'up'} 
          trendValue={data.etaVariance?.trendValue || '+6h'} 
          subtitle={data.etaVariance?.subtitle || 'Avg delay vs RTA'}
          icon={Clock}
          severity="bad"
        />
        <SummaryCard 
          title="Jetty Occupancy" 
          value={data.jettyOccupancy?.value || '78%'} 
          trend={data.jettyOccupancy?.trend || 'up'} 
          trendValue={data.jettyOccupancy?.trendValue || '+5%'} 
          subtitle={data.jettyOccupancy?.subtitle || 'Kochi SPM'}
          icon={Ship}
          severity="neutral"
        />
        <SummaryCard 
          title="Discharge Rate" 
          value={data.dischargeRate?.value || '12.4K'} 
          trend={data.dischargeRate?.trend || 'down'} 
          trendValue={data.dischargeRate?.trendValue || '-8%'} 
          subtitle={data.dischargeRate?.subtitle || 'Barrels per hour'}
          icon={TrendingDown}
          severity="bad"
        />
        <SummaryCard 
          title="Buffer Days" 
          value={data.bufferDays?.value || '4.2'} 
          trend={data.bufferDays?.trend || 'down'} 
          trendValue={data.bufferDays?.trendValue || '-0.8'} 
          subtitle={data.bufferDays?.subtitle || 'Days remaining'}
          icon={AlertTriangle}
          severity="bad"
        />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-2 gap-4">
        <BarChartComponent
          title="ETA Variance History"
          data={[
            { name: 'Week 1', 'Variance': 6 },
            { name: 'Week 2', 'Variance': 10 },
            { name: 'Week 3', 'Variance': 14 },
            { name: 'Week 4', 'Variance': 18 },
            { name: 'Week 5', 'Variance': 16 },
            { name: 'Week 6', 'Variance': 18 },
          ]}
          dataKey="Variance"
          color="#f59e0b"
        />
        <TrendLineChart
          title="Buffer Days Trend"
          data={[
            { name: 'Jan', 'Buffer Days': 6.2 },
            { name: 'Feb', 'Buffer Days': 5.8 },
            { name: 'Mar', 'Buffer Days': 5.4 },
            { name: 'Apr', 'Buffer Days': 4.9 },
            { name: 'May', 'Buffer Days': 4.5 },
            { name: 'Jun', 'Buffer Days': 4.2 },
          ]}
          dataKey="Buffer Days"
          color="#ef4444"
        />
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-4">
        <BreakdownTable 
          title="Operational Metrics" 
          items={[
            { label: 'Jetty Utilization', value: '78%', change: '+5%', status: 'up' },
            { label: 'Turnaround Time', value: '32h', change: '+4h', status: 'up' },
            { label: 'Throughput', value: '298K/day', change: '-8%', status: 'down' },
            { label: 'Queue Length', value: '3 vessels', change: '+1', status: 'up' },
          ]}
        />
        <ContributorTable
          title="Delayed Vessels"
          items={[
            { name: 'MT Volgograd', value: '+24h', impact: 'High' },
            { name: 'MT Basrah Star', value: '+18h', impact: 'Medium' },
            { name: 'MT Houston Voyager', value: '+8h', impact: 'Low' },
          ]}
        />
        <ThresholdAlert
          metrics={[
            { label: 'Buffer Days', value: '4.2', threshold: '> 5 days', status: 'warning' },
            { label: 'Jetty Occupancy', value: '78%', threshold: '< 85%', status: 'normal' },
            { label: 'ETA Variance', value: '+18h', threshold: '< 12h', status: 'critical' },
          ]}
        />
      </div>
    </div>
  );
}

function RiskAnalytics({ summary, isLoading }: { summary: any; isLoading: boolean }) {
  const data = summary || ANALYTICS_SUMMARY_FALLBACK;

  return (
    <div className={`space-y-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard 
          title="Maritime Risk Index" 
          value={data.maritimeRiskIndex?.value || '68'} 
          trend={data.maritimeRiskIndex?.trend || 'up'} 
          trendValue={data.maritimeRiskIndex?.trendValue || '+12'} 
          subtitle={data.maritimeRiskIndex?.subtitle || 'Composite index'}
          icon={Shield}
          severity="bad"
        />
        <SummaryCard 
          title="Geopolitical Exposure" 
          value={data.geopoliticalExposure?.value || 'High'} 
          trend={data.geopoliticalExposure?.trend || 'up'} 
          trendValue={data.geopoliticalExposure?.trendValue || 'Stable'} 
          subtitle={data.geopoliticalExposure?.subtitle || 'Hormuz corridor'}
          icon={AlertTriangle}
          severity="bad"
        />
        <SummaryCard 
          title="Route Vulnerability" 
          value={data.routeVulnerability?.value || '72%'} 
          trend={data.routeVulnerability?.trend || 'up'} 
          trendValue={data.routeVulnerability?.trendValue || '+5%'} 
          subtitle={data.routeVulnerability?.subtitle || 'India-bound lanes'}
          icon={BarChart3}
          severity="bad"
        />
        <SummaryCard 
          title="Insurance Liability" 
          value={data.insuranceLiability?.value || '$2.4M'} 
          trend={data.insuranceLiability?.trend || 'up'} 
          trendValue={data.insuranceLiability?.trendValue || '+$0.3M'} 
          subtitle={data.insuranceLiability?.subtitle || 'Active premiums'}
          icon={DollarSign}
          severity="neutral"
        />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-2 gap-4">
        <TrendLineChart
          title="Risk Index History"
          data={[
            { name: 'Week 1', 'Risk Index': 55 },
            { name: 'Week 2', 'Risk Index': 58 },
            { name: 'Week 3', 'Risk Index': 62 },
            { name: 'Week 4', 'Risk Index': 65 },
            { name: 'Week 5', 'Risk Index': 66 },
            { name: 'Week 6', 'Risk Index': 67 },
          ]}
          dataKey="Risk Index"
          color="#ef4444"
        />
        <StackedBarChart
          title="Risk by Category"
          data={[
            { name: 'Geo', 'Geopolitical': 30, 'Weather': 15, 'Congestion': 12, 'Other': 10 },
            { name: 'Weather', 'Geopolitical': 32, 'Weather': 18, 'Congestion': 11, 'Other': 9 },
            { name: 'Congestion', 'Geopolitical': 28, 'Weather': 20, 'Congestion': 14, 'Other': 8 },
          ]}
          bars={[
            { key: 'Geopolitical', name: 'Geopolitical', color: '#ef4444' },
            { key: 'Weather', name: 'Weather', color: '#f59e0b' },
            { key: 'Congestion', name: 'Congestion', color: '#3b82f6' },
            { key: 'Other', name: 'Other', color: '#10b981' },
          ]}
        />
      </div>

      {/* Risk Details */}
      <div className="grid grid-cols-3 gap-4">
        <BreakdownTable 
          title="Risk Components" 
          items={[
            { label: 'Geopolitical (40%)', value: '75', change: '+10', status: 'up' },
            { label: 'Weather (20%)', value: '55', change: '+5', status: 'up' },
            { label: 'Congestion (20%)', value: '70', change: '+8', status: 'up' },
            { label: 'Route Security (20%)', value: '62', change: '+3', status: 'up' },
          ]}
        />
        <ContributorTable
          title="High-Risk Vessels"
          items={[
            { name: 'MT Houston Voyager', value: 'Suez', impact: '85%' },
            { name: 'MT Fujairah King', value: 'Hormuz', impact: '72%' },
            { name: 'MT Basrah Star', value: 'Hormuz', impact: '58%' },
          ]}
        />
        <ActionBox
          title="Mitigation Actions"
          actions={[
            { label: 'Consider Cape route for high-risk', type: 'primary' },
            { label: 'Review insurance coverage', type: 'secondary' },
            { label: 'Monitor geopolitical alerts', type: 'secondary' },
          ]}
        />
      </div>
    </div>
  );
}

function ESGAnalytics({ summary, isLoading }: { summary: any; isLoading: boolean }) {
  return (
    <div className={`space-y-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard 
          title="Fleet CII Rating" 
          value="B" 
          trend="down" 
          trendValue="Improved" 
          subtitle="Carbon Intensity"
          icon={Leaf}
          severity="good"
        />
        <SummaryCard 
          title="Scope 3 Emissions" 
          value="12.4K" 
          trend="down" 
          trendValue="-5%" 
          subtitle="Tons CO2 MTD"
          icon={TrendingDown}
          severity="good"
        />
        <SummaryCard 
          title="Green Vessels" 
          value="42%" 
          trend="up" 
          trendValue="+8%" 
          subtitle="A/B rated fleet"
          icon={Ship}
          severity="good"
        />
        <SummaryCard 
          title="ESG Score" 
          value="72/100" 
          trend="up" 
          trendValue="+3" 
          subtitle="Quarterly rating"
          icon={Shield}
          severity="good"
        />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-2 gap-4">
        <AreaChartComponent
          title="Emissions Trend"
          data={[
            { name: 'Jan', 'CO2 Emissions': 12.8 },
            { name: 'Feb', 'CO2 Emissions': 12.5 },
            { name: 'Mar', 'CO2 Emissions': 12.1 },
            { name: 'Apr', 'CO2 Emissions': 11.8 },
            { name: 'May', 'CO2 Emissions': 11.5 },
            { name: 'Jun', 'CO2 Emissions': 12.4 },
          ]}
          dataKey="CO2 Emissions"
          color="#10b981"
        />
        <PieChartComponent
          title="CII Distribution"
          data={[
            { name: 'A Rated', value: 12 },
            { name: 'B Rated', value: 30 },
            { name: 'C Rated', value: 38 },
            { name: 'D/E Rated', value: 20 },
          ]}
          colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444']}
        />
      </div>

      {/* ESG Details */}
      <div className="grid grid-cols-3 gap-4">
        <BreakdownTable 
          title="Fleet Ratings" 
          items={[
            { label: 'A Rated', value: '12%', change: '+2%', status: 'down' },
            { label: 'B Rated', value: '30%', change: '+6%', status: 'down' },
            { label: 'C Rated', value: '38%', change: '-5%', status: 'down' },
            { label: 'D/E Rated', value: '20%', change: '-3%', status: 'down' },
          ]}
        />
        <ContributorTable
          title="Emission Contributors"
          items={[
            { name: 'MT Volgograd', value: '2.1K tons', impact: '17%' },
            { name: 'MT Houston Voyager', value: '1.8K tons', impact: '14%' },
            { name: 'MT Fujairah King', value: '1.5K tons', impact: '12%' },
          ]}
        />
        <ActionBox
          title="ESG Recommendations"
          actions={[
            { label: 'Prioritize A/B rated vessels', type: 'primary' },
            { label: 'Optimize voyage speeds', type: 'secondary' },
            { label: 'Review carbon offset options', type: 'secondary' },
          ]}
        />
      </div>
    </div>
  );
}

function RefineryFitAnalytics({ summary, isLoading }: { summary: any; isLoading: boolean }) {
  return (
    <div className={`space-y-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard 
          title="Crude Compatibility" 
          value="94%" 
          trend="up" 
          trendValue="+2%" 
          subtitle="Avg blend match"
          icon={Droplets}
          severity="good"
        />
        <SummaryCard 
          title="Tank Utilization" 
          value="72%" 
          trend="up" 
          trendValue="+5%" 
          subtitle="Storage efficiency"
          icon={Ship}
          severity="neutral"
        />
        <SummaryCard 
          title="Arrival Sync" 
          value="85%" 
          trend="down" 
          trendValue="-3%" 
          subtitle="Throughput alignment"
          icon={Clock}
          severity="neutral"
        />
        <SummaryCard 
          title="Inventory Pressure" 
          value="Medium" 
          trend="up" 
          trendValue="Increasing" 
          subtitle="By crude type"
          icon={AlertTriangle}
          severity="neutral"
        />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-2 gap-4">
        <TrendLineChart
          title="Compatibility Score Trend"
          data={[
            { name: 'Jan', 'Score': 92.1 },
            { name: 'Feb', 'Score': 92.8 },
            { name: 'Mar', 'Score': 93.2 },
            { name: 'Apr', 'Score': 93.8 },
            { name: 'May', 'Score': 94.1 },
            { name: 'Jun', 'Score': 94 },
          ]}
          dataKey="Score"
          color="#3b82f6"
        />
        <BarChartComponent
          title="Tank Segregation Status"
          data={[
            { name: 'Arab Light', 'Occupancy': 85 },
            { name: 'Basrah Med', 'Occupancy': 72 },
            { name: 'Murban', 'Occupancy': 65 },
            { name: 'Others', 'Occupancy': 45 },
          ]}
          dataKey="Occupancy"
          color="#10b981"
        />
      </div>

      {/* Refinery Details */}
      <div className="grid grid-cols-3 gap-4">
        <BreakdownTable 
          title="Crude Type Inventory" 
          items={[
            { label: 'Arab Light', value: '1.2M bbl', change: '+8%', status: 'up' },
            { label: 'Basrah Medium', value: '0.8M bbl', change: '-5%', status: 'down' },
            { label: 'Murban', value: '0.4M bbl', change: '+12%', status: 'up' },
            { label: 'Others', value: '0.2M bbl', change: '-2%', status: 'down' },
          ]}
        />
        <ContributorTable
          title="Incoming Compatibility"
          items={[
            { name: 'MT Rajput (Arab Light)', value: '98%', impact: 'Optimal' },
            { name: 'MT Yamuna (Basrah)', value: '92%', impact: 'Good' },
            { name: 'MT Ganges (Murban)', value: '88%', impact: 'Acceptable' },
          ]}
        />
        <ActionBox
          title="Optimization Actions"
          actions={[
            { label: 'Review crude blend ratios', type: 'primary' },
            { label: 'Optimize tank allocation', type: 'secondary' },
            { label: 'Adjust arrival scheduling', type: 'secondary' },
          ]}
        />
      </div>
    </div>
  );
}
