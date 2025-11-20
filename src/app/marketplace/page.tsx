"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Heart, ShoppingCart, Star, Filter, RefreshCw, X, LucideCircleArrowOutUpRight, LucideShoppingBag } from "lucide-react";
import { fetchProducts, addToCart, fetchCartItems } from "@/services/api";
import ProductCard, { ProductCardSkeleton } from "./components/ProductCard";
import Button from "@/components/Button";
import Skeleton from "@/components/skeleton";
import { useRouter } from "next/navigation";

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

const ActionBar = ({
  product,
  cartQuantity,
  onAddToCart,
  onBuyNow,
  onWishlistToggle,
  isWishlisted,
}: {
  product: Product;
  cartQuantity: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onWishlistToggle: () => void;
  isWishlisted: boolean;
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-lg font-bold text-gray-900">
            ₦{product.price.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onWishlistToggle}
            className={`p-3 rounded-lg transition-colors ${
              isWishlisted
                ? "bg-red-50 text-red-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
            />
          </button>

          <button
            onClick={onAddToCart}
            className="flex items-center px-4 py-3 space-x-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add {cartQuantity > 0 ? `(${cartQuantity})` : ""}</span>
          </button>

          <button
            onClick={onBuyNow}
            className="px-4 py-3 font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

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
      className={`fixed top-20 right-4 z-50 p-4 rounded-lg border ${
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

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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

  const [isDisabled, setIsDisabled] = useState(false);

  const addNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

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

  const fetchProductsFromAPI = async (): Promise<Product[]> => {
    try {
      setFetchError(null);
      const { data }: { data: ApiResponse } = await fetchProducts();

      const transformedProducts = data.products
        .filter(
          product =>
            product.product_name &&
            product.product_price !== undefined &&
            product.vendor?.business_name
        )
        .map(transformApiProduct);

      return transformedProducts;
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setFetchError("Failed to load products. Please try again later.");

      if (error.message.includes("401")) {
        addNotification("error", "Session expired. Please log in again.");
      }

      return [];
    }
  };

  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    try {
      setIsAddingToCart(prev => ({ ...prev, [product.id]: true }));

      await addToCart({
        product_id: product.id,
        quantity: quantity,
      });

      setCartQuantities(prev => ({
        ...prev,
        [product.id]: (prev[product.id] || 0) + quantity,
      }));

      addNotification("success", `${product.name} added to cart!`);
    } catch (error: any) {
      console.error("Error adding to cart:", error);

      if (error.message.includes("401")) {
        addNotification("error", "Please log in to add items to cart");
      } else {
        addNotification("error", "Failed to add item to cart");
      }
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const fetchCartQuantities = async () => {
    try {
      const { data } = await fetchCartItems();

      const quantities: { [key: number]: number } = {};
      (data.cart_items || []).forEach((item: any) => {
        quantities[item.product_id] = item.quantity;
      });

      setCartQuantities(quantities);
    } catch (error: any) {
      console.error("Error fetching cart quantities:", error);

      if (error.message.includes("500")) {
        console.log(
          "Cart is empty or endpoint issue - continuing without cart data"
        );
        setCartQuantities({});
      }
    }
  };

  // Update your initial load to not break if cart fails
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      // Fetch products first
      const fetchedProducts = await fetchProductsFromAPI();
      setAllProducts(fetchedProducts);

      // Try to fetch cart, but don't fail if it errors
      if (typeof window !== "undefined" && sessionStorage.getItem("RSToken")) {
        try {
          await fetchCartQuantities();
        } catch (error) {
          console.log("Could not load cart - user may not have cart yet");
          // Continue without cart data
        }
      }

      setLoading(false);
      setInitialLoadComplete(true);
    };

    initializeData();
  }, []);

  // Detect mobile
  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const fetchedProducts = await fetchProductsFromAPI();
      setAllProducts(fetchedProducts);

      if (typeof window !== "undefined" && sessionStorage.getItem("RSToken")) {
        await fetchCartQuantities();
      }

      setLoading(false);
      setInitialLoadComplete(true);
    };

    initializeData();
  }, []);

  // Filter and sort
  useEffect(() => {
    loadProducts(true);
  }, [filters, sortBy, searchQuery, allProducts]);

  const loadProducts = useCallback(
    async (reset: boolean = false): Promise<void> => {
      if (allProducts.length === 0 && !loading) return;

      setLoading(reset);

      let filteredProducts = [...allProducts];

      if (searchQuery) {
        filteredProducts = filteredProducts.filter(
          product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }

      if (filters.categories.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          filters.categories.includes(product.category)
        );
      }

      if (filters.vendors.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          filters.vendors.includes(
            product.vendor.toLowerCase().replace(/\s+/g, "")
          )
        );
      }

      if (filters.priceRange.min || filters.priceRange.max) {
        const min = parseFloat(filters.priceRange.min) || 0;
        const max = parseFloat(filters.priceRange.max) || Infinity;
        filteredProducts = filteredProducts.filter(product => {
          const price = product.salePrice || product.price;
          return price >= min && price <= max;
        });
      }

      if (filters.minRating > 0) {
        filteredProducts = filteredProducts.filter(
          product => product.rating >= filters.minRating
        );
      }

      if (filters.availability.inStock) {
        filteredProducts = filteredProducts.filter(
          product => product.stock > 0
        );
      }

      if (filters.availability.onSale) {
        filteredProducts = filteredProducts.filter(
          product => product.salePrice
        );
      }

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
        setProducts(prev => [
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
      setCurrentPage(prev => prev + 1);
      await loadProducts(false);
    }
  }, [loadProducts, loading, hasMore]);

  const handleAddToWishlist = (
    productId: number | string,
    isWishlisted: boolean
  ): void => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId ? { ...product, isWishlisted } : product
      )
    );
    setAllProducts(prev =>
      prev.map(product =>
        product.id === productId ? { ...product, isWishlisted } : product
      )
    );
  };

  const handleQuickView = (product: Product): void => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleBuyNow = (product: Product): void => {
    addToCart({ product_id: product.id, quantity: 1 });
    addNotification("info", "Redirecting to checkout...");
  };

  const handleRefreshProducts = async (): Promise<void> => {
    setLoading(true);
    const fetchedProducts = await fetchProductsFromAPI();
    setAllProducts(fetchedProducts);
    setCurrentPage(1);

    if (typeof window !== "undefined" && sessionStorage.getItem("RSToken")) {
      await fetchCartQuantities();
    }
  };

  // Navigate to details page
  const router = useRouter();

  const handleNavigateToDetailPage = (item: Product) => {
    router.push(`/product-detail?id=${item.id}`);
  };

  const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
  const uniqueVendors = [...new Set(allProducts.map(p => p.vendor))];

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

      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      <div className="flex h-screen">
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

              <div className="mb-6">
                <h3 className="mb-3 font-medium">Categories</h3>
                <div className="space-y-2">
                  {!initialLoadComplete ? (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Skeleton type="rect" className="w-4 h-4" />
                          <Skeleton type="text" className="w-24" />
                        </div>
                      ))}
                    </>
                  ) : (
                    uniqueCategories.map(category => (
                      <label
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={e => {
                            const newCategories = e.target.checked
                              ? [...filters.categories, category]
                              : filters.categories.filter(c => c !== category);
                            setFilters(prev => ({
                              ...prev,
                              categories: newCategories,
                            }));
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{category}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              {/* price section */}
              <div className="mb-6">
                <h3 className="mb-3 font-medium">Price Range</h3>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={e =>
                      setFilters(prev => ({
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
                    onChange={e =>
                      setFilters(prev => ({
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

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center ml-4 space-x-2">
                  <button
                    onClick={handleRefreshProducts}
                    disabled={loading}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                  </button>

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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {loading && products.length === 0
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
                    onChange={e => setSortBy(e.target.value as SortOption)}
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

          <div className="flex-1 p-4 overflow-y-auto">
            {!initialLoadComplete ? (
              // Show skeleton during initial load
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(12)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
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
                <div className="grid grid-cols-1 gap-3 mb-24 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onQuickView={handleQuickView}
                      onAddToWishlist={handleAddToWishlist}
                      cartQuantities={cartQuantities}
                      isAddingToCart={isAddingToCart}
                    />
                  ))}
                </div>

                {/* load more */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
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

        {/* mobile filter */}
        {isMobile && isFilterPanelOpen && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setIsFilterPanelOpen(false)}
          >
            <div
              className="absolute top-0 right-0 h-full overflow-y-auto bg-white w-80"
              onClick={e => e.stopPropagation()}
            >
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

                <div className="mb-6">
                  <h3 className="mb-3 font-medium">Categories</h3>
                  <div className="space-y-2">
                    {uniqueCategories.map(category => (
                      <label
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={e => {
                            const newCategories = e.target.checked
                              ? [...filters.categories, category]
                              : filters.categories.filter(c => c !== category);
                            setFilters(prev => ({
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

                {/* price range */}
                <div className="mb-6">
                  <h3 className="mb-3 font-medium">Price Range</h3>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min}
                      onChange={e =>
                        setFilters(prev => ({
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
                      onChange={e =>
                        setFilters(prev => ({
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

        {/* quick view */}
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
                  <div className="overflow-hidden bg-gray-100 rounded-lg aspect-square">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xl font-semibold">
                      {selectedProduct.name}
                    </h3>
                    <p className="mb-2 text-gray-600">
                      {selectedProduct.vendor}
                    </p>

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

                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        ₦{selectedProduct.price.toLocaleString()}
                      </span>
                    </div>

                    <p className="mb-6 text-gray-700">
                      {selectedProduct.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex flex-col lg:gap-3 lg:flex-row">
                        <Button
                          type="button"
                          variant="navy"
                          onClick={() => {
                            addToCart(selectedProduct);
                            setIsQuickViewOpen(false);
                          }}
                          disabled={isAddingToCart[selectedProduct.id]}
                          className="flex items-center justify-center w-full px-4 py-3 space-x-2 text-sm text-white transition-colors disabled:opacity-50"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          <span>
                            {isAddingToCart[selectedProduct.id]
                              ? "Adding..."
                              : "Add to Cart"}
                          </span>
                        </Button>

                        <Button
                          type="button"
                          variant="orange"
                          onClick={() => {
                            setIsDisabled(true);
                            handleNavigateToDetailPage(selectedProduct);
                          }}
                          disabled={isDisabled}
                          className="flex items-center justify-center w-full gap-2 px-4 text-sm transition-colors disabled:opacity-50"
                        >
                          <LucideCircleArrowOutUpRight className="w-4 h-4" />
                          <span>
                            {" "}
                            {isDisabled ? "Viewing..." : "View Detail"}
                          </span>
                        </Button>
                      </div>

                      <Button
                        onClick={() => {
                          handleBuyNow(selectedProduct);
                          setIsQuickViewOpen(false);
                        }}
                        className="flex items-center w-full gap-2 py-3 text-sm transition-colors items-centerpx-4 hover:bg-slate-800 bg-slate-900"
                      >
                        <LucideShoppingBag className="w-4 h-4" /> Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* mobile action bar */}
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
