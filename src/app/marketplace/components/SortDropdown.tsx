import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/AppIcon';

// Define the specific values a sort option can have
type SortOptionValue = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popular' | 'category';

// Define the shape of a single sort option
interface SortOption {
    value: SortOptionValue;
    label: string;
    icon: string; // Ideally, this would be a keyof your Icon component's name map
}

// Define the props for the SortDropdown component
interface SortDropdownProps {
    currentSort: SortOptionValue;
    onSortChange: (sortValue: SortOptionValue) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ currentSort, onSortChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef < HTMLDivElement | null > (null);

    const sortOptions: SortOption[] = [
        { value: 'relevance', label: 'Best Match', icon: 'Target' },
        { value: 'price-low', label: 'Price: Low to High', icon: 'ArrowUp' },
        { value: 'price-high', label: 'Price: High to Low', icon: 'ArrowDown' },
        { value: 'rating', label: 'Customer Rating', icon: 'Star' },
        { value: 'newest', label: 'Newest Arrivals', icon: 'Clock' },
        { value: 'popular', label: 'Most Popular', icon: 'TrendingUp' },
        { value: 'category', label: 'Category', icon: 'Grid' }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSortSelect = (sortValue: SortOptionValue) => {
        onSortChange(sortValue);
        setIsOpen(false);
    };

    const currentOption = sortOptions.find(option => option.value === currentSort);

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-200 min-w-48"
            >
                <Icon name={currentOption?.icon || 'ArrowUpDown'} size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground flex-1 text-left">
                    {currentOption?.label || 'Sort by'}
                </span>
                <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-dropdown z-1300 overflow-hidden">
                    <div className="py-1">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortSelect(option.value)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted transition-colors duration-200 ${currentSort === option.value ? 'bg-primary/10 text-primary' : 'text-foreground'
                                    }`}
                            >
                                <Icon
                                    name={option.icon}
                                    size={16}
                                    className={currentSort === option.value ? 'text-primary' : 'text-muted-foreground'}
                                />
                                <span className="text-sm font-medium">{option.label}</span>
                                {currentSort === option.value && (
                                    <Icon name="Check" size={16} className="text-primary ml-auto" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SortDropdown;