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
  StretchHorizontal 
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  product_price: number;
  images?: string[];
  description?: string;
}

interface Collection {
  id: string;
  name: string;
  image: string;
  items: Product[];
}

// Hardcoded Collections & Products
const COLLECTIONS: Collection[] = [
  {
    id: "mens-wear",
    name: "Men's Wear",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&q=80&w=800",
    items: [
      { id: 101, name: "Premium Cotton Shirt", product_price: 45.00, images: ["https://images.unsplash.com/photo-1596755094514-f87034a2612d?auto=format&fit=crop&q=80&w=800"] },
      { id: 102, name: "Slim Fit Chinos", product_price: 60.00, images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800"] },
    ]
  },
  {
    id: "electronics",
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",
    items: [
      { id: 201, name: "iPhone 15 Pro", product_price: 999.00, images: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800"] },
      { id: 202, name: "Wireless Earbuds", product_price: 120.00, images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800"] },
    ]
  }
];

const ProductGrid: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: "USD" 
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
              {selectedCollection.items.length} Items
            </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {selectedCollection.items.map((product) => (
            <Link key={product.id} href={`/product-detail?id=${product.id}`} className="group">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shadow-sm transition-all group-hover:shadow-md">
                <Image 
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800"} 
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
                <h3 className="text-[13px] font-bold text-slate-800 line-clamp-1">{product.name}</h3>
                <p className="text-[14px] font-black text-[#075E54] mt-0.5">{formatPrice(product.product_price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // 2. VIEW: Collections (Top level)
  // Includes toggle for Grid or Flex-Col (List) layout
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

      {/* DYNAMIC COLLECTIONS DISPLAY */}
      <div className={
        viewMode === "grid" 
          ? "grid grid-cols-2 sm:grid-cols-3 gap-4" 
          : "flex flex-col gap-4"
      }>
        {COLLECTIONS.map((collection) => (
          <button
            key={collection.id}
            onClick={() => setSelectedCollection(collection)}
            className={`
              group relative overflow-hidden bg-white border border-slate-100 transition-all hover:shadow-md hover:border-[#075E54]/20
              ${viewMode === "grid" 
                ? "flex flex-col p-3 rounded-2xl text-center items-center" 
                : "flex flex-row p-4 rounded-2xl text-left items-center gap-4"
              }
            `}
          >
            {/* Image Container */}
            <div className={`
              overflow-hidden rounded-xl bg-slate-50 flex-shrink-0 border border-slate-50
              ${viewMode === "grid" ? "w-full aspect-square mb-3" : "w-20 h-20"}
            `}>
              <Image 
                src={collection.image} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt={collection.name} 
              />
            </div>

            {/* Content Container */}
            <div className="flex-1 min-w-0">
              <h4 className={`font-black text-slate-900 uppercase tracking-tight ${
                viewMode === "grid" ? "text-xs line-clamp-1" : "text-sm"
              }`}>
                {collection.name}
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold mt-1">
                {collection.items.length} Products
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
    </div>
  );
};

export default ProductGrid;