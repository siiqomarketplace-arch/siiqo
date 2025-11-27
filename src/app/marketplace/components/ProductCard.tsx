"use client";

import React, { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Product } from "@/types/products";
import Skeleton from "@/components/skeleton";
import Button from "@/components/Button";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToWishlist: (productId: number | string, isWishlisted: boolean) => void;
  cartQuantities: { [key: number]: number };
  isAddingToCart: { [key: number]: boolean };
}

const ProductCard = ({
  product,
  onAddToCart,
  onQuickView,
  onAddToWishlist,
  cartQuantities,
  isAddingToCart,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const cartQuantity = cartQuantities[product.id] || 0;
  const isAdding = isAddingToCart[product.id] || false;

  return (
    <div
      className="z-0 overflow-hidden transition-shadow duration-200 bg-white border border-gray-200 rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        <img
          src={product.images[0]}
          alt={product.product_name}
          className="object-cover w-full h-full"
          loading="lazy"
        />

        <button
          onClick={() => onAddToWishlist(product.id, !product.isWishlisted)}
          className={`absolute z-20 top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            product.isWishlisted
              ? "bg-white text-red-500"
              : "bg-white/80 text-gray-600 hover:bg-white"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${product.isWishlisted ? "fill-current" : ""}`}
          />
        </button>

        {isHovered && (
          <button
            onClick={() => onQuickView(product)}
            className="absolute inset-0 z-10 flex items-center justify-center font-medium text-white transition-opacity duration-200 opacity-0 bg-black/50 hover:opacity-100"
          >
            Quick View
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {product.product_name}
          </h3>
          <p className="text-xs text-gray-500">{product.vendor.business_name}</p>
        </div>

        <div className="flex items-center mb-2 space-x-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₦{product.product_price.toLocaleString()}
            </span>
            {product.salePrice && (
              <span className="text-sm text-gray-500 line-through">
                ₦{product.originalPrice?.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="navy"
          onClick={() => onAddToCart(product)}
          disabled={isAdding}
          className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm transition-colors duration-200 disabled:opacity-50"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>
            {isAdding
              ? "Adding..."
              : `Add to Cart ${cartQuantity > 0 ? `(${cartQuantity})` : ""}`}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;

export const ProductCardSkeleton = () => {
  return (
    <div className="z-0 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
      <Skeleton type="rect" className="w-full aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton type="text" className="w-3/4" />
        <Skeleton type="text" className="w-1/2" />
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} type="circle" width={12} height={12} />
          ))}
        </div>
        <div className="flex space-x-2">
          <Skeleton type="rect" className="w-1/4 h-5" />
          <Skeleton type="rect" className="w-1/6 h-5" />
        </div>
        <Skeleton type="rect" className="w-full h-9" />
      </div>
    </div>
  );
};
