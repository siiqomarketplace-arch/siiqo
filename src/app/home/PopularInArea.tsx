import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import Button from "@/components/Button";
import Skeleton from "@/components/skeleton";
import { productService } from "@/services/productService";
import { PopularItem, ApiProduct, ApiResponse } from "@/types/popular";

const PopularInArea: React.FC = () => {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const generateDistance = (productId: number): string => {
    const seed = productId;
    const distance = (((Math.sin(seed * 9999) * 10000) % 3) + 0.5).toFixed(1);
    return `${Math.abs(parseFloat(distance))} miles`;
  };

  const generateRatingAndReviews = (productId: number) => {
    const seed = productId;
    const rating = +(((Math.sin(seed * 1111) * 10000) % 1.5) + 3.5).toFixed(1);
    const reviews = Math.floor((Math.sin(seed * 2222) * 10000) % 200) + 20;
    return {
      rating: Math.abs(rating),
      reviews: Math.abs(reviews),
    };
  };

  const calculatePopularity = (rating: number, reviews: number): number => {
    const ratingScore = (rating / 5) * 60;
    const reviewScore = Math.min(reviews / 200, 1) * 40;
    return Math.round(ratingScore + reviewScore);
  };

  const transformApiProduct = (apiProduct: ApiProduct): PopularItem => {
    const { rating, reviews } = generateRatingAndReviews(apiProduct.id);
    const popularity = calculatePopularity(rating, reviews);

    return {
      id: apiProduct.id,
      title: apiProduct.product_name,
      price: apiProduct.product_price,
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

  const fetchPopularProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const data: ApiResponse = await productService.getProducts();

      const transformedProducts = data.products
        .filter(
          (product) =>
            product.product_name &&
            product.product_price !== undefined &&
            product.vendor?.business_name
        )
        .map(transformApiProduct)
        .sort((a, b) => b.popularity - a.popularity);

      console.log("Transformed popular products:", transformedProducts);

      setPopularItems(transformedProducts);
    } catch (err) {
      console.error("Error fetching popular products:", err);
      setError("Failed to load popular products. Please try again later.");
      setPopularItems([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleRetry = () => {
    fetchPopularProducts();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="border rounded-lg bg-surface border-border animate-pulse"
          >
            <Skeleton
              type="text"
              className="w-full h-32 rounded-t-lg md:h-40 bg-surface-secondary"
            />
            <div className="p-3 space-y-2">
              <Skeleton
                type="text"
                count={4}
                className="w-full h-4 rounded bg-surface-secondary"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <Icon
            name="AlertCircle"
            size={48}
            className="mx-auto mb-4 text-destructive"
          />
          <h3 className="mb-2 text-lg font-semibold text-text-primary">
            Failed to Load Products
          </h3>
          <p className="max-w-md mb-4 text-text-secondary">{error}</p>
          <Button
            type="button" variant="navy"
            onClick={handleRetry}
            className="px-4 py-2 font-medium text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (popularItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <Icon
            name="Package"
            size={48}
            className="mx-auto mb-4 text-text-secondary"
          />
          <h3 className="mb-2 text-lg font-semibold text-text-primary">
            No Products Available
          </h3>
          <p className="max-w-md mb-4 text-text-secondary">
            There are currently no popular products in your area. Check back
            later for new arrivals!
          </p>
          <Button
            onClick={handleRetry}
            className="px-4 py-2 font-medium text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary-700"
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Popular in Your Area
          </h2>
          <p className="text-sm text-text-secondary">
            {popularItems.length} products found
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="orange"
            onClick={handleRetry}
            className="flex items-center gap-2 text-sm duration-200 trans-smition-colors"
            title="Refresh products"
          >
            <Icon name="RefreshCw" size={18} /> Refresh
          </Button>
          
          <Button type="button" variant="navy"
            onClick={() => router.push("/search-results?sort=popular")}
            className="text-sm transition-colors duration-200"
          >
            View All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {popularItems.map(item => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="transition-all duration-200 border rounded-lg cursor-pointer bg-surface border-border hover:shadow-elevation-2"
          >
            <div className="relative w-full h-32 overflow-hidden rounded-t-lg md:h-40">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/400x400?text=Product+Image";
                }}
              />
              <div className="absolute px-2 py-1 text-xs font-medium text-white rounded-full top-2 left-2 bg-primary">
                #{item.popularity}% Popular
              </div>
              <div className="absolute px-2 py-1 text-xs text-white bg-black bg-opacity-50 rounded-full top-2 right-2">
                {item.distance}
              </div>
              <Button
                type="button"
                variant="navy"
                onClick={e => toggleWishlist(e, item.id)}
                className="absolute p-2 transition-colors duration-200 bg-white rounded-full bottom-2 right-2 bg-opacity-90 hover:bg-white"
              >
                <Icon
                  name="Heart"
                  size={14}
                  className={
                    wishlist.has(item.id)
                      ? "text-slate-700 fill-current"
                      : "text-text-secondary text-slate-900"
                  }
                />
              </Button>
            </div>

            <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="flex-1 text-sm font-medium text-text-primary line-clamp-2">
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

              <div className="flex items-center justify-between mb-2 text-xs text-text-secondary">
                <div className="flex items-center space-x-1">
                  <Icon
                    name="Star"
                    size={10}
                    className="fill-current text-warning"
                  />
                  <span>{item.rating}</span>
                  <span>({item.reviews})</span>
                </div>
                <span className="px-2 py-1 rounded-full bg-surface-secondary">
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
                <Button
                  type="button"
                  variant="navy"
                  className="px-2 py-1 text-xs font-medium text-white transition-colors duration-200 rounded bg-primary hover:bg-primary-700"
                >
                  Quick View
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularInArea;
