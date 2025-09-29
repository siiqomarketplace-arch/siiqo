import React, { useState } from 'react';
import Icon, { type LucideIconName } from '@/components/AppIcon';
import Image from '@/components/ui/alt/AppImageAlt';
import Button from '@/components/ui/new/Button';

// --- START OF TYPESCRIPT CONVERSION ---

// interface Product {
//     id: number;
//     name: string;
//     image: string;
//     stock: number;
//     discount?: number;
//     description?: string;
//     rating?: number;
//     reviewCount?: number;
//     price: number;
//     originalPrice?: number;
// }

interface Product {
	id: number;
	name: string;
	description: string;
	price: number;
	image: string;
	stock: number;
	status?: string;
	category?: string;
	originalPrice?: number | null;
	rating?: number;
	reviewCount?: number;
	discount?: number | null;
}

interface ProductGridProps {
    products: Product[];
    onProductClick: (product: Product) => void;
    onAddToCart: (product: Product) => void;
}

// --- END OF TYPESCRIPT CONVERSION ---

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick, onAddToCart }) => {
    const [loadingProduct, setLoadingProduct] = useState<number | string | null>(null);

    const handleAddToCart = async (product: Product): Promise<void> => {
        setLoadingProduct(product.id);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        onAddToCart(product);
        setLoadingProduct(null);
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const getAvailabilityStatus = (stock: number): { text: string; color: string } => {
        if (stock === 0) return { text: 'Out of Stock', color: 'text-error' };
        if (stock <= 5) return { text: 'Low Stock', color: 'text-warning' };
        return { text: 'In Stock', color: 'text-success' };
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <Icon name={'Package' as LucideIconName} size={48} className="text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No Products Available</h3>
                <p className="text-text-secondary">This business hasn't added any products yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => {
                const availability = getAvailabilityStatus(product.stock);

                return (
                    <div
                        key={product.id}
                        className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-card transition-shadow duration-200 cursor-pointer"
                        onClick={() => onProductClick(product)}
                    >
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden">
                            <Image
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Availability Badge */}
                            <div className="absolute top-2 left-2">
                                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium bg-white
                  ${availability.color}
                `}>
                                    {availability.text}
                                </span>
                            </div>

                            {/* Discount Badge */}
                            {product.discount && (
                                <div className="absolute top-2 right-2">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-error text-error-foreground">
                                        {product.discount}% OFF
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="p-3">
                            <h3 className="font-medium text-text-primary mb-1 line-clamp-2 text-sm">
                                {product.name}
                            </h3>

                            {product.description && (
                                <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                                    {product.description}
                                </p>
                            )}

                            {/* Rating */}
                            {product.rating && (
                                <div className="flex items-center space-x-1 mb-2">
                                    <Icon name={'Star' as LucideIconName} size={12} className="text-warning fill-current" />
                                    <span className="text-xs font-medium text-text-primary">
                                        {product.rating}
                                    </span>
                                    <span className="text-xs text-text-secondary">
                                        ({product.reviewCount})
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-text-primary">
                                        {formatPrice(product.price)}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-xs text-text-secondary line-through">
                                            {formatPrice(product.originalPrice)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <Button
                                variant={product.stock === 0 ? 'outline' : 'default'}
                                size="sm"
                                fullWidth
                                disabled={product.stock === 0}
                                loading={loadingProduct === product.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(product);
                                }}
                                iconName={(product.stock === 0 ? 'AlertCircle' : 'Plus') as LucideIconName}
                                iconPosition="left"
                                iconSize={14}
                            >
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProductGrid;