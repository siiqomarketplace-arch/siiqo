"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import FilterDrawer from "@/components/ui/FilterDrawer";
import ProductCard from "./components/ProductCard";
import QuickFilters from "./components/QuickFilters";
import SearchSuggestions from "./components/SearchSuggestions";
import { productService } from "@/services/productService";
import {
  Product,
  Filter,
  ApiProduct,
  ApiResponse,
} from "@/types/search-results";

// --- Types --- //
interface MapCenter {
  lat: number;
  lng: number;
}

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Mini Q12",
    image: "https://api.siiqo.com/images/products/17_a7388584e71843ceac2bab17294dd407.jpeg",
    price: 10500,
    originalPrice: 12600,
    seller: "The best",
    rating: 2.6,
    reviewCount: 7,
    distance: 2.9,
    condition: "Like New",
    category: "Smart Electronics",
    isVerified: true,
    availability: "In Stock",
    location: "Vintage Quarter",
    postedDate: "2025-11-05",
    isProduct: true,
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 2,
    name: "Tech Haven MegaStore",
    image: "https://images.unsplash.com/photo-1531297461136-82lwDe43qR?w=500&q=80",
    price: 0,
    originalPrice: 0,
    seller: "Tech Haven",
    rating: 4.8,
    reviewCount: 154,
    distance: 1.5,
    condition: "N/A",
    category: "Featured Storefront",
    isVerified: true,
    availability: "Open Now",
    location: "Downtown Tech Hub",
    postedDate: "2025-10-10",
    isProduct: false,
    coordinates: { lat: 40.7200, lng: -74.0100 }
  },
  {
    id: 3,
    name: "iPhone 13 Pro",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
    price: 85000,
    originalPrice: 90000,
    seller: "Gadget World",
    rating: 4.5,
    reviewCount: 42,
    distance: 5.2,
    condition: "Used",
    category: "Smart Electronics",
    isVerified: false,
    availability: "In Stock",
    location: "Mall Plaza",
    postedDate: "2025-11-01",
    isProduct: true,
    coordinates: { lat: 40.7300, lng: -74.0200 }
  },
  {
    id: 4,
    name: "Luxe Fashion Boutique",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80",
    price: 0,
    originalPrice: 0,
    seller: "Luxe Fashion",
    rating: 4.9,
    reviewCount: 320,
    distance: 0.8,
    condition: "N/A",
    category: "Fashion",
    isVerified: true,
    availability: "Closing Soon",
    location: "Fashion District",
    postedDate: "2025-09-15",
    isProduct: false,
    coordinates: { lat: 40.7150, lng: -74.0050 }
  },
  {
    id: 5,
    name: "Sony Headphones",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80",
    price: 24000,
    originalPrice: 28000,
    seller: "Audio Experts",
    rating: 4.7,
    reviewCount: 89,
    distance: 4.1,
    condition: "New",
    category: "Accessories",
    isVerified: true,
    availability: "In Stock",
    location: "West Side",
    postedDate: "2025-11-07",
    isProduct: true,
    coordinates: { lat: 40.7350, lng: -74.0300 }
  },
  {
    id: 6,
    name: "Green Grocers",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80",
    price: 0,
    originalPrice: 0,
    seller: "Green Earth",
    rating: 4.6,
    reviewCount: 210,
    distance: 0.5,
    condition: "N/A",
    category: "Groceries",
    isVerified: true,
    availability: "Open Now",
    location: "Market Street",
    postedDate: "2025-01-01",
    isProduct: false,
    coordinates: { lat: 40.7110, lng: -74.0010 }
  }
];

