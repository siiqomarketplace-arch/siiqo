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
  const API_URL = "https://server.bizengo.com/api/marketplace/popular-products";

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
        <div className="px-4 md:px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Icon
                name="Search"
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
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
                className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border rounded-lg text-sm placeholder-text-secondary focus:outline-none focus:bg-surface focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-border-light transition-colors duration-200"
                >
                  <Icon name="X" size={14} className="text-text-secondary" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsFilterOpen(true)}
              className="p-2 rounded-lg border border-border hover:bg-surface-secondary transition-colors duration-200 relative"
            >
              <Icon
                name="SlidersHorizontal"
                size={20}
                className="text-text-primary"
              />
              {activeFilters.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleViewModeChange("map")}
              className="p-2 rounded-lg border border-border hover:bg-surface-secondary transition-colors duration-200"
            >
              <Icon name="Map" size={20} className="text-text-primary" />
            </button>

            <button
              onClick={handleRetry}
              className="p-2 rounded-lg border border-border hover:bg-surface-secondary transition-colors duration-200"
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
        <div className="hidden lg:block w-80 border-r border-border bg-surface">
          <div className="sticky top-32 h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-heading font-semibold text-text-primary">
                  Filters
                </h3>
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-primary hover:text-primary-700 transition-colors duration-200"
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
            <div className="px-4 md:px-6 py-3 bg-surface-secondary border-b border-border">
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <span className="text-sm text-text-secondary">
                  Active filters:
                </span>
                {activeFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center space-x-1 bg-primary-50 text-primary px-3 py-1 rounded-full text-sm"
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
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Quick Filters - Mobile */}
          <div className="lg:hidden px-4 py-3 border-b border-border bg-white">
            <QuickFilters onApplyFilter={handleQuickFilter} />
          </div>

          {/* Sort and Results Count */}
          <div className="px-4 md:px-6 py-4 border-b border-border bg-surface">
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
                  className="text-sm border border-border rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
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
          <div className="px-4 md:px-6 py-6">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-surface-secondary rounded-lg aspect-square mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-surface-secondary rounded"></div>
                      <div className="h-3 bg-surface-secondary rounded w-2/3"></div>
                      <div className="h-3 bg-surface-secondary rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon
                    name="AlertCircle"
                    size={48}
                    className="text-destructive"
                  />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text-primary mb-2">
                  Failed to Load Products
                </h3>
                <p className="text-text-secondary mb-6">{error}</p>
                <button
                  onClick={handleRetry}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon
                    name="Search"
                    size={48}
                    className="text-text-secondary"
                  />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text-primary mb-2">
                  No results found
                </h3>
                <p className="text-text-secondary mb-6">
                  {searchQuery
                    ? `No products found for "${searchQuery}". Try adjusting your search terms or filters.`
                    : "Try adjusting your filters or search for something else."}
                </p>
                <div className="flex items-center justify-center space-x-4">
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="border border-border text-text-primary px-6 py-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
            <div className="px-4 md:px-6 py-6 text-center">
              <button
                onClick={handleRetry}
                className="bg-surface border border-border text-text-primary px-8 py-3 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
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
