"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';

// Renamed interface from 'Product' to 'SimilarProduct'
interface SimilarProduct {
    id: string; // Changed from number to string
    title: string;
    price: number;
    originalPrice?: number;
    image: string;
    distance: number;
    rating: number;
    condition: string;
}

interface SimilarProductsProps {
    products: SimilarProduct[]; // Using the renamed interface
    onProductClick: (productId: string) => void; // Changed parameter type to string
    isMobile?: boolean;
}

const SimilarProducts = ({ products, onProductClick, isMobile = false }: SimilarProductsProps) => {
    const router = useRouter();
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-heading font-semibold text-text-primary">Similar Products Nearby</h3>
                <button className="text-primary hover:text-primary-700 transition-colors duration-200">
                    <span className="text-sm font-medium">View All</span>
                </button>
            </div>

            <div className={`${isMobile ? 'overflow-x-auto' : 'grid grid-cols-3 gap-4'}`}>
                <div className={`${isMobile ? 'flex space-x-4 pb-4' : 'contents'}`}>
                    {products.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => onProductClick(product.id)}
                            className={`${isMobile ? 'flex-shrink-0 w-64' : ''
                                } bg-surface border border-border rounded-lg overflow-hidden cursor-pointer hover:shadow-elevation-2 transition-all duration-200 group`}
                        >
                            {/* Product Image */}
                            <div className="relative aspect-square overflow-hidden bg-surface-secondary">
                                <Image
                                    src={product.image}
                                    alt={product.title}
                                    fill // Add the fill prop
                                    // Keep object-cover and transformation classes, remove w-full h-full
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    // Add sizes prop. This is critical for grid/responsive layouts.
                                    // Based on w-64 for mobile, and grid-cols-3 for desktop:
                                    sizes={`
                            ${isMobile ? '256px' : ''} // If isMobile, it's 256px fixed
                            (max-width: 768px) 100vw, // Fallback if isMobile is false but small screen
                            (max-width: 1200px) 33vw, // Roughly 1/3 viewport width for 3-col grid
                            300px // A max width for very large screens or fixed column width
                        `}
                                />
                            </div>
                            {/* Product Info */}
                            <div className="p-4">
                                <h4 className="font-medium text-text-primary mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                                    {product.title}
                                </h4>

                                {/* Price */}
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-lg font-semibold text-text-primary">${product.price}</span>
                                    {product.originalPrice && (
                                        <span className="text-sm text-text-secondary line-through">
                                            ${product.originalPrice}
                                        </span>
                                    )}
                                </div>

                                {/* Rating and Distance */}
                                <div className="flex items-center justify-between text-sm text-text-secondary">
                                    <div className="flex items-center space-x-1">
                                        <Icon name="Star" size={12} className="text-yellow-500 fill-current" />
                                        <span>{product.rating}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Icon name="MapPin" size={12} className="text-primary" />
                                        <span>{product.distance}mi</span>
                                    </div>
                                </div>

                                {/* Condition */}
                                <div className="mt-2">
                                    <span className="inline-block bg-surface-secondary text-text-secondary px-2 py-1 rounded text-xs">
                                        {product.condition}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Show More Button for Mobile */}
            {isMobile && (
                <button className="w-full py-3 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all duration-200">
                    <span className="text-sm font-medium">Show More Similar Products</span>
                </button>
            )}
        </div>
    );
};

export default SimilarProducts;