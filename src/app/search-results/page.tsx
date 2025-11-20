"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import FilterDrawer from "@/components/ui/FilterDrawer";
import ProductCard from "./components/ProductCard";
import QuickFilters from "./components/QuickFilters";
import SearchSuggestions from "./components/SearchSuggestions";
import MapViewToggle from "./components/MapViewToggle";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  seller: string;
  rating: number;
  reviewCount: number;
  distance: number;
  condition: string;
  category: string;
  isVerified: boolean;
  availability: string;
  location: string;
  postedDate: string;
}

interface Filter {
  type: string;
  label: string;
  value: any;
  id: string;
}

// API Response interfaces
interface ApiVendor {
  business_name: string;
  email: string;
  id: number;
}

interface ApiProduct {
  category: string;
  id: number;
  images: string[];
  product_name: string;
  product_price: number;
  vendor: ApiVendor;
  // Optional fields
  description?: string;
  status?: string;
  visibility?: boolean;
}

interface ApiResponse {
  count: number;
  products: ApiProduct[];
}

const SearchResults = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState("relevance");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // API URL
  const API_URL = "https://server.siiqo.com/api/marketplace/popular-products";

  // Function to generate consistent random data based on product ID
  const generateProductExtras = (productId: number) => {
    const seed = productId;
    const random = (min: number, max: number, multiplier: number = 1) => {
      return Math.abs(
        ((Math.sin(seed * multiplier) * 10000) % (max - min + 1)) + min
      );
    };

    const rating = +(random(35, 50, 1111) / 10).toFixed(1); // 3.5 to 5.0
    const reviewCount = Math.floor(random(20, 200, 2222));
    const distance = +(random(5, 50, 3333) / 10).toFixed(1); // 0.5 to 5.0 miles
    const conditions = ["New", "Like New", "Good", "Fair"];
    const condition = conditions[Math.floor(random(0, 3, 4444))];
    const locations = [
      "Downtown District",
      "Tech Plaza",
      "Mall Center",
      "Electronics District",
      "Vintage Quarter",
    ];
    const location = locations[Math.floor(random(0, 4, 5555))];

    // Generate posted date (within last 30 days)
    const daysAgo = Math.floor(random(1, 30, 6666));
    const postedDate = new Date();
    postedDate.setDate(postedDate.getDate() - daysAgo);

    return {
      rating,
      reviewCount,
      distance,
      condition,
      location,
      postedDate: postedDate.toISOString().split("T")[0], // YYYY-MM-DD format
      isVerified: random(0, 1, 7777) > 0.3, // 70% chance of being verified
      availability: random(0, 1, 8888) > 0.2 ? "In Stock" : "Limited Stock",
    };
  };

  // Transform API product to our Product interface
  const transformApiProduct = (apiProduct: ApiProduct): Product => {
    const extras = generateProductExtras(apiProduct.id);

    return {
      id: apiProduct.id,
      name: apiProduct.product_name,
      price: apiProduct.product_price,
      originalPrice: Math.round(apiProduct.product_price * 1.2), // Simulate original price
      image:
        apiProduct.images && apiProduct.images.length > 0
          ? apiProduct.images[0]
          : "https://via.placeholder.com/400x400?text=No+Image",
      seller: apiProduct.vendor.business_name,
      rating: extras.rating,
      reviewCount: extras.reviewCount,
      distance: extras.distance,
      condition: extras.condition,
      category: apiProduct.category,
      isVerified: extras.isVerified,
      availability: extras.availability,
      location: extras.location,
      postedDate: extras.postedDate,
    };
  };

  // Fetch products from API
  const fetchProducts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      // Transform API products to our Product interface
      const transformedProducts = data.products
        .filter(
          (product) =>
            // Only filter out products missing essential data
            product.product_name &&
            product.product_price !== undefined &&
            product.vendor?.business_name
        )
        .map(transformApiProduct);

      console.log("Fetched and transformed products:", transformedProducts);
      setProducts(transformedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  interface SortOption {
    value: string;
    label: string;
  }

  const sortOptions: SortOption[] = [
    { value: "relevance", label: "Most Relevant" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "distance", label: "Nearest First" },
    { value: "newest", label: "Newest First" },
    { value: "rating", label: "Highest Rated" },
  ];

  const recentSearches: string[] = [
    "iPhone 14",
    "MacBook",
    "Gaming laptop",
    "Vintage clothes",
    "Home decor",
  ];

  const popularSearches: string[] = [
    "Electronics",
    "Furniture",
    "Clothing",
    "Books",
    "Sports equipment",
  ];

  // Effect to load initial products based on search params
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const view = searchParams.get("view") || "list";

    setSearchQuery(query);
    setViewMode(view as "list" | "map");

    // Fetch products from API
    fetchProducts();
  }, [searchParams]);

  // This useMemo hook calculates the products to be displayed with search functionality
  const displayProducts = useMemo(() => {
    let currentProducts = [...products];

    // 1. Apply search query filter first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      currentProducts = currentProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.seller.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.location.toLowerCase().includes(query)
      );
    }

    // 2. Apply additional filters from activeFilters
    activeFilters.forEach((filter) => {
      switch (filter.type) {
        case "price":
          currentProducts = currentProducts.filter(
            (p) => p.price <= filter.value
          );
          break;
        case "distance":
          currentProducts = currentProducts.filter(
            (p) => p.distance <= filter.value
          );
          break;
        case "rating":
          currentProducts = currentProducts.filter(
            (p) => p.rating >= filter.value
          );
          break;
        case "condition":
          currentProducts = currentProducts.filter(
            (p) => p.condition === filter.value
          );
          break;
        case "category":
          currentProducts = currentProducts.filter(
            (p) => p.category.toLowerCase() === filter.value.toLowerCase()
          );
          break;
        case "availability":
          currentProducts = currentProducts.filter(
            (p) => p.availability === filter.value
          );
          break;
        case "verified":
          currentProducts = currentProducts.filter(
            (p) => p.isVerified === filter.value
          );
          break;
      }
    });

    // 3. Apply sorting
    switch (sortBy) {
      case "price-low":
        currentProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        currentProducts.sort((a, b) => b.price - a.price);
        break;
      case "distance":
        currentProducts.sort((a, b) => a.distance - b.distance);
        break;
      case "newest":
        currentProducts.sort(
          (a, b) =>
            new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
        break;
      case "rating":
        currentProducts.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // 'relevance' - for search results, prioritize name matches first
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          currentProducts.sort((a, b) => {
            const aNameMatch = a.name.toLowerCase().includes(query) ? 1 : 0;
            const bNameMatch = b.name.toLowerCase().includes(query) ? 1 : 0;
            return bNameMatch - aNameMatch;
          });
        }
        break;
    }
    return currentProducts;
  }, [products, activeFilters, sortBy, searchQuery]);

  const handleProductClick = (productId: number) => {
    router.push(`/product-detail?id=${productId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSearchSubmit = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query);
    router.push(`/search-results?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleQuickFilter = (filter: Omit<Filter, "id">) => {
    setActiveFilters((prev) => [
      ...prev,
      { ...filter, id: Date.now().toString() },
    ]);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  const removeFilter = (filterToRemove: Filter) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filterToRemove.id));
  };

  const handleViewModeChange = (newViewMode: "list" | "map") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newViewMode);
    router.push(`/search-results?${params.toString()}`);
  };

  const handleRetry = () => {
    fetchProducts();
  };

  if (viewMode === "map") {
    return (
      <MapViewToggle
        products={displayProducts}
        onBackToList={() => handleViewModeChange("list")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-100 left-0 right-0 z-[250] bg-white border-b border-border">
        <div className="px-4 py-3 md:px-6">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Icon
                name="Search"
                size={18}
                className="absolute transform -translate-y-1/2 left-3 top-1/2 text-text-secondary"
              />
              <input
                type="text"
                placeholder="Search products, stores..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleSearchSubmit(searchQuery)
                }
                className="w-full py-2 pl-10 pr-4 text-sm transition-all duration-200 border rounded-lg bg-surface-secondary border-border placeholder-text-secondary focus:outline-none focus:bg-surface focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute p-1 transition-colors duration-200 transform -translate-y-1/2 rounded-full right-3 top-1/2 hover:bg-border-light"
                >
                  <Icon name="X" size={14} className="text-text-secondary" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsFilterOpen(true)}
              className="relative p-2 transition-colors duration-200 border rounded-lg border-border hover:bg-surface-secondary"
            >
              <Icon
                name="SlidersHorizontal"
                size={20}
                className="text-text-primary"
              />
              {activeFilters.length > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white rounded-full -top-1 -right-1 bg-accent">
                  {activeFilters.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleViewModeChange("map")}
              className="p-2 transition-colors duration-200 border rounded-lg border-border hover:bg-surface-secondary"
            >
              <Icon name="Map" size={20} className="text-text-primary" />
            </button>

            <button
              onClick={handleRetry}
              className="p-2 transition-colors duration-200 border rounded-lg border-border hover:bg-surface-secondary"
              title="Refresh results"
            >
              <Icon
                name="RefreshCw"
                size={20}
                className={`text-text-primary ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {showSuggestions && (
        <SearchSuggestions
          query={searchQuery}
          recentSearches={recentSearches}
          popularSearches={popularSearches}
          onSelectSuggestion={handleSearchSubmit}
          onClose={() => setShowSuggestions(false)}
        />
      )}

      <div className="flex">
        {/* Desktop Sidebar Filters */}
        <div className="hidden border-r lg:block w-80 border-border bg-surface">
          <div className="sticky top-32 h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold font-heading text-text-primary">
                  Filters
                </h3>
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm transition-colors duration-200 text-primary hover:text-primary-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <QuickFilters onApplyFilter={handleQuickFilter} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="px-4 py-3 border-b md:px-6 bg-surface-secondary border-border">
              <div className="flex flex-wrap items-center gap-2 space-x-2">
                <span className="text-sm text-text-secondary">
                  Active filters:
                </span>
                {activeFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center px-3 py-1 space-x-1 text-sm rounded-full bg-primary-50 text-primary"
                  >
                    <span>{filter.label}</span>
                    <button
                      onClick={() => removeFilter(filter)}
                      className="ml-1 hover:bg-primary-100 rounded-full p-0.5 transition-colors duration-200"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-sm transition-colors duration-200 text-text-secondary hover:text-text-primary"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Quick Filters - Mobile */}
          <div className="px-4 py-3 bg-white border-b lg:hidden border-border">
            <QuickFilters onApplyFilter={handleQuickFilter} />
          </div>

          {/* Sort and Results Count */}
          <div className="px-4 py-4 border-b md:px-6 border-border bg-surface">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                {isLoading
                  ? "Searching..."
                  : `${displayProducts.length} results found`}
                {searchQuery && (
                  <span className="ml-1">for "{searchQuery}"</span>
                )}
                {error && (
                  <span className="ml-2 text-destructive">({error})</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 text-sm transition-colors duration-200 border rounded-lg border-border focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="px-4 py-6 md:px-6">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="mb-3 rounded-lg bg-surface-secondary aspect-square"></div>
                    <div className="space-y-2">
                      <div className="h-4 rounded bg-surface-secondary"></div>
                      <div className="w-2/3 h-3 rounded bg-surface-secondary"></div>
                      <div className="w-1/2 h-3 rounded bg-surface-secondary"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-surface-secondary">
                  <Icon
                    name="AlertCircle"
                    size={48}
                    className="text-destructive"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold font-heading text-text-primary">
                  Failed to Load Products
                </h3>
                <p className="mb-6 text-text-secondary">{error}</p>
                <button
                  onClick={handleRetry}
                  className="px-6 py-2 text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary-700"
                >
                  Try Again
                </button>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-surface-secondary">
                  <Icon
                    name="Search"
                    size={48}
                    className="text-text-secondary"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold font-heading text-text-primary">
                  No results found
                </h3>
                <p className="mb-6 text-text-secondary">
                  {searchQuery
                    ? `No products found for "${searchQuery}". Try adjusting your search terms or filters.`
                    : "Try adjusting your filters or search for something else."}
                </p>
                <div className="flex items-center justify-center space-x-4">
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-2 text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary-700"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-6 py-2 transition-colors duration-200 border rounded-lg border-border text-text-primary hover:bg-surface-secondary"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => handleProductClick(product.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Load More */}
          {!isLoading && !error && displayProducts.length > 0 && (
            <div className="px-4 py-6 text-center md:px-6">
              <button
                onClick={handleRetry}
                className="px-8 py-3 transition-colors duration-200 border rounded-lg bg-surface border-border text-text-primary hover:bg-surface-secondary"
              >
                Refresh Results
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
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
