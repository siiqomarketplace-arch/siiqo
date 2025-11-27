"use client";
import React, { useEffect, useState } from "react";
import ProductGrid from "./components/ProductGrid";
import AboutSection from "./components/AboutSection";
import { Storefront } from "@/types/storeFront";
import TabNavigation from "./components/TabNavigation";
import ContactSection from "./components/ContactSection";
import ReviewsSection from "./components/ReviewSection";
import Icon from "@/components/AppIcon";
import Image from "@/components/ui/alt/AppImageAlt";
import NotificationToast from "@/components/ui/NotificationToast";
import { userService } from "@/services/userService";
import { productService } from "@/services/productService";
import { Review, Product, VendorInfo } from "@/types/seller-profile";

type TabId = "products" | "about" | "reviews" | "contact";

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}


const VendorDetails = () => {
  const [vendorInformation, setVendorInformation] = useState<VendorInfo | null>(
    null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [business, setBusiness] = useState<Storefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("products");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSent, setIsSent] = useState(false);

  const getValidImageUrl = (url?: string | null) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL || "/api"}${url}`;
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
          userService.getVendorByEmail(email),
          productService.getProductsByVendorEmail(email),
        ]);

        setVendorInformation(vendorRes);
        setProducts(productRes.products || []);
        // Assuming business data can be derived or is part of vendorRes
        // For now, setting a mock or partial Storefront based on available data
        setBusiness({
          id: 0, // Placeholder
          business_name: vendorRes.name,
          description: "", // Placeholder
          established_at: "", // Placeholder
          ratings: vendorRes.average_rating,
          business_banner: vendorRes.banner || null,
          vendor: null, // Placeholder
          address: "", // Placeholder
          extended: null, // Placeholder
        });
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

  const tabs = React.useMemo(
    () => [
      { id: "products", label: "Products", count: products.length },
      { id: "about", label: "About" },
      { id: "reviews", label: "Reviews", count: totalReviews },
      { id: "contact", label: "Contact" },
    ],
    [products.length, totalReviews]
  );

  const userProfile = {
    name: vendorInformation?.name || "Sarah Johnson",
    phone: vendorInformation?.phone_number || "+1 (555) 123-4567",
    banner_image: vendorInformation?.banner || "",
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

  const handleSubmitContactForm = async (data: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }) => {
    if (!data.name || !data.email || !data.message) {
      addNotification("error", "Business information is missing.");
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSent(true);
      addNotification("success", "Your message has been sent successfully!");

      console.log("Simulated message data:", {
        ...data,
      });

      setTimeout(() => setIsSent(false), 2000);
    } catch (error) {
      console.error("Simulated error sending message:", error);
      addNotification("error", "Failed to send message. Please try again.");
    }
  };

  const handleSubmitReviewForm = async (data: {
    name: string;
    email: string;
    rating: number;
    message: string;
  }) => {
    if (!data.name || !data.email || !data.rating || !data.message) {
      addNotification("error", "Business information is missing.");
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSent(true);
      addNotification("success", "Your message has been sent successfully!");

      console.log("Review Submitted: ", {
        ...data,
      });

      setTimeout(() => setIsSent(false), 2000);
    } catch (error) {
      console.error("Simulated error sending message:", error);
      addNotification("error", "Failed to send message. Please try again.");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return <ProductGrid products={userProfile ? products : []} />;
      case "about":
        return business ? (
          <AboutSection
            business={{
              name: business.business_name,
              description: business.description,
              hours: business.extended?.hour || [],
            }}
          />
        ) : null;
      case "reviews":
        return (
          <ReviewsSection
            reviews={vendorInformation?.reviews || []}
            businessRating={{ average: 0, total: 0 }}
            onWriteReview={handleSubmitReviewForm}
          />
        );
      case "contact":
        return business ? (
          <ContactSection
            business={{
              name: business.business_name,
              phone: business.extended?.phone,
              address: business.address,
            }}
            onSendMessage={handleSubmitContactForm}
          />
        ) : null;
      default:
        return null;
    }
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
    <div className="min-h-screen bg-background">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      <div className="relative flex w-full h-48 mb-8 overflow-hidden sm:h-64 lg:h-72">
        {userProfile?.banner_image &&
        userProfile?.banner_image !== "/banner.jpg" ? (
          <>
            <Image
              src={userProfile.banner_image}
              alt={`${userProfile.name || "Vendor"} banner`}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-blue-100">
            <h2 className="font-semibold text-blue-200 text-9xl">
              Vendor Store
            </h2>
          </div>
        )}
      </div>

      <div className="px-4 mt-6 mb-28">
        <div className="grid grid-cols-1 gap-6 mx-auto md:grid-cols-12 max-w-7xl">
          <section className="space-y-6 md:col-span-4">
            <div className="col-span-4">
              <div className="p-6 mb-6 border rounded-lg bg-surface border-border">
                <div className="mb-6 text-center">
                  <div className="relative w-24 h-24 mx-auto overflow-hidden rounded-full">
                    <Image
                      src={userProfile.avatar}
                      alt={userProfile.name}
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <h1 className="mt-4 text-2xl font-semibold font-heading text-text-primary">
                    {userProfile.name}
                  </h1>
                  <span className="flex items-center justify-center gap-1 mt-2 text-sm text-text-secondary">
                    <Icon name="MapPin" size={14} />
                    {userProfile.location}
                  </span>
                  <p className="mt-2 text-sm text-text-tertiary">
                    Member since {userProfile.joinDate}
                  </p>
                </div>

                <div className="mb-6 space-y-2">
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
                </div>

                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-medium text-text-primary">
                    About
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {userProfile.bio}
                  </p>
                </div>
              </div>

              <div className="p-6 border rounded-lg bg-surface border-border">
                <h3 className="mb-4 text-lg font-semibold font-heading text-text-primary">
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
          </section>

          <section className="max-h-screen px-4 md:col-span-8 lg:overflow-y-auto custom-scrollbar">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={id => setActiveTab(id as TabId)}
              tabs={tabs}
            />
            <div className="mt-4">{renderTabContent()}</div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
