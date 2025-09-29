'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/new/Button';
import Input from '@/components/ui/new/Input';
import Select from '@/components/ui/new/NewSelect';

interface DateRange {
	from: string;
	to: string;
}

interface AmountRange {
	min: string;
	max: string;
}

interface Filters {
	search: string;
	status: string;
	sort: string;
	dateRange: DateRange;
	amountRange: AmountRange;
}

interface Props {
	filters: Filters;
	onFiltersChange: (filters: Filters) => void;
	onClearFilters: () => void;
}

const statusOptions = [
	{ value: 'all', label: 'All Status' },
	{ value: 'pending', label: 'Pending' },
	{ value: 'processing', label: 'Processing' },
	{ value: 'shipped', label: 'Shipped' },
	{ value: 'delivered', label: 'Delivered' },
	{ value: 'cancelled', label: 'Cancelled' },
	{ value: 'refunded', label: 'Refunded' }
];

const sortOptions = [
	{ value: 'newest', label: 'Newest First' },
	{ value: 'oldest', label: 'Oldest First' },
	{ value: 'amount_high', label: 'Amount: High to Low' },
	{ value: 'amount_low', label: 'Amount: Low to High' }
];

const dateFields: { label: string; field: keyof DateRange }[] = [
    { label: 'From Date', field: 'from' },
    { label: 'To Date', field: 'to' }
];

const amountFields: { label: string; field: keyof AmountRange; placeholder: string }[] = [
    { label: 'Min Amount ($)', field: 'min', placeholder: '0.00' },
    { label: 'Max Amount ($)', field: 'max', placeholder: '1000.00' }
];


const OrderFilters: React.FC<Props> = ({ filters, onFiltersChange, onClearFilters }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const updateFilter = (key: keyof Filters, value: any) =>
		onFiltersChange({ ...filters, [key]: value });

	const updateDateRange = (field: keyof DateRange, value: string) =>
		onFiltersChange({
			...filters,
			dateRange: { ...filters.dateRange, [field]: value }
		});

	const updateAmountRange = (field: keyof AmountRange, value: string) =>
		onFiltersChange({
			...filters,
			amountRange: { ...filters.amountRange, [field]: value }
		});

	return (
		<div className="bg-card border border-border rounded-lg p-4 mb-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold text-foreground">Filter Orders</h3>
				<div className="flex items-center space-x-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsExpanded(!isExpanded)}
						// Assuming Button component can take icon props
						// iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
						// iconPosition="right"
					>
						{isExpanded ? 'Less Filters' : 'More Filters'}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onClearFilters}
						// iconName="X"
						// iconPosition="left"
					>
						Clear All
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="lg:col-span-2">
					<Input
						type="search"
						placeholder="Search by order ID, customer name..."
						value={filters.search}
						onChange={(e) => updateFilter('search', e.target.value)}
						className="w-full"
					/>
				</div>
				<Select
					placeholder="Filter by status"
					options={statusOptions}
					value={filters.status}
					onChange={(value) => updateFilter('status', value)}
				/>
				<Select
					placeholder="Sort orders"
					options={sortOptions}
					value={filters.sort}
					onChange={(value) => updateFilter('sort', value)}
				/>
			</div>

			{isExpanded && (
				<div className="mt-4 pt-4 border-t border-border">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        {/* Map over date fields */}
						{dateFields.map(({ label, field }) => (
							<div key={field}>
								<label className="block text-sm font-medium text-foreground mb-2">{label}</label>
								<Input
									type="date"
									value={filters.dateRange[field]}
									onChange={(e) => updateDateRange(field, e.target.value)}
								/>
							</div>
						))}

                        {/* Map over amount fields */}
                        {amountFields.map(({ label, field, placeholder }) => (
							<div key={field}>
								<label className="block text-sm font-medium text-foreground mb-2">{label}</label>
								<Input
									type="number"
									placeholder={placeholder}
									value={filters.amountRange[field]}
									onChange={(e) => updateAmountRange(field, e.target.value)}
								/>
							</div>
						))}

					</div>
				</div>
			)}
		</div>
	);
};

export default OrderFilters;