import React from 'react';
import Icon from '@/components/AppIcon';

// Type definitions
interface PriceRange {
    min: string;
    max: string;
}

interface AvailabilityFilters {
    inStock: boolean;
    onSale: boolean;
    freeShipping: boolean;
}

interface ActiveFilters {
    categories: string[];
    vendors: string[];
    priceRange: PriceRange;
    minRating: number;
    availability: AvailabilityFilters;
}

interface FilterChip {
    id: string;
    label: string;
    type: 'category' | 'vendor' | 'priceRange' | 'rating' | 'availability';
    value: string;
}

interface CategoryNames {
    [key: string]: string;
}

interface VendorNames {
    [key: string]: string;
}

interface AvailabilityLabels {
    [key: string]: string;
}

interface FilterChipsProps {
    activeFilters: ActiveFilters;
    onRemoveFilter: (type: FilterChip['type'], value: string) => void;
    onClearAll: () => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({ activeFilters, onRemoveFilter, onClearAll }) => {
    const getFilterChips = (): FilterChip[] => {
        const chips: FilterChip[] = [];

        // Category chips
        activeFilters.categories.forEach(categoryId => {
            const categoryNames: CategoryNames = {
                'electronics': 'Electronics',
                'clothing': 'Clothing & Fashion',
                'home': 'Home & Garden',
                'books': 'Books & Media',
                'sports': 'Sports & Outdoors',
                'beauty': 'Beauty & Health',
                'toys': 'Toys & Games',
                'automotive': 'Automotive'
            };

            chips.push({
                id: `category-${categoryId}`,
                label: categoryNames[categoryId] || categoryId,
                type: 'category',
                value: categoryId
            });
        });

        // Vendor chips
        activeFilters.vendors.forEach(vendorId => {
            const vendorNames: VendorNames = {
                'techstore': 'TechStore Pro',
                'fashionhub': 'Fashion Hub',
                'homeessentials': 'Home Essentials',
                'bookworm': 'BookWorm Corner',
                'sportsgear': 'Sports Gear Co',
                'beautyworld': 'Beauty World'
            };

            chips.push({
                id: `vendor-${vendorId}`,
                label: vendorNames[vendorId] || vendorId,
                type: 'vendor',
                value: vendorId
            });
        });

        // Price range chip
        if (activeFilters.priceRange.min || activeFilters.priceRange.max) {
            const minPrice = activeFilters.priceRange.min || '0';
            const maxPrice = activeFilters.priceRange.max || '∞';
            chips.push({
                id: 'price-range',
                label: `$${minPrice} - $${maxPrice}`,
                type: 'priceRange',
                value: 'priceRange'
            });
        }

        // Rating chip
        if (activeFilters.minRating > 0) {
            chips.push({
                id: 'rating',
                label: `${activeFilters.minRating}+ Stars`,
                type: 'rating',
                value: 'rating'
            });
        }

        // Availability chips
        Object.entries(activeFilters.availability).forEach(([key, value]) => {
            if (value) {
                const labels: AvailabilityLabels = {
                    inStock: 'In Stock',
                    onSale: 'On Sale',
                    freeShipping: 'Free Shipping'
                };

                chips.push({
                    id: `availability-${key}`,
                    label: labels[key],
                    type: 'availability',
                    value: key
                });
            }
        });

        return chips;
    };

    const handleRemoveChip = (chip: FilterChip): void => {
        onRemoveFilter(chip.type, chip.value);
    };

    const chips = getFilterChips();

    if (chips.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 border-b border-border">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Filter" size={16} />
                <span>Active filters:</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                    <div
                        key={chip.id}
                        className="flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm border border-primary/20"
                    >
                        <span className="font-medium">{chip.label}</span>
                        <button
                            onClick={() => handleRemoveChip(chip)}
                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors duration-200"
                        >
                            <Icon name="X" size={12} />
                        </button>
                    </div>
                ))}
            </div>

            {chips.length > 1 && (
                <button
                    onClick={onClearAll}
                    className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ml-2"
                >
                    <Icon name="X" size={14} />
                    <span>Clear all</span>
                </button>
            )}
        </div>
    );
};

export default FilterChips;