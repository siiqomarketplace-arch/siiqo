"use client";

import React, { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import ProductCard from "./components/ProductCard";
import SearchSuggestions from "./components/SearchSuggestions";
import FilterPanel from "./components/FilterPanel";
import { marketplaceService } from "@/services/marketplaceService";
import { ApiProduct } from "@/types/marketplace";
import { storefrontService } from "@/services/storefrontService";

const MarketplaceBrowse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<"storefront" | "product">("product");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [storefronts, setStorefronts] = useState<any[]>([]);
  const [hasError, setHasError] = useState(false);

  const [activeFilters, setActiveFilters] = useState<any>({
    categories: [],
    vendors: [],
    priceRange: { min: '', max: '' },
    minRating: 0,
    availability: { inStock: false, onSale: false, freeShipping: false }
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const categoriesList = ["Popular Categories", "Featured Storefront", "Shop by Distance", "Service Tag"];

  const transformApiProduct = useCallback((apiProduct: ApiProduct) => {
    return {
      id: apiProduct.id,
      name: apiProduct.product_name,
      price: apiProduct.product_price,
      originalPrice: Math.round(apiProduct.product_price * 1.2),
      image: apiProduct.images?.[0] || "https://via.placeholder.com/400",
      seller: apiProduct.vendor?.business_name || "Unknown Seller",
      rating: (Math.random() * (5 - 3) + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 100),
      distance: (Math.random() * 5).toFixed(1),
      condition: "New",
      category: apiProduct.category || "General",
      isVerified: true,
      availability: apiProduct.status === "active" ? "In Stock" : "Out of Stock",
      location: "Local Area",
      postedDate: new Date().toISOString().split("T")[0],
      isProduct: true,
    };
  }, []);

  const transformApiStorefront = useCallback((store: any) => {
    return {
      id: store.id,
      name: store.business_name,
      image: store.logo || store.banner || "https://images.unsplash.com/photo-1531297461136-82lwDe43qR?w=500&q=80",
      price: 0,
      seller: store.business_name,
      rating: 4.5,
      reviewCount: 10,
      distance: 1.0,
      category: "Storefront",
      isVerified: store.is_verified || true,
      availability: "Open Now",
      location: store.city || "Online",
      isProduct: false,
      slug: store.slug
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const q = searchParams.get("q") || searchQuery;

      if (q.trim()) {
        const [searchData, storeData]: [any, any] = await Promise.all([
          marketplaceService.search(q),
          storefrontService.getStorefronts()
        ]);

        const p = (searchData?.products || []).map(transformApiProduct);
        const s = (storeData || [])
          .filter((store: any) => 
            store?.business_name?.toLowerCase().includes(q.toLowerCase())
          )
          .map(transformApiStorefront);

        setProducts(p);
        setStorefronts(s);
      } else {
        const [productData, storeData]: [any, any] = await Promise.all([
          marketplaceService.getProducts(),
          marketplaceService.getStorefronts()
        ]);

        const p = (productData?.products || []).map(transformApiProduct);
        const s = (storeData || []).map(transformApiStorefront);

        if (p.length === 0 && s.length === 0) setHasError(true);

        setProducts(p);
        setStorefronts(s);
      }
    } catch (error) {
      console.error("Marketplace Fetch Error:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
    fetchData();
  }, [searchParams]);

  const displayItems = useMemo(() => {
    let current = searchMode === "product" ? [...products] : [...storefronts];

    // Local filter application
    if (activeFilters.priceRange?.max) {
      current = current.filter((p) => p.price <= parseFloat(activeFilters.priceRange.max));
    }

    return current;
  }, [products, storefronts, activeFilters, searchMode]);

  const handleSearchSubmit = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("q", query);
    else params.delete("q");
    
    router.push(`/marketplace?${params.toString()}`);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-100 font-sans flex flex-col overflow-hidden">
      
      {/* LEFT PANEL - Desktop Only */}
      <div className="hidden md:flex md:fixed md:left-0 md:top-16 md:w-2/5 md:h-screen md:z-0 bg-white/60 backdrop-blur-xl border-r border-white/40 flex-col items-start p-6 overflow-y-auto">
        
        <div className="w-[90%] mb-4">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(searchQuery)}
              className="w-full placeholder-slate-400 py-3 pl-10 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            
            {/* FIX: Added missing props for SearchSuggestions */}
            {showSuggestions && (
              <SearchSuggestions 
                query={searchQuery} 
                onSelect={handleSearchSubmit} 
                recentSearches={[]} 
                popularSearches={["Electronics", "Furniture", "Fashion"]} 
                onSelectSuggestion={(val: string) => handleSearchSubmit(val)} 
                onClose={() => setShowSuggestions(false)}
              />
            )}
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold cursor-pointer ${searchMode === 'storefront' ? 'text-gray-900' : 'text-gray-400'}`} onClick={() => setSearchMode('storefront')}>Storefront</span>
              <div onClick={() => setSearchMode(searchMode === "product" ? "storefront" : "product")} className={`w-12 h-6 rounded-full cursor-pointer p-1 transition-all ${searchMode === "product" ? "bg-blue-500" : "bg-gray-300"}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all ${searchMode === "product" ? "translate-x-6" : "translate-x-0"}`} />
              </div>
              <span className={`text-xs font-bold cursor-pointer ${searchMode === 'product' ? 'text-gray-900' : 'text-gray-400'}`} onClick={() => setSearchMode('product')}>Product</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide py-4 mb-4 w-full">
          {categoriesList.map((category) => (
            <button key={category} className="whitespace-nowrap px-3 py-2 rounded-full bg-white/50 border border-white/60 text-sm font-medium text-slate-600 shadow-sm hover:bg-white/90 transition-all active:scale-95 flex-shrink-0">
              {category}
            </button>
          ))}
        </div>

        <div className="w-full mt-2 z-0">
          <FilterPanel
            isOpen={true}
            isMobile={false}
            filters={activeFilters}
            onFiltersChange={(filters: any) => setActiveFilters(filters)}
          />
        </div>
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden w-full bg-white/60 backdrop-blur-xl border-b border-white/40 p-4 sticky top-0 z-20">
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(searchQuery)}
            className="w-full py-2 pl-8 pr-10 rounded-full border border-gray-300 text-sm"
          />
          <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <button onClick={() => setIsFilterOpen(true)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
            <Icon name="Filter" size={14} />
          </button>
        </div>
      </div>

      {/* RIGHT PRODUCT RESULTS */}
      <div className="w-full md:ml-[40%] md:w-3/5 p-4 overflow-y-auto flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-500">Updating results...</p>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <Icon name="AlertCircle" size={40} className="text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Issue loading marketplace</h3>
            <button onClick={fetchData} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full">Try Again</button>
          </div>
        ) : (
          <div className="grid justify-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {displayItems.map((item) => (
              <ProductCard
                key={`${item.isProduct ? 'p' : 's'}-${item.id}`}
                product={item}
                onAddToCart={() => {}}
                onQuickView={() => {}}
                onAddToWishlist={() => {}}
                cartQuantities={{}}
                isAddingToCart={{}}
              />
            ))}
          </div>
        )}
      </div>

      <FilterPanel
        isOpen={isFilterOpen}
        isMobile={true}
        filters={activeFilters}
        onFiltersChange={(filters: any) => setActiveFilters(filters)}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
};

const MarketPlaceBrowsePage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <MarketplaceBrowse />
  </Suspense>
);

export default MarketPlaceBrowsePage;