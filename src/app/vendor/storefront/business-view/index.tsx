"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import CustomerBottomTabs from "@/components/ui/CustomerBottomTabs";
import LocationHeader from "@/components/ui/LocationHeader";
import BusinessHero from "./components/BusinessHero";
import TabNavigation from "./components/TabNavigation";
import ProductGrid from "./components/ProductGrid";
import AboutSection from "./components/AboutSection";
import ReviewsSection from "./components/ReviewSection";
import ContactSection from "./components/ContactSection";
import Button from "@/components/ui/alt/ButtonAlt";
import Icon from "@/components/AppIcon";
import { vendorService } from "@/services/vendorService";
import { StorefrontData } from "@/types/vendor/storefront";

interface MyProductsResponse {
  products: any[];
}

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  product_price: number;
  images: string[];
  stock: number;
  status: string;
  category: string;
}

interface Props {
  storefrontData: StorefrontData | null;
  products: Product[];
}

type TabId = "products" | "about" | "reviews" | "contact";

const BusinessStorefrontView: React.FC<Props> = ({ storefrontData, products }) => {
  const { businessId } = useParams<{ businessId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("products");
  const [business, setBusiness] = useState<StorefrontData | null>(storefrontData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storefrontData) {
      setBusiness(storefrontData);
      setLoading(false);
    }
  }, [storefrontData]);

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
          <div>
            <ProductGrid
              products={products}
              onProductClick={(p) => console.log("Clicked", p)}
              onAddToCart={(p) => alert(`${p.name} added to cart`)}
            />
            <div className="flex justify-center mt-8">
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/create-listing')}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        );
      case "about":
        return business ? (
          <AboutSection
            business={{
              name: business.businessName,
              description: business.description,
              story: "",
              established: "",
              teamSize: "",
              specialties: [],
              hours: [],
              gallery: [],
              team: [],
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
              name: business.businessName,
              phone: business.contact.phone,
              email: business.contact.email,
              address: business.contact.address,
              website: business.contact.website,
              socialMedia: {},
              coordinates: { lat: 0, lng: 0 }, // Default coordinates if not provided
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
        onContactClick={() => (window.location.href = `tel:${business.contact.phone}`)}
        onDirectionsClick={() =>
          window.open(
            `https://www.google.com/maps/search/?api=1&query=${business.contact.address}`,
            "_blank"
          )
        }
        onShareClick={() =>
          navigator.share?.({
            title: business.businessName,
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
