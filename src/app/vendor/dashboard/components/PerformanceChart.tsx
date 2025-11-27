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
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="font-heading font-semibold text-lg text-text-primary mb-6">
          Performance Overview
        </h2>
        <div className="text-center py-8">
          <Icon name="BarChart3" size={48} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">No data available</p>
          <p className="text-sm text-text-muted mt-1">
            Data will appear here once you start getting orders
          </p>
        </div>
      </div>
    );
  }

  const formatTooltipValue = (value: number, name: string): [string, string] => {
    if (name === 'sales') {
      return [`$${value.toLocaleString()}`, 'Sales'];
    }
    return [value.toString(), 'Orders'];
  };

  const getYAxisLabel = () => {
    return chartType === 'sales' ? 'Sales ($)' : 'Orders';
  };

  const getDataKey = () => {
    return chartType === 'sales' ? 'sales' : 'orders';
  };

  const getChartColor = () => {
    return chartType === 'sales' ? '#059669' : '#2563EB';
  };

  const getTotalValue = () => {
    const total = data?.reduce((sum, item) => sum + (item[getDataKey()] as number), 0) || 0;
    return chartType === 'sales' ? `$${total.toLocaleString()}` : total.toString();
  };

  const getGrowthRate = () => {
    if (!data || data.length < 2) return 0;
    const current = data[data.length - 1][getDataKey()] as number;
    const previous = data[data.length - 2][getDataKey()] as number;
    if (previous === 0) return 0;
    const growth = ((current - previous) / previous) * 100;
    return growth.toFixed(1);
  };

  const growthRate = getGrowthRate();
  const isPositiveGrowth = parseFloat(String(growthRate)) >= 0;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading font-semibold text-lg text-text-primary">
            Performance Overview
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Track your business performance over time
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-surface rounded-lg p-1">
            <button
              onClick={() => setChartType('sales')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                chartType === 'sales'
                  ? 'bg-card text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setChartType('orders')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                chartType === 'orders'
                  ? 'bg-card text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Orders
            </button>
          </div>

          {/* View Type Toggle */}
          <div className="flex items-center bg-surface rounded-lg p-1">
            <button
              onClick={() => setViewType('line')}
              className={`p-2 rounded-md transition-colors ${
                viewType === 'line'
                  ? 'bg-card text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon name="TrendingUp" size={16} />
            </button>
            <button
              onClick={() => setViewType('bar')}
              className={`p-2 rounded-md transition-colors ${
                viewType === 'bar'
                  ? 'bg-card text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon name="BarChart3" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">
            {getTotalValue()}
          </p>
          <p className="text-sm text-text-muted">
            Total {chartType === 'sales' ? 'Sales' : 'Orders'}
          </p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${isPositiveGrowth ? 'text-success' : 'text-error'}`}>
            {isPositiveGrowth ? '+' : ''}
            {growthRate}%
          </p>
          <p className="text-sm text-text-muted">Growth Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{data?.length || 0}</p>
          <p className="text-sm text-text-muted">Months</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value: number, _index: number) =>
                  chartType === 'sales' ? `$${value}` : value.toString()
                }
              />
              <Tooltip
                formatter={formatTooltipValue as any}
                labelStyle={{ color: '#1e293b' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey={getDataKey()}
                stroke={getChartColor()}
                strokeWidth={3}
                dot={{ fill: getChartColor(), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: getChartColor(), strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value: number, _index: number) =>
                  chartType === 'sales' ? `$${value}` : value.toString()
                }
              />
              <Tooltip
                formatter={formatTooltipValue as any}
                labelStyle={{ color: '#1e293b' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey={getDataKey()}
                fill={getChartColor()}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;