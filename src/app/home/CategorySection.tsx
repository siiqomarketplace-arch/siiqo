"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NearbyDealCard from "./ui/NearbyDealsProdCard";
import { useRouter } from "next/navigation";

interface CategorySectionProps {
  categoryName: string;
  products: any[];
  isLoading?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categoryName,
  products,
  isLoading = false,
}) => {
  const router = useRouter();
  const ITEMS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  const generateDealData = (product: any) => ({
    daysLeft: Math.floor(Math.random() * 30) + 1,
    discount: Math.floor(Math.random() * 40) + 5,
    trustLevel: "Trusted",
    rating: product.rating || 4.5,
    distance_km: product.distance_km || null,
    condition: product.condition || "new",
    id: product.id || null,
    image: product.image || product.images?.[0] || null,
    name: product.name || null,
    vendor_name: product.vendor_name || null,
    crypto_price: product.crypto_price || null,
    price: product.price || 0,
  });

  if (isLoading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">{categoryName}</h2>
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-60 h-72 bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{categoryName}</h2>
        <button
          onClick={() => router.push(`/marketplace?category=${categoryName}`)}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          View All →
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 overflow-hidden w-full">
          {paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="flex-1 min-w-0"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <NearbyDealCard
                product={product}
                dealData={generateDealData(product)}
                onClick={(id) => router.push(`/products/${id}`)}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>

          <div className="text-sm font-semibold text-slate-600">
            Page <span className="text-blue-600">{currentPage}</span> of{" "}
            {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} className="text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
