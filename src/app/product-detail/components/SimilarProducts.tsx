"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";

interface SimilarProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  distance: number;
  rating: number;
  condition: string;
}

interface SimilarProductsProps {
  products: SimilarProduct[];
  onProductClick: (productId: string) => void;
  isMobile?: boolean;
}

const SimilarProducts = ({
  products,
  onProductClick,
  isMobile = false,
}: SimilarProductsProps) => {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold font-heading text-text-primary">
          Similar Products Nearby
        </h3>
        <button className="transition-colors duration-200 text-primary hover:text-primary-700">
          <span className="text-sm font-medium" >
          <Link href='/marketplace'  > View All </Link>
             </span>
        </button>
      </div>

      <div
        className={`${isMobile ? "overflow-x-auto" : "grid grid-cols-1 gap-4"}`}
      >
        <div className={`${isMobile ? "flex space-x-4 pb-4" : "contents"}`}>
          {products.map(product => (
            <div
              key={product.id}
              onClick={() => onProductClick(product.id)}
              className={`${
                isMobile ? "flex-shrink-0 w-64" : ""
              } bg-surface border border-border rounded-lg overflow-hidden cursor-pointer hover:shadow-elevation-2 transition-all duration-200 group`}
            >
              {/* Product Image */}
              <div className="relative overflow-hidden aspect-square bg-surface-secondary">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill // Add the fill prop
                  // Keep object-cover and transformation classes, remove w-full h-full
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  // Add sizes prop. This is critical for grid/responsive layouts.
                  // Based on w-64 for mobile, and grid-cols-3 for desktop:
                  sizes={`
                            ${
                              isMobile ? "256px" : ""
                            } // If isMobile, it's 256px fixed
                            (max-width: 768px) 100vw, // Fallback if isMobile is false but small screen
                            (max-width: 1200px) 33vw, // Roughly 1/3 viewport width for 3-col grid
                            300px // A max width for very large screens or fixed column width
                        `}
                />
              </div>
              {/* Product Info */}
              <div className="p-4">
                <h4 className="mb-2 font-medium transition-colors duration-200 text-text-primary line-clamp-2 group-hover:text-primary">
                  {product.title}
                </h4>

                {/* Price */}
                <div className="flex items-center mb-2 space-x-2">
                  <span className="text-lg font-semibold text-text-primary">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm line-through text-text-secondary">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Rating and Distance */}
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <div className="flex items-center space-x-1">
                    <Icon
                      name="Star"
                      size={12}
                      className="text-yellow-500 fill-current"
                    />
                    <span>{product.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={12} className="text-primary" />
                    <span>{product.distance} {" "}miles</span>
                  </div>
                </div>

                {/* Condition */}
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-surface-secondary text-text-secondary">
                    {product.condition}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Show More Button for Mobile */}
      {isMobile && (
        <button className="w-full py-3 transition-all duration-200 border rounded-lg border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary">
          <span className="text-sm font-medium">
            Show More Similar Products
          </span>
        </button>
      )}
    </div>
  );
};

export default SimilarProducts;
