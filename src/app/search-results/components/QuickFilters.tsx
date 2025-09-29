"use client";

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { LucideIconName } from '@/components/ui/AppIcon';

interface Filter {
    id: string;
    label: string;
    type: string;
    value: any;
    icon: LucideIconName;
}

interface QuickFiltersProps {
    onApplyFilter: (filter: Omit<Filter, 'id'>) => void;
}

const QuickFilters = ({ onApplyFilter }: QuickFiltersProps) => {
    const quickFilters: Omit<Filter, 'id'>[] = [
        {
            label: 'Under $50',
            type: 'price',
            value: 50,
            icon: 'DollarSign'
        },
        {
            label: 'Within 5 miles',
            type: 'distance',
            value: 5,
            icon: 'MapPin'
        },
        {
            label: 'Highly Rated',
            type: 'rating',
            value: 4.5,
            icon: 'Star'
        },
        {
            label: 'New',
            type: 'condition',
            value: 'New',
            icon: 'Package'
        }
    ];

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Quick Filters</h4>
            <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter, index) => (
                    <button
                        key={index}
                        onClick={() => onApplyFilter(filter)}
                        className="flex items-center space-x-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-primary hover:border-primary-200 transition-all duration-200"
                    >
                        <Icon name={filter.icon} size={14} />
                        <span>{filter.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickFilters;