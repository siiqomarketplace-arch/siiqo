import React, { JSX } from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/ui/AppImage';
import Button from '@/components/ui/new/Button';
import { Checkbox } from '@/components/ui/new/Checkbox';

import { Product, ProductStatus } from '@/types/vendor/products';

interface StatusConfig {
    bg: string;
    text: string;
    label: string;
}

interface StockStatusConfig {
    color: string;
    icon: string;
}

interface ProductGridProps {
    products: Product[];
    selectedProducts: number[];
    onProductSelect: (productId: string | number, selected: boolean) => void;
    onEditProduct: (productId: any) => void;
    onDuplicateProduct: (productId: string | number) => void;
    onDeleteProduct: (productId: string | number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
    products,
    selectedProducts,
    onProductSelect,
    onEditProduct,
    onDuplicateProduct,
    onDeleteProduct
}) => {
    const getStatusBadge = (status: ProductStatus): JSX.Element => {
        const statusConfig: Record<ProductStatus, StatusConfig> = {
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

    const getStockStatus = (stock: number): StockStatusConfig => {
        if (stock === 0) return { color: 'text-error', icon: 'AlertCircle' };
        if (stock <= 10) return { color: 'text-warning', icon: 'AlertTriangle' };
        return { color: 'text-success', icon: 'CheckCircle' };
    };

    if (products.length === 0) {
        return (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                    Get started by adding your first product to the catalog.
                </p>
                <Button variant="default" iconName="Plus" iconPosition="left">
                    Add New Product
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                    <div key={product.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-card transition-smooth">
                        {/* Product Image */}
                        <div className="relative">
                            <div className="aspect-square bg-muted overflow-hidden">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Checkbox Overlay */}
                            <div className="absolute top-3 left-3">
                                <div className="bg-background/80 backdrop-blur-sm rounded-md p-1">
                                    <Checkbox
                                        checked={selectedProducts.includes(Number(product.id))}
                                        onChange={(e) => onProductSelect(product.id, e.target.checked)}
                                    />
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                                {getStatusBadge(product.status)}
                            </div>

                            {/* Quick Actions Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-smooth flex items-center justify-center space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onEditProduct(product.id)}
                                    iconName="Edit"
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onDuplicateProduct(product.id)}
                                    iconName="Copy"
                                />
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDeleteProduct(product.id)}
                                    iconName="Trash2"
                                />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                            <div className="mb-2">
                                <h3 className="font-medium text-foreground truncate" title={product.name}>
                                    {product.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                            </div>

                            <div className="mb-3">
                                <span className="text-xs text-muted-foreground">{product.category}</span>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <span className="text-lg font-semibold text-foreground">
                                    ${product.price}
                                </span>
                                <div className="flex items-center space-x-1">
                                    <Icon name={stockStatus.icon} size={14} className={stockStatus.color} />
                                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                                        {product.stock}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Created {new Date(product.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center space-x-1">
                                    <Icon name="Eye" size={12} />
                                    <span>{product.views || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="px-4 pb-4">
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    fullWidth
                                    onClick={() => onEditProduct(product.id)}
                                    iconName="Edit"
                                    iconPosition="left"
                                >
                                    Edit
                                </Button>
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
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProductGrid;