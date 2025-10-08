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

// API Response Types
interface ApiProduct {
  id: number;
  product_name: string;
  description: string;
  product_price: number;
  category: string;
  images: string[];
  status: string;
  visibility: boolean;
  vendor: {
    id: number;
    business_name: string;
    email: string;
  };
}

// Local Product Interface (transformed from API)
interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discount?: number;
  condition: string;
  rating: number;
  reviewCount: number;
  distance: number;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  images: string[];
  description: string;
  specifications: { [key: string]: string };
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    responseTime: string;
    memberSince: string;
    verifiedSeller: boolean;
  };
  availability: string;
  lastUpdated: Date;
  views: number;
  watchers: number;
}

interface PriceComparisonItem {
  id: string;
  seller: string;
  price: number;
  condition: string;
  distance: number;
  rating: number;
}

interface SimilarProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  distance: number;
  rating: number;
  condition: string;
}

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

// Notification Component
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
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get auth token from sessionStorage (as specified in your note)
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
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // API call helper
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
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

  // Transform API product to local Product interface
  const transformApiProduct = (apiProduct: ApiProduct): Product => {
    sessionStorage.setItem("selectedVendorEmail", apiProduct.vendor.email);
    sessionStorage.setItem(
      "selectedBusinessName",
      apiProduct.vendor.business_name
    );

    return {
      id: apiProduct.id.toString(),
      title: apiProduct.product_name,
      price: apiProduct.product_price / 100,
      originalPrice: (apiProduct.product_price / 100) * 1.2,
      discount: 17, // Mock discount
      condition: "Like New", // Mock condition
      rating: 4.7, // Mock rating
      reviewCount: 89, // Mock review count
      distance: 1.2, // Mock distance
      location: {
        address: "Electronic Store, Lagos, Nigeria", // Mock location
        lat: 6.5244, // Lagos coordinates
        lng: 3.3792,
      },
      images:
        apiProduct.images.length > 0
          ? apiProduct.images
          : [
              "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop",
            ],
      description: apiProduct.description,
      specifications: {
        Category: apiProduct.category,
        Status: apiProduct.status,
        "Product ID": apiProduct.id.toString(),
        Seller: apiProduct.vendor.business_name,
      },
      seller: {
        id: apiProduct.vendor.id.toString(),
        name: apiProduct.vendor.business_name,
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        rating: 4.8,
        reviewCount: 156,
        responseTime: "Usually responds within 2 hours",
        memberSince: "2020",
        verifiedSeller: true,
      },
      availability:
        apiProduct.status === "active" ? "Available" : "Unavailable",
      lastUpdated: new Date(Date.now() - 3600000), // Mock last updated
      views: 67, // Mock views
      watchers: 8, // Mock watchers
    };
  };

  // Navigate to Seller Profile
  const handleNavigateToVendorProfile = () => {
    const vendorEmail = sessionStorage.getItem("selectedVendorEmail");
    const businessName = sessionStorage.getItem("selectedBusinessName");

    if (!vendorEmail) {
      console.error("Vendor email not found!");
    }

    if (!businessName) {
      console.error("Business name not found!");
    }

    if (businessName && vendorEmail) {
      const slugify = (text: string) =>
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

      const businessSlug = slugify(businessName);
      router.push(`/seller-profile/${encodeURIComponent(businessSlug)}`);
    } else {
      console.warn("Missing vendor email or business name!");
    }
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get product ID from URL params
        const productId = searchParams.get("id") || "1"; // Default to 1 if no ID

        const apiProduct = await apiCall(
          `https://server.bizengo.com/api/marketplace/products/${productId}`
        );

        const transformedProduct = transformApiProduct(apiProduct);
        setProduct(transformedProduct);

        // Check if product is in wishlist
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

  // Add to Cart with real API call
  const handleAddToCart = async (quantity: number = 1) => {
    if (!product) return;

    try {
      setIsAddingToCart(true);

      await apiCall("https://server.bizengo.com/api/cart/add", {
        method: "POST",
        body: JSON.stringify({
          product_id: parseInt(product.id),
          quantity: quantity,
        }),
      });

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

    // Add to cart first, then redirect to checkout
    await handleAddToCart(1);

    // Simulate navigation to checkout
    addNotification("info", "Redirecting to checkout...");
    // router.push('/checkout');
  };

  const handleContactSeller = () => {
    addNotification("info", "Opening seller contact...");
    // router.push('/messages');
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

  // Mock data for components that don't have API endpoints yet
  const similarProducts: SimilarProduct[] = [
    {
      id: "2",
      title: "iPhone 14 Pro - 128GB Space Black",
      price: 749,
      originalPrice: 999,
      image:
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop",
      distance: 1.2,
      rating: 4.7,
      condition: "Excellent",
    },
    {
      id: "3",
      title: "Samsung Galaxy S23 Ultra",
      price: 699,
      originalPrice: 899,
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
      distance: 0.5,
      rating: 4.6,
      condition: "Good",
    },
    {
      id: "4",
      title: "Google Pixel 7 Pro",
      price: 649,
      originalPrice: 799,
      image:
        "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&h=300&fit=crop",
      distance: 2.1,
      rating: 4.8,
      condition: "Like New",
    },
  ];

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

  return (
    <div className="min-h-screen mb-20 bg-background">
      {/* Notifications */}
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="px-6 py-8 mx-auto max-w-7xl">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Images and Map */}
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

            {/* Right Column - Product Info and Actions */}
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
                onNavigateToVendorProfile={handleNavigateToVendorProfile}
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
                  disabled={
                    isAddingToCart || product.availability !== "Available"
                  }
                  className="w-full py-4 text-sm transition-colors duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? (
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
              products={similarProducts}
              onProductClick={productId =>
                router.push(`/product-detail?id=${productId}`)
              }
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
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
              onNavigateToVendorProfile={handleNavigateToVendorProfile}
            />

            <PriceComparison
              comparisons={priceComparisons}
              currentPrice={product.price}
              isMobile={true}
            />

            <SimilarProducts
              products={similarProducts}
              onProductClick={productId =>
                router.push(`/product-detail?id=${productId}`)
              }
              isMobile={true}
            />

            {/* Mobile Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-4 space-y-3 bg-white border-t border-border">
              <Button
                type="button"
                variant="navy"
                onClick={handleBuyNow}
                disabled={
                  isAddingToCart || product.availability !== "Available"
                }
                className="w-full py-4 text-sm transition-colors duration-200disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
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
