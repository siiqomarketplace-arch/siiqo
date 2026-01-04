"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import FilterDrawer from "@/components/ui/FilterDrawer";
import ProductCard from "./components/ProductCard";
import QuickFilters from "./components/QuickFilters";
import SearchSuggestions from "./components/SearchSuggestions";
import { productService } from "@/services/productService";
import { Filter } from "@/types/search-results";

// --- Types --- //
interface MapCenter {
  lat: number;
  lng: number;
}

const SearchResults = () => {
  // --- State --- //
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMapFull, setShowMapFull] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<'storefront' | 'product'>('product');
  
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Store products and stores separately to handle the toggle efficiently
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [mapCenter] = useState<MapCenter>({ lat: 6.5244, lng: 3.3792 }); // Default to Lagos coords

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Transformer for the new API Response --- //
  const transformNearbyItem = (item: any, isProduct: boolean): any => {
    return {
      id: item.id,
      name: item.name || item.business_name || "Unknown",
      price: item.price || 0,
      originalPrice: item.price ? Math.round(item.price * 1.15) : 0, // Mocked discount
      image: item.image || item.logo_url || "https://via.placeholder.com/400",
      seller: item.vendor_name || item.business_name || "Featured Seller",
      rating: "4.5", // API doesn't provide, defaulting
      reviewCount: Math.floor(Math.random() * 50),
      distance: item.distance_km ? item.distance_km.toFixed(1) : "1.2",
      condition: "New",
      category: isProduct ? "Product" : "Store",
      isVerified: true,
      availability: isProduct ? "In Stock" : "Open Now",
      location: "Nearby",
      postedDate: new Date().toISOString().split('T')[0],
      isProduct: isProduct,
      coordinates: { 
        lat: mapCenter.lat + (Math.random() * 0.02 - 0.01), 
        lng: mapCenter.lng + (Math.random() * 0.02 - 0.01) 
      }
    };
  };

  const fetchProducts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Pass the query from the URL to your service
      const query = searchParams.get("q") || "";
      
      // Assuming productService.getProducts() or similar now returns the new structure
      const response = await productService.getProducts();
      
      if (response && response.status === "success") {
        const { nearby_products, nearby_stores } = response.data;
        
        const transformedProducts = nearby_products.map((p: any) => transformNearbyItem(p, true));
        const transformedStores = nearby_stores.map((s: any) => transformNearbyItem(s, false));
        
        setProducts(transformedProducts);
        setStores(transformedStores);
      }
    } catch (err) {
      console.error("API Error:", err);
      // Fallback to empty if API fails
      setProducts([]);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Effects --- //
  useEffect(() => {
    const query = searchParams.get("q") || "";
    if (query) {
      setSearchQuery(query);
      setHasSearched(true);
      fetchProducts();
    }
  }, [searchParams]);

  // --- Filtering --- //
  const displayItems = useMemo(() => {
    // Select base list based on mode
    let currentList = searchMode === 'product' ? [...products] : [...stores];

    // Filter by active price/distance filters
    activeFilters.forEach((filter) => {
       if (filter.type === "price") currentList = currentList.filter(p => p.price <= filter.value);
       if (filter.type === "distance") currentList = currentList.filter(p => p.distance <= filter.value);
    });

    return currentList;
  }, [products, stores, activeFilters, searchMode]);

  const handleSearchSubmit = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query);
    router.push(`/search-results?${params.toString()}`);
    setShowSuggestions(false);
    setHasSearched(true);
  };

  const categories = ["Trending", "Fashion", "Electronics", "Groceries"];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1B3F61] font-sans">
      
      {/* 1. Map Layer */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${hasSearched ? 'opacity-100' : 'opacity-0'}`}>
         <iframe
            width="100%"
            height="100%"
            title="Search Map"
            src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=13&output=embed`}
            className="w-full h-full filter brightness-90 grayscale-[0.2]"
            style={{ border: 0 }}
        />
      </div>

      {/* 2. Glass UI Panel */}
      <div 
        className={`
            absolute top-0 bottom-0 left-0 z-10
            w-full h-screen md:w-[450px]
            bg-white/70 backdrop-blur-2xl border-r border-white/40 shadow-2xl
            transition-all duration-500 ease-in-out flex flex-col
            ${showMapFull ? '-translate-x-full' : 'translate-x-0'}
            ${!hasSearched ? 'md:w-full items-center justify-center bg-white/0 backdrop-blur-none border-none' : ''}
        `}
      >
        <div className={`flex flex-col w-full h-full ${!hasSearched ? 'max-w-xl p-6' : ''}`}>
            
            {/* Search Input Section */}
            <div className="flex-none p-5 pb-2">
                <div className="relative z-50 mb-4">
                    <div className="relative group shadow-xl rounded-full overflow-hidden border border-white/50">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Icon name="Search" size={18} className="text-slate-600" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products or stores..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(e.target.value.length > 0);
                            }}
                            onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit(searchQuery)}
                            className="w-full py-4 pl-12 pr-12 text-sm bg-white/90 text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                    </div>

                    {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-50">
                            <SearchSuggestions
                    query={searchQuery}
                    onSelectSuggestion={handleSearchSubmit}
                    onClose={() => setShowSuggestions(false)} recentSearches={[]} popularSearches={[]}                            />
                        </div>
                    )}
                </div>

                {hasSearched && (
                    <div className="animate-in fade-in duration-500">
                        {/* Search Mode Toggle */}
                        <div className="flex items-center justify-center mb-5 gap-4">
                            <button 
                                onClick={() => setSearchMode('storefront')}
                                className={`text-[10px] font-black uppercase tracking-[2px] ${searchMode === 'storefront' ? 'text-primary' : 'text-slate-400'}`}
                            >
                                Stores
                            </button>
                            <button 
                                onClick={() => setSearchMode(prev => prev === 'product' ? 'storefront' : 'product')}
                                className="relative w-12 h-6 bg-slate-200 rounded-full p-1"
                            >
                                <div className={`w-4 h-4 bg-primary rounded-full transition-transform duration-300 ${searchMode === 'product' ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                            <button 
                                onClick={() => setSearchMode('product')}
                                className={`text-[10px] font-black uppercase tracking-[2px] ${searchMode === 'product' ? 'text-primary' : 'text-slate-400'}`}
                            >
                                Products
                            </button>
                        </div>

                        <QuickFilters onApplyFilter={(f) => setActiveFilters([...activeFilters, {...f, id: Date.now().toString()}])} />
                    </div>
                )}
            </div>

            {/* Results List */}
            {hasSearched && (
                <div className="flex-1 overflow-y-auto px-5 pb-20 scrollbar-hide">
                    <div className="space-y-4 mt-2">
                        {isLoading ? (
                            <div className="flex justify-center py-10"><Icon name="Loader2" className="animate-spin text-primary" /></div>
                        ) : displayItems.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                                <Icon name="PackageSearch" size={48} className="mx-auto mb-2" />
                                <p>No {searchMode}s found nearby</p>
                            </div>
                        ) : (
                            displayItems.map((item) => (
                                <ProductCard
                                    key={`${item.id}-${searchMode}`}
                                    product={item}
                                    onClick={() => router.push(`/${searchMode === 'product' ? 'product' : 'store'}-detail?id=${item.id}`)}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Map Toggle Button */}
      {hasSearched && (
        <button
            onClick={() => setShowMapFull(!showMapFull)}
            className="fixed z-50 bottom-10 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
            <Icon name={showMapFull ? "List" : "Map"} size={24} />
        </button>
      )}
    </div>
  );
};

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#1B3F61] text-white">Initialising Map...</div>}>
      <SearchResults />
    </Suspense>
  );
}