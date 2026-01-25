"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import ProductInfo from "../components/ProductInfo";
import SellerCard from "../components/SellerCard";
import ImageGallery from "../components/ImageGallery";
import ActionAction from "../components/ActionBar";
import LocationMap from "../components/LocationMap";
import { useCartActions, useCartItems } from "@/context/CartContext";
import { toast } from "sonner";
import { switchMode } from "@/services/api";
import api_endpoints from "@/hooks/api_endpoints";
import { marketplaceService } from "@/services/marketplaceService";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const { addToCart } = useCartActions();
  const cartItems = useCartItems();

  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [storefronts, setStorefronts] = useState<any[]>([]);

  // Calculate cart quantity for this product
  const cartQuantity =
    cartItems.find((item) => item.product_id === Number(productId))?.quantity ||
    0;

  // Switch to buyer mode
  useEffect(() => {
    switchMode("buyer");
  }, []);

  // Fetch storefronts once on mount
  useEffect(() => {
    const fetchStorefronts = async () => {
      try {
        const response = await marketplaceService.getActiveStorefronts();
        if (response?.status === "success" && response?.storefronts) {
          setStorefronts(response.storefronts);
        }
      } catch (err) {
        console.error("Error fetching storefronts:", err);
      }
    };

    fetchStorefronts();
  }, []);

  useEffect(() => {
    if (!productId) {
      setError("Invalid product ID");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(api_endpoints.MARKETPLACE_PRODUCTS(productId), {
          cache: "no-store",
        });

        if (!res.ok)
          throw new Error("We couldn't load this product. Please try again.");

        const data = await res.json();

        if (data?.status !== "success" || !data?.product) {
          throw new Error("Product not found");
        }

        setProductData(data.product);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
      </div>
    );
  }
  console.log("Product Data:", productData);
  if (!productData) {
    return (
      <div className="flex h-screen items-center justify-center">
        Product not found.
      </div>
    );
  }

  const images =
    Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images
      : ["/placeholder-product.png"];

  const mappedProduct = {
    id: Number(productId),
    title: productData.name,
    price: productData.price,
    rating: 5.0,
    reviewCount: 0,
    distance: 0,
    availability: productData.quantity > 0 ? "In Stock" : "Out of Stock",
    views: 0,
    watchers: 0,
    condition: "New",
    lastUpdated: new Date(),
    description: productData.description || "",
    latitude: productData.latitude,
    longitude: productData.longitude,
    specifications: {
      Quantity: String(productData.quantity ?? 0),
      Vendor: productData.vendor_name || "Unknown",
    },
  };

  const mappedSeller = {
    name: productData.vendor_name || "Vendor",
    avatar: "",
    rating: 5.0,
    reviewCount: 24,
    responseTime: "Usually responds within 1 hour",
    memberSince: "2023",
    verifiedSeller: true,
    phoneNumber: productData.whatsapp_chat || "",
    slug: storefronts.find(
      (sf) =>
        sf.business_name?.toLowerCase().trim() ===
        productData.vendor_name?.toLowerCase().trim(),
    )?.slug,
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(Number(productId), 1);
      toast.success("Product added to cart!", {
        description: `${productData.name} has been added to your cart.`,
      });
    } catch (error: any) {
      toast.error("Failed to add to cart", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(Number(productId), 1);
      toast.success("Proceeding to checkout...");
      // Navigate to checkout after a brief delay
      setTimeout(() => {
        router.push("/CartSystem/checkout");
      }, 500);
    } catch (error: any) {
      toast.error("Failed to proceed to checkout", {
        description: error.message || "Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="Go back"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ImageGallery
            images={images}
            activeIndex={activeImageIndex}
            onImageChange={setActiveImageIndex}
          />

          <div className="space-y-8">
            <ProductInfo
              productData={mappedProduct}
              productId={Number(productId)}
              isWishlisted={isWishlisted}
              onWishlistToggle={() => setIsWishlisted(!isWishlisted)}
              showFullDescription
              onToggleDescription={() => {}}
              productOwner={productData.vendor_name || "Siiqo Store"}
            />

            <SellerCard
              seller={mappedSeller}
              onNavigateToVendorProfile={() => {}}
            />

            <LocationMap
              location={{
                address: productData.location || "Location not available",
                lat: productData.latitude || 6.5244,
                lng: productData.longitude || 3.3792,
              }}
              onGetDirections={() => {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${productData.latitude},${productData.longitude}`;
                window.open(mapsUrl, "_blank");
              }}
            />
          </div>
        </div>
      </div>

      {/* Coming Soon: ActionBar
        <ActionBar
          product={mappedProduct}
          cartQuantity={cartQuantity}
          // onAddToCart={handleAddToCart}
          // onBuyNow={handleBuyNow}
          onWishlistToggle={() => setIsWishlisted(!isWishlisted)}
          isWishlisted={isWishlisted}
        />
      */}

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background to-background/80 backdrop-blur-sm border-t border-gray-200 p-4 text-center">
        <p className="text-sm font-semibold text-gray-500">
          Coming Soon: Enhanced Cart & Checkout
        </p>
      </div>
    </div>
  );
}
