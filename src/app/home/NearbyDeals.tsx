"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Product } from "@/types/products";
import Skeleton from "@/components/skeleton";
import NearbyDealCard, { DealData } from "./ui/NearbyDealsProdCard";

// --- Updated Dummy Data ---
const DUMMY_PRODUCTS: Product[] = [
  {
    id: 1,
    product_name: "iPhone 13 Pro Max - 256GB Gold",
    product_price: 750000,
    originalPrice: 820000,
    salePrice: 750000,
    description: "Premium iPhone 13 Pro Max in excellent condition. Battery health is at 98%.",
    category: "Smartphones",
    images: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    visibility: true,
    isWishlisted: false,
    rating: 4.8,
    reviewCount: 24,
    stock: 5,
    condition: "New",
    vendor: { business_name: "Tech Haven Stores", email: "sales@techhaven.ng", id: 101 },
  },
  {
    id: 2,
    product_name: "Sony WH-1000XM4 Wireless Headphones",
    product_price: 220000,
    originalPrice: 250000,
    salePrice: 220000,
    description: "Industry-leading noise canceling with Dual Noise Sensor technology.",
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    visibility: true,
    isWishlisted: true,
    rating: 4.9,
    reviewCount: 156,
    stock: 12,
    condition: "New",
    vendor: { business_name: "Gadget Hub", email: "contact@gadgethub.ng", id: 102 },
  },
  {
    id: 3,
    product_name: "Luxury Velvet 3-Seater Sofa",
    product_price: 450000,
    originalPrice: 500000,
    description: "Add a touch of elegance to your living room with this handcrafted velvet sofa.",
    category: "Home & Furniture",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    visibility: true,
    isWishlisted: false,
    rating: 4.5,
    reviewCount: 8,
    stock: 2,
    condition: "Like New",
    vendor: { business_name: "Interiors by siiqo", email: "info@siiqointeriors.com", id: 103 },
  },
  {
    id: 4,
    product_name: "Nike Air Jordan 1 Retro High",
    product_price: 125000,
    originalPrice: 125000,
    description: "The classic silhouette that started it all.",
    category: "Fashion",
    images: ["https://images.unsplash.com/photo-1584908197066-394ffac0a7b7?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    visibility: true,
    isWishlisted: false,
    rating: 4.7,
    reviewCount: 42,
    stock: 8,
    condition: "Open Box",
    vendor: { business_name: "Sneaker Head", email: "support@sneakerhead.ng", id: 104 },
  },
  {
    id: 5,
    product_name: "MacBook Air M2 Chip - 512GB",
    product_price: 1100000,
    originalPrice: 1250000,
    salePrice: 1100000,
    description: "Strikingly thin design with the powerful M2 chip.",
    category: "Computers",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800"],
    status: "active",
    visibility: true,
    isWishlisted: false,
    rating: 5.0,
    reviewCount: 15,
    stock: 4,
    condition: "Like New",
    vendor: { business_name: "Apple Store NG", email: "orders@appleng.com", id: 105 },
  }
];

interface NearbyDealsProps {
  onRefresh: () => Promise<void>;
}

const NearbyDeals: React.FC<NearbyDealsProps> = ({ onRefresh }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProducts(DUMMY_PRODUCTS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const generateDealData = (product: Product): DealData => {
    const seed = typeof product.id === 'string' ? parseInt(product.id, 10) || 123 : product.id;
    const random = (min: number, max: number) =>
      Math.floor((Math.sin(seed * 9999) * 10000) % (max - min + 1)) + min;

    const discount = product.originalPrice 
      ? Math.round(((product.originalPrice - product.product_price) / product.originalPrice) * 100)
      : random(10, 35);

    return {
      originalPrice: product.originalPrice || Math.round(product.product_price * 1.2),
      discount: discount,
      distance: `${(random(1, 20) / 10).toFixed(1)} km`,
      rating: product.rating || 4.5,
      condition: product.condition || "New",
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