const SearchResults = () => {
  // --- State --- //
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMapFull, setShowMapFull] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<'storefront' | 'product'>('product');
  
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [mapCenter] = useState<MapCenter>({ lat: 40.7128, lng: -74.0060 });

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Helpers --- //
  const transformApiProduct = (apiProduct: ApiProduct): any => {
    const seed = apiProduct.id;
    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    return {
      id: apiProduct.id,
      name: apiProduct.product_name,
      price: apiProduct.product_price,
      originalPrice: Math.round(apiProduct.product_price * 1.2),
      image: apiProduct.images?.[0] || "https://via.placeholder.com/400",
      seller: apiProduct.vendor?.business_name || "Unknown Seller",
      rating: (random(30, 50) / 10).toFixed(1),
      reviewCount: random(10, 200),
      distance: (random(10, 100) / 10).toFixed(1),
      condition: "Like New",
      category: apiProduct.category || "General",
      isVerified: Math.random() > 0.5,
      availability: Math.random() > 0.3 ? "In Stock" : "Limited",
      location: "Downtown",
      postedDate: new Date().toISOString().split('T')[0],
      isProduct: true,
      coordinates: { lat: 40.7128 + (Math.random() * 0.05), lng: -74.0060 + (Math.random() * 0.05) }
    };
  };

  const fetchProducts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      let transformedProducts: any[] = [];
      try {
        const data: ApiResponse = await productService.getProducts();
        if (data && data.products) {
            transformedProducts = data.products
                .filter(p => p.product_name)
                .map(transformApiProduct);
        }
      } catch (e) {
        console.warn("Backend fetch failed, using mocks.");
      }

      const mockIds = new Set(MOCK_PRODUCTS.map(p => String(p.id)));
      const uniqueBackendProducts = transformedProducts.filter(p => !mockIds.has(String(p.id)));

      const allProducts = [...MOCK_PRODUCTS, ...uniqueBackendProducts];
      setProducts(allProducts);
    } catch (err) {
      console.error("Error:", err);
      setProducts(MOCK_PRODUCTS);
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
  const displayProducts = useMemo(() => {
    let currentProducts = [...products];

    if (searchMode === 'storefront') {
        currentProducts = currentProducts.filter(p => p.isProduct === false);
    } else {
        currentProducts = currentProducts.filter(p => p.isProduct === true);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      currentProducts = currentProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.seller.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
      );
    }

    activeFilters.forEach((filter) => {
       if (filter.type === "price") currentProducts = currentProducts.filter(p => p.price <= filter.value);
       if (filter.type === "distance") currentProducts = currentProducts.filter(p => p.distance <= filter.value);
    });

    return currentProducts;
  }, [products, activeFilters, searchQuery, searchMode]);

  const handleProductClick = (productId: number) => {
    router.push(`/product-detail?id=${productId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query);
    router.push(`/search-results?${params.toString()}`);
    setShowSuggestions(false);
    setHasSearched(true);
    fetchProducts();
  };

  const handleQuickFilter = (filter: Omit<Filter, "id">) => {
    setActiveFilters((prev) => [...prev, { ...filter, id: Date.now().toString() }]);
  };

  const removeFilter = (filter: Filter) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filter.id));
  };

  const categories = [
      "Popular Categories",
      "Featured Storefront",
      "Shop by Distance",
      "Service Tag"
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1B3F61] font-sans">
      
      {/* 1. Map Layer - HIDDEN until search */}
      <div className={`absolute overflow-hidden inset-0 z-0 transition-opacity duration-1000 ${hasSearched ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
         <iframe
            width="100%"
            height="100%"
            loading="lazy"
            title="Product Locations Map"
            src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=13&output=embed&layer=t`}
            className="w-full h-full filter grayscale-[0.3] contrast-[1.1] opacity-90"
            style={{ border: 0 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 to-transparent pointer-events-none" />
      </div>

      {/* Placeholder Background for Initial Load */}
       <div className={`absolute inset-0 z-0 bg-slate-100 transition-opacity duration-1000 ${hasSearched ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B3F61]/5 via-slate-100 to-[#1B3F61]/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1B3F61]/5 rounded-full blur-[120px] animate-pulse" />
       </div>

      {/* 2. Glass Container */}
      <div 
        className={`
            absolute top-0 bottom-0 left-0 z-10
            h-screen transition-all duration-700 ease-in-out
            flex flex-col items-center
            ${showMapFull ? '-translate-x-[calc(100%)]' : 'translate-x-0'}
            ${!hasSearched 
                ? 'w-full bg-transparent justify-center' 
                : 'w-full md:w-[450px] lg:w-[480px] bg-white/60 backdrop-blur-xl border-r border-white/40 shadow-2xl'}
        `}
      >
        {/* Inner Content Wrapper */}
        <div className={`flex flex-col w-full h-full transition-all duration-700 ${!hasSearched ? 'max-w-4xl px-6' : ''}`}>
            
            {/* Top Search Area */}
            <div className={`flex-none p-5 transition-all duration-700 ${!hasSearched ? 'flex flex-col items-center justify-center h-full' : 'pb-2'}`}>
                
                {/* {!hasSearched && (
                    <div className="mb-8 text-center animate-in fade-in zoom-in duration-1000">
                        <h1 className="text-4xl md:text-5xl font-black text-[#1B3F61] mb-2 tracking-tight">Explore your city.</h1>
                        <p className="text-slate-500 font-medium">Find anything from products to local storefronts</p>
                    </div>
                )} */}

                {/* Search Bar Container - Logic for Bing-style Long Bar */}
                <div className={`relative z-50 transition-all duration-700 ${!hasSearched ? 'w-full max-w-3xl' : 'w-full mb-4'}`}>
                    <div className={`relative group shadow-2xl transition-all duration-500 ${!hasSearched ? 'scale-110' : 'scale-100'}`}>
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <Icon name="Search" size={!hasSearched ? 24 : 18} className="text-[#1B3F61] group-focus-within:text-black transition-colors z-50" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find products, stores, services..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                            onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit(searchQuery)}
                            className={`
                                w-full font-medium transition-all duration-500 backdrop-blur-md border border-white/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1B3F61]/10 bg-white/95
                                ${!hasSearched 
                                    ? 'py-6 pl-16 pr-14 text-xl rounded-2xl shadow-[0_20px_50px_rgba(27,63,97,0.15)]' 
                                    : 'py-4 pl-12 pr-12 text-sm rounded-full shadow-sm'}
                            `}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                            >
                                <Icon name="X" size={!hasSearched ? 20 : 14} />
                            </button>
                        )}
                    </div>

                    {showSuggestions && (
                        <div className={`absolute top-full left-0 right-0 z-50 ${!hasSearched ? 'mt-4' : 'mt-2'}`}>
                            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
                                <SearchSuggestions
                                    query={searchQuery}
                                    recentSearches={["Mini Q12", "Headphones", "Storefront"]}
                                    popularSearches={["Smart Electronics", "Dining", "Fashion"]}
                                    onSelectSuggestion={handleSearchSubmit}
                                    onClose={() => setShowSuggestions(false)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* --- TOGGLE & FILTERS AREA --- */}
                <div className={`transition-all duration-700 ease-in-out w-full ${hasSearched ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden mt-0'}`}>
                    
                    {/* Storefront / Product Toggle */}
                    <div className="flex items-center justify-center my-4 space-x-4">
                        <span 
                            className={`text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors ${searchMode === 'storefront' ? 'text-[#1B3F61]' : 'text-slate-400'}`}
                            onClick={() => setSearchMode('storefront')}
                        >
                            Storefront
                        </span>
                        
                        <button 
                            onClick={() => setSearchMode(prev => prev === 'product' ? 'storefront' : 'product')}
                            className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none shadow-inner ${searchMode === 'product' ? 'bg-[#1B3F61]' : 'bg-slate-300'}`}
                        >
                            <div 
                                className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${searchMode === 'product' ? 'translate-x-6' : 'translate-x-0'}`} 
                            />
                        </button>
                        
                        <span 
                            className={`text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors ${searchMode === 'product' ? 'text-[#1B3F61]' : 'text-slate-400'}`}
                            onClick={() => setSearchMode('product')}
                        >
                            Product
                        </span>
                    </div>

                    <div className="mb-2">
                        <QuickFilters onApplyFilter={handleQuickFilter} />
                    </div>

                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {activeFilters.map((filter) => (
                                <span key={filter.id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1B3F61]/10 text-[#1B3F61] border border-[#1B3F61]/20">
                                    {filter.label}
                                    <button onClick={() => removeFilter(filter)} className="ml-1.5 hover:text-[#1B3F61]"><Icon name="X" size={10} /></button>
                                </span>
                            ))}
                            <button onClick={() => setActiveFilters([])} className="text-xs text-slate-500 underline ml-1">Clear</button>
                        </div>
                    )}

                    <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-2">
                        {categories.map((category) => (
                            <button 
                                key={category}
                                className="whitespace-nowrap px-4 py-2 rounded-full bg-white/50 border border-white/60 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-white hover:text-[#1B3F61] transition-all active:scale-95"
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-2 px-2">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                             {isLoading ? 'Searching...' : `${displayProducts.length} items found nearby`}
                         </span>
                         
                         <div className="md:hidden flex items-center space-x-2">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Map</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={showMapFull}
                                    onChange={() => setShowMapFull(!showMapFull)}
                                />
                                <div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:bg-[#1B3F61] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                            </label>
                         </div>
                    </div>
                </div>
            </div>

            {/* Results List Area */}
            {hasSearched && (
                <div className="flex-1 overflow-y-auto px-5 pb-20 scrollbar-hide animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-4 min-h-[200px] mt-2">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex p-3 bg-white/30 rounded-2xl animate-pulse">
                                    <div className="w-24 h-24 bg-white/40 rounded-xl"></div>
                                    <div className="ml-4 flex-1 space-y-2 py-2">
                                        <div className="h-4 bg-white/40 rounded w-3/4"></div>
                                        <div className="h-3 bg-white/40 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))
                        ) : displayProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white/30 rounded-3xl backdrop-blur-sm border border-white/40">
                                <Icon name="Search" size={32} className="mx-auto text-slate-400 mb-2" />
                                <p className="text-slate-600 font-medium">No results match your filters</p>
                            </div>
                        ) : (
                            displayProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={() => handleProductClick(product.id)}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
        
        {hasSearched && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/80 to-transparent pointer-events-none z-20" />
        )}
      </div>

      {/* Floating Map Controls */}
        {hasSearched && (
        <div className="fixed z-50 bottom-24 right-6 md:bottom-8 md:right-8">
            <button
                onClick={() => setShowMapFull(!showMapFull)}
                className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center text-slate-700 hover:bg-white hover:text-[#1B3F61] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/50"
                aria-label={showMapFull ? "Show List" : "Show Map"}
            >
                <Icon name={showMapFull ? "List" : "Map"} size={24} />
            </button>
        </div>
      )}

      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </div>
  );
};

const SearchResultsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
};

export default SearchResultsPage;