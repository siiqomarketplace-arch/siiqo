import React from 'react';
import { useRouter } from 'next/navigation'
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/alt/ButtonAlt';
import AppImage from '@/components/ui/alt/AppImageAlt';

interface Product {
	id: string;
	name: string;
	image: string;
	orders: number;
	revenue: number;
	rating: number;
}

interface ProductOverviewProps {
	products: Product[];
}

const ProductOverview: React.FC<ProductOverviewProps> = ({ products }) => {
	const router = useRouter();

	if (!products || products.length === 0) {
		return (
			<div className="bg-card rounded-lg border border-border p-6">
				<h2 className="font-heading font-semibold text-lg text-text-primary mb-6">
					Top Products
				</h2>
				<div className="text-center py-8">
					<Icon name="Package" size={48} className="text-text-muted mx-auto mb-4" />
					<p className="text-text-muted">No products yet</p>
					<p className="text-sm text-text-muted mt-1 mb-4">
						Add your first product to get started
					</p>
					<Button
						variant="primary"
						size="sm"
						onClick={() => router.push('../products')}
					>
						<Icon name="Plus" size={16} className="mr-2" />
						Add Product
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-card rounded-lg border border-border p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="font-heading font-semibold text-lg text-text-primary">
					Top Products
				</h2>
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.push('../products')}
				>
					View All
				</Button>
			</div>

			<div className="space-y-4">
				{products.map((product, index) => (
					<div
						key={product.id}
						className="flex items-center space-x-4 p-3 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
						onClick={() => router.push(`../products/`)}
					>
						<div className="relative">
							<AppImage
								src={product.image}
								alt={product.name}
								className="w-12 h-12 rounded-lg object-cover"
							/>
							<div className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-semibold">
								{index + 1}
							</div>
						</div>

						<div className="flex-1 min-w-0">
							<p className="font-medium text-text-primary truncate">
								{product.name}
							</p>
							<div className="flex items-center space-x-3 mt-1">
								<span className="text-sm text-text-muted">
									{product.orders} orders
								</span>
								<span className="text-sm font-medium text-success">
									${product.revenue.toFixed(2)}
								</span>
							</div>
						</div>

						<div className="text-right">
							<div className="flex items-center space-x-1">
								<Icon name="Star" size={14} className="text-warning fill-current" />
								<span className="text-sm font-medium text-text-primary">
									{product.rating}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Add Product Button */}
			<div className="mt-6 pt-4 border-t border-border">
				<Button
					variant="outline"
					className="w-full"
					onClick={() => router.push('../products')}
				>
					<Icon name="Plus" size={16} className="mr-2" />
					Add New Product
				</Button>
			</div>
		</div>
	);
};

export default ProductOverview;