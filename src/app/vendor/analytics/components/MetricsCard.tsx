import React from 'react';
import Icon, { LucideIconName } from '@/components/AppIcon';

// --- START OF TYPESCRIPT CONVERSION ---

type ChangeType = 'positive' | 'negative' | 'neutral';
type CardColor = 'primary' | 'success' | 'warning' | 'accent';

interface MetricsCardProps {
    title: string;
    value: string;
    change: string;
    changeType: ChangeType;
    icon: LucideIconName | string;
    color?: CardColor;
}

// --- END OF TYPESCRIPT CONVERSION ---

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, change, changeType, icon, color = 'primary' }) => {
    const getChangeColor = (): string => {
        if (changeType === 'positive') return 'text-success';
        if (changeType === 'negative') return 'text-error';
        return 'text-text-secondary';
    };

    const getChangeIcon = (): LucideIconName => {
        if (changeType === 'positive') return 'TrendingUp';
        if (changeType === 'negative') return 'TrendingDown';
        return 'Minus';
    };

    const getColorClasses = (): string => {
        const colorMap: Record<CardColor, string> = {
            primary: 'bg-primary/10 text-primary',
            success: 'bg-success/10 text-success',
            warning: 'bg-warning/10 text-warning',
            accent: 'bg-accent/10 text-accent'
        };
        return colorMap[color] || colorMap.primary;
    };

    return (
        <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getColorClasses()}`}>
                    <Icon name={icon} size={24} />
                </div>
                <div className={`flex items-center space-x-1 ${getChangeColor()}`}>
                    <Icon name={getChangeIcon()} size={16} />
                    <span className="text-sm font-medium">{change}</span>
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-1">{value}</h3>
                <p className="text-sm text-text-secondary">{title}</p>
            </div>
        </div>
    );
};

export default MetricsCard;