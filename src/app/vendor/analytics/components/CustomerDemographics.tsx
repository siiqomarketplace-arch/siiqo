import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

// --- START OF TYPESCRIPT CONVERSION ---

interface DemographicData {
    ageGroup: string;
    customers: number;
}

interface CustomerDemographicsProps {
    data: DemographicData[];
}

// --- END OF TYPESCRIPT CONVERSION ---

const CustomerDemographics: React.FC<CustomerDemographicsProps> = ({ data }) => {
    const totalCustomers = data.reduce((sum, item) => sum + item.customers, 0);

    const formatTooltipValue = (value: ValueType): [ValueType, NameType] => {
        return [value, 'Customers'];
    };

    return (
        <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">Customer Demographics</h3>
                <div className="text-sm text-text-secondary">
                    Total Customers: {totalCustomers}
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="ageGroup"
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <Tooltip
                            formatter={formatTooltipValue}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Bar
                            dataKey="customers"
                            fill="#2563eb"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {data.map((item) => (
                    <div key={item.ageGroup} className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium text-text-secondary">{item.ageGroup}</p>
                        <p className="text-lg font-bold text-text-primary">{item.customers}</p>
                        <p className="text-xs text-text-secondary">
                            {totalCustomers > 0 ? ((item.customers / totalCustomers) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerDemographics;