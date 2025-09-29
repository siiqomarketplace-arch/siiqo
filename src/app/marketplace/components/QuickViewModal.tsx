import React, { useState, useEffect, JSX } from 'react';
import Image from '@/components/ui/alt/AppImageAlt';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/new/Button';

// --- START OF TYPESCRIPT CONVERSION ---

// Define the shape of a product variant
interface ProductVariant {
    id: number | string;
    name: string;
    // Add other variant properties like price, stock if they exist
}

// Define the detailed shape of the product for the modal
interface ProductDetails {
    id: number | string;
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
    onAddToWishlist?: (productId: number | string, isWishlisted: boolean) => void;
}

// --- END OF TYPESCRIPT CONVERSION ---

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
                <Icon key={i} name="Star" size={16} className="text-warning fill-current" />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <Icon key="half" name="Star" size={16} className="text-warning fill-current opacity-50" />
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
        <div className="fixed inset-0 z-1400 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card rounded-xl shadow-modal max-w-4xl w-full max-h-[75vh] overflow-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-card hover:bg-white transition-colors duration-200"
                >
                    <Icon name="X" size={16} />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[90vh]">
                    {/* Image Section */}
                    <div className="relative bg-muted">
                        <div className="aspect-square lg:h-full lg:aspect-auto relative overflow-hidden">
                            <Image
                                src={images[selectedImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Image Navigation */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImageIndex(prev =>
                                            prev === 0 ? images.length - 1 : prev - 1
                                        )}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-card hover:bg-white transition-colors duration-200"
                                    >
                                        <Icon name="ChevronLeft" size={16} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImageIndex(prev =>
                                            prev === images.length - 1 ? 0 : prev + 1
                                        )}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-card hover:bg-white transition-colors duration-200"
                                    >
                                        <Icon name="ChevronRight" size={16} />
                                    </button>
                                </>
                            )}

                            {/* Sale Badge */}
                            {product.salePrice && (
                                <div className="absolute top-4 left-4 bg-error text-error-foreground px-3 py-1 rounded-md text-sm font-medium">
                                    {Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)}% OFF
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Navigation */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
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
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Vendor */}
                            <p className="text-sm text-muted-foreground mb-2">{product.vendor}</p>

                            {/* Product Name */}
                            <h1 className="text-2xl font-bold text-foreground mb-4">{product.name}</h1>

                            {/* Rating */}
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="flex items-center space-x-0.5">
                                    {renderStars(product.rating)}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    ({product.reviewCount} reviews)
                                </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center space-x-3 mb-6">
                                <span className="text-3xl font-bold text-foreground">
                                    ${product.salePrice || product.price}
                                </span>
                                {product.salePrice && (
                                    <span className="text-xl text-muted-foreground line-through">
                                        ${product.originalPrice}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {product.description || `Experience the perfect blend of style and functionality with ${product.name}. Crafted with attention to detail and designed for modern living, this product offers exceptional quality and performance that exceeds expectations.`}
                                </p>
                            </div>

                            {/* Variants */}
                            {variants.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-foreground mb-3">Options</h3>
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
                                <h3 className="font-semibold text-foreground mb-3">Features</h3>
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
                        <div className="border-t border-border p-6">
                            {/* Quantity Selector */}
                            <div className="flex items-center space-x-4 mb-4">
                                <span className="text-sm font-medium text-foreground">Quantity:</span>
                                <div className="flex items-center border border-border rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors duration-200"
                                    >
                                        <Icon name="Minus" size={16} />
                                    </button>
                                    <span className="w-12 text-center font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors duration-200"
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