import React, { useState } from "react";
import Icon, { type LucideIconName } from "@/components/AppIcon";
import Image from "@/components/ui/alt/AppImageAlt";

interface Product {
  id: number;
  name: string;
  price: number;
  images?: string[];
  rating?: number;
}

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
}) => {

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <Icon
          name={"Package" as LucideIconName}
          size={48}
          className="mx-auto mb-4 text-text-secondary"
        />
        <h3 className="mb-2 text-lg font-medium text-text-primary">
          No Products Available
        </h3>
        <p className="text-text-secondary">
          This business hasn't added any products yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {products.map(product => {
        return (
          <div
            key={product.id}
            className="overflow-hidden transition-shadow duration-200 bg-white border rounded-lg cursor-pointer border-border hover:shadow-card"
          >
            {/* Product Image */}
            <Image
              src={product.images?.[0] || "https://via.placeholder.com/300"}
              alt={product.name}
              className="object-cover w-full h-48 transition-transform duration-200 sm:h-56 lg:h-48 hover:scale-105"
            />

            {/* Product Info */}
            <div className="p-3">
              <h3 className="mb-1 text-sm font-medium text-text-primary line-clamp-2">
                {product.name}
              </h3>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center mb-2 space-x-1">
                  <Icon
                    name={"Star" as LucideIconName}
                    size={12}
                    className="text-orange-500 fill-current"
                  />
                  <span className="text-xs font-medium text-text-primary">
                    {product.rating}
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-text-primary">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
