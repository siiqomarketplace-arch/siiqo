import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";

interface PopularItem {
  id: number;
  title: string;
  price: number;
  image: string;
  distance: string;
  seller: string;
  rating: number;
  reviews: number;
  popularity: number;
  category: string;
  description: string;
}

// API Response interfaces - updated to match actual API response
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
  // Optional fields that may not exist in API response
  description?: string;
  status?: string;
  visibility?: boolean;
}

interface ApiResponse {
  count: number;
  products: ApiProduct[];
}

const PopularInArea: React.FC = () => {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API URL
  const API_URL = "https://server.bizengo.com/api/marketplace/popular-products";

  // Function to generate consistent random distance based on product ID
  const generateDistance = (productId: number): string => {
    const seed = productId;
    const distance = (((Math.sin(seed * 9999) * 10000) % 3) + 0.5).toFixed(1);
    return `${Math.abs(parseFloat(distance))} miles`;
  };

  // Function to generate consistent random rating and reviews based on product ID
  const generateRatingAndReviews = (productId: number) => {
    const seed = productId;
    const rating = +(((Math.sin(seed * 1111) * 10000) % 1.5) + 3.5).toFixed(1); // 3.5 to 5.0
    const reviews = Math.floor((Math.sin(seed * 2222) * 10000) % 200) + 20; // 20 to 220
    return {
      rating: Math.abs(rating),
      reviews: Math.abs(reviews),
    };
  };

  // Function to generate popularity score based on rating and reviews
  const calculatePopularity = (rating: number, reviews: number): number => {
    // Simple popularity calculation: higher rating and more reviews = higher popularity
    const ratingScore = (rating / 5) * 60; // Max 60 points for rating
    const reviewScore = Math.min(reviews / 200, 1) * 40; // Max 40 points for reviews
    return Math.round(ratingScore + reviewScore);
  };

  // Function to transform API product to PopularItem
  const transformApiProduct = (apiProduct: ApiProduct): PopularItem => {
    const { rating, reviews } = generateRatingAndReviews(apiProduct.id);
    const popularity = calculatePopularity(rating, reviews);

    return {
      id: apiProduct.id,
      title: apiProduct.product_name,
      price: apiProduct.product_price, // Keep as is since your prices appear to be in correct format
      image:
        apiProduct.images && apiProduct.images.length > 0
          ? apiProduct.images[0]
          : "https://via.placeholder.com/400x400?text=No+Image",
      distance: generateDistance(apiProduct.id),
      seller: apiProduct.vendor.business_name,
      rating,
      reviews,
      popularity,
      category: apiProduct.category,
      description: apiProduct.description || "No description available",
    };
  };

  // Fetch products from API
  const fetchPopularProducts = async (): Promise<void> => {
    try {
      setLoading(true);
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

      // Transform API products to PopularItem format
      // Fixed: Remove problematic filter and only validate essential fields
      const transformedProducts = data.products
        .filter(
          (product) =>
            // Only filter out products missing essential data
            product.product_name &&
            product.product_price !== undefined &&
            product.vendor?.business_name
        )
        .map(transformApiProduct)
        .sort((a, b) => b.popularity - a.popularity); // Sort by popularity descending

      console.log("Transformed popular products:", transformedProducts); // Debug log

      setPopularItems(transformedProducts);
    } catch (err) {
      console.error("Error fetching popular products:", err);
      setError("Failed to load popular products. Please try again later.");
      setPopularItems([]); // Clear products on error
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPopularProducts();
  }, []);

  const handleItemClick = (item: PopularItem) => {
    router.push(`/product-detail?id=${item.id}`);
  };

  const toggleWishlist = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(itemId)) {
        newWishlist.delete(itemId);
      } else {
        newWishlist.add(itemId);
      }
      return newWishlist;
    });
  };

  const getPopularityColor = (popularity: number): string => {
    if (popularity >= 90) return "text-success";
    if (popularity >= 80) return "text-warning";
    return "text-text-secondary";
  };

  // Retry function for error state
  const handleRetry = () => {
    fetchPopularProducts();
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-surface rounded-lg border border-border animate-pulse"
          >
            <div className="w-full h-32 md:h-40 bg-surface-secondary rounded-t-lg"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 bg-surface-secondary rounded w-3/4"></div>
              <div className="h-4 bg-surface-secondary rounded w-1/2"></div>
              <div className="h-3 bg-surface-secondary rounded w-full"></div>
              <div className="h-3 bg-surface-secondary rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <Icon
            name="AlertCircle"
            size={48}
            className="text-destructive mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Failed to Load Products
          </h3>
          <p className="text-text-secondary mb-4 max-w-md">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no products available
  if (popularItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <Icon
            name="Package"
            size={48}
            className="text-text-secondary mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Products Available
          </h3>
          <p className="text-text-secondary mb-4 max-w-md">
            There are currently no popular products in your area. Check back
            later for new arrivals!
          </p>
          <button
            onClick={handleRetry}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Products grid
  return (
    <div>
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Popular in Your Area
          </h2>
          <p className="text-sm text-text-secondary">
            {popularItems.length} products found
          </p>
        </div>
        <button
          onClick={handleRetry}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
          title="Refresh products"
        >
          <Icon name="RefreshCw" size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {popularItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="bg-surface rounded-lg border border-border hover:shadow-elevation-2 transition-all duration-200 cursor-pointer"
          >
            {/* Image */}
            <div className="relative overflow-hidden rounded-t-lg w-full h-32 md:h-40">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onError={(e) => {
                  // Fallback image on error
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/400x400?text=Product+Image";
                }}
              />
              <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                #{item.popularity}% Popular
              </div>
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                {item.distance}
              </div>
              <button
                onClick={(e) => toggleWishlist(e, item.id)}
                className="absolute bottom-2 right-2 p-2 bg-white bg-opacity-90 rounded-full hover:bg-white transition-colors duration-200"
              >
                <Icon
                  name="Heart"
                  size={14}
                  className={
                    wishlist.has(item.id)
                      ? "text-accent fill-current"
                      : "text-text-secondary"
                  }
                />
              </button>
            </div>

            {/* Content */}
            <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-text-primary line-clamp-2 flex-1">
                  {item.title}
                </h3>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-semibold text-text-primary">
                  ₦{item.price.toLocaleString()}
                </span>
                <span
                  className={`text-xs font-medium ${getPopularityColor(
                    item.popularity
                  )}`}
                >
                  🔥 Hot
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
                <div className="flex items-center space-x-1">
                  <Icon
                    name="Star"
                    size={10}
                    className="text-warning fill-current"
                  />
                  <span>{item.rating}</span>
                  <span>({item.reviews})</span>
                </div>
                <span className="bg-surface-secondary px-2 py-1 rounded-full">
                  {item.category}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className="text-xs text-text-secondary truncate max-w-[100px]"
                  title={item.seller}
                >
                  {item.seller}
                </span>
                <button className="bg-primary text-white px-2 py-1 rounded text-xs font-medium hover:bg-primary-700 transition-colors duration-200">
                  Quick View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularInArea;
