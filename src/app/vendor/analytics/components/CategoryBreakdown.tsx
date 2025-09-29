import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

// --- START OF TYPESCRIPT CONVERSION ---

interface CategoryData {
    name: string;
    value: number; // Represents revenue
}

interface CategoryBreakdownProps {
    data: CategoryData[];
}

// This interface is provided by Recharts for custom labels
interface PieLabelRenderProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
}

// --- END OF TYPESCRIPT CONVERSION ---

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data }) => {
    const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps): React.ReactNode => {
        if (percent < 0.05) return null; // Don't show labels for slices less than 5%

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
                fontWeight="500"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const formatTooltipValue = (value: ValueType): [string, NameType] => {
        return [`$${(value as number).toLocaleString()}`, 'Revenue'];
    };

    return (
        <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">Revenue by Category</h3>
                <div className="text-sm text-text-secondary">
                    Total: ${data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={formatTooltipValue}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry: any) => (
                                <span style={{ color: entry.color, fontSize: '14px' }}>
                                    {value}
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-sm font-medium text-text-primary">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-text-primary">
                            ${item.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBreakdown;