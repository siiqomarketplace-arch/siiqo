"use client";

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Product {
    title: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviewCount: number;
    distance: number; // Changed from string to number
    availability: string;
    views: number;
    watchers: number;
    condition: string;
    lastUpdated: Date;
    description: string;
    specifications: { [key: string]: string };
}

interface ProductInfoProps {
    product: Product;
    isWishlisted: boolean;
    onWishlistToggle: () => void;
    onShare: () => void;
    showFullDescription: boolean;
    onToggleDescription: () => void;
    isMobile?: boolean;
}

const ProductInfo = ({
    product,
    isWishlisted,
    onWishlistToggle,
    onShare,
    showFullDescription,
    onToggleDescription,
    isMobile = false
}: ProductInfoProps) => {
    const formatTimeAgo = (date: Date): string => {
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h1 className="text-xl md:text-2xl font-heading font-bold text-text-primary mb-2">
                        {product.title}
                    </h1>

                    {/* Price Section */}
                    <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl md:text-3xl font-bold text-text-primary">
                            ${product.price}
                        </span>
                        {product.originalPrice > product.price && (
                            <>
                                <span className="text-lg text-text-secondary line-through">
                                    ${product.originalPrice}
                                </span>
                                <span className="bg-secondary text-white px-2 py-1 rounded text-sm font-medium">
                                    {discountPercentage}% OFF
                                </span>
                            </>
                        )}
                    </div>

                    {/* Rating and Distance */}
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                        <div className="flex items-center space-x-1">
                            <Icon name="Star" size={16} className="text-yellow-500 fill-current" />
                            <span className="font-medium text-text-primary">{product.rating}</span>
                            <span>({product.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Icon name="MapPin" size={16} className="text-primary" />
                            <span>{product.distance} miles away</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                    <button
                        onClick={onWishlistToggle}
                        className={`p-3 rounded-full transition-all duration-200 ${isWishlisted
                            ? 'bg-accent-50 text-accent'
                            : 'bg-surface-secondary text-text-secondary hover:bg-surface hover:text-text-primary'
                            }`}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <Icon
                            name="Heart"
                            size={20}
                            className={isWishlisted ? 'fill-current' : ''}
                        />
                    </button>
                    <button
                        onClick={onShare}
                        className="p-3 rounded-full bg-surface-secondary text-text-secondary hover:bg-surface hover:text-text-primary transition-all duration-200"
                        aria-label="Share product"
                    >
                        <Icon name="Share" size={20} />
                    </button>
                </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <span className="text-sm font-medium text-secondary">{product.availability}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <Icon name="Eye" size={16} />
                    <span>{product.views} views</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <Icon name="Users" size={16} />
                    <span>{product.watchers} watching</span>
                </div>
            </div>

            {/* Condition and Last Updated */}
            <div className="flex items-center justify-between py-4 border-t border-b border-border">
                <div>
                    <span className="text-sm text-text-secondary">Condition</span>
                    <p className="font-medium text-text-primary">{product.condition}</p>
                </div>
                <div className="text-right">
                    <span className="text-sm text-text-secondary">Updated</span>
                    <p className="font-medium text-text-primary">{formatTimeAgo(product.lastUpdated)}</p>
                </div>
            </div>

            {/* Description */}
            <div>
                <h3 className="text-lg font-heading font-semibold text-text-primary mb-3">Description</h3>
                <div className="text-text-secondary leading-relaxed">
                    <p className={`${!showFullDescription && isMobile ? 'line-clamp-3' : ''}`}>
                        {product.description}
                    </p>
                    {isMobile && (
                        <button
                            onClick={onToggleDescription}
                            className="text-primary font-medium mt-2 hover:text-primary-700 transition-colors duration-200"
                        >
                            {showFullDescription ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </div>
            </div>

            {/* Specifications */}
            <div>
                <h3 className="text-lg font-heading font-semibold text-text-primary mb-3">Specifications</h3>
                <div className="space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-border-light last:border-b-0">
                            <span className="text-text-secondary">{key}</span>
                            <span className="font-medium text-text-primary text-right">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductInfo;