// app/search-results/components/ProductCard.tsx
"use client";

import React, { useMemo } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";

interface ProductCardProps {
  product: any;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  // Determine if it is a product or storefront based on the flag
  const isStorefront = product.isProduct === false;

  // Get location display - prioritize actual location, then coordinates
  const locationDisplay = useMemo(() => {
    // If location is provided, use it
    if (product.location) {
      return product.location;
    }

    // If we have coordinates, show them in a readable format
    if (product.coordinates?.lat && product.coordinates?.lng) {
      const lat = product.coordinates.lat;
      const lng = product.coordinates.lng;
      return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
    }

    // Fallback to seller/business name
    return product.seller || product.location || "Unknown";
  }, [product.location, product.coordinates, product.seller]);

  return (
    <div
      onClick={onClick}
      className="group relative flex items-center p-3 mb-3 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm hover:shadow-xl hover:bg-white/60 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-inner bg-slate-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="96px"
        />
        {product.isVerified && (
          <div className="absolute bottom-1 left-1 bg-[#1B3F61]/90 backdrop-blur text-white p-0.5 rounded-full z-10">
            <Icon name="CheckCircle" size={10} />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 ml-4 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-slate-800 text-sm truncate pr-2">
            {product.name}
          </h3>

          {/* Only show Price for Products */}
          {!isStorefront && product.price !== undefined && (
            <div className="flex flex-col items-end">
              <span className="font-bold text-slate-900 text-sm">
                ₦{product.price?.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[10px] text-slate-500 line-through">
                  ₦{product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Show 'Visit' for Storefront */}
          {isStorefront && (
            <div className="flex items-center text-[#1B3F61] bg-[#1B3F61]/10 px-2 py-0.5 rounded-full border border-[#1B3F61]/20">
              <span className="text-[10px] font-semibold">Visit</span>
              <Icon name="ChevronRight" size={10} className="ml-0.5" />
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center space-x-2">
          {/* <div className="flex items-center bg-yellow-100/50 px-1.5 py-0.5 rounded-md border border-yellow-100/50">
                        <Icon name="Star" size={10} className="text-[#DE941D] fill-current" />
                        <span className="text-[10px] font-bold text-slate-700 ml-1">
                            {product.rating}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                            ({product.reviewCount})
                        </span>
                    </div> */}
          <span className="text-[10px] text-slate-500 truncate">
            • {product.distance} mi •{" "}
            {isStorefront ? product.availability : product.condition}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center text-slate-500">
            <Icon
              name={isStorefront ? "MapPin" : "Store"}
              size={12}
              className="mr-1 opacity-70"
            />
            <span
              className="text-[10px] truncate max-w-[120px]"
              title={locationDisplay}
            >
              {locationDisplay}
            </span>
          </div>

          {/* Decorative Map Link Indicator */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-0.5 w-4 bg-gradient-to-r from-transparent to-[#1B3F61] rounded-full" />
            <Icon name="MapPin" size={10} className="text-[#1B3F61]" />
          </div>
        </div>
      </div>

      {/* Decorative shine effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
    </div>
  );
};

export default ProductCard;
