"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Product } from "@/types/products";
import Skeleton from "@/components/skeleton";
import NearbyDealCard, { DealData } from "./ui/NearbyDealsProdCard";



interface NearbyDealsProps {
  onRefresh: () => Promise<void>;
}

const NearbyDeals: React.FC<NearbyDealsProps> = ({ onRefresh }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

   const fetchProducts = async () => {
    setIsLoading(true);
    try {
      setError(null);
      const response = await fetch("https://server.siiqo.com/api/marketplace/search");
      const data = await response.json();
      setProducts(data.data.nearby_products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

 

  const generateDealData = (product: any): DealData => {
    const seed = typeof product.id === 'string' ? parseInt(product.id, 10) || 123 : product.id;
    const random = (min: number, max: number) =>
      Math.floor((Math.sin(seed * 9999) * 10000) % (max - min + 1)) + min;

    const discount = product.originalPrice 
      ? Math.round(((product.originalPrice - product.product_price) / product.originalPrice) * 100)
      : random(10, 35);

    return {
price: product.originalPrice || Math.round(product.price * 1.2),
  discount: discount,
  distance_km: null,
  rating: product.rating || 4.5,
  condition: product.condition || "New",

  id: 0,
  image: null,
  name: null,
  vendor_name: null,
  crypto_price: null
};
  };

  const handleDealClick = (name: string) => {
    router.push(`/product-detail?name=${encodeURIComponent(name)}`);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchProducts();
      await onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
        <p className="mb-4 text-gray-500 text-sm">Oops! Could not load nearby deals.</p>
        <button onClick={handleRefresh} className="px-5 py-2 text-sm font-medium text-white rounded-full bg-[#E0921C]">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-end mb-4 px-1">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh Deals</span>
        </button>
      </div>

      {/* Container for horizontal scroll */}
      <div className="overflow-x-auto pb-8 pt-2 -mx-4 px-4 scrollbar-hide">
        {/* items-stretch ensures all direct children (cards) take the height of the tallest card */}
        <div className="flex gap-6 w-max items-stretch">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <DealCardSkeleton key={index} />
            ))
          ) : products.length === 0 ? (
            <div className="w-full flex items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 min-w-[300px]">
              No deals found in your area.
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="flex">
                 <NearbyDealCard
                  product={product}
                  dealData={generateDealData(product)}
                  onClick={() => handleDealClick(product.product_name)}
                  // Pass a className if your component supports it to fix width
                  className="w-72" 
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- Skeleton Component (Perfectly matching the card size) ---
const DealCardSkeleton = () => (
  <div className="w-72 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-full">
    {/* Fixed height image area */}
    <div className="h-48 bg-gray-100 relative shrink-0">
      <Skeleton height="100%" />
    </div>
    
    {/* Content Area - flex-1 ensures it fills available space */}
    <div className="p-4 flex flex-col ">
      <div className="flex justify-between items-center mb-3 shrink-0">
        <Skeleton width={80} height={12} />
        <Skeleton width={30} height={12} />
      </div>
      
      {/* Title Area - Fixed height for 2 lines of text */}
      <div className="flex-1 min-h-[40px]">
        <Skeleton width="90%" height={18} className="mb-1" />
        <Skeleton width="60%" height={18} />
      </div>
      
      <div className="flex gap-2 mb-4 mt-2 shrink-0">
        <Skeleton width={40} height={16} />
        <Skeleton width={60} height={16} />
      </div>
      
      {/* Footer Area - Always at the bottom */}
      <div className="flex justify-between items-end border-t border-gray-100 pt-3 mt-auto shrink-0">
        <div>
           <Skeleton width={40} height={20} className="mb-1" />
           <Skeleton width={70} height={20} />
        </div>
        <Skeleton type="circle" width={32} height={32} />
      </div>
    </div>
  </div>
);

export default NearbyDeals;