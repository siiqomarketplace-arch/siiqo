'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import Icon from '@/components/AppIcon';
import { PerformanceData } from "@/types/dashboard";

type ChartType = 'sales' | 'orders';
type ViewType = 'line' | 'bar';

interface PerformanceChartProps {
  data: PerformanceData[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<ChartType>('sales');
  const [viewType, setViewType] = useState<ViewType>('line');

  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 md:p-6">
        <h2 className="font-heading font-semibold text-base md:text-lg text-text-primary mb-4 md:mb-6">
          Performance Overview
        </h2>
        <div className="text-center py-8">
          <Icon name="BarChart3" size={40} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted text-sm">No data available</p>
          <p className="text-xs text-text-muted mt-1">
            Data will appear here once you start getting orders
          </p>
        </div>
      </div>
    );
  }

  // --- LOGIC MAINTAINED ---
  const formatTooltipValue = (value: number, name: string): [string, string] => {
    if (chartType === 'sales') {
      return [`$${value.toLocaleString()}`, 'Sales'];
    }
    return [value.toString(), 'Orders'];
  };

  const getDataKey = () => (chartType === 'sales' ? 'sales' : 'orders');
  const getChartColor = () => (chartType === 'sales' ? '#059669' : '#2563EB');

  const getTotalValue = () => {
    const total = data?.reduce((sum, item) => sum + (Number(item[getDataKey()]) || 0), 0) || 0;
    return chartType === 'sales' ? `$${total.toLocaleString()}` : total.toString();
  };

  const getGrowthRate = () => {
    if (!data || data.length < 2) return 0;
    const current = Number(data[data.length - 1][getDataKey()]) || 0;
    const previous = Number(data[data.length - 2][getDataKey()]) || 0;
    if (previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const growthRate = getGrowthRate();
  const isPositiveGrowth = parseFloat(String(growthRate)) >= 0;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 md:p-6 shadow-sm">
      {/* Header & Controls - Responsive Flex Stack */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading font-bold text-lg text-text-primary">
            Performance
          </h2>
          <p className="text-xs md:text-sm text-text-muted">
            Your business trends
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-gray-100/50 rounded-lg p-1">
            <button
              onClick={() => setChartType('sales')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                chartType === 'sales' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setChartType('orders')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                chartType === 'orders' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
              }`}
            >
              Orders
            </button>
          </div>

          {/* View Type Toggle */}
          <div className="flex items-center bg-gray-100/50 rounded-lg p-1">
            <button
              onClick={() => setViewType('line')}
              className={`p-1.5 rounded-md transition-all ${
                viewType === 'line' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'
              }`}
            >
              <Icon name="TrendingUp" size={16} />
            </button>
            <button
              onClick={() => setViewType('bar')}
              className={`p-1.5 rounded-md transition-all ${
                viewType === 'bar' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'
              }`}
            >
              <Icon name="BarChart3" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary - Responsive Grid */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
        <div className="bg-gray-50/50 p-2 md:p-3 rounded-xl border border-gray-100">
          <p className="text-base md:text-xl font-black text-text-primary truncate">
            {getTotalValue()}
          </p>
          <p className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-tight">Total</p>
        </div>
        <div className="bg-gray-50/50 p-2 md:p-3 rounded-xl border border-gray-100">
          <p className={`text-base md:text-xl font-black truncate ${isPositiveGrowth ? 'text-green-600' : 'text-red-500'}`}>
            {isPositiveGrowth ? '↑' : '↓'} {Math.abs(Number(growthRate))}%
          </p>
          <p className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-tight">Growth</p>
        </div>
        <div className="bg-gray-50/50 p-2 md:p-3 rounded-xl border border-gray-100">
          <p className="text-base md:text-xl font-black text-primary truncate">{data?.length || 0}</p>
          <p className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-tight">Days</p>
        </div>
      </div>

      {/* Chart Container - Adjusted Height for Mobile */}
      <div className="h-48 md:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                tickFormatter={(val) => chartType === 'sales' ? `$${val}` : val}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={formatTooltipValue as any}
              />
              <Line
                type="monotone"
                dataKey={getDataKey()}
                stroke={getChartColor()}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey={getDataKey()} fill={getChartColor()} radius={[4, 4, 0, 0]} barSize={window.innerWidth < 768 ? 15 : 30} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;