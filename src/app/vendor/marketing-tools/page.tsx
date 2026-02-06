"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { productService } from "@/services/productService";
import { vendorService } from "@/services/vendorService";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types/vendor/products";
import Button from "@/components/ui/new/Button";
import ProductPromoCard from "./components/ProductPromoCard";
import html2canvas from "html2canvas";
import { toast } from "@/hooks/use-toast";
import ShareModal from "@/components/ShareModal";
interface VendorProfile {
  business_name?: string;
  logo_url?: string | null;
  address?: string | null;
  storefront_link?: string | null;
  banner_url?: string | null;
  description?: string | null;
}

const MarketingToolsPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [cardType, setCardType] = useState<"product" | "store">("product");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/auth/login");
    }
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsResponse, vendorResponse] = await Promise.all([
          productService.getMyProducts(),
          vendorService.getVendorProfile(),
        ]);

        const catalogs = Array.isArray(productsResponse?.data)
          ? productsResponse.data
          : Array.isArray(productsResponse?.data?.data)
            ? productsResponse.data.data
            : [];

        const productsArray = catalogs.flatMap((catalog: any) => {
          if (!Array.isArray(catalog?.products)) return [];
          return catalog.products.map((p: any) => ({
            ...p,
            catalog_id: catalog.catalog_id,
            catalog_name: catalog.catalog_name,
          }));
        });

        const formattedProducts: Product[] = productsArray.map(
          (product: any) => ({
            id: product.id || product._id,
            name: product.product_name || product.name,
            image: product.images?.[0] || "/assets/images/no_image.png",
            images: product.images || [],
            category: product.category || "Uncategorized",
            sku: product.sku || `SKU-${product.id}`,
            final_price:
              product.final_price ??
              product.product_price ??
              product.price ??
              0,
            stock: product.quantity ?? 0,
            status: product.status || "active",
            createdAt: product.createdAt || new Date().toISOString(),
            views: product.views || 0,
            description: product.description,
          }),
        );

        setProducts(formattedProducts);
        if (formattedProducts.length > 0) {
          setSelectedProductId(Number(formattedProducts[0].id));
        }

        const storeSettings = vendorResponse?.data?.store_settings || {};
        setVendorProfile({
          business_name:
            storeSettings?.business_name || user?.business_name || user?.name,
          logo_url: storeSettings?.logo_url || null,
          address: storeSettings?.address || null,
          storefront_link:
            storeSettings?.storefront_link || storeSettings?.website || null,
          banner_url: storeSettings?.banner_url || null,
          description: storeSettings?.description || null,
        });
      } catch (error) {
        console.error("Error loading ShareKit data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const safeBaseUrl = baseUrl || "https://siiqo.com";

  const productUrl = selectedProduct
    ? `${safeBaseUrl}/products/${selectedProduct.id}`
    : safeBaseUrl;

  const normalizeUrl = (url: string) =>
    /^https?:\/\//i.test(url) ? url : `https://${window.location.host}/${url}`;

  const rawStoreUrl = vendorProfile?.storefront_link || safeBaseUrl;
  const storeUrl = normalizeUrl(rawStoreUrl);
  const shareUrl = cardType === "store" ? storeUrl : productUrl;
  const downloadDisabled = cardType === "product" && !selectedProduct;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      setIsCopying(true);
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast({ title: "Link copied", description: shareUrl });
    } catch (error) {
      console.error("Failed to copy link", error);
      toast({ title: "Could not copy link", variant: "destructive" });
    } finally {
      setIsCopying(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const filename =
        cardType === "store"
          ? "siiqo-storefront-card.png"
          : `siiqo-product-${selectedProduct?.id || "card"}.png`;
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "PNG downloaded" });
    } catch (error) {
      console.error("Failed to download PNG", error);
      toast({ title: "Could not download PNG", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isAuthLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="text-text-muted">Loading ShareKit...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] mt-14 md:mt-0">
      <main className="max-w-[1400px] mx-auto px-4 py-8 md:py-12">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-black text-[#0B1B3B] tracking-tight">
            ShareKit Marketing
          </h1>
          <p className="text-lg text-gray-500 font-medium mt-2">
            Create high-converting promo cards for your social media.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* SETTINGS PANEL */}
          <section className="lg:col-span-5 order-2 lg:order-1">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold text-[#0B1B3B] mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-[#3662D8] rounded-full" />
                Customize Your Card
              </h2>

              <div className="space-y-6">
                {/* Type & Orientation Selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCardType("product")}
                    className={`py-4 rounded-2xl font-bold transition-all ${cardType === "product" ? "bg-[#0B1B3B] text-white shadow-lg" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                  >
                    Product Card
                  </button>
                  <button
                    onClick={() => setCardType("store")}
                    className={`py-4 rounded-2xl font-bold transition-all ${cardType === "store" ? "bg-[#0B1B3B] text-white shadow-lg" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                  >
                    Store Card
                  </button>
                </div>

                <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
                  <button
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${orientation === "portrait" ? "bg-white shadow-sm" : "text-gray-500"}`}
                    onClick={() => setOrientation("portrait")}
                  >
                    Portrait
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${orientation === "landscape" ? "bg-white shadow-sm" : "text-gray-500"}`}
                    onClick={() => setOrientation("landscape")}
                  >
                    Landscape
                  </button>
                </div>

                {/* Product Select */}
                {cardType === "product" && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Select Product
                    </label>
                    <select
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-medium focus:ring-2 focus:ring-blue-500 transition"
                      value={selectedProductId ?? ""}
                      onChange={(e) =>
                        setSelectedProductId(Number(e.target.value))
                      }
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="secondary"
                    className="w-full py-7 rounded-2xl font-bold text-lg shadow-xl"
                    iconName="Download"
                    onClick={handleDownloadPng}
                    disabled={downloadDisabled || isDownloading}
                    loading={isDownloading}
                  >
                    Download PNG
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full py-7 rounded-2xl font-bold text-lg"
                    iconName="Share2"
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* PREVIEW PANEL */}
          <section className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-center">
            <div className="mb-4 text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">
              Live Preview
            </div>

            {/* THE MAGIC WRAPPER: Handles responsiveness via CSS scaling */}
            <div className="w-full flex justify-center items-center overflow-x-auto py-10 px-4 scrollbar-hide min-h-[500px]">
              <div className="origin-center scale-[0.7] sm:scale-[0.85] md:scale-100 transition-transform duration-500">
                <div
                  ref={cardRef}
                  className="shadow-[0_40px_100px_rgba(0,0,0,0.15)] rounded-[45px]"
                >
                  <ProductPromoCard
                    type={cardType}
                    orientation={orientation}
                    product={cardType === "product" ? selectedProduct : null}
                    storeName={vendorProfile?.business_name || "My Store"}
                    storeUrl={storeUrl}
                    storeLogoUrl={vendorProfile?.logo_url}
                    storeBannerUrl={vendorProfile?.banner_url}
                    storeTagline={vendorProfile?.description}
                    productUrl={productUrl}
                    locationLabel={vendorProfile?.address || undefined}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        productId={
          cardType === "store"
            ? vendorProfile?.business_name || "store"
            : selectedProduct?.id || "product"
        }
        productName={
          cardType === "store"
            ? vendorProfile?.business_name || "My Store"
            : selectedProduct?.name || "Product"
        }
        productOwner={vendorProfile?.business_name || "Siiqo Store"}
        isStore={cardType === "store"}
      />
    </div>
  );
};

export default MarketingToolsPage;
