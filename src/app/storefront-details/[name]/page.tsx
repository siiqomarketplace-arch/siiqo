"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Globe,
  MessageCircle,
  Star,
  ShoppingBag,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import ContactVendorModal from "@/app/vendor-public-view/[name]/ContactVendorModal";
import ShareModal from "@/components/ShareModal";
import { productService } from "@/services/productService";
import api_endpoints from "@/hooks/api_endpoints";

interface StoreInfo {
  address: string;
  banner: string;
  branding: {
    layout_style: string;
    primary_color: string;
    secondary_color: string;
  };
  description: string;
  hours: Record<string, any>;
  logo: string;
  name: string;
  socials: Record<string, any>;
  whatsapp_link: string | null;
}

interface StorefrontDetailsResponse {
  catalogs: any[];
  status: string;
  store_info: StoreInfo;
}

const StorefrontDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [viewMode, setViewMode] = useState<"products" | "catalogs">("catalogs");
  const [selectedCatalog, setSelectedCatalog] = useState<any | null>(null);
  const [catalogPage, setCatalogPage] = useState(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const catalogsPerPage = 6;

  const storeName = typeof params.name === "string" ? params.name : "";

  useEffect(() => {
    const fetchStoreDetails = async () => {
      if (!storeName) {
        setError("Store name not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get authorization token
        const token =
          typeof window !== "undefined"
            ? sessionStorage.getItem("RSToken") ||
              localStorage.getItem("RSToken")
            : null;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          api_endpoints.MARKETPLACE_STORE(storeName),
          { headers }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch store details");
        }

        const data: StorefrontDetailsResponse = await response.json();

        if (data.status === "success" && data.store_info) {
          setStore(data.store_info);
          setError(null);
        } else {
          setError("Store not found");
        }
      } catch (err: any) {
        console.error("Error fetching store details:", err);
        setError(err.message || "Failed to load store details");
        toast.error("Failed to load store details");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, [storeName]);

  // Fetch catalogs for this store
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoadingCatalogs(true);
        const res = await productService.getPublicCatalogs();

        if (res.status === "success" && res.data && Array.isArray(res.data)) {
          // Extract catalogs from the vendor data
          // res.data is an array of vendors, find the current store's vendor
          const vendorData = res.data.find((vendor: any) => {
            // Match by vendor_slug or business_name against store name
            return (
              vendor.vendor_slug === storeName ||
              vendor.business_name?.toLowerCase() === store?.name?.toLowerCase()
            );
          });

          if (vendorData && vendorData.catalogs) {
            setCatalogs(vendorData.catalogs);
          } else {
            // Fallback: use first vendor's catalogs if no exact match
            setCatalogs(res.data[0]?.catalogs || []);
          }
        }
      } catch (err) {
        console.error("Error fetching catalogs:", err);
      } finally {
        setLoadingCatalogs(false);
      }
    };

    if (store) {
      fetchCatalogs();
    }
  }, [store, storeName]);

  if (loading) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center bg-background">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="Store" className="text-primary" size={20} />
          </div>
        </div>
        <p className="mt-4 text-sm font-bold text-gray-500 animate-pulse">
          Loading store details...
        </p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 bg-gray-50/50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50 text-center border border-gray-100">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="AlertCircle" size={48} className="text-orange-500" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
            Store Not Found
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {error || "We couldn't find the store you're looking for."}
          </p>

          <button
            onClick={() => router.back()}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleWhatsAppClick = () => {
    if (!store?.whatsapp_link) return;

    let phoneNumber = store.whatsapp_link;
    // Remove any leading zeros or special characters
    phoneNumber = phoneNumber.replace(/^0+/, "").replace(/\D/g, "");

    // If phone number doesn't start with country code, prepend it
    const countryCode = "234"; // Nigeria
    if (!phoneNumber.startsWith(countryCode)) {
      phoneNumber = `${countryCode}${phoneNumber}`;
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, "_blank");
  };

  const primaryColor = store.branding?.primary_color || "#000000";

  const handleShareStore = async () => {
    setIsShareModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-40">
        {/* Header with back button */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700" />
              <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
                Back
              </span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs font-bold transition"
              >
                Contact Vendor
              </button>
              <button
                onClick={handleShareStore}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Icon name="Share2" size={20} />
              </button>
            </div>
          </div>
        </div>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          productId={storeName}
          productName={store?.name}
          productOwner={store?.name}
          isStore={true}
        />

        {/* Banner and Logo Section */}
        <div className="relative">
          <div
            className="h-60 md:h-80 w-full bg-center bg-cover"
            style={{ backgroundImage: `url(${store.banner})` }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 -bottom-12">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-[6px] border-white bg-gray-100 shadow-xl overflow-hidden">
              <Image
                src={store.logo}
                alt={store.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-16 md:mt-20">
          {/* Store Info */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold mb-2">
              {store.name}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {store.description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              {store.address && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={18} className="text-primary" />
                  <span className="text-sm font-medium">{store.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Store Details Card */}
              {/* <div className="p-6 border rounded-2xl bg-white shadow-sm">
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
                        Business Type
                      </p>
                      <p className="text-sm font-semibold">
                        {store.branding.layout_style}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">
                        Brand Color
                      </p>
                      <p className="text-sm font-semibold">{primaryColor}</p>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Contact Card */}
              <div className="p-6 border rounded-2xl bg-white shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4">
                  Business Hours
                </h3>
                <div className="space-y-2">
                  {store.hours && Object.keys(store.hours).length > 0 ? (
                    Object.entries(store.hours).map(
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
                    )
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-3">
                      Business hours not available
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  {store.whatsapp_link ? (
                    <button
                      onClick={handleWhatsAppClick}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle size={18} />
                      Message on WhatsApp
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-3">
                      WhatsApp contact not available
                    </p>
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
                      <Icon name="Layers" size={16} className="text-primary" />
                      Catalogs
                    </span>
                    <span className="font-bold">
                      {catalogs.filter((c: any) => c.name).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <ShoppingBag size={16} className="text-primary" />
                      Products
                    </span>
                    <span className="font-bold">
                      {catalogs.reduce(
                        (total: number, cat: any) =>
                          total + (cat.products?.length || 0),
                        0
                      )}
                    </span>
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
                  onClick={() => setViewMode("catalogs")}
                  className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                    viewMode === "catalogs"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon name="Layers" size={16} className="inline mr-2" />
                  View by Catalogs
                </button>
                <button
                  onClick={() => setViewMode("products")}
                  className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
                    viewMode === "products"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon name="Package" size={16} className="inline mr-2" />
                  View by Products
                </button>
              </div>

              {loadingCatalogs ? (
                <div className="border rounded-2xl bg-white shadow-sm p-8 text-center">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-40 bg-gray-200 rounded-lg" />
                    ))}
                  </div>
                </div>
              ) : viewMode === "catalogs" ? (
                // Catalogs View - Grid Layout
                selectedCatalog ? (
                  // Catalog Detail View
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedCatalog(null)}
                      className="flex items-center gap-2 px-4 py-2 text-primary font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ArrowLeft size={18} />
                      Back to Catalogs
                    </button>

                    <div className="border rounded-2xl bg-white shadow-sm overflow-hidden">
                      {/* Catalog Header */}
                      <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-slate-100">
                        <div className="flex items-start gap-4">
                          {selectedCatalog.image && (
                            <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                              <Image
                                src={selectedCatalog.image}
                                alt={selectedCatalog.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                              {selectedCatalog.name}
                            </h3>
                            {selectedCatalog.description && (
                              <p className="text-sm text-slate-600 mt-2">
                                {selectedCatalog.description}
                              </p>
                            )}
                            <p className="text-sm font-bold text-slate-500 mt-3">
                              {selectedCatalog.products?.length || 0} Products
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Products Grid */}
                      {selectedCatalog.products &&
                      selectedCatalog.products.length > 0 ? (
                        <div className="p-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {selectedCatalog.products.map((product: any) => (
                              <div
                                key={product.id}
                                className="group cursor-pointer"
                                onClick={() =>
                                  router.push(`/products/${product.id}`)
                                }
                              >
                                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 border border-slate-100 shadow-sm transition-all group-hover:shadow-md">
                                  <Image
                                    src={
                                      product.image ||
                                      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400"
                                    }
                                    alt={product.name}
                                    fill
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                  />
                                  <div className="absolute bottom-2 right-2">
                                    <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg text-primary">
                                      <ShoppingBag size={18} />
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 px-1">
                                  <h4 className="text-[13px] font-bold text-slate-800 line-clamp-2">
                                    {product.name}
                                  </h4>
                                  <p className="text-[14px] font-black text-primary mt-1">
                                    ₦{product.price?.toLocaleString() || "N/A"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-gray-500">
                          <p className="text-sm">No products in this catalog</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : // Catalogs Grid View
                catalogs.filter((c: any) => c.name).length > 0 ? (
                  <div className="space-y-6">
                    {/* Catalogs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {catalogs
                        .filter((c: any) => c.name)
                        .slice(
                          (catalogPage - 1) * catalogsPerPage,
                          catalogPage * catalogsPerPage
                        )
                        .map((catalog: any) => (
                          <div
                            key={catalog.id}
                            onClick={() => setSelectedCatalog(catalog)}
                            className="border rounded-2xl bg-white shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                          >
                            {/* Catalog Image */}
                            <div className="relative h-48 bg-slate-200 overflow-hidden">
                              {catalog.image ? (
                                <Image
                                  src={catalog.image}
                                  alt={catalog.name}
                                  fill
                                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                  <Icon
                                    name="Package"
                                    size={40}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                  View Products
                                </button>
                              </div>
                            </div>

                            {/* Catalog Info */}
                            <div className="p-4">
                              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight line-clamp-2">
                                {catalog.name}
                              </h3>
                              {catalog.description && (
                                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                                  {catalog.description}
                                </p>
                              )}
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">
                                  {catalog.products?.length || 0} Products
                                </span>
                                <Icon
                                  name="ArrowRight"
                                  size={16}
                                  className="text-primary"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {catalogs.filter((c: any) => c.name).length >
                      catalogsPerPage && (
                      <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t">
                        <button
                          onClick={() =>
                            setCatalogPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={catalogPage === 1}
                          className="px-4 py-2 border rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          Previous
                        </button>

                        <div className="flex gap-1">
                          {Array.from({
                            length: Math.ceil(
                              catalogs.filter((c: any) => c.name).length /
                                catalogsPerPage
                            ),
                          }).map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => setCatalogPage(i + 1)}
                              className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                                catalogPage === i + 1
                                  ? "bg-primary text-white"
                                  : "border hover:bg-gray-50"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setCatalogPage((prev) => prev + 1)}
                          disabled={
                            catalogPage >=
                            Math.ceil(
                              catalogs.filter((c: any) => c.name).length /
                                catalogsPerPage
                            )
                          }
                          className="px-4 py-2 border rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border rounded-2xl bg-white shadow-sm p-8 text-center">
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <ShoppingBag size={40} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      No Catalogs Yet
                    </h2>
                    <p className="text-gray-600 mb-6">
                      This store hasn't created any catalogs yet. Check back
                      later!
                    </p>
                  </div>
                )
              ) : (
                // Products View (Flattened)
                (() => {
                  const allProducts = catalogs.flatMap((cat: any) =>
                    (cat.products || []).map((p: any) => ({
                      ...p,
                      catalogName: cat.name,
                    }))
                  );

                  return allProducts.length > 0 ? (
                    <div className="space-y-6">
                      <div className="border rounded-2xl bg-white shadow-sm p-6">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4">
                          All Products ({allProducts.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                          {allProducts.map((product: any) => (
                            <div
                              key={`${product.catalogName}-${product.id}`}
                              className="group cursor-pointer"
                              onClick={() =>
                                router.push(`/products/${product.id}`)
                              }
                            >
                              <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 border border-slate-100 shadow-sm transition-all group-hover:shadow-md">
                                <Image
                                  src={
                                    product.image ||
                                    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400"
                                  }
                                  alt={product.name}
                                  fill
                                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-2 left-2">
                                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-gray-700 shadow-lg">
                                    {product.catalogName}
                                  </div>
                                </div>
                                <div className="absolute bottom-2 right-2">
                                  <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg text-primary">
                                    <ShoppingBag size={18} />
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3 px-1">
                                <h4 className="text-[13px] font-bold text-slate-800 line-clamp-2">
                                  {product.name}
                                </h4>
                                <p className="text-[14px] font-black text-primary mt-1">
                                  ₦{product.price?.toLocaleString() || "N/A"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-2xl bg-white shadow-sm p-8 text-center">
                      <div
                        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <ShoppingBag size={40} className="text-gray-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Products Coming Soon
                      </h2>
                      <p className="text-gray-600 mb-6">
                        This store is setting up their product catalog. Check
                        back later!
                      </p>
                      <button
                        onClick={() => setIsSaved(!isSaved)}
                        style={{ backgroundColor: primaryColor }}
                        className="px-8 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      >
                        {isSaved ? "Remove from Saved" : "Save This Store"}
                      </button>
                    </div>
                  );
                })()
              )}
            </main>
          </div>
        </div>
      </div>
      <ContactVendorModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        vendorName={store.name}
        phone={null}
        socialLinks={store.socials || {}}
        workingHours={store.hours || {}}
        countryCode="234"
      />
    </>
  );
};

export default StorefrontDetailsPage;
