"use client";

import React, { useState } from "react";
import {
  Heart,
  ShoppingCart,
  Star as StarIcon,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Product } from "@/types/products";
import Skeleton from "@/components/skeleton";
import Button from "@/components/Button";

interface ProductCardProps {
  product: Product & any;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToWishlist: (productId: number , isWishlisted: boolean) => void;
  cartQuantities: { [key: number]: number };
  isAddingToCart: { [key: number]: boolean };
  id?: number | string;
}

const ProductCard = ({
  product,
  id,
  onAddToCart,
  onQuickView,
  onAddToWishlist,
  cartQuantities,
  isAddingToCart,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  /* ----------------------------------------------------------
     ✅ GUARANTEE A VALID PRODUCT
     ---------------------------------------------------------- */
  if (!product) {
    return <ProductCardSkeleton />;
  }

  /* ----------------------------------------------------------
     SAFE PRODUCT ID (Fixes the "reading '1'" TypeError)
     ---------------------------------------------------------- */
  const productId = product?.id ?? id ?? null;

  const isStorefront = product.isProduct === false;

  /* ----------------------------------------------------------
     SAFE CART STATE ACCESS
     ---------------------------------------------------------- */
  const cartQuantity = productId ? cartQuantities[productId] || 0 : 0;
  const isAdding = productId ? isAddingToCart[productId] || false : false;

  /* ----------------------------------------------------------
     CONTENT DETAILS (Names, Image, Vendor...)
     ---------------------------------------------------------- */
  const vendorName =
    product.vendor?.business_name || product.seller || product.storeName || "";

  const title =
    product.product_name || product.name || vendorName || "Untitled";

  const imageSrc =
    (product.images && product.images[0]) ||
    product.image ||
    "https://via.placeholder.com/400";

  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? product.reviews ?? 0;
  const distance = product.distance ?? product.distanceKm ?? null;

  const locationText =
    product.location ||
    vendorName ||
    product.seller ||
    product.vendor?.business_name ||
    "Unknown";

  /* ----------------------------------------------------------
     PRICE HANDLING (Only for true products)
     ---------------------------------------------------------- */
  const formattedPrice =
    typeof product.product_price === "number"
      ? `₦${product.product_price.toLocaleString()}`
      : typeof product.price === "number"
      ? `₦${product.price.toLocaleString()}`
      : null;

  return (
    <div
      className="z-0  overflow-hidden transition-shadow duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ---------------- IMAGE AREA ---------------- */}
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        <img
          src={imageSrc}
          alt={String(title)}
          className={`object-cover w-full h-full transform transition-transform duration-500 ${
            isHovered ? "scale-105" : "scale-100"
          }`}
          loading="lazy"
        />

        {/* Verified Badge */}
        {product.isVerified && (
          <div className="absolute bottom-3 left-3 bg-[#1B3F61]/95 text-white p-1 rounded-full z-20">
            <CheckCircle className="w-3 h-3" />
          </div>
        )}

        {/* Wishlist Button */}
        {productId && (
          <button
            onClick={() =>
              onAddToWishlist(productId, !product.isWishlisted)
            }
            className={`absolute z-20 top-3 right-3 p-2 rounded-full transition-all duration-200 ${
              product.isWishlisted
                ? "bg-white text-red-500"
                : "bg-white/80 text-gray-600 hover:bg-white"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                product.isWishlisted ? "fill-current" : ""
              }`}
            />
          </button>
        )}

        {/* Quick View Overlay */}
        {isHovered && (
          <button
            onClick={() => onQuickView(product)}
            className="absolute inset-0 z-10 flex items-center justify-center font-medium text-white transition-opacity duration-200 opacity-0 bg-black/40 hover:opacity-100"
          >
            Quick View
          </button>
        )}
      </div>

      {/* ---------------- CONTENT AREA ---------------- */}
      <div className="p-4 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
              {title}
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              {isStorefront
                ? vendorName
                : product.vendor?.business_name || product.seller}
            </p>
          </div>

          {/* Price (Products Only) */}
          {!isStorefront && formattedPrice && (
            <div className="flex flex-col items-end">
              <span className="font-bold text-gray-900 text-sm">
                {formattedPrice}
              </span>

              {product.originalPrice &&
                product.originalPrice >
                  (product.product_price ?? product.price ?? 0) && (
                  <span className="text-[11px] text-gray-400 line-through">
                    ₦
                    {product.originalPrice?.toLocaleString?.() ??
                      product.originalPrice}
                  </span>
                )}
            </div>
          )}

          {/* Visit Badge for Storefront */}
          {isStorefront && (
            <div className="flex-shrink-0 flex items-center text-[#1B3F61] bg-[#1B3F61]/10 px-2 py-0.5 rounded-full border border-[#1B3F61]/20">
              <span className="text-[11px] font-semibold">Visit</span>
              <svg
                className="w-3 h-3 ml-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M9 18l6-6-6-6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Rating + Distance */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Rating Pill */}
            <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100">
              <StarIcon className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-[12px] font-semibold text-gray-700 ml-1">
                {rating}
              </span>
              <span className="text-[11px] text-gray-400 ml-1">
                ({reviewCount})
              </span>
            </div>

            {/* Distance + Availability */}
            <span className="text-[11px] text-gray-500">
              {distance ? `• ${distance} mi • ` : "• "}
              {isStorefront
                ? product.availability ?? "Open"
                : product.condition ?? "N/A"}
            </span>
          </div>

          {/* Hover map indicator */}
          <div
            className={`flex items-center space-x-1 transition-opacity ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-0.5 w-5 bg-gradient-to-r from-transparent to-[#1B3F61] rounded-full" />
            <MapPin className="w-3 h-3 text-[#1B3F61]" />
          </div>
        </div>

        {/* Location + CTA */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-xs">
            <MapPin className="w-3 h-3 mr-1 opacity-70" />
            <span className="truncate max-w-[160px]">{locationText}</span>
          </div>

          <div className="ml-3 flex-shrink-0">
            {/* ADD TO CART BUTTON (Product) */}
            {!isStorefront ? (
                <Button
                type="button"
                variant="navy"
                onClick={() => onAddToCart(product)}
                disabled={isAdding}
                className="flex items-center justify-center px-2 py-1 text-xs space-x-1 disabled:opacity-50"
                >
                <ShoppingCart className="w-3 h-3" />
                <span>
                  {isAdding
                  ? "Adding..."
                  : `Add${
                    cartQuantity > 0 ? ` (${cartQuantity})` : ""
                    }`}
                </span>
                </Button>
            ) : (
              /* VISIT (Storefront) */
              <Button
                type="button"
                variant="outline"
                onClick={() => onQuickView(product)}
                className="flex items-center justify-center px-3 py-1.5 text-sm space-x-2"
              >
                <span className="text-sm font-semibold text-[#1B3F61]">
                  Visit
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

/* ----------------------------------------------------------
   SKELETON
   ---------------------------------------------------------- */
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
