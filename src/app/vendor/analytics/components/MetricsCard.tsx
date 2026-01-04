import React from 'react';
import Icon, { LucideIconName } from '@/components/AppIcon';

type ChangeType = 'positive' | 'negative' | 'neutral';
type CardColor = 'primary' | 'success' | 'warning' | 'accent';

interface MetricsCardProps {
    title: string;
    value: string | number;
    change: string;
    changeType: ChangeType;
    icon: LucideIconName;
    color?: CardColor;
    isLoading?: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ 
    title, 
    value, 
    change, 
    changeType, 
    icon, 
    color = 'primary',
    isLoading = false 
}) => {
    const getChangeColor = (): string => {
        if (changeType === 'positive') return 'text-emerald-600';
        if (changeType === 'negative') return 'text-rose-600';
        return 'text-slate-500';
    };

    const getChangeIcon = (): LucideIconName => {
        if (changeType === 'positive') return 'TrendingUp';
        if (changeType === 'negative') return 'TrendingDown';
        return 'Minus';
    };

    const getColorClasses = (): string => {
        const colorMap: Record<CardColor, string> = {
            primary: 'bg-blue-50 text-blue-600',
            success: 'bg-emerald-50 text-emerald-600',
            warning: 'bg-amber-50 text-amber-600',
            accent: 'bg-purple-50 text-purple-600'
        };
        return colorMap[color];
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${getColorClasses()}`}>
                    <Icon name={icon} size={24} />
                </div>
                {!isLoading && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-slate-50 ${getChangeColor()}`}>
                        <Icon name={getChangeIcon()} size={14} />
                        <span className="text-xs font-bold">{change}</span>
                    </div>
                )}
            </div>

            <div>
                {isLoading ? (
                    <div className="h-8 w-24 bg-slate-100 animate-pulse rounded mb-1" />
                ) : (
                    <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
                        {value}
                    </h3>
                )}
                <p className="text-sm font-medium text-slate-500">{title}</p>
            </div>
        </div>
    );
};

export default MetricsCard;