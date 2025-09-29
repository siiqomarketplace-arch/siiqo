"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';
import FilterDrawer from '@/components/ui/FilterDrawer'; // Adjust path as needed
import ActionSheetModal from '@/components/ui/ActionSheetModal'; // Adjust path as needed

interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    category: string;
    condition: string;
    distance: number;
    seller: string;
    rating: number;
    reviews: number;
    location: { lat: number; lng: number };
    address: string;
    availability: string;
    description: string;
}

interface Filter {
    type: string;
    value: string;
}

const MapView = () => {
    const [currentLocation, setCurrentLocation] = useState({ lat: 40.7128, lng: -74.0060 });
    const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
    const [zoomLevel, setZoomLevel] = useState(12);
    const [mapType, setMapType] = useState('roadmap');
    const [showFilterDrawer, setShowFilterDrawer] = useState(false);
    const [showProductList, setShowProductList] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Filter[]>([]);

    const router = useRouter();
    const searchParams = useSearchParams();
    const mapRef = useRef<HTMLIFrameElement>(null);

    // Mock product data with location coordinates
    const mockProducts: Product[] = [
        {
            id: 1,
            name: "iPhone 14 Pro Max",
            price: 899,
            originalPrice: 1099,
            image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
            category: "Electronics",
            condition: "Like New",
            distance: 0.8,
            seller: "TechStore NYC",
            rating: 4.8,
            reviews: 124,
            location: { lat: 40.7589, lng: -73.9851 },
            address: "Manhattan, NY",
            availability: "Available",
            description: "Excellent condition iPhone 14 Pro Max with original box and accessories."
        },
        {
            id: 2,
            name: "MacBook Air M2",
            price: 1199,
            originalPrice: 1399,
            image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
            category: "Electronics",
            condition: "New",
            distance: 1.2,
            seller: "Apple Authorized",
            rating: 4.9,
            reviews: 89,
            location: { lat: 40.7505, lng: -73.9934 },
            address: "Midtown, NY",
            availability: "Available",
            description: "Brand new MacBook Air with M2 chip, perfect for professionals."
        },
        {
            id: 3,
            name: "Nike Air Jordan 1",
            price: 180,
            originalPrice: 220,
            image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400",
            category: "Clothing",
            condition: "Good",
            distance: 2.1,
            seller: "Sneaker Hub",
            rating: 4.6,
            reviews: 67,
            location: { lat: 40.7282, lng: -74.0776 },
            address: "Brooklyn, NY",
            availability: "Available",
            description: "Classic Air Jordan 1 in excellent condition, size 10."
        },
        {
            id: 4,
            name: "Samsung 55\" QLED TV",
            price: 699,
            originalPrice: 899,
            image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
            category: "Electronics",
            condition: "Like New",
            distance: 3.5,
            seller: "Electronics Plus",
            rating: 4.7,
            reviews: 45,
            location: { lat: 40.6892, lng: -74.0445 },
            address: "Staten Island, NY",
            availability: "Available",
            description: "Stunning 4K QLED display with smart TV features."
        },
        {
            id: 5,
            name: "Vintage Leather Jacket",
            price: 120,
            originalPrice: 180,
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
            category: "Clothing",
            condition: "Good",
            distance: 1.8,
            seller: "Vintage Finds",
            rating: 4.5,
            reviews: 32,
            location: { lat: 40.7831, lng: -73.9712 },
            address: "Upper East Side, NY",
            availability: "Available",
            description: "Authentic vintage leather jacket in great condition."
        },
        {
            id: 6,
            name: "Gaming Chair Pro",
            price: 299,
            originalPrice: 399,
            image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400",
            category: "Home & Garden",
            condition: "New",
            distance: 4.2,
            seller: "Gaming Gear",
            rating: 4.8,
            reviews: 78,
            location: { lat: 40.6782, lng: -73.9442 },
            address: "Queens, NY",
            availability: "Available",
            description: "Ergonomic gaming chair with lumbar support and adjustable height."
        }
    ];

    // Get current location
    useEffect(() => {
        if (navigator.geolocation) {
            setIsLocationLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCurrentLocation(newLocation);
                    setMapCenter(newLocation);
                    setIsLocationLoading(false);
                },
                (error) => {
                    console.log('Location access denied, using default location');
                    setIsLocationLoading(false);
                }
            );
        }
    }, []);

    // Filter products based on map bounds and active filters
    useEffect(() => {
        const category = searchParams.get('category');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const condition = searchParams.get('condition');

        let filtered = mockProducts;

        if (category) {
            filtered = filtered.filter(product => product.category === category);
        }
        if (minPrice) {
            filtered = filtered.filter(product => product.price >= parseInt(minPrice));
        }
        if (maxPrice) {
            filtered = filtered.filter(product => product.price <= parseInt(maxPrice));
        }
        if (condition) {
            filtered = filtered.filter(product => product.condition === condition);
        }

        setVisibleProducts(filtered);

        // Update active filters display
        const filters: Filter[] = [];
        if (category) filters.push({ type: 'category', value: category });
        if (minPrice || maxPrice) filters.push({ type: 'price', value: `$${minPrice || 0} - $${maxPrice || '∞'}` });
        if (condition) filters.push({ type: 'condition', value: condition });
        setActiveFilters(filters);
    }, [searchParams]);

    const handleProductClick = (product: Product) => {
        router.push(`/product-detail?id=${product.id}`);
    };

    const handleMarkerClick = (product: Product) => {
        setSelectedProduct(product);
        setMapCenter(product.location);
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            setIsLocationLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCurrentLocation(newLocation);
                    setMapCenter(newLocation);
                    setZoomLevel(15);
                    setIsLocationLoading(false);
                },
                (error) => {
                    setIsLocationLoading(false);
                }
            );
        }
    };

    const removeFilter = (filterToRemove: Filter) => {
        const params = new URLSearchParams(searchParams.toString());

        switch (filterToRemove.type) {
            case 'category':
                params.delete('category');
                break;
            case 'price':
                params.delete('minPrice');
                params.delete('maxPrice');
                break;
            case 'condition':
                params.delete('condition');
                break;
        }

        router.push(`/?${params.toString()}`);
    };

    interface ProductMarkerProps {
        product: Product;
        onClick: (product: Product) => void;
    }

    const ProductMarker: React.FC<ProductMarkerProps> = ({ product, onClick }) => (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
            style={{
                left: `${((product.location.lng - (mapCenter.lng - 0.05)) / 0.1) * 100}%`,
                top: `${((mapCenter.lat + 0.05 - product.location.lat) / 0.1) * 100}%`
            }}
            onClick={() => onClick(product)}
        >
            <div className="relative">
                <div className="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">${Math.floor(product.price / 100)}</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-primary"></div>
            </div>
        </div>
    );

    interface ProductPreviewCardProps {
        product: Product;
        onClose: () => void;
    }

    const ProductPreviewCard: React.FC<ProductPreviewCardProps> = ({ product, onClose }) => (
        <div className="absolute bottom-4 left-4 right-4 bg-surface rounded-lg shadow-elevation-2 p-4 z-20">
            <div className="flex items-start space-x-3">
                {/* Add 'relative' to the existing sizing div */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill // Add fill prop
                        className="object-cover" // Keep object-cover, remove w-full h-full
                        sizes="64px" // Add sizes prop, as it's a fixed size
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary truncate">{product.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg font-bold text-primary">${product.price}</span>
                        {product.originalPrice > product.price && (
                            <span className="text-sm text-text-secondary line-through">${product.originalPrice}</span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                        <Icon name="MapPin" size={12} className="text-text-secondary" />
                        <span className="text-xs text-text-secondary">{product.distance} miles away</span>
                        <div className="flex items-center space-x-1">
                            <Icon name="Star" size={12} className="text-yellow-400 fill-current" />
                            <span className="text-xs text-text-secondary">{product.rating}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-2">
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-surface-secondary transition-colors duration-200"
                    >
                        <Icon name="X" size={16} className="text-text-secondary" />
                    </button>
                    <button
                        onClick={() => handleProductClick(product)}
                        className="px-3 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    );

    interface ProductListItemProps {
        product: Product;
    }

    const ProductListItem: React.FC<ProductListItemProps> = ({ product }) => (
        <div
            onClick={() => handleProductClick(product)}
            className="flex items-center space-x-3 p-3 hover:bg-surface-secondary transition-colors duration-200 cursor-pointer"
        >
            {/* Add 'relative' to the existing sizing div */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill // Add fill prop
                    className="object-cover" // Keep object-cover, remove w-full h-full
                    sizes="48px" // Add sizes prop (12 * 4 = 48px)
                />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-text-primary truncate text-sm">{product.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                    <span className="text-primary font-bold text-sm">${product.price}</span>
                    <span className="text-xs text-text-secondary">• {product.distance} mi</span>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                    <Icon name="Star" size={10} className="text-yellow-400 fill-current" />
                    <span className="text-xs text-text-secondary">{product.rating}</span>
                </div>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleMarkerClick(product);
                }}
                className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
            >
                <Icon name="MapPin" size={16} className="text-primary" />
            </button>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Filter Chips */}
            {activeFilters.length > 0 && (
                <div className="px-4 py-2 bg-surface border-b border-border">
                    <div className="flex items-center space-x-2 overflow-x-auto">
                        <span className="text-xs text-text-secondary whitespace-nowrap">Filters:</span>
                        {activeFilters.map((filter, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-1 bg-primary-50 text-primary px-2 py-1 rounded-full text-xs whitespace-nowrap"
                            >
                                <span>{filter.value}</span>
                                <button
                                    onClick={() => removeFilter(filter)}
                                    className="hover:bg-primary-100 rounded-full p-0.5 transition-colors duration-200"
                                >
                                    <Icon name="X" size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 relative">
                {/* Desktop Layout */}
                <div className="hidden md:flex h-full">
                    {/* Map Section */}
                    <div className="flex-1 relative">
                        {/* Map Container */}
                        <div className="w-full h-full bg-gray-100 relative overflow-hidden">
                            {/* Google Maps Iframe */}
                            <iframe
                                ref={mapRef}
                                width="100%"
                                height="100%"
                                loading="lazy"
                                title="Product Map"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=${zoomLevel}&output=embed&maptype=${mapType}`}
                                className="absolute inset-0"
                            />

                            {/* Product Markers Overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                {visibleProducts.map((product) => (
                                    <div key={product.id} className="pointer-events-auto">
                                        <ProductMarker
                                            product={product}
                                            onClick={handleMarkerClick}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Map Controls */}
                            <div className="absolute top-4 right-4 flex flex-col space-y-2">
                                <button
                                    onClick={handleCurrentLocation}
                                    disabled={isLocationLoading}
                                    className="w-10 h-10 bg-surface rounded-lg shadow-elevation-1 flex items-center justify-center hover:bg-surface-secondary transition-colors duration-200 disabled:opacity-50"
                                >
                                    {isLocationLoading ? (
                                        <Icon name="Loader2" size={18} className="text-primary animate-spin" />
                                    ) : (
                                        <Icon name="Navigation" size={18} className="text-primary" />
                                    )}
                                </button>

                                <div className="flex flex-col bg-surface rounded-lg shadow-elevation-1 overflow-hidden">
                                    <button
                                        onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-surface-secondary transition-colors duration-200"
                                    >
                                        <Icon name="Plus" size={18} className="text-text-primary" />
                                    </button>
                                    <div className="w-full h-px bg-border" />
                                    <button
                                        onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-surface-secondary transition-colors duration-200"
                                    >
                                        <Icon name="Minus" size={18} className="text-text-primary" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
                                    className="w-10 h-10 bg-surface rounded-lg shadow-elevation-1 flex items-center justify-center hover:bg-surface-secondary transition-colors duration-200"
                                >
                                    <Icon name="Layers" size={18} className="text-primary" />
                                </button>
                            </div>

                            {/* Filter Button */}
                            <div className="absolute top-4 left-4">
                                <button
                                    onClick={() => setShowFilterDrawer(true)}
                                    className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-elevation-1 hover:bg-surface-secondary transition-colors duration-200"
                                >
                                    <Icon name="SlidersHorizontal" size={18} className="text-primary" />
                                    <span className="text-sm font-medium text-text-primary">Filters</span>
                                    {activeFilters.length > 0 && (
                                        <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                                            {activeFilters.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Selected Product Preview */}
                        {selectedProduct && (
                            <ProductPreviewCard
                                product={selectedProduct}
                                onClose={() => setSelectedProduct(null)}
                            />
                        )}
                    </div>

                    {/* Product List Sidebar */}
                    <div className="w-80 bg-surface border-l border-border flex flex-col">
                        <div className="p-4 border-b border-border">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-heading font-semibold text-text-primary">
                                    Products ({visibleProducts.length})
                                </h2>
                                <button
                                    onClick={() => router.push('/search-results')}
                                    className="text-sm text-primary hover:text-primary-700 transition-colors duration-200"
                                >
                                    View All
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {visibleProducts.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {visibleProducts.map((product) => (
                                        <ProductListItem key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <Icon name="MapPin" size={48} className="text-text-tertiary mb-4" />
                                    <h3 className="text-lg font-medium text-text-primary mb-2">No products found</h3>
                                    <p className="text-text-secondary text-sm">Try adjusting your filters or search area</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden h-full relative">
                    {/* Map Container */}
                    <div className="w-full h-full bg-gray-100 relative overflow-hidden">
                        {/* Google Maps Iframe */}
                        <iframe
                            width="100%"
                            height="100%"
                            loading="lazy"
                            title="Product Map"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=${zoomLevel}&output=embed&maptype=${mapType}`}
                            className="absolute inset-0"
                        />

                        {/* Product Markers Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            {visibleProducts.map((product) => (
                                <div key={product.id} className="pointer-events-auto">
                                    <ProductMarker
                                        product={product}
                                        onClick={handleMarkerClick}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Mobile Map Controls */}
                        <div className="absolute top-4 right-4 flex flex-col space-y-2">
                            <button
                                onClick={handleCurrentLocation}
                                disabled={isLocationLoading}
                                className="w-10 h-10 bg-surface rounded-lg shadow-elevation-1 flex items-center justify-center hover:bg-surface-secondary transition-colors duration-200 disabled:opacity-50"
                            >
                                {isLocationLoading ? (
                                    <Icon name="Loader2" size={18} className="text-primary animate-spin" />
                                ) : (
                                    <Icon name="Navigation" size={18} className="text-primary" />
                                )}
                            </button>

                            <button
                                onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
                                className="w-10 h-10 bg-surface rounded-lg shadow-elevation-1 flex items-center justify-center hover:bg-surface-secondary transition-colors duration-200"
                            >
                                <Icon name="Layers" size={18} className="text-primary" />
                            </button>
                        </div>

                        {/* Mobile Filter and List Buttons */}
                        <div className="absolute top-4 left-4 flex space-x-2">
                            <button
                                onClick={() => setShowFilterDrawer(true)}
                                className="flex items-center space-x-2 bg-surface px-3 py-2 rounded-lg shadow-elevation-1 hover:bg-surface-secondary transition-colors duration-200"
                            >
                                <Icon name="SlidersHorizontal" size={16} className="text-primary" />
                                {activeFilters.length > 0 && (
                                    <span className="w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                                        {activeFilters.length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setShowProductList(true)}
                                className="flex items-center space-x-2 bg-surface px-3 py-2 rounded-lg shadow-elevation-1 hover:bg-surface-secondary transition-colors duration-200"
                            >
                                <Icon name="List" size={16} className="text-primary" />
                                <span className="text-sm font-medium text-text-primary">{visibleProducts.length}</span>
                            </button>
                        </div>

                        {/* Selected Product Preview */}
                        {selectedProduct && (
                            <ProductPreviewCard
                                product={selectedProduct}
                                onClose={() => setSelectedProduct(null)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Drawer */}
            <FilterDrawer
                isOpen={showFilterDrawer}
                onClose={() => setShowFilterDrawer(false)}
            />

            {/* Mobile Product List Modal */}
            <ActionSheetModal
                isOpen={showProductList}
                onClose={() => setShowProductList(false)}
                title={`Products (${visibleProducts.length})`}
                size="large"
            >
                <div className="max-h-96 overflow-y-auto">
                    {visibleProducts.length > 0 ? (
                        <div className="divide-y divide-border">
                            {visibleProducts.map((product) => (
                                <ProductListItem key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <Icon name="MapPin" size={48} className="text-text-tertiary mb-4" />
                            <h3 className="text-lg font-medium text-text-primary mb-2">No products found</h3>
                            <p className="text-text-secondary text-sm">Try adjusting your filters or search area</p>
                        </div>
                    )}
                </div>
            </ActionSheetModal>
        </div>
    );
};


const MapViewPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MapView />
        </Suspense>
    );
};



export default MapViewPage;