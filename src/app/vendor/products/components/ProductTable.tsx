import React, { useState, JSX } from 'react';
import Input from '@/components/ui/new/Input';
import Icon from '@/components/AppIcon';
import Image from '@/components/ui/alt/AppImageAlt';
import Button from '@/components/ui/new/Button';
import { Checkbox } from '@/components/ui/new/Checkbox';

// Type definitions

interface Product {
	id: any;
	name: string;
	sku: string;
	image: string;
	category: string;
	price: number;
	stock: number;
	status: 'active' | 'draft' | 'out-of-stock' | 'inactive';
	createdAt: string;
}

interface ProductTableProps {
	products: Product[];
	selectedProducts: string[] | any;
	onProductSelect: (productId: string, selected: boolean) => void;
	onSelectAll: (selected: boolean) => void;
	onEditProduct: (productId: string) => void;
	onDuplicateProduct: (productId: string) => void;
	onDeleteProduct: (productId: string) => void;
	onQuickEdit: (productId: string, field: string, value: string | number) => void;
}

interface StatusConfig {
	bg: string;
	text: string;
	label: string;
}

interface StockStatus {
	color: string;
	icon: string;
}

const ProductTable: React.FC<ProductTableProps> = ({
	products,
	selectedProducts,
	onProductSelect,
	onSelectAll,
	onEditProduct,
	onDuplicateProduct,
	onDeleteProduct,
	onQuickEdit
}) => {
	const [editingCell, setEditingCell] = useState<string | null>(null);
	const [editValue, setEditValue] = useState<string>('');

	const handleQuickEdit = (productId: string, field: string, value: string | number): void => {
		setEditingCell(`${productId}-${field}`);
		setEditValue(String(value));
	};

	const saveQuickEdit = (productId: string, field: string): void => {
		const numericValue = field === 'price' || field === 'stock' ? parseFloat(editValue) : editValue;
		onQuickEdit(productId, field, numericValue);
		setEditingCell(null);
		setEditValue('');
	};

	const cancelQuickEdit = (): void => {
		setEditingCell(null);
		setEditValue('');
	};

	const getStatusBadge = (status: Product['status']): JSX.Element => {
		const statusConfig: Record<Product['status'], StatusConfig> = {
			active: { bg: 'bg-success/10', text: 'text-success', label: 'Active' },
			draft: { bg: 'bg-warning/10', text: 'text-warning', label: 'Draft' },
			'out-of-stock': { bg: 'bg-error/10', text: 'text-error', label: 'Out of Stock' },
			inactive: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Inactive' }
		};

		const config = statusConfig[status] || statusConfig.inactive;
		return (
			<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
				{config.label}
			</span>
		);
	};

	const getStockStatus = (stock: number): StockStatus => {
		if (stock === 0) return { color: 'text-error', icon: 'AlertCircle' };
		if (stock <= 10) return { color: 'text-warning', icon: 'AlertTriangle' };
		return { color: 'text-success', icon: 'CheckCircle' };
	};

	return (
		<div className="bg-card border border-border rounded-lg overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-muted/50 border-b border-border">
						<tr>
							<th className="w-12 px-4 py-3">
								<Checkbox
									checked={selectedProducts.length === products.length && products.length > 0}
									onChange={(e) => onSelectAll(e.target.checked)}
								/>
							</th>
							<th className="text-left px-4 py-3 text-sm font-medium text-foreground">Product</th>
							<th className="text-left px-4 py-3 text-sm font-medium text-foreground">Category</th>
							<th className="text-left px-4 py-3 text-sm font-medium text-foreground">Price</th>
							<th className="text-left px-4 py-3 text-sm font-medium text-foreground">Stock</th>
							<th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
							<th className="text-left px-4 py-3 text-sm font-medium text-foreground">Created</th>
							<th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{products.map((product) => {
							const stockStatus = getStockStatus(product.stock);
							return (
								<tr key={product.id} className="hover:bg-muted/30 transition-smooth">
									<td className="px-4 py-4">
										<Checkbox
											checked={selectedProducts.includes(product.id)}
											onChange={(e) => onProductSelect(product.id, e.target.checked)}
										/>
									</td>

									<td className="px-4 py-4">
										<div className="flex items-center space-x-3">
											<div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
												<Image
													src={product.image}
													alt={product.name}
													className="w-full h-full object-cover"
												/>
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium text-foreground truncate">
													{product.name}
												</p>
												<p className="text-xs text-muted-foreground truncate">
													SKU: {product.sku}
												</p>
											</div>
										</div>
									</td>

									<td className="px-4 py-4">
										<span className="text-sm text-muted-foreground">{product.category}</span>
									</td>

									<td className="px-4 py-4">
										{editingCell === `${product.id}-price` ? (
											<div className="flex items-center space-x-2">
												<Input
													type="number"
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													className="w-20"
													step="0.01"
												/>
												<button
													onClick={() => saveQuickEdit(product.id, 'price')}
													className="text-success hover:text-success/80"
												>
													<Icon name="Check" size={16} />
												</button>
												<button
													onClick={cancelQuickEdit}
													className="text-error hover:text-error/80"
												>
													<Icon name="X" size={16} />
												</button>
											</div>
										) : (
											<button
												onClick={() => handleQuickEdit(product.id, 'price', product.price)}
												className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
											>
												${product.price}
											</button>
										)}
									</td>

									<td className="px-4 py-4">
										<div className="flex items-center space-x-2">
											<Icon name={stockStatus.icon} size={16} className={stockStatus.color} />
											{editingCell === `${product.id}-stock` ? (
												<div className="flex items-center space-x-2">
													<Input
														type="number"
														value={editValue}
														onChange={(e) => setEditValue(e.target.value)}
														className="w-16"
														min="0"
													/>
													<button
														onClick={() => saveQuickEdit(product.id, 'stock')}
														className="text-success hover:text-success/80"
													>
														<Icon name="Check" size={16} />
													</button>
													<button
														onClick={cancelQuickEdit}
														className="text-error hover:text-error/80"
													>
														<Icon name="X" size={16} />
													</button>
												</div>
											) : (
												<button
													onClick={() => handleQuickEdit(product.id, 'stock', product.stock)}
													className={`text-sm font-medium transition-smooth ${stockStatus.color} hover:opacity-80`}
												>
													{product.stock}
												</button>
											)}
										</div>
									</td>

									<td className="px-4 py-4">
										{getStatusBadge(product.status)}
									</td>

									<td className="px-4 py-4">
										<span className="text-sm text-muted-foreground">
											{new Date(product.createdAt).toLocaleDateString()}
										</span>
									</td>

									<td className="px-4 py-4">
										<div className="flex items-center justify-end space-x-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => onEditProduct(product.id)}
												iconName="Edit"
											/>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => onDuplicateProduct(product.id)}
												iconName="Copy"
											/>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => onDeleteProduct(product.id)}
												iconName="Trash2"
											/>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{products.length === 0 && (
				<div className="text-center py-12">
					<Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
					<p className="text-muted-foreground mb-4">
						Get started by adding your first product to the catalog.
					</p>
					<Button variant="default" iconName="Plus" iconPosition="left">
						Add New Product
					</Button>
				</div>
			)}
		</div>
	);
};

export default ProductTable;