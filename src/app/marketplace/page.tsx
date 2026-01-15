"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  Suspense,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import ProductCard from "./components/ProductCard";
import SearchSuggestions from "./components/SearchSuggestions";
import FilterPanel from "./components/FilterPanel";
import { useLocation } from "@/context/LocationContext";
import api_endpoints from "@/hooks/api_endpoints";

const MarketplaceBrowse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<"storefront" | "product">(
    "product"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [storefronts, setStorefronts] = useState<any[]>([]);
  const [hasError, setHasError] = useState(false);
  const { coords } = useLocation();

  const [activeFilters, setActiveFilters] = useState<any>({
    categories: [],
    vendors: [],
    priceRange: { min: "", max: "" },
    minRating: 0,
    availability: { inStock: false, onSale: false, freeShipping: false },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters, searchMode]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const categoriesList = [
    "Popular Categories",
    "Featured Storefront",
    "Shop by Distance",
  ];

  /**
   * ✅ TRANSFORM LOGIC
   * Maps API keys to ProductCard expectations
   */
  const transformApiProduct = useCallback((item: any) => {
    return {
      ...item,
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.original_price,
      image: item.image,
      seller: item.vendor_name,
      rating: item.rating || (Math.random() * (5 - 4) + 4).toFixed(1),
      reviewCount: item.reviewCount || Math.floor(Math.random() * 50),
      distance: item.distance_km
        ? `${parseFloat(item.distance_km).toFixed(1)} km`
        : null,
      isProduct: true,
      crypto_price: item.crypto_price,
    };
  }, []);

  const transformApiStorefront = useCallback((store: any) => {
    return {
      ...store,
      id: store.slug, // Storefronts often use slug as unique ID
      name: store.business_name,
      image: store.logo,
      banner: store.banner,
      seller: store.business_name,
      rating: 4.5,
      reviewCount: 12,
      distance: store.distance_km
        ? `${parseFloat(store.distance_km).toFixed(1)} km`
        : null,
      isProduct: false,
      isStorefront: true,
      store_slug: store.slug,
    };
  }, []);

  /**
   * ✅ UPDATED FETCH DATA
   * Logic: Fetch nearby first, if empty fetch all for each category independently
   */
  const fetchData = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const baseUrl = api_endpoints.MARKETPLACE_SEARCH;
      const query = searchParams.get("q") || "";

      const url = new URL(baseUrl);
      if (coords?.lat && coords?.lng) {
        url.searchParams.set("lat", String(coords.lat));
        url.searchParams.set("lng", String(coords.lng));
      }
      if (query) url.searchParams.set("q", query);

      const response = await fetch(url.toString());
      const json = await response.json();

      if (json.status === "success") {
        let p = json.data?.nearby_products || [];
        let s = json.data?.nearby_stores || [];

        // FALLBACK: If products are empty, fetch all products
        if (p.length === 0) {
          const productUrl = new URL(baseUrl);
          if (query) productUrl.searchParams.set("q", query);
          const productRes = await fetch(productUrl.toString());
          const productJson = await productRes.json();
          p =
            productJson.data?.products ||
            productJson.data?.nearby_products ||
            [];
        }

        // FALLBACK: If stores are empty, fetch all stores
        if (s.length === 0) {
          const storeUrl = new URL(baseUrl);
          if (query) storeUrl.searchParams.set("q", query);
          const storeRes = await fetch(storeUrl.toString());
          const storeJson = await storeRes.json();
          s =
            storeJson.data?.storefronts || storeJson.data?.nearby_stores || [];
        }

        setProducts(p.map(transformApiProduct));
        setStorefronts(s.map(transformApiStorefront));
      } else {
        setHasError(true);
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
  }, [searchParams, coords]);

  const displayItems = useMemo(() => {
    let current = searchMode === "product" ? [...products] : [...storefronts];

    if (activeFilters.priceRange?.max) {
      current = current.filter(
        (p) => p.price <= parseFloat(activeFilters.priceRange.max)
      );
    }

    if (searchQuery) {
      current = current.filter((item) =>
        (item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const start = (currentPage - 1) * itemsPerPage;
    return current.slice(start, start + itemsPerPage);
  }, [
    products,
    storefronts,
    activeFilters,
    searchMode,
    searchQuery,
    currentPage,
  ]);

  const totalItemsCount = useMemo(() => {
    let curr = searchMode === "product" ? [...products] : [...storefronts];
    if (activeFilters.priceRange?.max)
      curr = curr.filter(
        (p) => p.price <= parseFloat(activeFilters.priceRange.max)
      );
    if (searchQuery)
      curr = curr.filter((item) =>
        (item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    return curr.length;
  }, [products, storefronts, activeFilters, searchMode, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(totalItemsCount / itemsPerPage));

  const handleSearchSubmit = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("q", query);
    else params.delete("q");
    router.push(`/marketplace?${params.toString()}`);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-100 font-sans flex flex-col overflow-hidden">
      {/* LEFT PANEL */}
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
              onKeyDown={(e) =>
                e.key === "Enter" && handleSearchSubmit(searchQuery)
              }
              className="w-full placeholder-slate-400 py-3 pl-10 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            />
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

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
              <span
                className={`text-xs font-bold cursor-pointer transition-colors ${
                  searchMode === "storefront"
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}
                onClick={() => setSearchMode("storefront")}
              >
                Stores
              </span>
              <div
                onClick={() =>
                  setSearchMode(
                    searchMode === "storefront" ? "product" : "storefront"
                  )
                }
                className={`w-12 h-6 rounded-full cursor-pointer p-1 transition-all ${
                  searchMode === "product" ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all ${
                    searchMode === "product" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-bold cursor-pointer transition-colors ${
                  searchMode === "product" ? "text-gray-900" : "text-gray-400"
                }`}
                onClick={() => setSearchMode("product")}
              >
                Products
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide py-4 md:py-5 mb-4 w-full">
          {categoriesList.map((category) => (
            <button
              key={category}
              className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-slate-600 shadow-sm hover:bg-gray-50 transition-all active:scale-95 flex-shrink-0"
            >
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
            onKeyDown={(e) =>
              e.key === "Enter" && handleSearchSubmit(searchQuery)
            }
            className="w-full py-2 pl-8 pr-10 rounded-full border border-gray-300 text-sm"
          />
          <Icon
            name="Search"
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <button
            onClick={() => setIsFilterOpen(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
          >
            <Icon name="Filter" size={14} />
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <span
            className={`text-xs font-bold cursor-pointer transition-colors ${
              searchMode === "storefront" ? "text-gray-900" : "text-gray-400"
            }`}
            onClick={() => setSearchMode("storefront")}
          >
            Stores
          </span>
          <div
            onClick={() =>
              setSearchMode(
                searchMode === "storefront" ? "product" : "storefront"
              )
            }
            className={`w-12 h-6 rounded-full cursor-pointer p-1 transition-all ${
              searchMode === "product" ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all ${
                searchMode === "product" ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
          <span
            className={`text-xs font-bold cursor-pointer transition-colors ${
              searchMode === "product" ? "text-gray-900" : "text-gray-400"
            }`}
            onClick={() => setSearchMode("product")}
          >
            Products
          </span>
        </div>
      </div>

      {/* RIGHT PRODUCT RESULTS */}
      <div className="w-full md:ml-[40%] md:w-3/5 p-4 overflow-y-auto flex-1 mt-10 md:mt-20 mb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 text-sm font-medium tracking-wide">
              Finding items near you...
            </p>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6 bg-white rounded-xl shadow-sm m-4">
            <Icon name="AlertCircle" size={40} className="text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">
              Unable to load marketplace
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Check your connection and try again.
            </p>
            <button
              onClick={fetchData}
              className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-md"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid justify-center grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
              {displayItems.map((item) => (
                <ProductCard
                  key={`${item.isProduct ? "p" : "s"}-${item.id || item.slug}`}
                  product={item}
                  onAddToCart={() => console.log("Added to cart", item)}
                  onQuickView={() => console.log("Quick view", item)}
                  onAddToWishlist={(id, state) =>
                    console.log("Wishlist", id, state)
                  }
                  cartQuantities={{}}
                  isAddingToCart={{}}
                />
              ))}
              {displayItems.length === 0 && (
                <div className="col-span-full py-20 text-center flex flex-col items-center">
                  <Icon
                    name="SearchX"
                    size={48}
                    className="text-slate-300 mb-4"
                  />
                  <p className="text-slate-500 font-medium">
                    No {searchMode === "product" ? "products" : "stores"} found.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      fetchData();
                    }}
                    className="text-blue-600 text-sm font-bold mt-2 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalItemsCount > itemsPerPage && (
              <div className="flex items-center justify-center gap-4 mt-12 mb-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="ChevronLeft" size={20} />
                </button>

                <div className="text-sm font-semibold text-slate-600">
                  Page <span className="text-blue-600">{currentPage}</span> of{" "}
                  {totalPages}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="ChevronRight" size={20} />
                </button>
              </div>
            )}
          </>
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
  <Suspense
    fallback={
      <div className="h-screen flex items-center justify-center text-slate-500">
        Loading marketplace...
      </div>
    }
  >
    <MarketplaceBrowse />
  </Suspense>
);

export default MarketPlaceBrowsePage;
