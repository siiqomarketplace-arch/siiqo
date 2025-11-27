import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/new/Button';
import Input from '@/components/ui/new/Input';
import Select from '@/components/ui/new/NewSelect';
import { ViewMode, BulkAction } from "@/types/vendor/products";

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "stock-asc"
  | "stock-desc"
  | "created-desc"
  | "created-asc";

export interface ProductToolbarProps {
  onAddProduct: () => void;
  onBulkAction: (action: BulkAction, selectedProducts: number[]) => void;
  onViewToggle: (mode: ViewMode) => void;
  viewMode: ViewMode;
  selectedProducts: number[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface SelectOption<T> {
  value: T;
  label: string;
}

const ProductToolbar: React.FC<ProductToolbarProps> = ({
	onAddProduct,
	onBulkAction,
	onViewToggle,
	viewMode,
	selectedProducts,
	searchQuery,
	onSearchChange
}) => {
	const [showBulkActions, setShowBulkActions] = useState(false);

	const bulkActionOptions: SelectOption<BulkAction>[] = [
		{ value: 'activate', label: 'Activate Selected' },
		{ value: 'deactivate', label: 'Deactivate Selected' },
		{ value: 'duplicate', label: 'Duplicate Selected' },
		{ value: 'delete', label: 'Delete Selected' },
		{ value: 'export', label: 'Export Selected' }
	];

	const sortOptions: SelectOption<SortOption>[] = [
		{ value: 'name-asc', label: 'Name (A-Z)' },
		{ value: 'name-desc', label: 'Name (Z-A)' },
		{ value: 'price-asc', label: 'Price (Low to High)' },
		{ value: 'price-desc', label: 'Price (High to Low)' },
		{ value: 'stock-asc', label: 'Stock (Low to High)' },		
		{ value: 'stock-desc', label: 'Stock (High to Low)' },
		{ value: 'created-desc', label: 'Newest First' },
		{ value: 'created-asc', label: 'Oldest First' }
	];

	const handleBulkAction = (action: BulkAction) => {
		onBulkAction(action, selectedProducts);
		setShowBulkActions(false);
	};

	return (
		<div className="bg-card border border-border rounded-lg p-4 mb-6">
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
				{/* Left Section - Bulk Actions & Add Product */}
				<div className="flex items-center space-x-3">
					{selectedProducts.length > 0 && (
						<div className="relative">
							<Button
								variant="outline"
								onClick={() => setShowBulkActions(!showBulkActions)}
								iconName="ChevronDown"
								iconPosition="right"
							>
								Bulk Actions ({selectedProducts.length})
							</Button>

							{showBulkActions && (
								<div className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-dropdown z-50">
									<div className="py-1">
										{bulkActionOptions.map((option) => (
											<button
												key={option.value}
												onClick={() => handleBulkAction(option.value)}
												className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
											>
												{option.label}
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					)}

					<Button
						variant="default"
						onClick={onAddProduct}
						iconName="Plus"
						iconPosition="left"
					>
						Add New Product
					</Button>

					<Button
						variant="outline"
						iconName="Upload"
						iconPosition="left"
					>
						Bulk Import
					</Button>
				</div>

				{/* Right Section - Search, Sort & View Toggle */}
				<div className="flex items-center space-x-3">
					<div className="w-64">
						<Input
							type="search"
							placeholder="Search products..."
							value={searchQuery}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
							className="w-full"
						/>
					</div>

					<div className="w-48">
						<Select
							options={sortOptions}
							value="created-desc"
							onChange={() => { }} // Assuming Select component handles this
							placeholder="Sort by..."
						/>
					</div>

					<div className="flex items-center bg-muted rounded-lg p-1">
						<button
							onClick={() => onViewToggle('table')}
							className={`p-2 rounded-md transition-smooth ${viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
								}`}
						>
							<Icon name="Table" size={18} />
						</button>
						<button
							onClick={() => onViewToggle('grid')}
							className={`p-2 rounded-md transition-smooth ${viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
								}`}
						>
							<Icon name="Grid3X3" size={18} />
						</button>
					</div>
				</div>
			</div>

			{/* Filter Tags */}
			<div className="flex items-center space-x-2 mt-4">
				<span className="text-sm text-muted-foreground">Active filters:</span>
				<div className="flex items-center space-x-2">
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
						Electronics
						<button className="ml-1 hover:text-primary/80">
							<Icon name="X" size={12} />
						</button>
					</span>
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success/10 text-success">
						In Stock
						<button className="ml-1 hover:text-success/80">
							<Icon name="X" size={12} />
						</button>
					</span>
					<button className="text-xs text-primary hover:text-primary/80 transition-smooth">
						Clear all filters
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProductToolbar;