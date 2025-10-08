import React, { useState } from 'react';
import Icon from '@/components/AppIcon';

interface Category {
	id: string;
	name: string;
	count: number;
	children: Category[];
}

interface CategoryTreeProps {
	onCategorySelect: (id: string | null) => void;
	selectedCategory: string | null;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({ onCategorySelect, selectedCategory }) => {
	const [expandedCategories, setExpandedCategories] = useState<string[]>(['electronics', 'clothing']);

	const categories: Category[] = [
		{
			id: 'electronics',
			name: 'Electronics',
			count: 45,
			children: [
				{ id: 'smartphones', name: 'Smartphones', count: 12, children: [] },
				{ id: 'laptops', name: 'Laptops', count: 8, children: [] },
				{ id: 'accessories', name: 'Accessories', count: 25, children: [] }
			]
		},
		{
			id: 'clothing',
			name: 'Clothing',
			count: 32,
			children: [
				{ id: 'mens', name: "Men's Wear", count: 18, children: [] },
				{ id: 'womens', name: "Women's Wear", count: 14, children: [] }
			]
		},
		{
			id: 'home',
			name: 'Home & Garden',
			count: 28,
			children: [
				{ id: 'furniture', name: 'Furniture', count: 15, children: [] },
				{ id: 'decor', name: 'Home Decor', count: 13, children: [] }
			]
		},
		{
			id: 'books',
			name: 'Books',
			count: 19,
			children: []
		}
	];

	const toggleCategory = (categoryId: string) => {
		setExpandedCategories(prev =>
			prev.includes(categoryId)
				? prev.filter(id => id !== categoryId)
				: [...prev, categoryId]
		);
	};

	const handleCategoryClick = (categoryId: string | null) => {
		onCategorySelect(categoryId);
	};

	return (
		<div className="bg-card border border-border rounded-lg p-4 h-fit">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-semibold text-foreground">Categories</h3>
				<button
					onClick={() => onCategorySelect(null)}
					className="text-xs text-primary hover:text-primary/80 transition-smooth"
				>
					Clear Filter
				</button>
			</div>

			<div className="space-y-1">
				<button
					onClick={() => handleCategoryClick(null)}
					className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-smooth ${selectedCategory === null
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:text-foreground hover:bg-muted'
						}`}
				>
					<span>All Products</span>
					<span className="text-xs">124</span>
				</button>

				{categories.map((category) => (
					<div key={category.id}>
						<button
							onClick={() => toggleCategory(category.id)}
							className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-smooth ${selectedCategory === category.id
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:text-foreground hover:bg-muted'
								}`}
						>
							<div className="flex items-center space-x-2">
								{category.children.length > 0 && (
									<Icon
										name={expandedCategories.includes(category.id) ? "ChevronDown" : "ChevronRight"}
										size={14}
									/>
								)}
								<span onClick={(e) => {
									e.stopPropagation();
									handleCategoryClick(category.id);
								}}>
									{category.name}
								</span>
							</div>
							<span className="text-xs">{category.count}</span>
						</button>

						{expandedCategories.includes(category.id) && category.children.length > 0 && (
							<div className="ml-4 mt-1 space-y-1">
								{category.children.map((child) => (
									<button
										key={child.id}
										onClick={() => handleCategoryClick(child.id)}
										className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-smooth ${selectedCategory === child.id
												? 'bg-primary text-primary-foreground'
												: 'text-muted-foreground hover:text-foreground hover:bg-muted'
											}`}
									>
										<span>{child.name}</span>
										<span className="text-xs">{child.count}</span>
									</button>
								))}
							</div>
						)}
					</div>
				))}
			</div>

			<div className="mt-6 pt-4 border-t border-border">
				<h4 className="font-medium text-foreground mb-3">Quick Filters</h4>
				<div className="space-y-2">
					<button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-smooth">
						Low Stock (8)
					</button>
					<button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-smooth">
						Out of Stock (3)
					</button>
					<button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-smooth">
						Draft Products (5)
					</button>
					<button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-smooth">
						Recently Added (12)
					</button>
				</div>
			</div>
		</div>
	);
};

export default CategoryTree;
