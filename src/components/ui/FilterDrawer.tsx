// components/FilterDrawer.tsx
'use client'; // This component uses client-side hooks like useState, useEffect, useRouter, usePathname, useSearchParams

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; // Next.js routing hooks
import Icon from './AppIcon'; // Adjust path as needed

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Filters {
    category: string;
    priceRange: [number, number];
    distance: number;
    condition: string;
    sortBy: string;
    availability: string;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const pathname = usePathname(); // Current path
    const searchParams = useSearchParams(); // Current URL search parameters

    const [filters, setFilters] = useState<Filters>({
        category: '',
        priceRange: [0, 1000],
        distance: 5,
        condition: '',
        sortBy: 'distance',
        availability: 'all'
    });

    const categories = [
        'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books',
        'Automotive', 'Health & Beauty', 'Toys & Games', 'Food & Beverages'
    ];

    const conditions = ['New', 'Like New', 'Good', 'Fair', 'For Parts'];
    const sortOptions = [
        { value: 'distance', label: 'Distance' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'newest', label: 'Newest First' },
        { value: 'rating', label: 'Highest Rated' }
    ];

    // Populate filters from URL search params on mount or param change
    useEffect(() => {
        // Create a mutable URLSearchParams object from the read-only useSearchParams
        const currentParams = new URLSearchParams(searchParams.toString());

        setFilters(prev => ({
            ...prev,
            category: currentParams.get('category') || '',
            priceRange: [
                currentParams.get('minPrice') ? parseInt(currentParams.get('minPrice') as string) : 0,
                currentParams.get('maxPrice') ? parseInt(currentParams.get('maxPrice') as string) : 1000
            ],
            distance: currentParams.get('distance') ? parseInt(currentParams.get('distance') as string) : 5,
            condition: currentParams.get('condition') || '',
            sortBy: currentParams.get('sortBy') || 'distance'
        }));
    }, [searchParams]); // Depend on searchParams to re-sync when URL changes

    const handleFilterChange = (key: keyof Filters, value: any): void => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = (): void => {
        const params = new URLSearchParams(searchParams.toString()); // Start with current params

        if (filters.category) params.set('category', filters.category);
        else params.delete('category');

        if (filters.priceRange[0] > 0) params.set('minPrice', filters.priceRange[0].toString());
        else params.delete('minPrice');

        if (filters.priceRange[1] < 1000) params.set('maxPrice', filters.priceRange[1].toString());
        else params.delete('maxPrice');

        if (filters.distance !== 5) params.set('distance', filters.distance.toString());
        else params.delete('distance');

        if (filters.condition) params.set('condition', filters.condition);
        else params.delete('condition');

        if (filters.sortBy !== 'distance') params.set('sortBy', filters.sortBy);
        else params.delete('sortBy');

        router.push(`/tools/find-products/${pathname}?${params.toString()}`); // Use router.push
        onClose();
    };

    const clearFilters = (): void => {
        setFilters({
            category: '',
            priceRange: [0, 1000],
            distance: 5,
            condition: '',
            sortBy: 'distance',
            availability: 'all'
        });
        router.push(`/tools/find-products/${pathname}`); // Navigate to current path without any search params
        onClose();
    };

    const activeFiltersCount = Object.values(filters).filter(value => {
        if (Array.isArray(value)) return value[0] > 0 || value[1] < 1000;
        // Check if it's not the default value for distance or availability or sortBy
        return value && value !== 'distance' && value !== 'all' && value !== 5;
    }).length;

    return (
        <>
            {/* Mobile Drawer */}
            <div className={`md:hidden fixed inset-0 z-300 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
                <div className={`absolute left-0 top-0 bottom-0 w-80 bg-white shadow-elevation-3 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}>
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center space-x-2">
                                <h2 className="text-lg font-heading font-semibold text-text-primary">Filters</h2>
                                {activeFiltersCount > 0 && (
                                    <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                            >
                                <Icon name="X" size={20} className="text-text-primary" />
                            </button>
                        </div>

                        {/* Filter Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-3">Category</label>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => handleFilterChange('category', filters.category === category ? '' : category)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${filters.category === category
                                                ? 'bg-primary-50 text-primary border border-primary-200' : 'hover:bg-surface-secondary text-text-secondary'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-3">
                                    Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        value={filters.priceRange[0]}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                                        className="w-full accent-primary"
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        value={filters.priceRange[1]}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                                        className="w-full accent-primary"
                                    />
                                </div>
                            </div>

                            {/* Distance */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-3">
                                    Distance: {filters.distance} miles
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={filters.distance}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('distance', parseInt(e.target.value))}
                                    className="w-full accent-primary"
                                />
                            </div>

                            {/* Condition */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-3">Condition</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {conditions.map((condition) => (
                                        <button
                                            key={condition}
                                            onClick={() => handleFilterChange('condition', filters.condition === condition ? '' : condition)}
                                            className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${filters.condition === condition
                                                ? 'bg-primary-50 text-primary border border-primary-200' : 'hover:bg-surface-secondary text-text-secondary border border-border'
                                                }`}
                                        >
                                            {condition}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-3">Sort By</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border space-y-3">
                            <button
                                onClick={applyFilters}
                                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={clearFilters}
                                className="w-full border border-border text-text-secondary py-3 rounded-lg font-medium hover:bg-surface-secondary transition-colors duration-200"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className={`hidden md:block fixed left-0 top-32 bottom-0 w-80 bg-white border-r border-border z-300 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div className="flex items-center space-x-2">
                            <h2 className="text-xl font-heading font-semibold text-text-primary">Filters</h2>
                            {activeFiltersCount > 0 && (
                                <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                        >
                            <Icon name="X" size={20} className="text-text-primary" />
                        </button>
                    </div>

                    {/* Filter Content - Same as mobile but with larger spacing */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Category */}
                        <div>
                            <label className="block text-base font-medium text-text-primary mb-4">Category</label>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleFilterChange('category', filters.category === category ? '' : category)}
                                        className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${filters.category === category
                                            ? 'bg-primary-50 text-primary border border-primary-200' : 'hover:bg-surface-secondary text-text-secondary border border-border'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-base font-medium text-text-primary mb-4">
                                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                            </label>
                            <div className="space-y-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    value={filters.priceRange[0]}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                                    className="w-full accent-primary"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    value={filters.priceRange[1]}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                                    className="w-full accent-primary"
                                />
                            </div>
                        </div>

                        {/* Distance */}
                        <div>
                            <label className="block text-base font-medium text-text-primary mb-4">
                                Distance: {filters.distance} miles
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={filters.distance}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('distance', parseInt(e.target.value))}
                                className="w-full accent-primary"
                            />
                        </div>

                        {/* Condition */}
                        <div>
                            <label className="block text-base font-medium text-text-primary mb-4">Condition</label>
                            <div className="grid grid-cols-2 gap-2">
                                {conditions.map((condition) => (
                                    <button
                                        key={condition}
                                        onClick={() => handleFilterChange('condition', filters.condition === condition ? '' : condition)}
                                        className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${filters.condition === condition
                                            ? 'bg-primary-50 text-primary border border-primary-200' : 'hover:bg-surface-secondary text-text-secondary border border-border'
                                            }`}
                                    >
                                        {condition}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-base font-medium text-text-primary mb-4">Sort By</label>
                            <select
                                value={filters.sortBy}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('sortBy', e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-border space-y-3">
                        <button
                            onClick={applyFilters}
                            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={clearFilters}
                            className="w-full border border-border text-text-secondary py-3 rounded-lg font-medium hover:bg-surface-secondary transition-colors duration-200"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FilterDrawer;