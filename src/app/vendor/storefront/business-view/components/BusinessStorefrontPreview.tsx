"use client";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Lock,
  Clock,
  Building,
  Globe,
  CheckCircle2,
  ChevronLeft,
  User,
  Search,
  Loader2,
  Settings,
  ShoppingBag,
} from "lucide-react";
import api_endpoints from "@/hooks/api_endpoints";

const BusinessStorefrontPreview = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchPreviewData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token");

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // This is what was missing
        };
        // Fetch Business Settings, Products, and Catalogs in parallel
        const [settingsRes, productsRes, catalogsRes] = await Promise.all([
          fetch(api_endpoints.VENDOR_SETTINGS),
          fetch(api_endpoints.GET_MY_PRODUCTS),
          fetch(api_endpoints.GET_CATALOGS),
        ]);

        const settingsData = await settingsRes.json();
        const productsData = await productsRes.json();
        const catalogsData = await catalogsRes.json();

        if (settingsData.status === "success") {
          setBusiness(settingsData.data);
        }

        if (productsData.status === "success") {
          // Accessing products from the nested array structure provided
          const extractedProducts = productsData.data?.[0]?.products || [];
          setProducts(extractedProducts);
        }

        if (catalogsData.status === "success") {
          setCatalogs(catalogsData.catalogs);
        }
      } catch (error) {
        console.error("Preview fetch error:", error);
        toast({
          title: "Connection Error",
          description: "Could not load live preview data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, [toast]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-400 mb-2" size={32} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Loading Preview...
        </p>
      </div>
    );

  if (!business) return null;

  // Mapping API names to the UI variables
  const storeSettings = business.store_settings;
  const personalInfo = business.personal_info;
  const themeColor =
    storeSettings?.template_options?.primary_color || "#1E293B";

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-40 font-sans">
      {/* 1. TOP BANNER */}
      <div className="bg-[#EF8E52] text-white py-2 px-4 flex items-center justify-center gap-2 text-[10px] font-bold sticky top-0 z-[100]">
        <Lock size={12} fill="currentColor" />
        <span className="tracking-tight">
          LIVE PREVIEW — Current Cloud Settings
        </span>
      </div>

      {/* 2. HEADER SECTION */}
      <div className="relative w-full overflow-hidden font-sans">
        <div className="relative h-64 w-full bg-slate-200">
          {storeSettings?.banner_url ? (
            <>
              <img
                src={storeSettings.banner_url}
                className="w-full h-full object-cover"
                alt="Cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: themeColor }}
            >
              <Building size={48} className="text-white/20" />
            </div>
          )}

          <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-white">
            <button className="p-2 bg-black/20 backdrop-blur-md rounded-xl">
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-3">
              <button className="p-2 bg-black/20 backdrop-blur-md rounded-xl">
                <Search size={20} />
              </button>
              <button className="p-2 bg-black/20 backdrop-blur-md rounded-xl">
                <User size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="relative px-6 -mt-12 mb-6 flex items-end gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 bg-white rounded-[2rem] p-1 shadow-xl">
              <div className="w-full h-full bg-slate-50 rounded-[1.8rem] flex items-center justify-center overflow-hidden border border-slate-100">
                {storeSettings?.logo_url ? (
                  <img
                    src={storeSettings.logo_url}
                    className="w-full h-full object-cover"
                    alt="Logo"
                  />
                ) : (
                  <Building size={32} className="text-slate-300" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-500 p-1.5 rounded-full border-4 border-[#F1F5F9]">
              <CheckCircle2 size={12} className="text-white" />
            </div>
          </div>

          <div className="pb-10 text-black">
            <h2 className="text-xl font-black text-white drop-shadow-md leading-tight">
              {storeSettings?.business_name || "New Store"}
            </h2>
            <div className="flex items-center gap-1.5 text-white/80">
              <Globe size={10} />
              <p className="text-[10px] font-bold tracking-wide">
                siiqo.com/{storeSettings?.storefront_link}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONTENT WRAPPER */}
      <div className="px-4 mt-4 space-y-4 relative z-50">
        {/* ABOUT CARD */}
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                About
              </h4>
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                {storeSettings?.business_name}
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 mb-4">
                {storeSettings?.description || "No description provided."}
              </p>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Store Address
                </span>
                <p className="text-[11px] font-bold text-slate-700">
                  {storeSettings?.address || "Lagos, Nigeria"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CATALOGS / CATEGORIES */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {catalogs.map((cat) => (
            <div
              key={cat.id}
              className="bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm whitespace-nowrap"
            >
              <span className="text-[10px] font-black text-slate-900 uppercase">
                {cat.name}
              </span>
            </div>
          ))}
        </div>

        {/* STYLE PREVIEW SECTION */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[1.5rem] p-4 flex items-center gap-3 border border-slate-50 shadow-sm">
            <div
              className="w-8 h-8 rounded-full shadow-inner"
              style={{ backgroundColor: themeColor }}
            />
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                Theme
              </p>
              <p className="text-[11px] font-bold text-slate-800">Primary</p>
            </div>
          </div>
          <div className="bg-white rounded-[1.5rem] p-4 flex items-center gap-3 border border-slate-50 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Settings size={14} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                Layout
              </p>
              <p className="text-[11px] font-bold text-slate-800 capitalize">
                {storeSettings?.template_options?.layout_style}
              </p>
            </div>
          </div>
        </div>

        {/* PRODUCTS FROM API */}
        <div className="pt-4">
          <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Store Products
            </h3>
            <span className="text-[10px] font-bold text-orange-500">
              {products.length} Items
            </span>
          </div>

          <div className="space-y-3">
            {products.length > 0 ? (
              products.map((product: any) => (
                <div
                  key={product.id}
                  className="bg-white rounded-[1.5rem] p-3 flex items-center justify-between border border-slate-50 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag
                          size={20}
                          className="m-auto mt-3 text-slate-300"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {product.category}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-slate-900">
                    ₦{product.price?.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-slate-100">
                <p className="text-xs font-bold text-slate-400">
                  No products found in this store.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex items-center justify-center z-[100]">
        <button
          className="bg-[#1E293B] text-white px-10 py-4 rounded-full text-xs font-black shadow-lg transform -translate-y-2 active:scale-95 transition-all w-full max-w-xs"
          onClick={() => toast({ title: "Storefront is Live!" })}
        >
          {storeSettings?.is_published
            ? "Manage Published Store"
            : "Publish Storefront"}
        </button>
      </div>
    </div>
  );
};

export default BusinessStorefrontPreview;
