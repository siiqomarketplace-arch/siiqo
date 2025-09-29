"use client";

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ComparisonItem {
    id: string;
    seller: string;
    price: number;
    condition: string;
    distance: number;
    rating: number;
}

interface PriceComparisonProps {
    comparisons: ComparisonItem[];
    currentPrice: number;
    isMobile?: boolean;
}

const PriceComparison = ({ comparisons, currentPrice, isMobile = false }: PriceComparisonProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const sortedComparisons = [...comparisons].sort((a, b) => a.price - b.price);
    const lowestPrice = sortedComparisons[0]?.price;
    const savings = currentPrice - lowestPrice;

    return (
        <div className="bg-surface border border-border rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-heading font-semibold text-text-primary">Price Comparison</h3>
                    {savings > 0 && (
                        <p className="text-sm text-secondary">Save up to ${savings} nearby</p>
                    )}
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                >
                    <Icon
                        name={isExpanded ? "ChevronUp" : "ChevronDown"}
                        size={20}
                        className="text-text-secondary"
                    />
                </button>
            </div>

            {/* Current Product */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-text-primary">Current Product</p>
                        <p className="text-sm text-text-secondary">This listing</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-primary">${currentPrice}</p>
                        <div className="flex items-center space-x-1 text-sm text-text-secondary">
                            <Icon name="MapPin" size={12} />
                            <span>0.8 mi</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Items */}
            <div className={`space-y-3 ${!isExpanded && isMobile ? 'max-h-32 overflow-hidden' : ''}`}>
                {sortedComparisons.map((comparison, index) => (
                    <div key={comparison.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-surface-secondary transition-colors duration-200">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-text-primary">{comparison.seller}</p>
                                {index === 0 && (
                                    <span className="bg-secondary text-white px-2 py-0.5 rounded text-xs font-medium">
                                        Lowest
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-text-secondary">
                                <div className="flex items-center space-x-1">
                                    <Icon name="Package" size={12} />
                                    <span>{comparison.condition}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Icon name="MapPin" size={12} />
                                    <span>{comparison.distance} mi</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Icon name="Star" size={12} className="text-yellow-500 fill-current" />
                                    <span>{comparison.rating}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right ml-4">
                            <p className="text-lg font-bold text-text-primary">${comparison.price}</p>
                            {comparison.price !== currentPrice && (
                                <p className={`text-sm ${comparison.price < currentPrice ? 'text-secondary' : 'text-accent'
                                    }`}>
                                    {comparison.price < currentPrice ? '-' : '+'}$
                                    {Math.abs(comparison.price - currentPrice)}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Expand/Collapse Button for Mobile */}
            {isMobile && comparisons.length > 2 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full mt-3 py-2 text-primary hover:text-primary-700 transition-colors duration-200"
                >
                    <span className="text-sm font-medium">
                        {isExpanded ? 'Show Less' : `Show ${comparisons.length - 2} More`}
                    </span>
                </button>
            )}

            {/* View All Button */}
            <button className="w-full mt-4 py-3 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all duration-200">
                <span className="text-sm font-medium">View All Price Comparisons</span>
            </button>
        </div>
    );
};

export default PriceComparison;