import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import Button from "@/components/Button";
import Skeleton from "@/components/skeleton";
import { productService } from "@/services/productService";
import { Product, APIResponse } from "@/types/products";

interface NearbyDealsProps {
  onRefresh: () => Promise<void>;
}

const NearbyDeals: React.FC<NearbyDealsProps> = ({ onRefresh }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setError(null);
      const data: APIResponse = await productService.getProducts();
      setProducts(data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const generateDealData = (product: Product) => {
    const seed = product.id;
    const random = (min: number, max: number) =>
      Math.floor((Math.sin(seed * 9999) * 10000) % (max - min + 1)) + min;

    const discount = random(10, 35);
    const originalPrice = Math.round(
      product.product_price / (1 - discount / 100)
    );

    return {
      originalPrice,
      discount,
      distance: `${(random(1, 20) / 10).toFixed(1)} miles`,
      rating: random(40, 50) / 10,
      condition: ["New", "Like New", "Open Box"][random(0, 2)],
    };
  };

  const handleDealClick = (product: Product) => {
    router.push(`/product-detail?id=${product.id}`);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchProducts();
      await onRefresh();
    } catch (err) {
      console.error("Error during refresh:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-text-secondary">
          Failed to load products: {error}
        </p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute hidden md:block -top-12 right-12">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center px-3 py-2 space-x-2 transition-colors duration-200 text-text-secondary hover:text-text-primary"
        >
          <Icon
            name="RefreshCw"
            size={16}
            className={isLoading ? "animate-spin" : ""}
          />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-hide custom-scrollbar custom-scrollbar-height">
        <div className="flex pb-4 space-x-4">
          {isLoading && products.length === 0 ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 border rounded-lg w-72 bg-surface border-border animate-pulse"
              >
                <div className="w-full h-48 bg-gray-300 rounded-t-lg"></div>
                <div className="p-4">
                  <Skeleton
                    type="text"
                    className="mb-2 bg-gray-300 rounded -4"
                  />
                  <Skeleton
                    type="text"
                    className="h-4 mb-2 bg-gray-300 rounded"
                  />
                  <Skeleton
                    type="text"
                    className="w-24 h-6 mb-2 bg-gray-300 rounded"
                  />
                  <Skeleton
                    type="text"
                    className="w-32 h-4 mb-3 bg-gray-300 rounded"
                  />
                  <Skeleton type="text" className="h-8 bg-gray-300 rounded" />
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="flex-shrink-0 py-8 text-center w-72 text-text-secondary">
              No products available
            </div>
          ) : (
            products.map(product => {
              const dealData = generateDealData(product);

              return (
                <div
                  key={product.id}
                  onClick={() => handleDealClick(product)}
                  className="flex-shrink-0 transition-all duration-200 border rounded-lg cursor-pointer w-72 bg-surface border-border hover:shadow-elevation-2"
                >
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={
                        product.images[0] ||
                        "https://via.placeholder.com/400x300?text=No+Image"
                      }
                      alt={product.product_name}
                      fill={true}
                      className="object-cover"
                      sizes="288px"
                    />
                    <div className="absolute px-2 py-1 text-xs font-medium text-black rounded-full top-3 left-3 bg-accent">
                      {dealData.discount}% OFF
                    </div>
                    <div className="absolute px-2 py-1 text-xs text-white bg-black bg-opacity-50 rounded-full top-3 right-3">
                      {dealData.distance}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="flex-1 text-base font-medium text-text-primary line-clamp-2">
                        {product.product_name}
                      </h3>
                      <button className="p-1 ml-2 transition-colors duration-200 rounded-full hover:bg-surface-secondary">
                        <Icon
                          name="Heart"
                          size={16}
                          className="text-text-secondary"
                        />
                      </button>
                    </div>

                    <div className="flex items-center mb-2 space-x-2">
                      <span className="text-lg font-semibold text-text-primary">
                        ₦{product.product_price.toLocaleString()}
                      </span>
                      <span className="text-sm line-through text-text-secondary">
                        ₦{dealData.originalPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3 text-sm text-text-secondary">
                      <span className="px-2 py-1 text-xs rounded-full bg-success-50 text-success">
                        {dealData.condition}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Icon
                          name="Star"
                          size={12}
                          className="fill-current text-warning"
                        />
                        <span>{dealData.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">
                        {product.vendor?.business_name ?? "Unknown Vendor"}
                      </span>
                      <Button
                        variant="navy"
                        className="px-3 py-1 text-sm font-medium text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary-700"
                      >
                        View Deal
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyDeals;
