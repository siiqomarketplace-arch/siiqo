"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Clock,
  Building,
  ChevronLeft,
  Share2,
  Globe,
  ShoppingBag,
  Star,
  AlertCircle,
} from "lucide-react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import ShareModal from "@/components/ShareModal";
import TabNavigation from "./TabNavigation";
import ProductGrid from "./ProductGrid";
import ContactSection from "./ContactSection";
import { StorefrontData } from "@/types/vendor/storefront";
import { productService } from "@/services/productService";
import { vendorService } from "@/services/vendorService";
import { toast } from "@/components/ui/sonner";

interface Props {
  storefrontData: StorefrontData | null;
  products: any[];
}

type TabId = "products" | "about" | "reviews" | "contact";

const BusinessStorefrontView: React.FC<Props> = ({
  storefrontData,
  products: initialProducts,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("products");
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [availableCatalogs, setAvailableCatalogs] = useState<any[]>([]);
  const [fetchingCatalogs, setfetchingCatalogs] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const refetchCatalogs = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchCatalogs = async () => {
      setfetchingCatalogs(true);
      try {
        const res = await productService.getCatalogs();

        if (res.status === "success" && res.catalogs) {
          const transformedCatalogs = res.catalogs.map((catalog: any) => ({
            id: catalog.id,
            name: catalog.name || "Untitled Catalog",
            image: catalog.image || null,
            items: (catalog.products || []).map((product: any) => ({
              id: product.id,
              name: product.name,
              product_price: product.price,
              images: [product.image],
              description: "",
            })),
          }));
          setAvailableCatalogs(transformedCatalogs);
        }
      } catch (error) {
        console.error("Failed to load catalogs");
      } finally {
        setfetchingCatalogs(false);
      }
    };

    fetchCatalogs();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "catalogsUpdated") {
        fetchCatalogs();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refetchTrigger]);

  useEffect(() => {
    const syncData = async (fetchFreshSettings = false) => {
      try {
        let settingsData: any = storefrontData;

        // Always fetch fresh settings to get latest updates
        const freshSettings = await vendorService.getVendorProfile();
        if (freshSettings?.data) {
          settingsData = freshSettings.data;
        }

        const savedLocal = localStorage.getItem("vendorStorefrontDetails");
        if (savedLocal) {
          const parsed = JSON.parse(savedLocal);
          setBusiness({
            ...settingsData,
            ...parsed,
            products:
              parsed.products?.length > 0 ? parsed.products : availableCatalogs,
            selectedDays: parsed.selectedDays || [],
            business_name:
              settingsData?.store_settings?.business_name ||
              parsed.business_name,
            profileImage:
              settingsData?.store_settings?.logo_url || parsed.profileImage,
            description:
              settingsData?.store_settings?.description || parsed.description,
            address: settingsData?.store_settings?.address || parsed.address,
            template_options:
              settingsData?.store_settings?.template_options ||
              parsed.template_options,
            banner_url:
              settingsData?.store_settings?.banner_url || parsed.banner_url,
            is_published:
              settingsData?.store_settings?.is_published || parsed.is_published,
            working_hours:
              settingsData?.store_settings?.working_hours ||
              parsed.working_hours,
            website: settingsData?.store_settings?.website || parsed.website,
            cac_reg: settingsData?.store_settings?.cac_reg || parsed.cac_reg,
            storefront_link:
              settingsData?.store_settings?.storefront_link ||
              parsed.storefront_link,
            social_links:
              settingsData?.store_settings?.social_links || parsed.social_links,
          });
        } else {
          setBusiness({
            ...settingsData,
            products: availableCatalogs,
            selectedDays: [],
            business_name: settingsData?.store_settings?.business_name,
            profileImage: settingsData?.store_settings?.logo_url,
            description: settingsData?.store_settings?.description,
            address: settingsData?.store_settings?.address,
            template_options: settingsData?.store_settings?.template_options,
            banner_url: settingsData?.store_settings?.banner_url,
            is_published: settingsData?.store_settings?.is_published,
            working_hours: settingsData?.store_settings?.working_hours,
            website: settingsData?.store_settings?.website,
            cac_reg: settingsData?.store_settings?.cac_reg,
            storefront_link: settingsData?.store_settings?.storefront_link,
            social_links: settingsData?.store_settings?.social_links,
          });
        }
      } catch (error) {
        console.error("Error syncing data:", error);
      } finally {
        setLoading(false);
      }
    };

    syncData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "storefrontUpdated") {
        syncData(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [storefrontData, availableCatalogs]);

  if (loading || !business) return null;

  const themeColor =
    business.template_options?.primary_color ||
    business.themeColor ||
    "#1E293B";
  const secondaryColor =
    business.template_options?.secondary_color || "#ffffff";

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = days[new Date().getDay()];
  const todayHours = business.working_hours?.[today];
  const displayOpenTime = todayHours?.start || business.openTime || "09:00";
  const displayCloseTime = todayHours?.end || business.closeTime || "21:00";

  const handleShareStore = () => {
    setIsShareModalOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <ProductGrid
              collections={availableCatalogs}
              isLoading={fetchingCatalogs}
            />
          </div>
        );
      case "about":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="p-6 border rounded-2xl bg-white shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">
                About
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">
                {business.description ||
                  "This business hasn't shared their story yet."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 border rounded-2xl bg-white shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                  Theme
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: themeColor }}
                  />
                  <p className="text-xs font-semibold">{themeColor}</p>
                </div>
              </div>
              <div className="p-6 border rounded-2xl bg-white shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                  Address
                </p>
                <p className="text-xs font-semibold truncate">
                  {business.address || "N/A"}
                </p>
              </div>
              <div className="p-6 border rounded-2xl bg-white shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                  Website
                </p>
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:underline truncate"
                >
                  {business.website || "N/A"}
                </a>
              </div>
              <div className="p-6 border rounded-2xl bg-white shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                  CAC Reg
                </p>
                <p className="text-xs font-semibold">
                  {business.cac_reg || "N/A"}
                </p>
              </div>
            </div>

            {business.social_links &&
              Object.keys(business.social_links).length > 0 && (
                <div className="p-6 border rounded-2xl bg-white shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-4">
                    Social Links
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(business.social_links).map(
                      ([platform, url]: [string, any]) => (
                        <div
                          key={platform}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="text-xs font-semibold text-gray-700 capitalize">
                            {platform}
                          </span>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate max-w-xs"
                          >
                            {String(url)}
                          </a>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        );
      case "contact":
        return <ContactSection business={business} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with back button */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <button className="flex items-center gap-2 p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-gray-700" />
            <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
              Back
            </span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShareStore}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Banner and Logo Section */}
      <div className="relative">
        <div
          className="h-60 md:h-80 w-full bg-center bg-cover"
          style={{
            backgroundImage: business.banner_url
              ? `url(${business.banner_url})`
              : `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
            backgroundColor: themeColor,
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 -bottom-12">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-[6px] border-white bg-gray-100 shadow-xl overflow-hidden">
            {business.profileImage ? (
              <Image
                src={business.profileImage}
                alt={business.business_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Building size={40} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-16 md:mt-20">
        {/* Store Info */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black mb-2 uppercase tracking-tight">
            {business.business_name}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {business.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {business.address && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={18} className="text-primary" />
                <span className="text-sm font-medium">{business.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Store Details Card */}
            <div className="p-6 border rounded-2xl bg-white shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">
                Store Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Globe size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                      Status
                    </p>
                    <p className="text-sm font-semibold">
                      {business.is_published ? "Published" : "Draft"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: themeColor }}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                      Brand Color
                    </p>
                    <p className="text-sm font-semibold">{themeColor}</p>
                  </div>
                </div>

                {business.storefront_link && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <Icon name="Link" size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">
                        Storefront Link
                      </p>
                      <p className="text-sm font-semibold">
                        siiqo.com/{business.storefront_link}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours Card */}
            <div className="p-6 border rounded-2xl bg-white shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">
                Business Hours
              </h3>
              <div className="space-y-3">
                {Object.keys(business.working_hours || {}).length > 0 ? (
                  <>
                    <div className="mb-3 pb-3 border-b">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Today ({today})
                      </p>
                      <p className="text-sm font-bold text-blue-600">
                        {displayOpenTime} — {displayCloseTime}
                      </p>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(business.working_hours).map(
                        ([day, hours]: [string, any]) => (
                          <div
                            key={day}
                            className="flex justify-between text-xs p-2 bg-gray-50 rounded"
                          >
                            <span className="font-semibold text-gray-700">
                              {day}
                            </span>
                            <span className="text-gray-600">
                              {hours.start && hours.end
                                ? `${hours.start} - ${hours.end}`
                                : hours.start
                                ? `From ${hours.start}`
                                : "Closed"}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Hours not set</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-6 border rounded-2xl bg-white shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-primary" />
                    Catalogs
                  </span>
                  <span className="font-bold">{availableCatalogs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    Rating
                  </span>
                  <span className="font-bold flex items-center gap-1">
                    5.0{" "}
                    <Star
                      size={14}
                      className="text-yellow-500 fill-yellow-500"
                    />
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-8">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("products")}
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === "products"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon name="Package" size={16} className="inline mr-2" />
                Products
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === "about"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon name="Info" size={16} className="inline mr-2" />
                About
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === "contact"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon name="MessageCircle" size={16} className="inline mr-2" />
                Contact
              </button>
            </div>

            {/* Content */}
            <div className="mt-10">{renderTabContent()}</div>
          </main>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        productId={business.storefront_link}
        productName={business.business_name}
        productOwner={business.business_name}
        isStore={true}
      />
    </div>
  );
};

export default BusinessStorefrontView;
