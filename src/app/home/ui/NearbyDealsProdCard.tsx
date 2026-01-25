"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import Button from "@/components/Button";

export interface DealData {
  discount: number;
  distance_km: string | null;
  rating: number;
  condition: string;
  id: number;
  image: string;
  name: string;
  price: number;
  vendor_name: string;
  crypto_price: null | number;
}

export interface NearbyDealCardProps {
  product: {
    id: number | string;
    name: string;
    price: number;
    image: string;
    vendor_name: string;
  };
  dealData: DealData;
  onClick: (id: any) => void;
  className?: string; // Added to accept external width/styling
}

const NearbyDealCard: React.FC<NearbyDealCardProps> = ({
  product,
  dealData,
  onClick,
  className = "",
}) => {
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      setError(null);
      const response = await fetch("/api/marketplace/search");
      const data = await response.json();
      setProducts(data.data.nearby_products);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products... Not your problem, it's ours... Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={() => onClick(product.id)}
      className={`transition-all duration-200 border rounded-lg cursor-pointer w-full bg-surface border-border hover:shadow-elevation-2 flex flex-col h-full ${className}`}
    >
      {/* 1. Image Section - Fixed height, no stretching */}
      <div className="relative w-full h-48 overflow-hidden rounded-t-lg shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          fill={true}
          className="object-cover"
          sizes="288px"
        />
        {/* <div className="absolute px-2 py-1 text-xs font-medium text-black rounded-full top-3 left-3 bg-accent">
          {dealData.discount}% OFF
        </div> */}
        <div className="absolute px-2 py-1 text-xs text-white bg-black bg-opacity-50 rounded-full top-3 right-3">
          {dealData.distance_km}km
        </div>
      </div>

      {/* 2. Content Section - flex-1 makes this area fill the available height */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title Area - flex-1 inside here ensures the footer is pushed down */}
        <div className="flex-1">
          <div className="flex items-start justify-between ">
            <h3 className="flex-1 text-base font-medium text-text-primary line-clamp-2 min-h-[3rem]">
              {product.name}
            </h3>
            <button
              className="p-1 ml-2 transition-colors duration-200 rounded-full hover:bg-surface-secondary shrink-0"
              onClick={(e) => {
                e.stopPropagation(); /* Add wishlist logic here */
              }}
            >
              <Icon name="Heart" size={16} className="text-text-secondary" />
            </button>
          </div>
<hr className="mb-2" />

          <div className="flex items-center mb-2 space-x-2">
            <span className="text-lg font-semibold text-text-primary">
              {product.price !== undefined ? `₦${product.price.toLocaleString()}` : ""}
            </span>
            {/* <span className="text-sm line-through text-text-secondary">
              {dealData.price !== undefined
                ? `₦${dealData.price.toLocaleString()}`
                : ""}
            </span> */}
          </div>

          {/* <div className="flex items-center justify-between mb-4 text-sm text-text-secondary">
            <span className="px-2 py-1 text-xs rounded-full bg-success-50 text-success">
              {dealData.condition}
            </span>
            <div className="flex items-center space-x-1">
              <Icon name="Star" size={12} className="fill-current text-warning" />
              <span>{dealData.rating.toFixed(1)}</span>
            </div>
          </div> */}
        </div>
        {/* 3. Bottom Row - Always aligned at the bottom of the card */}
        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto shrink-0">
          <span className="text-xs text-text-secondary line-clamp-1 max-w-[120px]">
            {dealData.vendor_name}
          </span>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowLoadingModal(true);
              setBtnDisabled(true);
              // small delay to show modal before navigating
              setTimeout(() => {
                onClick(product.id);
              }, 700);
            }}
            disabled={btnDisabled}
            type="button"
            className={`px-3 py-1.5 text-xs font-medium text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary-700 shrink-0 ${
              btnDisabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            View Deal
          </Button>
        </div>
      </div>

      {showLoadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-t-transparent border-gray-300 rounded-full animate-spin" />
            <div>
              <div className="font-medium">Loading</div>
              <div className="text-sm text-gray-500">
                View deal has been clicked...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyDealCard;
