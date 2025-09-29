"use client";

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';

interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    seller: string;
    rating: number;
    reviewCount: number;
    distance: number;
    condition: string;
    category: string;
    isVerified: boolean;
    availability: string;
    location: string;
    postedDate: string;
}

interface ProductCardProps {
    product: Product;
    onClick: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
    const discountPercentage = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div
            onClick={onClick}
            className="bg-surface rounded-lg border border-border hover:shadow-elevation-2 transition-all duration-200 cursor-pointer group"
        >
            {/* Product Image */}
            {/* This div is already 'relative' and has dimensions, perfect! */}
            <div className="relative overflow-hidden rounded-t-lg aspect-square">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill // Add the fill prop
                    // Keep object-cover and transformation classes, remove w-full h-full
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    // Add sizes prop. This will depend on your card's layout (e.g., in a grid).
                    // Example for a common responsive card layout:
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />


                {/* Discount Badge */}
                {discountPercentage > 0 && (
                    <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 rounded-full text-xs font-medium">
                        -{discountPercentage}%
                    </div>
                )}

                {/* Availability Status */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${product.availability === 'In Stock'
                    ? 'bg-gray-100 text-success border border-success-100'
                    : product.availability === 'Limited Stock'
                        ? 'bg-gray-100 text-warning border border-warning-100'
                        : 'bg-error-50 text-error border border-error-100'
                    }`}>
                    {product.availability}
                </div>

                {/* Verified Badge */}
                {product.isVerified && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white p-1 rounded-full">
                        <Icon name="CheckCircle" size={12} />
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-3">
                {/* Product Name */}
                <h3 className="font-medium text-text-primary text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg font-semibold text-text-primary">
                        ${product.price}
                    </span>
                    {product.originalPrice && (
                        <span className="text-sm text-text-secondary line-through">
                            ${product.originalPrice}
                        </span>
                    )}
                </div>

                {/* Seller and Rating */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                        <Icon name="Star" size={12} className="text-warning fill-current" />
                        <span className="text-xs text-text-secondary">
                            {product.rating} ({product.reviewCount})
                        </span>
                    </div>
                    <span className="text-xs text-text-secondary">
                        {product.condition}
                    </span>
                </div>

                {/* Location and Distance */}
                <div className="flex items-center justify-between text-xs text-text-secondary">
                    <div className="flex items-center space-x-1">
                        <Icon name="MapPin" size={12} />
                        <span className="truncate">{product.location}</span>
                    </div>
                    <span className="font-medium">
                        {product.distance} mi
                    </span>
                </div>

                {/* Seller */}
                <div className="mt-2 pt-2 border-t border-border">
                    <div className="flex items-center space-x-1">
                        <Icon name="Store" size={12} className="text-text-secondary" />
                        <span className="text-xs text-text-secondary truncate">
                            {product.seller}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;