"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AppImage from "@/components/ui/AppImage";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface CategoryGridProps {
  categoryProducts: { [key: string]: any[] };
  isLoading?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  categoriesPerPage?: number;
  onCategorySelect?: (categoryName: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categoryProducts,
  isLoading = false,
  currentPage = 1,
  onPageChange,
  categoriesPerPage = 8,
  onCategorySelect,
}) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="group cursor-pointer animate-pulse">
            <div className="relative w-full aspect-square bg-gray-200 rounded-2xl mb-4" />
            <div className="h-4 bg-gray-200 rounded-lg mb-2" />
            <div className="h-3 bg-gray-200 rounded-lg w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const categories = Object.entries(categoryProducts)
    .filter(([_, products]) => products && products.length > 0)
    .map(([categoryName, products]) => ({
      name: categoryName,
      firstProduct: products[0],
      productCount: products.length,
    }));

  if (categories.length === 0) {
    return null;
  }

  // Pagination logic
  const totalPages = Math.ceil(categories.length / categoriesPerPage);
  const startIndex = (currentPage - 1) * categoriesPerPage;
  const paginatedCategories = categories.slice(
    startIndex,
    startIndex + categoriesPerPage,
  );

  const handlePrevious = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {paginatedCategories.map((category, idx) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => {
              if (onCategorySelect) {
                onCategorySelect(category.name);
                return;
              }
              router.push(
                `/marketplace?category=${encodeURIComponent(category.name)}`,
              );
            }}
            className="group cursor-pointer"
          >
            {/* Category Card */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-md hover:shadow-xl transition-shadow duration-300">
              {/* Product Image */}
              {category.firstProduct?.image ? (
                <AppImage
                  src={category.firstProduct.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-gray-500" />
                </div>
              )}

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm font-semibold">View All</p>
                  <p className="text-xs text-gray-200">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>

              {/* Product Count Badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                <p className="text-xs font-semibold text-gray-900">
                  {category.productCount}
                </p>
              </div>
            </div>

            {/* Category Name */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                {category.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {category.productCount}{" "}
                {category.productCount === 1 ? "item" : "items"}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between sm:justify-center gap-4 mt-8 pt-8 border-t border-gray-200"
        >
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={18} />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CategoryGrid;
