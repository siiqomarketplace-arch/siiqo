import React from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/ui/AppImage';
import Button from '@/components/ui/new/Button';

// --- Start of TypeScript Conversion ---

// Interface for the component's props
interface StockAlertsProps {
	onClose: () => void;
}

// Interface for a single product
interface Product {
	id: number;
	name: string;
	image: string;
	sku: string;
	currentStock: number;
	threshold?: number; // Optional as out-of-stock products don't have it
	category: string;
	price: number;
}

// Interface for the urgency level object
interface Urgency {
	level: 'critical' | 'high' | 'medium' | 'low';
	color: string;
	bg: string;
}

// --- End of TypeScript Conversion ---

const StockAlerts: React.FC<StockAlertsProps> = ({ onClose }) => {
	const lowStockProducts: Product[] = [
		{
			id: 1,
			name: "iPhone 15 Pro Max",
			image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
			sku: "IPH15PM-256",
			currentStock: 3,
			threshold: 10,
			category: "Electronics",
			price: 1199.99
		},
		{
			id: 2,
			name: "Nike Air Max 270",
			image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
			sku: "NAM270-BLK-42",
			currentStock: 5,
			threshold: 15,
			category: "Footwear",
			price: 149.99
		},
		{
			id: 3,
			name: "MacBook Pro 16-inch",
			image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
			sku: "MBP16-M3-512",
			currentStock: 1,
			threshold: 5,
			category: "Electronics",
			price: 2499.99
		}
	];

	const outOfStockProducts: Product[] = [
		{
			id: 4,
			name: "Samsung Galaxy S24 Ultra",
			image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
			sku: "SGS24U-512-TIT",
			currentStock: 0,
			category: "Electronics",
			price: 1299.99
		},
		{
			id: 5,
			name: "Adidas Ultraboost 22",
			image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
			sku: "AUB22-WHT-43",
			currentStock: 0,
			category: "Footwear",
			price: 179.99
		}
	];

	const getUrgencyLevel = (currentStock: number, threshold: number): Urgency => {
		const percentage = (currentStock / threshold) * 100;
		if (currentStock === 0) return { level: 'critical', color: 'text-error', bg: 'bg-error/10' };
		if (percentage <= 30) return { level: 'high', color: 'text-error', bg: 'bg-error/10' };
		if (percentage <= 60) return { level: 'medium', color: 'text-warning', bg: 'bg-warning/10' };
		return { level: 'low', color: 'text-success', bg: 'bg-success/10' };
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1300 p-4">
			<div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-border">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
							<Icon name="AlertTriangle" size={20} className="text-warning" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-foreground">Stock Alerts</h2>
							<p className="text-sm text-muted-foreground">
								{lowStockProducts.length + outOfStockProducts.length} products need attention
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-muted rounded-md transition-smooth"
					>
						<Icon name="X" size={20} />
					</button>
				</div>

				{/* Content */}
				<div className="overflow-y-auto max-h-[calc(90vh-140px)]">
					{/* Out of Stock Section */}
					{outOfStockProducts.length > 0 && (
						<div className="p-6 border-b border-border">
							<div className="flex items-center space-x-2 mb-4">
								<Icon name="AlertCircle" size={20} className="text-error" />
								<h3 className="text-lg font-medium text-foreground">Out of Stock</h3>
								<span className="px-2 py-1 bg-error/10 text-error text-xs rounded-full">
									{outOfStockProducts.length} products
								</span>
							</div>

							<div className="space-y-3">
								{outOfStockProducts.map((product) => (
									<div key={product.id} className="flex items-center space-x-4 p-4 bg-error/5 border border-error/20 rounded-lg">
										<div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
											<Image
												src={product.image}
												alt={product.name}
												className="w-full h-full object-cover"
											/>
										</div>

										<div className="flex-1 min-w-0">
											<h4 className="font-medium text-foreground truncate">{product.name}</h4>
											<p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
											<p className="text-sm text-muted-foreground">{product.category}</p>
										</div>

										<div className="text-right">
											<p className="font-semibold text-foreground">${product.price}</p>
											<p className="text-sm text-error font-medium">Out of Stock</p>
										</div>

										<div className="flex items-center space-x-2">
											<Button variant="outline" size="sm" iconName="Plus">
												Restock
											</Button>
											<Button variant="ghost" size="sm" iconName="Edit" />
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Low Stock Section */}
					{lowStockProducts.length > 0 && (
						<div className="p-6">
							<div className="flex items-center space-x-2 mb-4">
								<Icon name="AlertTriangle" size={20} className="text-warning" />
								<h3 className="text-lg font-medium text-foreground">Low Stock</h3>
								<span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
									{lowStockProducts.length} products
								</span>
							</div>

							<div className="space-y-3">
								{lowStockProducts.map((product) => {
									// Type guard to ensure threshold is defined
									if (typeof product.threshold === 'undefined') return null;

									const urgency = getUrgencyLevel(product.currentStock, product.threshold);
									return (
										<div key={product.id} className="flex items-center space-x-4 p-4 bg-warning/5 border border-warning/20 rounded-lg">
											<div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
												<Image
													src={product.image}
													alt={product.name}
													className="w-full h-full object-cover"
												/>
											</div>

											<div className="flex-1 min-w-0">
												<h4 className="font-medium text-foreground truncate">{product.name}</h4>
												<p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
												<p className="text-sm text-muted-foreground">{product.category}</p>
											</div>

											<div className="text-center">
												<p className="font-semibold text-foreground">${product.price}</p>
												<div className="flex items-center space-x-2 mt-1">
													<span className={`px-2 py-1 rounded-full text-xs font-medium ${urgency.bg} ${urgency.color}`}>
														{product.currentStock} left
													</span>
												</div>
											</div>

											<div className="text-right">
												<p className="text-sm text-muted-foreground">Threshold: {product.threshold}</p>
												<div className="w-24 bg-muted rounded-full h-2 mt-1">
													<div
														className={`h-2 rounded-full ${product.currentStock === 0 ? 'bg-error' :
															product.currentStock <= product.threshold * 0.3 ? 'bg-error' :
																product.currentStock <= product.threshold * 0.6 ? 'bg-warning' : 'bg-success'
															}`}
														style={{ width: `${Math.min((product.currentStock / product.threshold) * 100, 100)}%` }}
													/>
												</div>
											</div>

											<div className="flex items-center space-x-2">
												<Button variant="outline" size="sm" iconName="Plus">
													Restock
												</Button>
												<Button variant="ghost" size="sm" iconName="Edit" />
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Empty State */}
					{lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
						<div className="p-12 text-center">
							<Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
							<h3 className="text-lg font-medium text-foreground mb-2">All Good!</h3>
							<p className="text-muted-foreground">
								All your products are well-stocked. No alerts at this time.
							</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between p-6 border-t border-border">
					<div className="text-sm text-muted-foreground">
						Last updated: {new Date().toLocaleString()}
					</div>
					<div className="flex items-center space-x-3">
						<Button variant="outline" onClick={onClose}>
							Close
						</Button>
						<Button variant="default" iconName="Settings">
							Alert Settings
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StockAlerts;