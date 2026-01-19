"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle } from "lucide-react";
import Icon from "@/components/ui/AppIcon";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import ShareModal from "@/components/ShareModal";
import { useLocation } from "@/context/LocationContext";
import api from "@/services/api";
import { calculateDistance } from "@/utils/proximitySort";

interface Product {
  title: string;
  price: number;
  rating: number;
  reviewCount: number;
  distance: number;
  availability: string;
  views: number;
  watchers: number;
  condition: string;
  lastUpdated: Date;
  description: string;
  specifications: { [key: string]: string };
  latitude?: number | string;
  longitude?: number | string;
}

interface ProductInfoProps {
  productData: Product;
  productId: number;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  showFullDescription: boolean;
  onToggleDescription: () => void;
  isMobile?: boolean;
  productOwner?: string;
}

const ProductInfo = ({
  productData: product,
  productId,
  isWishlisted,
  onWishlistToggle,
  showFullDescription,
  onToggleDescription,
  isMobile = false,
  productOwner = "Siiqo Store",
}: ProductInfoProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { coords } = useLocation();
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const canManageFavorites = isLoggedIn;

  // Calculate distance using lat/lng
  const calculatedDistance = useMemo(() => {
    if (
      !coords?.lat ||
      !coords?.lng ||
      !product.latitude ||
      !product.longitude
    ) {
      return null;
    }

    const distanceKm = calculateDistance(
      { lat: coords.lat, lng: coords.lng },
      { lat: Number(product.latitude), lng: Number(product.longitude) }
    );

    return distanceKm;
  }, [coords, product.latitude, product.longitude]);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleWishlistToggle = async () => {
    if (!canManageFavorites) {
      setShowBuyerModal(true);
      return;
    }

    setIsLoadingWishlist(true);
    try {
      const response = await api.post(`/buyers/favourites/${productId}`);
      if (response.data.status === "success") {
        onWishlistToggle();
        toast({
          title: isWishlisted
            ? "Removed from Favourites"
            : "Added to Favourites",
          description: isWishlisted
            ? "Product removed from your favourites."
            : "Product added to your favourites.",
        });
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const BuyerModeModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 md:p-8 animate-in zoom-in duration-300">
        <div className="relative">
          <button
            onClick={() => setShowBuyerModal(false)}
            className="absolute -top-2 -right-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Switch to Buyer Mode
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Please log in to manage your favorites.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowBuyerModal(false);
                  router.push("/auth/login");
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Log In
              </button>

              <button
                onClick={() => setShowBuyerModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- CUSTOM SHARE LOGIC ---
  const handleShare = async () => {
    setShowShareModal(true);
  };

  const discountPercentage = Math.round(
    ((product.price - product.price) / product.price) * 100
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="mb-2 text-xl font-bold md:text-2xl font-heading text-text-primary">
              {product.title}
            </h1>

            {/* Price Section */}
            <div className="flex items-center mb-3 space-x-3">
              <span className="text-2xl font-bold md:text-3xl text-text-primary">
                ₦{product.price.toLocaleString()}
              </span>
              {product.price > product.price && (
                <>
                  <span className="text-lg line-through text-text-secondary">
                    ₦{product.price}
                  </span>
                  <span className="px-2 py-1 text-sm font-medium text-orange-500 bg-orange-100 rounded">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Rating and Distance */}
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <div className="flex items-center space-x-1">
                <Icon
                  name="Star"
                  size={16}
                  className="text-orange-500 fill-current"
                />
                <span className="font-medium text-text-primary">
                  {product.rating}
                </span>
                {/* <span>({product.reviewCount} reviews)</span> */}
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={16} className="text-primary" />
                <span>
                  {calculatedDistance
                    ? `${calculatedDistance.toFixed(1)} km away`
                    : product.distance
                    ? `${product.distance} km away`
                    : "Distance unavailable"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row items-center space-x-2">
            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={isLoadingWishlist}
              className={`p-1 rounded-full transition-all duration-200 ${
                isWishlisted
                  ? "bg-white text-slate-900"
                  : "bg-white text-orange-500"
              } ${isLoadingWishlist ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Icon
                name="Heart"
                size={15}
                className={isWishlisted ? "fill-current" : ""}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-3 transition-all duration-200 rounded-full bg-surface-secondary text-text-secondary hover:bg-surface hover:text-text-primary"
              aria-label="Share product"
            >
              <Icon name="Share" size={20} />
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium text-primary">
              {product.availability}
            </span>
          </div>
        </div>

        {/* <div className="flex items-center justify-between py-4 border-t border-b border-border">
          <div>
            <span className="text-sm text-text-secondary">Condition</span>
            <p className="font-medium text-text-primary">{product.condition}</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-text-secondary">Updated</span>
            <p className="font-medium text-text-primary">
              {formatTimeAgo(product.lastUpdated)}
            </p>
          </div>
        </div> */}

        <div>
          <h3 className="mb-3 text-lg font-semibold font-heading text-text-primary">
            Description
          </h3>
          <div className="leading-relaxed text-text-secondary">
            <p
              className={`${
                !showFullDescription && isMobile ? "line-clamp-3" : ""
              }`}
            >
              {product.description}
            </p>
            {isMobile && (
              <button
                onClick={onToggleDescription}
                className="mt-2 font-medium transition-colors duration-200 text-primary hover:text-primary-700"
              >
                {showFullDescription ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold font-heading text-text-primary">
            Specifications
          </h3>
          <div className="space-y-3">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b border-border-light last:border-b-0"
              >
                <span className="text-text-secondary">{key}</span>
                <span className="font-medium text-right text-text-primary">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showBuyerModal && <BuyerModeModal />}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        productId={productId}
        productName={product.title}
        productOwner={productOwner}
      />
    </>
  );
};

export default ProductInfo;
