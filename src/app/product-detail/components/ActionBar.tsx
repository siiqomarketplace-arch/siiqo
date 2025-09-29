"use client";

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Product {
    price: number;
    originalPrice?: number;
}

interface ActionBarProps {
    product: Product;
    cartQuantity: number;
    onAddToCart: () => void;
    onBuyNow: () => void;
    onWishlistToggle: () => void;
    isWishlisted: boolean;
}

const ActionBar = ({
    product,
    cartQuantity,
    onAddToCart,
    onBuyNow,
    onWishlistToggle,
    isWishlisted
}: ActionBarProps) => {
    return (
        <div className="fixed bottom-16 left-0 right-0 z-100 bg-white border-t border-border p-4 safe-area-inset-bottom">
            <div className="flex items-center space-x-3">
                {/* Wishlist Button */}
                <button
                    onClick={onWishlistToggle}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${isWishlisted
                        ? 'border-accent bg-accent-50 text-accent'
                        : 'border-border text-text-secondary hover:border-border-dark hover:text-text-primary'
                        }`}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Icon
                        name="Heart"
                        size={20}
                        className={isWishlisted ? 'fill-current' : ''}
                    />
                </button>

                {/* Add to Cart Button */}
                <button
                    onClick={onAddToCart}
                    className="flex-1 bg-surface-secondary border-2 border-primary text-primary py-3 px-4 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                    <Icon name="ShoppingCart" size={18} />
                    <span>Add to Cart</span>
                    {cartQuantity > 0 && (
                        <span className="bg-primary text-white px-2 py-0.5 rounded-full text-xs font-medium">
                            {cartQuantity}
                        </span>
                    )}
                </button>

                {/* Buy Now Button */}
                <button
                    onClick={onBuyNow}
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                    <Icon name="CreditCard" size={18} />
                    <span>Buy Now</span>
                </button>
            </div>

            {/* Price Display */}
            <div className="flex items-center justify-center mt-3 pt-3 border-t border-border-light">
                <div className="text-center">
                    <p className="text-2xl font-bold text-text-primary">${product.price}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-sm text-text-secondary">
                            <span className="line-through">${product.originalPrice}</span>
                            <span className="text-secondary ml-2">
                                Save ${product.originalPrice - product.price}
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActionBar;