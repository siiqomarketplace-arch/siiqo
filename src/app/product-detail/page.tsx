"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ImageGallery from "./components/ImageGallery";
import ProductInfo from "./components/ProductInfo";
import LocationMap from "./components/LocationMap";
import SellerCard from "./components/SellerCard";
import SimilarProducts from "./components/SimilarProducts";
import PriceComparison from "./components/PriceComparison";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import Button from "@/components/Button";
import { useCartModal } from "@/context/cartModalContext";
import { productService } from "@/services/productService";
import { cartService } from "@/services/cartService";
import {
  ApiProductFull,
  Product,
  PriceComparisonItem,
  Notification,
} from "@/types/product-detail";

const NotificationToast: React.FC<{
  notification: Notification;
  onClose: (id: string) => void;
}> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg border ${
        bgColors[notification.type]
      } shadow-lg max-w-sm animate-in slide-in-from-right duration-300`}
    >
      <div className="flex items-start space-x-3">
        {icons[notification.type]}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {notification.message}
          </p>
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const { openCart } = useCartModal();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const transformApiProduct = (apiProduct: ApiProductFull): Product => {
    return {
      id: apiProduct.id.toString(),
      title: apiProduct.product_name || "Unknown Product",
      price: apiProduct.product_price / 100 || 0,
      originalPrice: (apiProduct.product_price / 100) * 1.2 || 0,
      discount: apiProduct.discount ?? 0,
      condition: apiProduct.condition ?? "Like New",
      rating: apiProduct.rating ?? 4.7,
      reviewCount: apiProduct.review_count ?? 0,
      distance: apiProduct.distance ?? 0,
      location: apiProduct.location ?? { address: "Unknown", lat: 0, lng: 0 },
      images:
        apiProduct.images.length > 0
          ? apiProduct.images
          : [
              "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop",
            ],
      description: apiProduct.description || "No description available",
      specifications: {
        Category: apiProduct.category || "General",
        Status: apiProduct.status || "unknown",
        "Product ID": apiProduct.id.toString(),
        Seller: apiProduct.seller?.name || "Unknown",
      },
      seller: {
        id: apiProduct.seller?.id.toString() || "0",
        name: apiProduct.seller?.name || "Unknown Seller",
        avatar:
          apiProduct.seller?.avatar ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        rating: apiProduct.seller?.rating ?? 0,
        reviewCount: apiProduct.seller?.review_count ?? 0,
        responseTime: apiProduct.seller?.response_time || "N/A",
        memberSince: apiProduct.seller?.member_since || "N/A",
        verifiedSeller: apiProduct.seller?.verified ?? false,
      },
      availability:
        apiProduct.availability ??
        (apiProduct.status === "active" ? "Available" : "Unavailable"),
      lastUpdated: apiProduct.last_updated
        ? new Date(apiProduct.last_updated)
        : new Date(),
      views: apiProduct.views ?? 0,
      watchers: apiProduct.watchers ?? 0,
    };
  };

  const currentCategory = product?.specifications?.Category;

  const handleNavigateToVendorProfile = (vendor: Product["seller"]) => {
    if (!vendor || !vendor.name) return;

    const slugify = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const businessSlug = slugify(vendor.name);
    router.push(`/seller-profile/${encodeURIComponent(businessSlug)}`);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const productId = searchParams.get("id") || "1";
        if (!productId) {
          setError("Missing product ID.");
          return;
        }

        const apiProduct = await productService.getProductById(productId);

        console.log("API Product Response:", apiProduct);
        const transformedProduct = transformApiProduct(apiProduct);
        setProduct(transformedProduct);

        const category = apiProduct.category;
        console.log("Current Product Category:", category);

        if (category) {
          try {
            const similarResponse = await productService.getProducts();

            console.log("All product with thesame Category: ", similarResponse);

            if (Array.isArray(similarResponse)) {
              const transformed = similarResponse.map(transformApiProduct);
              const filtered = transformed.filter(
                (p: Product) => p.id !== productId
              );
              setAllProducts(filtered);
            }
          } catch (err) {
            console.error("Error fetching similar products:", err);
            setAllProducts([]);
          }
        }

        console.log("Fetched Product:", transformedProduct);

        if (typeof window !== "undefined") {
          const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
          setIsWishlisted(wishlist.includes(transformedProduct.id));
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
        addNotification("error", "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [searchParams]);

  const handleWishlistToggle = () => {
    if (!product || typeof window === "undefined") return;

    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    let updatedWishlist;

    if (isWishlisted) {
      updatedWishlist = wishlist.filter((id: string) => id !== product.id);
      addNotification("info", "Removed from wishlist");
    } else {
      updatedWishlist = [...wishlist, product.id];
      addNotification("success", "Added to wishlist");
    }

    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = async (quantity: number = 1) => {
    if (!product) return;

    try {
      setIsAddingToCart(true);

      await cartService.addToCart(parseInt(product.id), quantity);

      setCartQuantity(prev => prev + quantity);
      addNotification(
        "success",
        `Added ${quantity} item(s) to cart successfully!`
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      addNotification("error", "Failed to add item to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      setIsBuyingNow(true);

      await cartService.addToCart(parseInt(product.id), 1);

      setCartQuantity(prev => prev + 1);
      openCart(1);

      addNotification("success", "Product added! Redirecting to checkout...");
    } catch (error) {
      console.error("Error on Buy Now:", error);
      addNotification("error", "Failed to process Buy Now. Please try again.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleContactSeller = () => {
    addNotification("info", "Opening seller contact...");
    const businessName = sessionStorage.getItem("selectedBusinessName");

    if (!businessName) {
      console.error("Business name not found!");
      return;
    }

    if (businessName) {
      const slugify = (text: string) =>
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

      const businessSlug = slugify(businessName);
      router.push(
        `/seller-profile/${encodeURIComponent(businessSlug)}?tab=contact`
      );
    } else {
      console.warn("Missing business name!");
    }
  };

  const handleGetDirections = () => {
    if (!product) return;

    const { lat, lng } = product.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const handleShare = async () => {
    if (!product) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this ${product.title} for ₦${product.price}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      addNotification("success", "Link copied to clipboard!");
    }
  };

  const priceComparisons: PriceComparisonItem[] = [
    {
      id: "comp_001",
      seller: "Mobile World",
      price: 929,
      condition: "New",
      distance: 1.5,
      rating: 4.6,
    },
    {
      id: "comp_002",
      seller: "Phone Paradise",
      price: 949,
      condition: "New",
      distance: 2.3,
      rating: 4.4,
    },
    {
      id: "comp_003",
      seller: "Digital Store",
      price: 879,
      condition: "Like New",
      distance: 3.1,
      rating: 4.7,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
          <p className="text-text-secondary">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            Product Not Available
          </h2>
          <p className="mb-4 text-text-secondary">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const similarProductsData = allProducts.filter(
    (p: Product) =>
      p.id !== product?.id &&
      p.specifications?.Category === product?.specifications?.Category
  );

  return (
    <div className="min-h-screen mb-20 bg-background">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      <div className="hidden lg:block">
        <div className="px-6 py-8 mx-auto max-w-7xl">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              <ImageGallery
                images={product.images}
                activeIndex={activeImageIndex}
                onImageChange={setActiveImageIndex}
              />

              <LocationMap
                location={product.location}
                onGetDirections={handleGetDirections}
              />
            </div>

            <div className="space-y-6">
              <ProductInfo
                product={product}
                isWishlisted={isWishlisted}
                onWishlistToggle={handleWishlistToggle}
                onShare={handleShare}
                showFullDescription={showFullDescription}
                onToggleDescription={() =>
                  setShowFullDescription(!showFullDescription)
                }
              />

              <SellerCard
                seller={product.seller}
                onContact={handleContactSeller}
                onNavigateToVendorProfile={() =>
                  handleNavigateToVendorProfile(product.seller)
                }
              />

              <PriceComparison
                comparisons={priceComparisons}
                currentPrice={product.price}
              />

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="navy"
                  onClick={handleBuyNow}
                  disabled={isBuyingNow || product.availability !== "Available"}
                  className="w-full py-4 text-sm transition-colors duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBuyingNow ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Buy Now - ₦${product.price.toLocaleString()}`
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddToCart(1)}
                  disabled={
                    isAddingToCart || product.availability !== "Available"
                  }
                  className="w-full py-4 text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
                      <span>Adding to Cart...</span>
                    </div>
                  ) : (
                    `Add to Cart ${cartQuantity > 0 ? `(${cartQuantity})` : ""}`
                  )}
                </Button>
              </div>

              {product.availability !== "Available" && (
                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <p className="text-sm font-medium text-yellow-800">
                    This product is currently unavailable.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12">
            <SimilarProducts
              products={similarProductsData}
              onProductClick={(productId: string) =>
                router.push(`/product-detail?id=${productId}`)
              }
            />
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="space-y-0">
          <ImageGallery
            images={product.images}
            activeIndex={activeImageIndex}
            onImageChange={setActiveImageIndex}
            isMobile={true}
          />

          <div className="px-4 py-6 space-y-6">
            <ProductInfo
              product={product}
              isWishlisted={isWishlisted}
              onWishlistToggle={handleWishlistToggle}
              onShare={handleShare}
              showFullDescription={showFullDescription}
              onToggleDescription={() =>
                setShowFullDescription(!showFullDescription)
              }
              isMobile={true}
            />

            <LocationMap
              location={product.location}
              onGetDirections={handleGetDirections}
              isMobile={true}
            />

            <SellerCard
              seller={product.seller}
              onContact={handleContactSeller}
              isMobile={true}
              onNavigateToVendorProfile={() =>
                handleNavigateToVendorProfile(product.seller)
              }
            />

            <PriceComparison
              comparisons={priceComparisons}
              currentPrice={product.price}
              isMobile={true}
            />

            <SimilarProducts
              products={similarProductsData}
              onProductClick={(productId: string) =>
                router.push(`/product-detail?id=${productId}`)
              }
            />

            <div className="fixed bottom-0 left-0 right-0 p-4 space-y-3 bg-white border-t border-border">
              <Button
                type="button"
                variant="navy"
                onClick={handleBuyNow}
                disabled={isBuyingNow || product.availability !== "Available"}
                className="text-sm transition-colors duration-200disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuyingNow ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Buy Now - ₦${product.price.toLocaleString()}`
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddToCart(1)}
                disabled={
                  isAddingToCart || product.availability !== "Available"
                }
                className="w-full py-4 text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
                    <span>Adding to Cart...</span>
                  </div>
                ) : (
                  `Add to Cart ${cartQuantity > 0 ? `(${cartQuantity})` : ""}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetailPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
            <p className="text-text-secondary">Loading...</p>
          </div>
        </div>
      }
    >
      <ProductDetail />
    </Suspense>
  );
};

export default ProductDetailPage;
