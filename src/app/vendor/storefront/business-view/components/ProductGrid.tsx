"use client";

import React, { useState } from "react";
import Icon, { type LucideIconName } from "@/components/AppIcon";
import Image from "@/components/ui/alt/AppImageAlt";
import Link from "next/link";
import {
  Plus,
  ChevronRight,
  ArrowLeft,
  LayoutGrid,
  StretchHorizontal,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  product_price: number;
  images: string[];
  description?: string;
}

interface Collection {
  length: number;
  id: string | number;
  name: string;
  image: string | null;
  items: Product[];
}

interface ProductGridProps {
  collections?: Collection[];
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  collections = [],
  isLoading = false,
}) => {
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // 1. VIEW: Product List (Deep view within a collection)
  // This view remains as a standard grid for a focused product experience
  if (selectedCollection) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCollection(null)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Collections
        </button>

        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {selectedCollection.name}
          </h2>
          <span className="text-xs font-bold text-slate-400">
            <span className="text-xs font-bold text-slate-400">
              {selectedCollection.items?.length || 0} Items
            </span>{" "}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {(selectedCollection.items || []).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shadow-sm transition-all group-hover:shadow-md">
                <Image
                  src={
                    product.images?.[0] ||
                    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800"
                  }
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-2 right-2">
                  <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg text-[#075E54]">
                    <Plus size={18} strokeWidth={3} />
                  </div>
                </div>
              </div>
              <div className="mt-3 px-1">
                <h3 className="text-[13px] font-bold text-slate-800 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-[14px] font-black text-[#075E54] mt-0.5">
                  {formatPrice(product.product_price)}
                </p>
              </div>
            </Link>
          ))}
          {(!selectedCollection.items ||
            selectedCollection.items.length === 0) && (
            <div className="col-span-full py-20 text-center text-slate-400">
              <p>No products in this collection.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. VIEW: Collections (Top level)
  // Includes toggle for Grid or Flex-Col (List) layout
  const displayCollections = collections.length > 0 ? collections : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
            Catalog Collections
          </h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
          Catalog Collections
        </h3>

        {/* VIEW INDICATOR / TOGGLE */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-white text-[#075E54] shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-white text-[#075E54] shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <StretchHorizontal size={18} />
          </button>
        </div>
      </div>

      {displayCollections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm font-medium">
            No catalogs available yet
          </p>
        </div>
      ) : (
        /* DYNAMIC COLLECTIONS DISPLAY */
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 gap-4"
              : "flex flex-col gap-4"
          }
        >
          {displayCollections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => setSelectedCollection(collection)}
              className={`
                group relative overflow-hidden bg-white border border-slate-100 transition-all hover:shadow-md hover:border-[#075E54]/20
                ${
                  viewMode === "grid"
                    ? "flex flex-col p-3 rounded-2xl text-center items-center"
                    : "flex flex-row p-4 rounded-2xl text-left items-center gap-4"
                }
              `}
            >
              {/* Image Container */}
              <div
                className={`
                overflow-hidden rounded-xl bg-slate-50 flex-shrink-0 border border-slate-50
                ${
                  viewMode === "grid"
                    ? "w-full aspect-square mb-3"
                    : "w-20 h-20"
                }
              `}
              >
                <Image
                  src={
                    collection.image ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800"
                  }
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={collection.name || "Collection"}
                />
              </div>

              {/* Content Container */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-black text-slate-900 uppercase tracking-tight ${
                    viewMode === "grid" ? "text-xs line-clamp-1" : "text-sm"
                  }`}
                >
                  {collection.name}
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold mt-1">
                  {collection.items?.length || 0} Products
                </p>
              </div>

              {/* Action Arrow (Only visible in list mode for cleaner UI) */}
              {viewMode === "list" && (
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#075E54]/10 group-hover:text-[#075E54] transition-colors">
                  <ChevronRight size={18} />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
