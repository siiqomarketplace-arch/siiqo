"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import CustomerBottomTabs from "@/components/ui/CustomerBottomTabs";
import LocationHeader from "@/components/ui/LocationHeader";
import BusinessHero from "./components/BusinessHero";
import TabNavigation from "./components/TabNavigation";
import ProductGrid from "./components/ProductGrid";
import AboutSection from "./components/AboutSection";
import ReviewsSection from "./components/ReviewSection";
import ContactSection from "./components/ContactSection";

// Types
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  status: string;
  category: string;
}

interface Storefront {
  id: number;
  business_name: string;
  country: string;
  description: string;
  email: string;
  phone: string;
  state: string;
  name?: string;
  story?: string;
  established?: number | string;
  teamSize?: number | string;
  specialties?: string[];
  hours?: Array<{
    day: string;
    hours: string;
    isToday: boolean;
  }>;
  gallery?: Array<{
    url: string;
    caption?: string;
  }>;
  team?: Array<{
    name: string;
    role: string;
    photo: string;
  }>;
  // Additional properties to match Business interface for ContactSection
  address?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

type TabId = "products" | "about" | "reviews" | "contact";

const BusinessStorefrontView: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [activeTab, setActiveTab] = useState<TabId>("products");
  const [business, setBusiness] = useState<Storefront | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorefront = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("vendorToken");
        if (!token) throw new Error("No vendor token found");

        const res = await fetch(
          "https://server.bizengo.com/api/vendor/storefront",
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        console.log("Storefront API response:", data);

        if (data.storefront) {
          setBusiness(data.storefront);

          const formattedProducts: Product[] =
            data.products?.map((p: any) => ({
              id: p.id,
              name: p.product_name,
              description: p.description,
              price: p.product_price,
              image: p.images?.[0] || "https://via.placeholder.com/300",
              stock: p.stock || 0,
              status: p.status,
              category: p.category,
            })) || [];

          setProducts(formattedProducts);
        }
      } catch (err) {
        console.error("Failed to fetch storefront:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefront();
  }, [businessId]);

  // Tab UI
  const tabs = [
    { id: "products", label: "Products", count: products.length },
    { id: "about", label: "About" },
    { id: "reviews", label: "Reviews", count: 0 }, // no reviews yet
    { id: "contact", label: "Contact" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <ProductGrid
            products={products}
            onProductClick={(p) => console.log("Clicked", p)}
            onAddToCart={(p) => alert(`${p.name} added to cart`)}
          />
        );
      case "about":
        return business ? (
          <AboutSection
            business={{
              name: business.business_name,
              description: business.description,
              story: business.story,
              established: business.established || "N/A",
              teamSize: business.teamSize || "N/A",
              specialties: business.specialties || [],
              hours: business.hours || [],
              gallery: business.gallery,
              team: business.team,
            }}
          />
        ) : null;
      case "reviews":
        return (
          <ReviewsSection
            reviews={[]}
            businessRating={{ average: 0, total: 0 }}
            onWriteReview={() => alert("Write review")}
          />
        );
      case "contact":
        return business ? (
          <ContactSection
            business={{
              name: business.business_name,
              phone: business.phone,
              email: business.email,
              address:
                business.address || `${business.state}, ${business.country}`,
              website: business.website,
              socialMedia: business.socialMedia,
              coordinates: business.coordinates || { lat: 0, lng: 0 }, // Default coordinates if not provided
            }}
            onSendMessage={async (data) => {
              alert("Message sent");
              // TODO: Implement actual message sending logic
            }}
          />
        ) : null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LocationHeader context="customer" />
        <div className="flex items-center justify-center h-96">
          <p className="text-text-secondary">Loading storefront...</p>
        </div>
        <CustomerBottomTabs />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <LocationHeader context="customer" />
        <div className="flex items-center justify-center h-96">
          <h2 className="text-xl font-semibold">Storefront Not Found</h2>
        </div>
        <CustomerBottomTabs />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LocationHeader context="customer" />

      <BusinessHero
        business={business}
        onContactClick={() => (window.location.href = `tel:${business.phone}`)}
        onDirectionsClick={() =>
          window.open(
            `https://www.google.com/maps/search/?api=1&query=${business.state},${business.country}`,
            "_blank"
          )
        }
        onShareClick={() =>
          navigator.share?.({
            title: business.business_name,
            url: window.location.href,
          })
        }
      />

      <TabNavigation
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabId)}
        tabs={tabs}
      />

      <main className="px-4 py-8 pb-20 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:pb-8">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default BusinessStorefrontView;
