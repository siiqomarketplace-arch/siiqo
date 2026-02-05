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
    <div className="min-h-screen flex bg-background mt-14 md:mt-0 pb-10">
      <main className="w-full md:max-w-[85vw]  mx-auto px-4 py-4 md:py-6">
        <div className="mb-6 md:mb-8">
          <h1 className="mb-1 md:mb-2 text-xl md:text-2xl font-bold font-heading text-text-primary">
            Marketing Tools
          </h1>
          <p className="text-sm md:text-base text-text-muted">
            Promote your products & storefront on social media with ShareKit
            cards.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-5">
            <div className="bg-white border border-border rounded-2xl p-5 md:p-6">
              <h2 className="text-lg font-semibold text-text-primary">
                Siiqo ShareKit
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Auto-generate a promo card with QR code for products or your
                storefront.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={cardType === "product" ? "default" : "outline"}
                    size="sm"
                    iconName="Package"
                    onClick={() => setCardType("product")}
                  >
                    Product Card
                  </Button>
                  <Button
                    variant={cardType === "store" ? "default" : "outline"}
                    size="sm"
                    iconName="Store"
                    onClick={() => setCardType("store")}
                  >
                    Storefront Card
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={orientation === "portrait" ? "default" : "outline"}
                    size="sm"
                    iconName="Smartphone"
                    onClick={() => setOrientation("portrait")}
                  >
                    Portrait
                  </Button>
                  <Button
                    variant={
                      orientation === "landscape" ? "default" : "outline"
                    }
                    size="sm"
                    iconName="Monitor"
                    onClick={() => setOrientation("landscape")}
                  >
                    Landscape
                  </Button>
                </div>

                <label className="block text-sm font-medium text-text-secondary">
                  Select product
                </label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                  value={selectedProductId ?? ""}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  disabled={cardType === "store"}
                >
                  {products.length === 0 && (
                    <option value="" disabled>
                      No products found
                    </option>
                  )}
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>

                <div className="rounded-lg bg-muted/50 p-3 text-xs text-text-muted">
                  {cardType === "product"
                    ? "Tip: Add products first, then come back to generate a promo card."
                    : "Tip: Keep your storefront name, logo, and banner updated for a better card."}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Share2"
                    onClick={handleCopyLink}
                    loading={isCopying}
                  >
                    Share
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    iconName="Download"
                    onClick={handleDownloadPng}
                    disabled={downloadDisabled || isDownloading}
                    loading={isDownloading}
                  >
                    Download PNG
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="xl:col-span-7 flex justify-center xl:justify-end w-full overflow-x-auto">
            {cardType === "product" && !selectedProduct ? (
              <div className="bg-white border border-border rounded-2xl p-6 text-sm text-text-muted">
                Add a product to generate your promo card.
              </div>
            ) : (
              <div ref={cardRef}>
                <ProductPromoCard
                  type={cardType}
                  orientation={orientation}
                  product={cardType === "product" ? selectedProduct : null}
                  storeName={vendorProfile?.business_name || "My Store"}
                  storeUrl={storeUrl}
                  storeLogoUrl={vendorProfile?.logo_url || null}
                  storeBannerUrl={vendorProfile?.banner_url || null}
                  storeTagline={vendorProfile?.description || null}
                  productUrl={productUrl}
                  locationLabel={vendorProfile?.address || undefined}
                  ctaText={cardType === "store" ? "Visit my Store" : undefined}
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default MarketingToolsPage;
