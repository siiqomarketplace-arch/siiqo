"use client";

import React, { useState } from 'react';
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

interface MapViewToggleProps {
    products: Product[];
    onBackToList: () => void;
}

const MapViewToggle = ({ products, onBackToList }: MapViewToggleProps) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [mapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // New York coordinates

    const handleMarkerClick = (product: Product) => {
        setSelectedProduct(product);
    };

    return (
        <div className="fixed inset-0 z-50 bg-surface">
            {/* Map Header */}
            <div className="absolute top-0 left-0 right-0 z-60 bg-surface border-b border-border">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={onBackToList}
                        className="flex items-center space-x-2 text-text-primary hover:text-primary transition-colors duration-200"
                    >
                        <Icon name="ArrowLeft" size={20} />
                        <span className="font-medium">Back to List</span>
                    </button>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-text-secondary">
                            {products.length} products nearby
                        </span>
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="pt-16 h-full relative">
                {/* Google Maps Iframe */}
                <iframe
                    width="100%"
                    height="100%"
                    loading="lazy"
                    title="Product Locations Map"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=12&output=embed`}
                    className="w-full h-full"
                />

                {/* Map Overlay Controls */}
                <div className="absolute top-20 right-4 space-y-2">
                    <button className="w-10 h-10 bg-surface border border-border rounded-lg shadow-elevation-1 flex items-center justify-center hover:bg-surface-secondary transition-colors duration-200">
                        <Icon name="Plus" size={16} className="text-text-primary" />
                    </button>
                    <button className="w-10 h-10 bg-surface border border-border rounded-lg shadow-elevation-1 flex items-center justify-center hover:bg-surface-secondary transition-colors duration-200">
                        <Icon name="Minus" size={16} className="text-text-primary" />
                    </button>
                    <button className="w-10 h-10 bg-surface border border-border rounded-lg shadow-elevation-1 flex items-center justify-center hover:bg-surface-secondary transition-colors duration-200">
                        <Icon name="Navigation" size={16} className="text-text-primary" />
                    </button>
                </div>

                {/* Product Markers Simulation */}
                <div className="absolute inset-0 pointer-events-none">
                    {products.slice(0, 6).map((product, index) => (
                        <div
                            key={product.id}
                            className="absolute pointer-events-auto cursor-pointer"
                            style={{
                                left: `${20 + (index * 15)}%`,
                                top: `${30 + (index * 10)}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                            onClick={() => handleMarkerClick(product)}
                        >
                            <div className="relative">
                                <div className="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-elevation-2 flex items-center justify-center hover:scale-110 transition-transform duration-200">
                                    <span className="text-white text-xs font-bold">
                                        ${Math.floor(product.price / 10)}
                                    </span>
                                </div>
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-primary"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Selected Product Card */}
                {selectedProduct && (
                    <div className="absolute bottom-4 left-4 right-4 bg-surface rounded-lg border border-border shadow-elevation-3 p-4">
                        <div className="flex items-start space-x-3">
                            {/* Add 'relative' to this div */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    fill // Add the fill prop
                                    className="object-cover" // Keep object-cover, remove w-full h-full
                                    sizes="64px" // Add sizes prop for a fixed 16x16 (64px) image
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-text-primary mb-1 truncate">
                                    {selectedProduct.name}
                                </h3>
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-lg font-semibold text-text-primary">
                                        ${selectedProduct.price}
                                    </span>
                                    {selectedProduct.originalPrice && (
                                        <span className="text-sm text-text-secondary line-through">
                                            ${selectedProduct.originalPrice}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1">
                                        <Icon name="MapPin" size={12} className="text-text-secondary" />
                                        <span className="text-xs text-text-secondary">
                                            {selectedProduct.distance} mi away
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Icon name="Star" size={12} className="text-warning fill-current" />
                                        <span className="text-xs text-text-secondary">
                                            {selectedProduct.rating}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="p-1 rounded-full hover:bg-surface-secondary transition-colors duration-200"
                                >
                                    <Icon name="X" size={16} className="text-text-secondary" />
                                </button>
                                <button className="p-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                                    <Icon name="ExternalLink" size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-surface border border-border rounded-lg shadow-elevation-1 p-3 hidden md:block">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                            <span className="text-xs text-text-secondary">Available Products</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-warning rounded-full"></div>
                            <span className="text-xs text-text-secondary">Limited Stock</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-error rounded-full"></div>
                            <span className="text-xs text-text-secondary">Out of Stock</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapViewToggle;