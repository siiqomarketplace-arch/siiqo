// /marketplace/page.tsx
"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import ProductCard from "./components/ProductCard";
import SearchSuggestions from "./components/SearchSuggestions";
import FilterPanel from "./components/FilterPanel";
import { productService } from "@/services/productService";
import { ApiProduct, ApiResponse, Filters } from "@/types/marketplace";

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Mini Q12",
    image: "https://api.bizengo.com/images/products/17_a7388584e71843ceac2bab17294dd407.jpeg",
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
  },
];

const MarketplaceBrowse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<"storefront" | "product">("product");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<Filters[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const categories = ["Popular Categories", "Featured Storefront", "Shop by Distance", "Service Tag"];
  
  const removeFilter = (filter: Filters) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filter.id));
  };

  const transformApiProduct = (apiProduct: ApiProduct) => {
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
      distance: random(1, 10),
      condition: "Like New",
      category: apiProduct.category || "General",
      isVerified: Math.random() > 0.5,
      availability: Math.random() > 0.3 ? "In Stock" : "Limited",
      location: "Downtown",
      postedDate: new Date().toISOString().split("T")[0],
      isProduct: true,
    };
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
    //   let backendProducts: any[] = [];
    //   try {
    //     const data: ApiResponse = await productService.getProducts();
    //     if (data?.products) {
    //       backendProducts = data.products.filter((p) => p.product_name).map(transformApiProduct);
    //     }
    //   } catch {
    //     console.warn("Backend fetch failed, using mocks only.");
    //   }
    //   const mockIds = new Set(MOCK_PRODUCTS.map((p) => String(p.id)));
    //   const uniqueBackend = backendProducts.filter((p) => !mockIds.has(String(p.id)));
    //   setProducts([...MOCK_PRODUCTS, ...uniqueBackend]);
      // --- Using Dummy Data Instead ---
      // Simulate slight delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(MOCK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const displayProducts = useMemo(() => {
    let current = [...products];
    if (searchMode === "storefront") current = current.filter((p) => !p.isProduct);
    else current = current.filter((p) => p.isProduct);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      current = current.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.seller.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    activeFilters.forEach((filter) => {
      if (filter.type === "price") current = current.filter((p) => p.price <= filter.value);
      if (filter.type === "distance") current = current.filter((p) => p.distance <= filter.value);
    });

    return current;
  }, [products, activeFilters, searchQuery, searchMode]);

  const handleSearchSubmit = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query);
    router.push(`/marketplace?${params.toString()}`);
    setShowSuggestions(false);
  };

return (
    <div className="relative w-full min-h-screen bg-slate-100 font-sans flex flex-col overflow-hidden">
        
        {/* LEFT PANEL - Desktop Only */}
        <div className="hidden md:flex md:fixed md:left-0 md:top-16 md:w-2/5 md:h-screen md:z-0 bg-white/60 backdrop-blur-xl border-r border-white/40 flex-col items-start p-6 overflow-y-auto">
            
            {/* Search + Mode Toggle */}
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
                </div>

                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span
                            className={`text-xs font-bold cursor-pointer ${searchMode === 'storefront' ? 'text-gray-900' : 'text-gray-400'}`}
                            onClick={() => setSearchMode('storefront')}
                        >
                            Storefront
                        </span>
                        <div
                            onClick={() => setSearchMode(searchMode === "product" ? "storefront" : "product")}
                            className={`w-12 h-6 rounded-full cursor-pointer p-1 transition-all ${searchMode === "product" ? "bg-blue-500" : "bg-gray-300"}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all ${searchMode === "product" ? "translate-x-6" : "translate-x-0"}`} />
                        </div>
                        <span
                            className={`text-xs font-bold cursor-pointer ${searchMode === 'product' ? 'text-gray-900' : 'text-gray-400'}`}
                            onClick={() => setSearchMode('product')}
                        >
                            Product
                        </span>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide overflow-y-hidden py-7 mb-4 w-full">
                {categories.map((category) => (
                    <button key={category} className="whitespace-nowrap px-3 py-2 rounded-full bg-white/50 border border-white/60 text-sm font-medium text-slate-600 shadow-sm hover:bg-white/90 hover:text-slate-900 transition-all active:scale-95 flex-shrink-0">
                        {category}
                    </button>
                ))}
            </div>

            {/* Desktop Filter Panel */}
            <div className="w-full mt-2 z-0 h-screen overflow-y-scroll">
                <FilterPanel
                    isOpen={true}
                    isMobile={false}
                    filters={{
                        categories: [],
                        vendors: [],
                        priceRange: { min: '', max: '' },
                        minRating: 0,
                        availability: { inStock: false, onSale: false, freeShipping: false }
                    }}
                    onFiltersChange={(filters) => console.log(filters)}
                />
            </div>
        </div>

        {/* MOBILE HEADER */}
        <div className="md:hidden w-full bg-white/60 backdrop-blur-xl border-b border-white/40 p-4 sticky top-0 z-20">
            <div className="relative mb-3">
                <input
                    type="text"
                    placeholder="Search marketplace..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(e.target.value.length > 0);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(searchQuery)}
                    className="w-full placeholder-slate-400 py-2 pl-8 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                />
                <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <button onClick={() => setIsFilterOpen(true)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
                    <Icon name="Filter" size={14} />
                </button>
            </div>

            <div className="flex items-center gap-2 justify-center">
                <span
                    className={`text-xs font-bold cursor-pointer ${searchMode === 'storefront' ? 'text-gray-900' : 'text-gray-400'}`}
                    onClick={() => setSearchMode('storefront')}
                >
                    Storefront
                </span>
                <div
                    onClick={() => setSearchMode(searchMode === "product" ? "storefront" : "product")}
                    className={`w-10 h-5 rounded-full cursor-pointer p-1 transition-all ${searchMode === "product" ? "bg-blue-500" : "bg-gray-300"}`}
                >
                    <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-all ${searchMode === "product" ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <span
                    className={`text-xs font-bold cursor-pointer ${searchMode === 'product' ? 'text-gray-900' : 'text-gray-400'}`}
                    onClick={() => setSearchMode('product')}
                >
                    Product
                </span>
            </div>
        </div>

        {/* MOBILE CATEGORIES */}
        <div className="md:hidden w-full overflow-x-auto scrollbar-hide px-4 py-2 bg-slate-100">
            <div className="flex gap-2 items-center">
                {categories.map((category) => (
                    <button key={category} className="whitespace-nowrap px-2 py-1 rounded-full bg-white/50 border border-white/60 text-xs font-medium text-slate-600 shadow-sm hover:bg-white/90 active:scale-95 flex-shrink-0">
                        {category}
                    </button>
                ))}
            </div>
        </div>

        {/* RIGHT PRODUCT RESULTS */}
        <div className="w-full md:ml-[40%] md:w-3/5 p-4 overflow-y-auto flex-1">
            {isLoading ? (
                <div className="text-center text-gray-500 py-20">Loading...</div>
            ) : displayProducts.length === 0 ? (
                <div className="text-center text-gray-500 py-20">No results found</div>
            ) : (
                <div className="grid justify-center grid-cols-[80%] sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 pb-4">
                    {displayProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
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

        {/* Mobile Filter Panel */}
        <div>
  <FilterPanel
            isOpen={isFilterOpen}
            isMobile={true}
            filters={{
                categories: [],
                vendors: [],
                priceRange: { min: '', max: '' },
                minRating: 0,
                availability: { inStock: false, onSale: false, freeShipping: false }
            }}
            onFiltersChange={(filters) => console.log(filters)}
            onClose={() => setIsFilterOpen(false)}
        />
        </div>
      
    </div>
);
};

const MarketPlaceBrowsePage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <MarketplaceBrowse />
  </Suspense>
);

export default MarketPlaceBrowsePage;
