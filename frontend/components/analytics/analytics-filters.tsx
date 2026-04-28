'use client';

import React, { useState } from 'react';
import { Calendar, Filter, ChevronDown, X } from 'lucide-react';

interface FilterState {
  dateRange: 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  refinery: string;
  port: string;
  vessel: string;
  route: string;
  scenario: string;
  compareMode: boolean;
}

interface AnalyticsFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'month',
    refinery: 'all',
    port: 'all',
    vessel: 'all',
    route: 'all',
    scenario: 'current',
    compareMode: false,
  });

  const [showExpanded, setShowExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      dateRange: 'month',
      refinery: 'all',
      port: 'all',
      vessel: 'all',
      route: 'all',
      scenario: 'current',
      compareMode: false,
    };
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  };

  const activeCount = [
    filters.refinery !== 'all',
    filters.port !== 'all',
    filters.vessel !== 'all',
    filters.route !== 'all',
  ].filter(Boolean).length;

  // Compact "pills" view — filters as horizontal chips
  const FilterPill = ({ label, value, onClick }: any) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide rounded-full transition-colors ${
        value && value !== 'all'
          ? 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/40'
          : 'bg-[#1a1a1a] text-[#737373] border border-[#2a2a2a] hover:border-[#404040]'
      }`}
    >
      {label}
      {value && value !== 'all' && (
        <X className="h-2.5 w-2.5 opacity-60" />
      )}
    </button>
  );

  return (
    <div>
      {/* Compact Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <Filter className="h-3.5 w-3.5 text-[#525252] flex-shrink-0" />

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range Pill */}
          <FilterPill
            label={filters.dateRange === 'month' ? '30d' : filters.dateRange}
            value={filters.dateRange}
            onClick={() => setShowExpanded(!showExpanded)}
          />

          {/* Refinery Pill */}
          <FilterPill
            label={filters.refinery === 'all' ? 'All Refineries' : filters.refinery}
            value={filters.refinery}
            onClick={() => setShowExpanded(!showExpanded)}
          />

          {/* Port Pill */}
          <FilterPill
            label={filters.port === 'all' ? 'All Ports' : filters.port}
            value={filters.port}
            onClick={() => setShowExpanded(!showExpanded)}
          />

          {/* Vessel Pill */}
          <FilterPill
            label={filters.vessel === 'all' ? 'All Vessels' : filters.vessel}
            value={filters.vessel}
            onClick={() => setShowExpanded(!showExpanded)}
          />

          {/* Route Pill */}
          <FilterPill
            label={filters.route === 'all' ? 'All Routes' : filters.route}
            value={filters.route}
            onClick={() => setShowExpanded(!showExpanded)}
          />
        </div>

        {/* Controls */}
        <div className="ml-auto flex items-center gap-2">
          {activeCount > 0 && (
            <span className="text-[9px] font-mono text-[#525252] bg-[#1a1a1a] px-1.5 py-0.5 rounded">
              {activeCount} active
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-[9px] font-semibold text-[#737373] hover:text-[#a3a3a3] uppercase tracking-wider transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setShowExpanded(!showExpanded)}
            className={`p-1 rounded transition-colors ${
              showExpanded ? 'bg-[#2a2a2a]' : 'hover:bg-[#1a1a1a]'
            }`}
          >
            <ChevronDown
              className={`h-3.5 w-3.5 text-[#737373] transform transition-transform ${
                showExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded Filter Panel — only show when toggled */}
      {showExpanded && (
        <div className="border-t border-[#2a2a2a] bg-[#0f0f0f] px-4 py-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Date Range */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3] mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                handleFilterChange('dateRange', e.target.value as any)
              }
              className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-[#e5e5e5] rounded hover:border-[#404040] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="today">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Refinery */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3] mb-2">
              Refinery
            </label>
            <select
              value={filters.refinery}
              onChange={(e) => handleFilterChange('refinery', e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-[#e5e5e5] rounded hover:border-[#404040] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="all">All Refineries</option>
              <option value="kochi">Kochi</option>
              <option value="vizag">Vizag</option>
            </select>
          </div>

          {/* Port */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3] mb-2">
              Port
            </label>
            <select
              value={filters.port}
              onChange={(e) => handleFilterChange('port', e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-[#e5e5e5] rounded hover:border-[#404040] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="all">All Ports</option>
              <option value="kochi">Kochi</option>
              <option value="bombay">Bombay</option>
            </select>
          </div>

          {/* Vessel */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3] mb-2">
              Vessel
            </label>
            <select
              value={filters.vessel}
              onChange={(e) => handleFilterChange('vessel', e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-[#e5e5e5] rounded hover:border-[#404040] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="all">All Vessels</option>
              <option value="mt-rajput">MT Rajput</option>
              <option value="mt-yamuna">MT Yamuna</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
