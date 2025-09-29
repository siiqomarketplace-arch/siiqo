import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

// --- START OF TYPESCRIPT CONVERSION ---

interface SalesData {
    date: string; // ISO date string
    revenue: number;
    orders: number;
}

type DateRange = '7d' | '30d' | '90d' | '1y' | 'custom' | string;

interface SalesChartProps {
    data: SalesData[];
    dateRange: DateRange;
}

// --- END OF TYPESCRIPT CONVERSION ---

const SalesChart: React.FC<SalesChartProps> = ({ data, dateRange }) => {
    const formatTooltipValue = (value: ValueType, name: NameType): [string, NameType] => {
        if (name === 'revenue') {
            return [`$${(value as number).toLocaleString()}`, 'Revenue'];
        }
        return [String(value), name === 'orders' ? 'Orders' : String(name)];
    };

    const formatXAxisLabel = (tickItem: string): string => {
        const date = new Date(tickItem);
        if (dateRange === '7d') {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else if (dateRange === '30d') {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return date.toLocaleDateString('en-US', { month: 'short' });
    };

    return (
        <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">Sales Performance</h3>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-sm text-text-secondary">Revenue</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                        <span className="text-sm text-text-secondary">Orders</span>
                    </div>
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatXAxisLabel}
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <YAxis
                            yAxisId="revenue"
                            orientation="left"
                            stroke="#64748b"
                            fontSize={12}
                            tickFormatter={(value: number) => `$${value / 1000}k`}
                        />
                        <YAxis
                            yAxisId="orders"
                            orientation="right"
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <Tooltip
                            formatter={formatTooltipValue}
                            labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Line
                            yAxisId="revenue"
                            type="monotone"
                            dataKey="revenue"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
                        />
                        <Line
                            yAxisId="orders"
                            type="monotone"
                            dataKey="orders"
                            stroke="#059669"
                            strokeWidth={2}
                            dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;