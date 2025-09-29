import React, { useState, ChangeEvent, JSX } from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/new/Button';
import Input from '@/components/ui/new/Input';
import { Checkbox } from '@/components/ui/new/Checkbox';

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

interface Filters {
	categories: string[];
	vendors: string[];
	priceRange: PriceRange;
	minRating: number;
	availability: AvailabilityFilters;
}

interface Category {
	id: string;
	name: string;
	count: number;
}

interface Vendor {
	id: string;
	name: string;
	count: number;
}

interface ExpandedSections {
	categories: boolean;
	price: boolean;
	vendors: boolean;
	rating: boolean;
	availability: boolean;
}

interface FilterPanelProps {
	isOpen: boolean;
	onClose?: () => void;
	filters: Filters;
	onFiltersChange: (filters: Filters) => void;
	isMobile?: boolean;
}

interface FilterSectionProps {
	title: string;
	sectionKey: keyof ExpandedSections;
	children: React.ReactNode;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
	isOpen,
	onClose,
	filters,
	onFiltersChange,
	isMobile = false
}) => {
	const [localFilters, setLocalFilters] = useState<Filters>(filters);
	const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
		categories: true,
		price: true,
		vendors: true,
		rating: true,
		availability: true
	});

	const categories: Category[] = [
		{ id: 'electronics', name: 'Electronics', count: 245 },
		{ id: 'clothing', name: 'Clothing & Fashion', count: 189 },
		{ id: 'home', name: 'Home & Garden', count: 156 },
		{ id: 'books', name: 'Books & Media', count: 98 },
		{ id: 'sports', name: 'Sports & Outdoors', count: 87 },
		{ id: 'beauty', name: 'Beauty & Health', count: 76 },
		{ id: 'toys', name: 'Toys & Games', count: 54 },
		{ id: 'automotive', name: 'Automotive', count: 43 }
	];

	const vendors: Vendor[] = [
		{ id: 'techstore', name: 'TechStore Pro', count: 45 },
		{ id: 'fashionhub', name: 'Fashion Hub', count: 38 },
		{ id: 'homeessentials', name: 'Home Essentials', count: 32 },
		{ id: 'bookworm', name: 'BookWorm Corner', count: 28 },
		{ id: 'sportsgear', name: 'Sports Gear Co', count: 25 },
		{ id: 'beautyworld', name: 'Beauty World', count: 22 }
	];

	const toggleSection = (section: keyof ExpandedSections): void => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	const handleCategoryChange = (categoryId: string, checked: boolean): void => {
		const updatedCategories = checked
			? [...localFilters.categories, categoryId]
			: localFilters.categories.filter(id => id !== categoryId);

		setLocalFilters(prev => ({
			...prev,
			categories: updatedCategories
		}));
	};

	const handleVendorChange = (vendorId: string, checked: boolean): void => {
		const updatedVendors = checked
			? [...localFilters.vendors, vendorId]
			: localFilters.vendors.filter(id => id !== vendorId);

		setLocalFilters(prev => ({
			...prev,
			vendors: updatedVendors
		}));
	};

	const handlePriceChange = (field: keyof PriceRange, value: string): void => {
		setLocalFilters(prev => ({
			...prev,
			priceRange: {
				...prev.priceRange,
				[field]: value
			}
		}));
	};

	const handleRatingChange = (rating: number): void => {
		setLocalFilters(prev => ({
			...prev,
			minRating: prev.minRating === rating ? 0 : rating
		}));
	};

	const handleAvailabilityChange = (field: keyof AvailabilityFilters, checked: boolean): void => {
		setLocalFilters(prev => ({
			...prev,
			availability: {
				...prev.availability,
				[field]: checked
			}
		}));
	};

	const applyFilters = (): void => {
		onFiltersChange(localFilters);
		if (isMobile && onClose) {
			onClose();
		}
	};

	const clearAllFilters = (): void => {
		const clearedFilters: Filters = {
			categories: [],
			vendors: [],
			priceRange: { min: '', max: '' },
			minRating: 0,
			availability: {
				inStock: false,
				onSale: false,
				freeShipping: false
			}
		};
		setLocalFilters(clearedFilters);
		onFiltersChange(clearedFilters);
	};

	const getActiveFiltersCount = (): number => {
		return localFilters.categories.length +
			localFilters.vendors.length +
			(localFilters.priceRange.min || localFilters.priceRange.max ? 1 : 0) +
			(localFilters.minRating > 0 ? 1 : 0) +
			Object.values(localFilters.availability).filter(Boolean).length;
	};

	const renderStars = (rating: number): JSX.Element[] => {
		return Array.from({ length: 5 }, (_, i) => (
			<Icon
				key={i}
				name="Star"
				size={16}
				className={`${i < rating ? 'text-warning fill-current' : 'text-muted-foreground'
					}`}
			/>
		));
	};

	const FilterSection: React.FC<FilterSectionProps> = ({ title, sectionKey, children }) => (
		<div className="pb-4 mb-4 border-b border-border last:border-b-0 last:pb-0 last:mb-0">
			<button
				onClick={() => toggleSection(sectionKey)}
				className="flex items-center justify-between w-full py-2 text-left"
			>
				<h3 className="font-medium text-foreground">{title}</h3>
				<Icon
					name={expandedSections[sectionKey] ? "ChevronUp" : "ChevronDown"}
					size={20}
					className="text-muted-foreground"
				/>
			</button>
			{expandedSections[sectionKey] && (
				<div className="mt-3 space-y-3">
					{children}
				</div>
			)}
		</div>
	);

	const panelContent = (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-border">
				<div className="flex items-center space-x-2">
					<h2 className="text-lg font-semibold text-foreground">Filters</h2>
					{getActiveFiltersCount() > 0 && (
						<span className="px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground">
							{getActiveFiltersCount()}
						</span>
					)}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={clearAllFilters}
						disabled={getActiveFiltersCount() === 0}
					>
						Clear All
					</Button>
					{isMobile && onClose && (
						<Button variant="ghost" size="icon" onClick={onClose}>
							<Icon name="X" size={20} />
						</Button>
					)}
				</div>
			</div>

			{/* Filter Content */}
			<div className="flex-1 p-4 overflow-y-auto">
				{/* Categories */}
				<FilterSection title="Categories" sectionKey="categories">
					<div className="space-y-2 overflow-y-auto max-h-48">
						{categories.map(category => (
							<div key={category.id} className="flex items-center justify-between">
								<Checkbox
									label={category.name}
									checked={localFilters.categories.includes(category.id)}
									onChange={(e: ChangeEvent<HTMLInputElement>) => handleCategoryChange(category.id, e.target.checked)}
								/>
								<span className="text-xs text-muted-foreground">({category.count})</span>
							</div>
						))}
					</div>
				</FilterSection>

				{/* Price Range */}
				<FilterSection title="Price Range" sectionKey="price">
					<div className="grid grid-cols-2 gap-3">
						<Input
							type="number"
							placeholder="Min"
							value={localFilters.priceRange.min}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handlePriceChange('min', e.target.value)}
						/>
						<Input
							type="number"
							placeholder="Max"
							value={localFilters.priceRange.max}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handlePriceChange('max', e.target.value)}
						/>
					</div>
				</FilterSection>

				{/* Vendors */}
				<FilterSection title="Vendors" sectionKey="vendors">
					<div className="space-y-2 overflow-y-auto max-h-48">
						{vendors.map(vendor => (
							<div key={vendor.id} className="flex items-center justify-between">
								<Checkbox
									label={vendor.name}
									checked={localFilters.vendors.includes(vendor.id)}
									onChange={(e: ChangeEvent<HTMLInputElement>) => handleVendorChange(vendor.id, e.target.checked)}
								/>
								<span className="text-xs text-muted-foreground">({vendor.count})</span>
							</div>
						))}
					</div>
				</FilterSection>

				{/* Rating */}
				<FilterSection title="Customer Rating" sectionKey="rating">
					<div className="space-y-2">
						{[4, 3, 2, 1].map(rating => (
							<button
								key={rating}
								onClick={() => handleRatingChange(rating)}
								className={`flex items-center space-x-2 w-full p-2 rounded-md transition-colors ${localFilters.minRating === rating
									? 'bg-primary/10 border border-primary' : 'hover:bg-muted'
									}`}
							>
								<div className="flex items-center space-x-1">
									{renderStars(rating)}
								</div>
								<span className="text-sm text-muted-foreground">& up</span>
							</button>
						))}
					</div>
				</FilterSection>

				{/* Availability */}
				<FilterSection title="Availability" sectionKey="availability">
					<div className="space-y-2">
						<Checkbox
							label="In Stock Only"
							checked={localFilters.availability.inStock}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleAvailabilityChange('inStock', e.target.checked)}
						/>
						<Checkbox
							label="On Sale"
							checked={localFilters.availability.onSale}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleAvailabilityChange('onSale', e.target.checked)}
						/>
						<Checkbox
							label="Free Shipping"
							checked={localFilters.availability.freeShipping}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleAvailabilityChange('freeShipping', e.target.checked)}
						/>
					</div>
				</FilterSection>
			</div>

			{/* Apply Button - Mobile Only */}
			{isMobile && (
				<div className="p-4 border-t border-border">
					<Button
						variant="default"
						fullWidth
						onClick={applyFilters}
					>
						Apply Filters ({getActiveFiltersCount()})
					</Button>
				</div>
			)}
		</div>
	);

	if (isMobile) {
		return (
			<>
				{/* Mobile Overlay */}
				{isOpen && (
					<div
						className="fixed inset-0 bg-black bg-opacity-50 z-1200"
						onClick={onClose}
					/>
				)}

				{/* Mobile Slide-up Panel */}
				<div
					className={`fixed bottom-0 left-0 right-0 bg-card rounded-t-xl z-1300 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'
						}`}
					style={{ height: '80vh' }}
				>
					{panelContent}
				</div>
			</>
		);
	}

	// Desktop Sidebar
	return (
		<div className="h-full border-r w-80 bg-card border-border">
			{panelContent}
		</div>
	);
};

export default FilterPanel;