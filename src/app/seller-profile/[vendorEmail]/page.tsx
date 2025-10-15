"use client";
import React, { useEffect, useState } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import { baseURL } from "@/hooks/api_endpoints";
import { Storefront } from "@/types/storeFront";
import ProductGrid from "./components/ProductGrid";
import ContactSection from "./components/ContactSection";
import ReviewsSection from "./components/ReviewSection";
import TabNavigation from "./components/TabNavigation";
import { useSearchParams } from "next/navigation";
import NotificationToast from "@/components/ui/NotificationToast";

interface Review {
  id: number;
  reviewername: string;
  revieweremail: string;
  feedback: string;
  rating: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  images?: string[];
  rating: number;
}

interface VendorInfo {
  name: string;
  address: string;
  phone_number: string;
  banner?: string;
  is_verified: string;
  average_rating: number;
  open_hours?: string;
  profile_pic?: string | null;
  reviews?: Review[];
}

type TabId = "products" | "reviews" | "contact";

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

// Star Rating Component
const StarRating = ({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Icon
          key={star}
          name="Star"
          size={size}
          className={`${
            star <= rating ? "text-orange-500 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

// Review Card Component
// const ReviewCard = ({ review }: { review: Review }) => {
//   return (
//     <div className="p-4 transition-shadow border rounded-lg bg-surface border-border hover:shadow-sm">
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex items-center gap-3">
//           <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
//             <span className="text-sm font-semibold text-primary">
//               {review.reviewername.charAt(0).toUpperCase()}
//             </span>
//           </div>
//           <div>
//             <h4 className="font-medium text-text-primary">
//               {review.reviewername}
//             </h4>
//             <p className="text-xs text-text-tertiary">{review.revieweremail}</p>
//           </div>
//         </div>
//         <StarRating rating={review.rating} size={14} />
//       </div>

//       <p className="text-sm leading-relaxed text-text-secondary">
//         {review.feedback || "No feedback provided"}
//       </p>
//     </div>
//   );
// };

const VendorDetails = () => {
  const [vendorInformation, setVendorInformation] = useState<VendorInfo | null>(
    null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("products");
  const [business, setBusiness] = useState<Storefront | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSent, setIsSent] = useState(false);

  const getValidImageUrl = (url?: string | null) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${baseURL}${url}`;
  };

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabId | null;

  useEffect(() => {
    if (tabParam && ["products", "reviews", "contact"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
          fetch(`${baseURL}/user/${email}`),
          fetch(`${baseURL}/vendor-products/${email}`),
        ]);

        if (!vendorRes.ok) throw new Error("Failed to load vendor data");
        if (!productRes.ok) throw new Error("Failed to load product data");

        const vendorData = await vendorRes.json();
        const productData = await productRes.json();

        setVendorInformation(vendorData);
        setProducts(productData.products || []);
        setBusiness(productData.products || []);
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
      { id: "reviews", label: "Reviews", count: totalReviews },
      { id: "contact", label: "Contact" },
    ],
    [products.length, totalReviews]
  );

  const userProfile = {
    name: vendorInformation?.name || "Sarah Johnson",
    phone: vendorInformation?.phone_number || "+1 (555) 123-4567",
    banner_image: vendorInformation?.banner || "/banner.jpg",
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

  // submit contact form
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulated success
      setIsSent(true);
      addNotification("success", "Your message has been sent successfully!");

      // Log message for debugging
      console.log("Simulated message data:", {
        ...data,
      });

      // Reset send state after 2 seconds
      setTimeout(() => setIsSent(false), 2000);
    } catch (error) {
      console.error("Simulated error sending message:", error);
      addNotification("error", "Failed to send message. Please try again.");
    }
  };

    const handleSubmitReview = async (data: {
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
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulated success
        setIsSent(true);
        addNotification("success", "Your message has been sent successfully!");

        // Log message for debugging
        console.log("Review Submitted: ", {
          ...data,
        });

        // Reset send state after 2 seconds
        setTimeout(() => setIsSent(false), 2000);
      } catch (error) {
        console.error("Simulated error sending message:", error);
        addNotification("error", "Failed to send message. Please try again.");
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return <ProductGrid products={userProfile ? products : []} />;
      case "reviews":
        return (
          <ReviewsSection
            reviews={vendorInformation?.reviews || []}
            businessRating={{ average: 0, total: 0 }}
            onWriteReview={handleSubmitReview}
          />
        );
      case "contact":
        return business ? (
          <ContactSection
            business={{
              name: business.business_name,
              phone: business.extended?.phone ?? "",
              address: business.address,
            }}
            onSendMessage={handleSubmitContactForm}
            isSent={isSent}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen mb-28 bg-background">
      {/* Notifications */}
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      {/* Banner Section */}
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

      <div className="grid grid-cols-1 gap-6 px-4 mx-auto md:grid-cols-12 max-w-7xl">
        {/* Left - Vendor Info */}
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

              {/* Verification Badges */}
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

                {/* <div className="flex items-center justify-between">
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
                </div> */}
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-medium text-text-primary">
                  About
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {userProfile.bio}
                </p>
              </div>
            </div>

            {/* Stats Card */}
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

        {/* Right - Tabs and Content */}
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
  );
};

export default VendorDetails;
