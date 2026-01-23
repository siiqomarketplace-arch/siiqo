"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import { toast } from "sonner";
import { switchMode } from "@/services/api";
import ContactVendorModal from "./ContactVendorModal";
import api_endpoints from "@/hooks/api_endpoints";
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Star,
} from "lucide-react";

interface StoreInfo {
  address: string;
  banner: string;
  branding: {
    layout_style?: string;
    primary_color?: string;
    secondary_color?: string;
  } | null;
  description: string;
  hours: Record<string, { start?: string; end?: string }>;
  logo: string;
  name: string;
  phone?: string | null;
  socials: Record<string, string> | null;
  whatsapp_link: string | null;
}

interface Catalog {
  id?: number | string;
  name: string;
  description?: string;
  image?: string | null;
  products?: any[];
}

const VendorPublicProfile = () => {
  const router = useRouter();
  const params = useParams<{ name: string }>();
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"catalogs" | "products">("catalogs");
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [catalogPage, setCatalogPage] = useState(1);
  const catalogsPerPage = 6;

  const fetchVendorSettings = async () => {
    try {
      setLoading(true);
      const storeSlug = params?.name;
      if (!storeSlug) {
        throw new Error("Missing store slug");
      }

      const response = await fetch(api_endpoints.MARKETPLACE_STORE(storeSlug));
      const data = await response.json();

      if (data?.status === "success" && data?.store_info) {
        const apiStoreInfo = data.store_info as StoreInfo;
        const mappedCatalogs: Catalog[] = (data.catalogs || []).map(
          (catalog: any) => ({
            id: catalog.id || catalog.catalog_name,
            name: catalog.catalog_name || catalog.name,
            description: catalog.description,
            image: catalog.image || null,
            products: catalog.products || [],
          }),
        );

        setStoreInfo(apiStoreInfo);
        setCatalogs(mappedCatalogs);
      } else {
        throw new Error("Failed to load store info");
      }
    } catch (err) {
      toast.error("Failed to load store details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorSettings();
  }, [params?.name]);

  useEffect(() => {
    switchMode("buyer");
  }, []);

  if (loading || !storeInfo)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-text-secondary">Loading Profile...</p>
      </div>
    );

  const primaryColor = storeInfo.branding?.primary_color || "#000000";
  const socialLinks: Record<string, string> = {
    ...(storeInfo.socials || {}),
    ...(storeInfo.whatsapp_link ? { whatsapp: storeInfo.whatsapp_link } : {}),
  };

  const totalCatalogPages = Math.ceil(
    catalogs.filter((c) => c.name).length / catalogsPerPage,
  );

  return (
    <div className="min-h-screen bg-background pb-12">
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
          </div>
        </div>
      </div>
      <div className="relative">
        <div
          className="h-44 md:h-64 w-full bg-center bg-cover relative"
          style={{ backgroundImage: `url(${storeInfo.banner})` }}
        />
        <div className="absolute -bottom-12 left-6 md:left-12">
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-xl">
            <Image
              src={storeInfo.logo}
              alt="Store Logo"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-2 w-full max-w-lg">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              {storeInfo.name}
              <Icon name="ShieldCheck" size={24} className="text-blue-500" />
            </h1>
            {storeInfo.description && (
              <p className="text-text-secondary text-sm font-medium">
                {storeInfo.description}
              </p>
            )}

            {storeInfo.address && (
              <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
                <span className="flex items-center gap-1">
                  <Icon name="MapPin" size={14} />
                  {storeInfo.address}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3 items-center flex-wrap"></div>{" "}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
          <aside className="lg:col-span-4 space-y-6">
            <div className="p-6 border rounded-2xl bg-surface shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-50">
                About Store
              </h3>
              <p className="text-sm leading-relaxed">{storeInfo.description}</p>
            </div>

            <div className="p-6 border rounded-2xl bg-surface shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">
                Contact Info
              </h3>
              <div className="space-y-3">
                {storeInfo.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Icon name="Phone" size={16} />
                    {storeInfo.phone}
                  </div>
                )}
                {storeInfo.whatsapp_link && (
                  <button
                    onClick={() => {
                      let phoneNumber = storeInfo.whatsapp_link || "";
                      phoneNumber = phoneNumber
                        .replace(/^0+/, "")
                        .replace(/\D/g, "");
                      if (!phoneNumber.startsWith("234")) {
                        phoneNumber = `234${phoneNumber}`;
                      }
                      window.open(`https://wa.me/${phoneNumber}`, "_blank");
                    }}
                    className="flex items-center gap-2 text-sm text-green-600 font-semibold"
                  >
                    <MessageCircle size={16} />
                    Message on WhatsApp
                  </button>
                )}
              </div>
            </div>

            {storeInfo.hours && Object.keys(storeInfo.hours).length > 0 && (
              <div className="p-6 border rounded-2xl bg-surface shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-50">
                  Working Hours
                </h3>
                <div className="space-y-2">
                  {Object.entries(storeInfo.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="font-medium">{day}</span>
                      <span className="text-text-secondary">
                        {hours.start && hours.end
                          ? `${hours.start} - ${hours.end}`
                          : hours.start
                            ? `From ${hours.start}`
                            : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(socialLinks).length > 0 && (
              <div className="p-6 border rounded-2xl bg-surface shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">
                  Follow Us
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(socialLinks).map(([platform, url]) => {
                    const getSocialIcon = (
                      platform: string,
                    ): React.ReactNode => {
                      const platform_lower = platform.toLowerCase();
                      switch (platform_lower) {
                        case "facebook":
                          return <Icon name="Facebook" size={18} />;
                        case "twitter":
                          return <Icon name="Twitter" size={18} />;
                        case "instagram":
                          return <Icon name="Instagram" size={18} />;
                        case "linkedin":
                          return <Icon name="Linkedin" size={18} />;
                        case "whatsapp":
                          return <Icon name="MessageCircle" size={18} />;
                        case "tiktok":
                          return <Icon name="Music" size={18} />;
                        case "youtube":
                          return <Icon name="Youtube" size={18} />;
                        default:
                          return <Icon name="Link" size={18} />;
                      }
                    };
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border rounded-lg hover:bg-gray-50 transition"
                        title={`Visit ${platform}`}
                      >
                        {getSocialIcon(platform)}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

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
                    {catalogs.filter((c) => c.name).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-primary" />
                    Products
                  </span>
                  <span className="font-bold">
                    {catalogs.reduce(
                      (total, cat) => total + (cat.products?.length || 0),
                      0,
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

          <main className="lg:col-span-8">
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

            {viewMode === "catalogs" ? (
              selectedCatalog ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedCatalog(null)}
                    className="flex items-center gap-2 px-4 py-2 text-primary font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={18} />
                    Back to Catalogs
                  </button>

                  <div className="border rounded-2xl bg-white shadow-sm overflow-hidden">
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
              ) : catalogs.filter((c) => c.name).length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {catalogs
                      .filter((c) => c.name)
                      .slice(
                        (catalogPage - 1) * catalogsPerPage,
                        catalogPage * catalogsPerPage,
                      )
                      .map((catalog) => (
                        <div
                          key={catalog.id || catalog.name}
                          onClick={() => setSelectedCatalog(catalog)}
                          className="border rounded-2xl bg-white shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                        >
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
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                View Products
                              </button>
                            </div>
                          </div>

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

                  {catalogs.filter((c) => c.name).length > catalogsPerPage && (
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
                        {Array.from({ length: totalCatalogPages }).map(
                          (_, i) => (
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
                          ),
                        )}
                      </div>

                      <button
                        onClick={() => setCatalogPage((prev) => prev + 1)}
                        disabled={catalogPage >= totalCatalogPages}
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
              (() => {
                const allProducts = catalogs.flatMap((cat) =>
                  (cat.products || []).map((p) => ({
                    ...p,
                    catalogName: cat.name,
                  })),
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
                      This store is setting up their product catalog. Check back
                      later!
                    </p>
                  </div>
                );
              })()
            )}
          </main>
        </div>
      </div>

      <ContactVendorModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        vendorName={storeInfo.name}
        phone={storeInfo.phone || null}
        socialLinks={socialLinks}
        workingHours={storeInfo.hours || {}}
      />
    </div>
  );
};

export default VendorPublicProfile;
