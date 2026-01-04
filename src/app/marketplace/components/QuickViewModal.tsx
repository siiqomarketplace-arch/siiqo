// src/app/marketplace/components/QuickViewModal.tsx
import React, { useState, useEffect, JSX } from 'react';
import Image from '@/components/ui/alt/AppImageAlt';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/new/Button';

// Define the shape of a product variant
interface ProductVariant {
    id: number ;
    name: string;
}

interface ProductDetails {
    id: number ;
    name: string;
    image: string; // Main fallback image
    images?: string[];
    vendor: string;
    rating: number;
    reviewCount: number;
    price: number;
    originalPrice?: any;
    salePrice?: number;
    description: string;
    variants?: ProductVariant[];
    stock: number;
    isWishlisted?: boolean;
    category: string; // Optional category field
}

// Define the payload for adding a product to the cart
interface AddToCartPayload extends ProductDetails {
    quantity: number;
    selectedVariant: ProductVariant | null;
}

// Define the props for the QuickViewModal component
interface QuickViewModalProps {
    product: ProductDetails | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart?: (payload: AddToCartPayload) => void;
    onAddToWishlist?: (productId: number , isWishlisted: boolean) => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose, onAddToCart, onAddToWishlist }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [isWishlisted, setIsWishlisted] = useState(product?.isWishlisted || false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (product) {
            setSelectedImageIndex(0);
            setQuantity(1);
            setSelectedVariant(null);
            setIsWishlisted(product.isWishlisted || false);
        }
    }, [product]);

    if (!isOpen || !product) return null;

    const images = product.images?.length ? product.images : [product.image];
    const variants = product.variants || [];

    const handleAddToCart = () => {
        onAddToCart?.({
            ...product,
            quantity,
            selectedVariant
        });
        onClose();
    };

    const handleWishlistToggle = () => {
        const newWishlistState = !isWishlisted;
        setIsWishlisted(newWishlistState);
        onAddToWishlist?.(product.id, newWishlistState);
    };

    const renderStars = (rating: number): JSX.Element[] => {
        const stars: JSX.Element[] = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Icon key={i} name="Star" size={16} className="fill-current text-warning" />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <Icon key="half" name="Star" size={16} className="opacity-50 fill-current text-warning" />
            );
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Icon key={`empty-${i}`} name="Star" size={16} className="text-muted-foreground" />
            );
        }
        return stars;
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-1400">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-xl shadow-modal max-w-4xl w-full max-h-[75vh] overflow-auto">
                <button
                    onClick={onClose}
                    className="absolute z-10 flex items-center justify-center w-8 h-8 transition-colors duration-200 rounded-full top-4 right-4 bg-white/90 backdrop-blur-sm shadow-card hover:bg-white"
                >
                    <Icon name="X" size={16} />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[90vh]">
                    {/* Image Section */}
                    <div className="relative bg-muted">
                        <div className="relative overflow-hidden aspect-square lg:h-full lg:aspect-auto">
                            <Image
                                src={images[selectedImageIndex]}
                                alt={product.name}
                                className="object-cover w-full h-full"
                            />

                            {/* Image Navigation */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImageIndex(prev =>
                                            prev === 0 ? images.length - 1 : prev - 1
                                        )}
                                        className="absolute flex items-center justify-center w-8 h-8 transition-colors duration-200 -translate-y-1/2 rounded-full left-2 top-1/2 bg-white/90 backdrop-blur-sm shadow-card hover:bg-white"
                                    >
                                        <Icon name="ChevronLeft" size={16} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImageIndex(prev =>
                                            prev === images.length - 1 ? 0 : prev + 1
                                        )}
                                        className="absolute flex items-center justify-center w-8 h-8 transition-colors duration-200 -translate-y-1/2 rounded-full right-2 top-1/2 bg-white/90 backdrop-blur-sm shadow-card hover:bg-white"
                                    >
                                        <Icon name="ChevronRight" size={16} />
                                    </button>
                                </>
                            )}

                            {/* Sale Badge */}
                            {product.salePrice && (
                                <div className="absolute px-3 py-1 text-sm font-medium rounded-md top-4 left-4 bg-error text-error-foreground">
                                    {Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)}% OFF
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Navigation */}
                        {images.length > 1 && (
                            <div className="absolute flex space-x-2 -translate-x-1/2 bottom-4 left-1/2">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col h-full max-h-[90vh] lg:max-h-none">
                        <div className="flex-1 p-6 overflow-y-auto">
                            {/* Vendor */}
                            <p className="mb-2 text-sm text-muted-foreground">{product.vendor}</p>

                            {/* Product Name */}
                            <h1 className="mb-4 text-2xl font-bold text-foreground">{product.name}</h1>

                            {/* Rating */}
                            <div className="flex items-center mb-4 space-x-2">
                                <div className="flex items-center space-x-0.5">
                                    {renderStars(product.rating)}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    ({product.reviewCount} reviews)
                                </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center mb-6 space-x-3">
                                <span className="text-3xl font-bold text-foreground">
                                    ${product.salePrice || product.price}
                                </span>
                                {product.salePrice && (
                                    <span className="text-xl line-through text-muted-foreground">
                                        ${product.originalPrice}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="mb-2 font-semibold text-foreground">Description</h3>
                                <p className="leading-relaxed text-muted-foreground">
                                    {product.description || `Experience the perfect blend of style and functionality with ${product.name}. Crafted with attention to detail and designed for modern living, this product offers exceptional quality and performance that exceeds expectations.`}
                                </p>
                            </div>

                            {/* Variants */}
                            {variants.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="mb-3 font-semibold text-foreground">Options</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {variants.map((variant) => (
                                            <button
                                                key={variant.id}
                                                onClick={() => setSelectedVariant(variant)}
                                                className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${selectedVariant?.id === variant.id
                                                    ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                {variant.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stock Status */}
                            <div className="mb-6">
                                {product.stock > 0 ? (
                                    <div className="flex items-center space-x-2 text-success">
                                        <Icon name="CheckCircle" size={16} />
                                        <span className="text-sm font-medium">
                                            {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2 text-error">
                                        <Icon name="XCircle" size={16} />
                                        <span className="text-sm font-medium">Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            <div className="mb-6">
                                <h3 className="mb-3 font-semibold text-foreground">Features</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Icon name="Truck" size={14} />
                                        <span>Free shipping on orders over $50</span>
                                    </li>
                                    <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Icon name="RotateCcw" size={14} />
                                        <span>30-day return policy</span>
                                    </li>
                                    <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Icon name="Shield" size={14} />
                                        <span>1-year warranty included</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-border">
                            {/* Quantity Selector */}
                            <div className="flex items-center mb-4 space-x-4">
                                <span className="text-sm font-medium text-foreground">Quantity:</span>
                                <div className="flex items-center border rounded-lg border-border">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="flex items-center justify-center w-10 h-10 transition-colors duration-200 hover:bg-muted"
                                    >
                                        <Icon name="Minus" size={16} />
                                    </button>
                                    <span className="w-12 font-medium text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="flex items-center justify-center w-10 h-10 transition-colors duration-200 hover:bg-muted"
                                    >
                                        <Icon name="Plus" size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <Button
                                    variant="default"
                                    fullWidth
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    iconName="ShoppingCart"
                                    iconPosition="left"
                                >
                                    Add to Cart
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleWishlistToggle}
                                >
                                    <Icon
                                        name="Heart"
                                        size={20}
                                        className={isWishlisted ? 'text-error fill-current' : 'text-muted-foreground'}
                                    />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
