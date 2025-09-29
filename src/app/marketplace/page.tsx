"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  Filter,
  RefreshCw,
  Grid3X3,
  List,
  X,
} from "lucide-react";
import ActionBar from "./components/ActionBar";

// Type definitions
interface Product {
  id: any;
  name: string;
  vendor: string;
  price: number;
  salePrice?: number;
  originalPrice?: any;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  stock: number;
  category: string;
  isWishlisted?: boolean;
  description: string;
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    product_name: string;
    product_price: number;
    images: string[];
    category: string;
  };
}

interface PriceRange {
  min: string;
  max: string;
}

interface AvailabilityFilters {
  inStock: boolean;
  onSale: boolean;
  freeShipping: boolean;
}

interface Filters {
  categories: string[];
  vendors: string[];
  priceRange: PriceRange;
  minRating: number;
  availability: AvailabilityFilters;
}

type SortOption =
  | "relevance"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest"
  | "popular"
  | "category";

type FilterType =
  | "category"
  | "vendor"
  | "priceRange"
  | "rating"
  | "availability";

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
  description?: string;
  status?: string;
  visibility?: boolean;
}

interface ApiResponse {
  count: number;
  products: ApiProduct[];
}

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

// Notification Component
const NotificationToast = ({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: (id: string) => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const bgColors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div
      className={`fixed top-20 right-4 z-1 p-4 rounded-lg border ${
        bgColors[notification.type]
      } shadow-lg max-w-sm`}
      style={{
        animation: "slideInFromRight 0.3s ease-out",
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="text-lg text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({
  product,
  onAddToCart,
  onQuickView,
  onAddToWishlist,
  cartQuantities,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToWishlist: (productId: number | string, isWishlisted: boolean) => void;
  cartQuantities: { [key: number]: number };
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cartQuantity = cartQuantities[product.id] || 0;

  return (
    <div
      className="z-0 overflow-hidden transition-shadow duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={() => onAddToWishlist(product.id, !product.isWishlisted)}
          className={`absolute z-20 top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            product.isWishlisted
              ? "bg-white text-red-500"
              : "bg-white/80 text-gray-600 hover:bg-white"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${product.isWishlisted ? "fill-current" : ""}`}
          />
        </button>

        {/* Quick View Button */}
        {isHovered && (
          <button
            onClick={() => onQuickView(product)}
            className="absolute inset-0 z-10 flex items-center justify-center font-medium text-white transition-opacity duration-200 opacity-0 bg-black/50 hover:opacity-100"
          >
            Quick View
          </button>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500">{product.vendor}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-2 space-x-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₦{product.price.toLocaleString()}
            </span>
            {product.salePrice && (
              <span className="text-sm text-gray-500 line-through">
                ₦{product.originalPrice?.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          className="flex items-center justify-center w-full px-4 py-2 space-x-2 font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart {cartQuantity > 0 ? `(${cartQuantity})` : ""}</span>
        </button>
      </div>
    </div>
  );
};

// Main Marketplace Component
export default function MarketplaceBrowse() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cartQuantities, setCartQuantities] = useState<{
    [key: number]: number;
  }>({});
  const [isAddingToCart, setIsAddingToCart] = useState<{
    [key: number]: boolean;
  }>({});

  const [filters, setFilters] = useState<Filters>({
    categories: [],
    vendors: [],
    priceRange: { min: "", max: "" },
    minRating: 0,
    availability: {
      inStock: false,
      onSale: false,
      freeShipping: false,
    },
  });

  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get auth token from sessionStorage
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("RSToken") || "";
    }
    return "";
  };

  // Add notification
  const addNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // API call helper for cart operations
  const cartApiCall = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found. Please log in again.");
    }

    const headers = {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cart API Error:", response.status, errorText);
      throw new Error(
        `HTTP ${response.status}: ${errorText || "Request failed"}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return null;
  };

  // Add to cart function
  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      setIsAddingToCart((prev) => ({ ...prev, [product.id]: true }));

      await cartApiCall("https://server.bizengo.com/api/cart/add", {
        method: "POST",
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity,
        }),
      });

      // Update local cart quantities
      setCartQuantities((prev) => ({
        ...prev,
        [product.id]: (prev[product.id] || 0) + quantity,
      }));

      addNotification("success", `${product.name} added to cart!`);
    } catch (error: any) {
      console.error("Error adding to cart:", error);

      if (error.message.includes("No authentication token")) {
        addNotification("error", "Please log in to add items to cart");
      } else if (error.message.includes("401")) {
        addNotification("error", "Session expired. Please log in again");
      } else {
        addNotification("error", "Failed to add item to cart");
      }
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // Fetch current cart to get quantities
  const fetchCartQuantities = async () => {
    try {
      const data = await cartApiCall("https://server.bizengo.com/api/cart");

      // console.log(data);

      const quantities: { [key: number]: number } = {};
      (data.cart_items || []).forEach((item: any) => {
        quantities[item.id] = item.quantity;
      });

      setCartQuantities(quantities);
    } catch (error) {
      console.error("Error fetching cart quantities:", error);
      // Don't show error notification for this as it's background operation
    }
  };

  // API URL
  const API_URL = "https://server.bizengo.com/api/marketplace/popular-products";

  // Function to transform API response to our Product interface
  const transformApiProduct = (apiProduct: ApiProduct): Product => {
    return {
      id: apiProduct.id,
      name: apiProduct.product_name,
      vendor: apiProduct.vendor.business_name,
      price: apiProduct.product_price,
      salePrice: undefined,
      originalPrice: apiProduct.product_price,
      rating: 4.5,
      reviewCount: Math.floor(Math.random() * 200) + 10,
      image:
        apiProduct.images && apiProduct.images.length > 0
          ? apiProduct.images[0]
          : "https://via.placeholder.com/400x400?text=No+Image",
      images: apiProduct.images || [],
      stock: 10,
      category: apiProduct.category.toLowerCase(),
      isWishlisted: false,
      description: apiProduct.description || "No description available",
    };
  };

  // Fetch products from API
  const fetchProductsFromAPI = async (): Promise<Product[]> => {
    try {
      setFetchError(null);

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

      const transformedProducts = data.products
        .filter(
          (product) =>
            product.product_name &&
            product.product_price !== undefined &&
            product.vendor?.business_name
        )
        .map(transformApiProduct);

      return transformedProducts;
    } catch (error) {
      console.error("Error fetching products:", error);
      setFetchError("Failed to load products. Please try again later.");
      return [];
    }
  };

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initial load of products and cart quantities
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const fetchedProducts = await fetchProductsFromAPI();
      setAllProducts(fetchedProducts);

      // Fetch cart quantities if user is logged in
      if (getAuthToken()) {
        await fetchCartQuantities();
      }

      setLoading(false);
    };

    initializeData();
  }, []);

  // Filter and sort products when filters/search/sort changes
  useEffect(() => {
    loadProducts(true);
  }, [filters, sortBy, searchQuery, allProducts]);

  const loadProducts = useCallback(
    async (reset: boolean = false): Promise<void> => {
      if (allProducts.length === 0 && !loading) return;

      setLoading(reset);

      let filteredProducts = [...allProducts];

      // Apply search filter
      if (searchQuery) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }

      // Apply category filter
      if (filters.categories.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
          filters.categories.includes(product.category)
        );
      }

      // Apply vendor filter
      if (filters.vendors.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
          filters.vendors.includes(
            product.vendor.toLowerCase().replace(/\s+/g, "")
          )
        );
      }

      // Apply price range filter
      if (filters.priceRange.min || filters.priceRange.max) {
        const min = parseFloat(filters.priceRange.min) || 0;
        const max = parseFloat(filters.priceRange.max) || Infinity;
        filteredProducts = filteredProducts.filter((product) => {
          const price = product.salePrice || product.price;
          return price >= min && price <= max;
        });
      }

      // Apply rating filter
      if (filters.minRating > 0) {
        filteredProducts = filteredProducts.filter(
          (product) => product.rating >= filters.minRating
        );
      }

      // Apply availability filters
      if (filters.availability.inStock) {
        filteredProducts = filteredProducts.filter(
          (product) => product.stock > 0
        );
      }

      if (filters.availability.onSale) {
        filteredProducts = filteredProducts.filter(
          (product) => product.salePrice
        );
      }

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          filteredProducts.sort(
            (a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)
          );
          break;
        case "price-high":
          filteredProducts.sort(
            (a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)
          );
          break;
        case "rating":
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case "newest":
          filteredProducts.sort((a, b) => b.id - a.id);
          break;
        case "popular":
          filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
        case "category":
          filteredProducts.sort((a, b) => a.category.localeCompare(b.category));
          break;
        default:
          break;
      }

      const itemsPerPage = 12;
      if (reset) {
        setProducts(filteredProducts.slice(0, itemsPerPage));
        setCurrentPage(1);
        setHasMore(filteredProducts.length > itemsPerPage);
      } else {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setProducts((prev) => [
          ...prev,
          ...filteredProducts.slice(startIndex, endIndex),
        ]);
        setHasMore(filteredProducts.length > endIndex);
      }

      setLoading(false);
    },
    [filters, sortBy, searchQuery, currentPage, allProducts, loading]
  );

  const handleLoadMore = useCallback(async (): Promise<void> => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
      await loadProducts(false);
    }
  }, [loadProducts, loading, hasMore]);

  const handleAddToWishlist = (
    productId: number | string,
    isWishlisted: boolean
  ): void => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, isWishlisted } : product
      )
    );
    setAllProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, isWishlisted } : product
      )
    );
  };

  const handleQuickView = (product: Product): void => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleBuyNow = (product: Product): void => {
    // Add to cart first, then redirect to checkout
    addToCart(product, 1);
    // In a real app, you would navigate to checkout page
    addNotification("info", "Redirecting to checkout...");
  };

  const handleRefreshProducts = async (): Promise<void> => {
    setLoading(true);
    const fetchedProducts = await fetchProductsFromAPI();
    setAllProducts(fetchedProducts);
    setCurrentPage(1);

    // Refresh cart quantities
    if (getAuthToken()) {
      await fetchCartQuantities();
    }
  };

  // Get unique categories and vendors for filters
  const uniqueCategories = [...new Set(allProducts.map((p) => p.category))];
  const uniqueVendors = [...new Set(allProducts.map((p) => p.vendor))];

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Notifications */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      <div className="flex h-screen">
        {/* Desktop Filter Sidebar */}
        {!isMobile && (
          <div className="overflow-y-auto bg-white border-r border-gray-200 w-60">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() =>
                    setFilters({
                      categories: [],
                      vendors: [],
                      priceRange: { min: "", max: "" },
                      minRating: 0,
                      availability: {
                        inStock: false,
                        onSale: false,
                        freeShipping: false,
                      },
                    })
                  }
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="mb-3 font-medium">Categories</h3>
                <div className="space-y-2">
                  {uniqueCategories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...filters.categories, category]
                            : filters.categories.filter((c) => c !== category);
                          setFilters((prev) => ({
                            ...prev,
                            categories: newCategories,
                          }));
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="mb-3 font-medium">Price Range</h3>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header Controls */}
          <div className="bg-white border-b border-gray-200">
            {/* Search and Controls */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center ml-4 space-x-2">
                  {/* Refresh Button */}
                  <button
                    onClick={handleRefreshProducts}
                    disabled={loading}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                  </button>

                  {/* Mobile Filter Button */}
                  {isMobile && (
                    <button
                      onClick={() => setIsFilterPanelOpen(true)}
                      className="flex items-center px-3 py-2 space-x-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filter</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Results Info and Sort */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {loading
                      ? "Loading..."
                      : `${products.length} products found`}
                  </span>
                  {fetchError && (
                    <span className="text-sm text-red-600">{fetchError}</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            {loading && products.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <div className="mb-4 text-6xl">📦</div>
                <p className="text-lg">No products found</p>
                <p className="text-sm">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onQuickView={handleQuickView}
                      onAddToWishlist={handleAddToWishlist}
                      cartQuantities={cartQuantities}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" /> Load More
                          <span>Loading...</span>
                        </div>
                      ) : (
                        "Load More Products"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filter Panel */}
        {isMobile && isFilterPanelOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsFilterPanelOpen(false)}>
            <div className="absolute top-0 right-0 h-full overflow-y-auto bg-white w-80">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="mb-3 font-medium">Categories</h3>
                  <div className="space-y-2">
                    {uniqueCategories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...filters.categories, category]
                              : filters.categories.filter(
                                  (c) => c !== category
                                );
                            setFilters((prev) => ({
                              ...prev,
                              categories: newCategories,
                            }));
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="mb-3 font-medium">Price Range</h3>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: {
                            ...prev.priceRange,
                            min: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceRange: {
                            ...prev.priceRange,
                            max: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Apply Filters Button */}
                <button
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="w-full py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick View Modal */}
        {isQuickViewOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Quick View</h2>
                  <button
                    onClick={() => setIsQuickViewOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Product Image */}
                  <div className="overflow-hidden bg-gray-100 rounded-lg aspect-square">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Product Details */}
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">
                      {selectedProduct.name}
                    </h3>
                    <p className="mb-2 text-gray-600">
                      {selectedProduct.vendor}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center mb-4 space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(selectedProduct.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({selectedProduct.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        ₦{selectedProduct.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mb-6 text-gray-700">
                      {selectedProduct.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          addToCart(selectedProduct);
                          setIsQuickViewOpen(false);
                        }}
                        disabled={isAddingToCart[selectedProduct.id]}
                        className="flex items-center justify-center w-full px-4 py-3 space-x-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>
                          {isAddingToCart[selectedProduct.id]
                            ? "Adding..."
                            : "Add to Cart"}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          handleBuyNow(selectedProduct);
                          setIsQuickViewOpen(false);
                        }}
                        className="w-full px-4 py-3 font-semibold text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-900"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Action Bar - Only show when a product is selected */}
        {isMobile && selectedProduct && (
          <ActionBar
            product={selectedProduct}
            cartQuantity={cartQuantities[selectedProduct.id] || 0}
            onAddToCart={() => addToCart(selectedProduct)}
            onBuyNow={() => handleBuyNow(selectedProduct)}
            onWishlistToggle={() =>
              handleAddToWishlist(
                selectedProduct.id,
                !selectedProduct.isWishlisted
              )
            }
            isWishlisted={selectedProduct.isWishlisted || false}
          />
        )}
      </div>
    </div>
  );
}
