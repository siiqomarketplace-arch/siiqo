"use client";
import React, { useEffect, useState } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";

interface Review {
  reviewername: string;
  revieweremail: string;
  feedback: string;
  rating: number;
}

interface Product {
  id: string | number;
  name: string;
  price: number;
  images?: string[];
  rating: number;
}

interface VendorInfo {
  name: string;
  address: string;
  phone_number: string;
  is_verified: string;
  average_rating: number;
  open_hours?: string;
  profile_pic?: string | null;
  reviews?: Review[];
}

// Star Rating Component
const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="Star"
          size={size}
          className={`${
            star <= rating
              ? "text-orange-500 fill-current"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {review.reviewername.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-text-primary">
              {review.reviewername}
            </h4>
            <p className="text-xs text-text-tertiary">{review.revieweremail}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size={14} />
      </div>
      
      <p className="text-sm text-text-secondary leading-relaxed">
        {review.feedback || "No feedback provided"}
      </p>
    </div>
  );
};

const VendorDetails = () => {
  const [vendorInformation, setVendorInformation] = useState<VendorInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "reviews">("products");

  const getValidImageUrl = (url?: string | null) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `https://server.bizengo.com/api${url}`;
  };

  useEffect(() => {
    const email = sessionStorage.getItem("selectedVendorEmail");
    if (!email) {
      console.error("No vendor email found in sessionStorage");
      setLoading(false);
      return;
    }

    const fetchVendorData = async () => {
      try {
        const [vendorRes, productRes] = await Promise.all([
          fetch(`https://server.bizengo.com/api/user/${email}`),
          fetch(`https://server.bizengo.com/api/vendor-products/${email}`),
        ]);

        if (!vendorRes.ok) throw new Error("Failed to load vendor data");
        if (!productRes.ok) throw new Error("Failed to load product data");

        const vendorData = await vendorRes.json();
        const productData = await productRes.json();

        setVendorInformation(vendorData);
        setProducts(productData.products || []);
      } catch (error) {
        console.error("Error fetching vendor details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, []);

  const averageRating =
    vendorInformation?.average_rating ??
    (vendorInformation?.reviews?.length
      ? vendorInformation.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        vendorInformation.reviews.length
      : 0);

  const totalReviews = vendorInformation?.reviews?.length || 0;

  const userProfile = {
    name: vendorInformation?.name || "Sarah Johnson",
    phone: vendorInformation?.phone_number || "+1 (555) 123-4567",
    identity: vendorInformation?.is_verified || "Not verified",
    avatar: getValidImageUrl(vendorInformation?.profile_pic),
    location: vendorInformation?.address || "San Francisco, CA",
    joinDate: "March 2023",
    isVerified: { phone: true, identity: true },
    stats: {
      itemsListed: products.length,
      sellerRating: averageRating.toFixed(1),
      totalReviews,
    },
    bio: "Passionate about sustainable living and finding great deals on quality items...",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="text-text-secondary">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 pt-10 pb-24">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 max-w-7xl mx-auto">
        {/* Left - Vendor Info */}
        <div className="md:col-span-4 space-y-6">
          <div className="col-span-4">
            <div className="bg-surface rounded-lg border border-border p-6 mb-6">
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto">
                  <Image
                    fill
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <h1 className="text-2xl font-heading font-semibold text-text-primary mt-4">
                  {userProfile.name}
                </h1>
                <span>{userProfile.location}</span>
                <p className="text-text-tertiary text-sm mt-1">
                  Member since {userProfile.joinDate}
                </p>
              </div>

              {/* Verification Badges */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="Phone"
                      size={16}
                      className="text-text-secondary"
                    />
                    <span className="text-sm text-text-secondary">Phone</span>
                  </div>
                  {userProfile.isVerified.phone ? (
                    <span className="text-sm">{userProfile.phone}</span>
                  ) : (
                    <span className="text-xs text-text-tertiary">
                      Not available
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="Shield"
                      size={16}
                      className="text-text-secondary"
                    />
                    <span className="text-sm text-text-secondary">
                      Identity
                    </span>
                  </div>
                  {userProfile.isVerified.identity ? (
                    <span className="text-sm">{userProfile.identity}</span>
                  ) : (
                    <div className="text-xs text-primary hover:underline">
                      Not verified.
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-primary mb-2">
                  About
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {userProfile.bio}
                </p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
                Activity Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Package" size={16} className="text-primary" />
                    <span className="text-sm text-text-secondary">
                      Items Listed
                    </span>
                  </div>
                  <span className="font-semibold text-text-primary">
                    {userProfile.stats.itemsListed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="Star"
                      size={16}
                      className="text-orange-500 fill-current"
                    />
                    <span className="text-sm text-text-secondary">
                      Seller Rating
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-text-primary">
                      {userProfile.stats.sellerRating}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      ({userProfile.stats.totalReviews})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Products & Reviews */}
        <div className="md:col-span-8">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-3 px-4 font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === "products"
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>Products</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  activeTab === "products"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-text-secondary"
                }`}
              >
                {products.length}
              </span>
              {activeTab === "products" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 px-4 font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === "reviews"
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>Reviews</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  activeTab === "reviews"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-text-secondary"
                }`}
              >
                {totalReviews}
              </span>
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Products Tab */}
          {activeTab === "products" && (
            <>
              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                  {products.map(product => (
                    <div
                      key={product.id}
                      className="border rounded-lg overflow-hidden bg-surface border-border hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-full h-40 bg-gray-100">
                        <Image
                          fill
                          src={getValidImageUrl(product.images?.[0])}
                          alt={product.name}
                          className="object-cover"
                          sizes="160px"
                        />
                      </div>
                      <div className="p-4">
                        <p className="font-medium text-text-primary line-clamp-1">
                          {product.name}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-primary">
                          ₦{product.price?.toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-1 mt-2">
                          <Icon
                            name="Star"
                            size={14}
                            className="text-orange-500 fill-current"
                          />
                          <span className="text-xs font-medium text-text-secondary">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon
                    name="Package"
                    size={48}
                    className="mx-auto mb-4 text-text-tertiary"
                  />
                  <p className="text-text-secondary">
                    No products available from this vendor.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <>
              {vendorInformation?.reviews &&
              vendorInformation.reviews.length > 0 ? (
                <div className="space-y-4">
                  {/* Rating Summary */}
                  <div className="bg-surface border border-border rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-text-primary mb-2">
                          {averageRating.toFixed(1)}
                        </div>
                        <StarRating
                          rating={Math.round(averageRating)}
                          size={20}
                        />
                        <p className="text-sm text-text-tertiary mt-2">
                          Based on {totalReviews}{" "}
                          {totalReviews === 1 ? "review" : "reviews"}
                        </p>
                      </div>

                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map(star => {
                          const count =
                            vendorInformation.reviews?.filter(
                              r => r.rating === star
                            ).length || 0;
                          const percentage =
                            totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                          return (
                            <div
                              key={star}
                              className="flex items-center gap-2 mb-2"
                            >
                              <span className="text-sm text-text-secondary w-8">
                                {star}{" "}
                                <Icon
                                  name="Star"
                                  size={12}
                                  className="inline text-orange-500"
                                />
                              </span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-orange-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-text-tertiary w-8">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {vendorInformation.reviews.map((review, index) => (
                    <ReviewCard key={index} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon
                    name="MessageSquare"
                    size={48}
                    className="mx-auto mb-4 text-text-tertiary"
                  />
                  <p className="text-text-secondary mb-2">No reviews yet</p>
                  <p className="text-sm text-text-tertiary">
                    Be the first to leave a review for this vendor!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
