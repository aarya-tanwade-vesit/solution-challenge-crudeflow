'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartLegend, ChartStyle } from '@/components/ui/chart';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#262626] border border-[#404040] rounded-lg p-2 shadow-lg">
        <p className="text-xs text-[#a3a3a3] font-mono">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs font-semibold" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Trend Line Chart Component
export function TrendLineChart({
  title,
  data,
  dataKey,
  color = '#3b82f6',
  height = 280,
}: {
  title: string;
  data: any[];
  dataKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">{title}</h4>
      </div>
      <div style={{ height: `${height}px` }} className="flex items-center justify-center p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="name" tick={{ fill: '#525252', fontSize: 12 }} />
            <YAxis tick={{ fill: '#525252', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Multi-Line Trend Chart
export function MultiLineTrendChart({
  title,
  data,
  lines,
  height = 280,
}: {
  title: string;
  data: any[];
  lines: { key: string; name: string; color: string }[];
  height?: number;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">{title}</h4>
      </div>
      <div style={{ height: `${height}px` }} className="flex items-center justify-center p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="name" tick={{ fill: '#525252', fontSize: 12 }} />
            <YAxis tick={{ fill: '#525252', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2.5}
                dot={{ fill: line.color, r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Bar Chart Component
export function BarChartComponent({
  title,
  data,
  dataKey,
  color = '#3b82f6',
  height = 280,
}: {
  title: string;
  data: any[];
  dataKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">{title}</h4>
      </div>
      <div style={{ height: `${height}px` }} className="flex items-center justify-center p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="name" tick={{ fill: '#525252', fontSize: 12 }} />
            <YAxis tick={{ fill: '#525252', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Stacked Bar Chart
export function StackedBarChart({
  title,
  data,
  bars,
  height = 280,
}: {
  title: string;
  data: any[];
  bars: { key: string; name: string; color: string }[];
  height?: number;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">{title}</h4>
      </div>
      <div style={{ height: `${height}px` }} className="flex items-center justify-center p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="name" tick={{ fill: '#525252', fontSize: 12 }} />
            <YAxis tick={{ fill: '#525252', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {bars.map((bar) => (
              <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Area Chart Component
export function AreaChartComponent({
  title,
  data,
  dataKey,
  color = '#3b82f6',
  height = 280,
}: {
  title: string;
  data: any[];
  dataKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">{title}</h4>
      </div>
      <div style={{ height: `${height}px` }} className="flex items-center justify-center p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="name" tick={{ fill: '#525252', fontSize: 12 }} />
            <YAxis tick={{ fill: '#525252', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey={dataKey} fill="url(#areaGradient)" stroke={color} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Composition / Distribution Pie Chart
export function PieChartComponent({
  title,
  data,
  colors,
  height = 280,
}: {
  title: string;
  data: { name: string; value: number }[];
  colors: string[];
  height?: number;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">{title}</h4>
      </div>
      <div style={{ height: `${height}px` }} className="flex items-center justify-center p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#3b82f6"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Composed Chart (combining multiple chart types)
export function ComposedChartComponent({
  title,
  data,
  lines,
  bars,
  height = 280,
}: {
  title: string;
  data: any[];
  lines?: { key: string; name: string; color: string }[];
  bars?: { key: string; name: string; color: string }[];
  height?: number;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">{title}</h4>
      </div>
      <div style={{ height: `${height}px` }} className="flex items-center justify-center p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="name" tick={{ fill: '#525252', fontSize: 12 }} />
            <YAxis tick={{ fill: '#525252', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            {bars && bars.length > 0 && (
              <>
                {bars.map((bar) => (
                  <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color} />
                ))}
              </>
            )}
            {lines && lines.length > 0 && (
              <>
                {lines.map((line) => (
                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    name={line.name}
                    stroke={line.color}
                    strokeWidth={2}
                    yAxisId="right"
                  />
                ))}
              </>
            )}
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Gauge-style chart (simulated with a bar)
export function GaugeChartComponent({
  title,
  value,
  maxValue = 100,
  color = '#3b82f6',
  unit = '%',
}: {
  title: string;
  value: number;
  maxValue?: number;
  color?: string;
  unit?: string;
}) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">{title}</h4>
        <span className="text-2xl font-bold text-[#e5e5e5] font-mono">
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div className="w-full h-3 bg-[#262626] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-[#525252]">
        <span>0</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
}
