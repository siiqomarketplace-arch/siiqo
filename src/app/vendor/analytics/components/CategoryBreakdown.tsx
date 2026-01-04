'use client'

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

// --- TYPES ---
interface CategoryData {
    name: string;
    value: number; 
}

interface CategoryBreakdownProps {
    data?: CategoryData[]; // Made optional to prevent crash if undefined
    isLoading?: boolean;
}

interface PieLabelRenderProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data = [], isLoading = false }) => {
    const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

    // Prevent error by ensuring we have an array
    const chartData = Array.isArray(data) ? data : [];
    const totalRevenue = chartData.reduce((sum, item) => sum + item.value, 0);

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps): React.ReactNode => {
        if (percent < 0.05) return null; 

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight="700"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const formatTooltipValue = (value: ValueType): [string, NameType] => {
        return [`₦${(value as number).toLocaleString()}`, 'Revenue'];
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 animate-pulse">
                <div className="h-6 w-48 bg-slate-100 rounded mb-8" />
                <div className="flex justify-center">
                    <div className="h-64 w-64 rounded-full bg-slate-50 border-8 border-slate-100" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Revenue by Category</h3>
                    <p className="text-xs text-slate-500 font-medium">Distribution across segments</p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</div>
                    <div className="text-lg font-black text-slate-900">
                        ₦{totalRevenue.toLocaleString()}
                    </div>
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-slate-400 text-sm font-medium italic">
                    No sales data for this period
                </div>
            ) : (
                <>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60} // Turned into a Donut chart for a cleaner look
                                    outerRadius={100}
                                    paddingAngle={5}
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]} 
                                            stroke="none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={formatTooltipValue}
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '12px'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    iconType="circle"
                                    formatter={(value) => (
                                        <span className="text-xs font-bold text-slate-600 ml-1">
                                            {value}
                                        </span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-2">
                        {chartData.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    ></div>
                                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">
                                    ₦{item.value.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CategoryBreakdown;