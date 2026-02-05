"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { MapPin } from "lucide-react";
import { Product } from "@/types/vendor/products";

type PromoCardType = "product" | "store";
type CardOrientation = "portrait" | "landscape";

interface ProductPromoCardProps {
  type?: PromoCardType;
  orientation?: CardOrientation;
  product?: Product | null;
  storeName: string;
  storeUrl: string;
  storeLogoUrl?: string | null;
  storeBannerUrl?: string | null;
  productUrl?: string;
  storeTagline?: string | null;
  ctaText?: string;
  locationLabel?: string;
}

const ProductPromoCard: React.FC<ProductPromoCardProps> = ({
  type = "product",
  orientation = "portrait",
  product,
  storeName,
  storeUrl,
  storeLogoUrl,
  storeBannerUrl,
  productUrl,
  storeTagline,
  ctaText,
  locationLabel,
}) => {
  const isStoreCard = type === "store";
  const rawImage = product?.images?.[0];
  const productImage =
    (typeof rawImage === "string" ? rawImage : rawImage?.url) ||
    product?.image ||
    "/assets/images/no_image.png";
  const headerImage =
    storeBannerUrl ||
    storeLogoUrl ||
    productImage ||
    "/assets/images/no_image.png";

  const displayStoreUrl = storeUrl?.replace(/^https?:\/\//, "") || "siiqo.com";
  const resolvedTitle = isStoreCard ? storeName : product?.name || "Product";
  const resolvedCta =
    ctaText || (isStoreCard ? "Visit my Store" : "Scan to Order");
  const resolvedQrValue = isStoreCard ? storeUrl : productUrl || storeUrl;

  const withProxy = (url?: string | null) => {
    if (!url) return url || "";
    if (url.startsWith("/")) return url;
    if (!/^https?:\/\//.test(url)) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  const headerImageSrc = withProxy(isStoreCard ? headerImage : productImage);
  const logoSrc = withProxy(storeLogoUrl || "/assets/images/logo-icon.png");
  const topWaveBg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 48'><path d='M0,48 C150,48 250,0 400,48 L400,48 L0,48 Z' fill='%23ffffff'/></svg>";
  const footerWaveBg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 100'><path d='M0,20 C100,60 200,0 400,40 V0 H0 Z' fill='white'/></svg>";

  const isLandscape = orientation === "landscape";
  const containerClass = isLandscape
    ? "relative w-[700px] h-[400px] bg-white rounded-[36px] shadow-2xl overflow-hidden flex font-sans border border-gray-100"
    : "relative w-[380px] h-[580px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col font-sans border border-gray-100";
  const headerClass = isLandscape
    ? "relative w-[46%] h-full overflow-hidden"
    : "relative h-[42%] w-full overflow-hidden";
  const detailsClass = isLandscape
    ? "relative bg-white px-6 pt-6 pb-3 z-10"
    : "relative flex-1 mb-4 bg-white px-8 pt-2 z-10";
  const footerClass = isLandscape
    ? "relative flex-1 overflow-hidden flex flex-col justify-end px-6 pb-5"
    : "relative h-[38%] overflow-hidden flex flex-col justify-end p-6";

  return (
    <div className={containerClass}>
      {/* 1. Header Image Section */}
      <div className={headerClass}>
        <div
          role="img"
          aria-label={resolvedTitle}
          className="w-full h-full"
          style={{
            backgroundImage: `url(${headerImageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute top-8 left-6 text-white/40 text-xl select-none">
          ✦
        </div>
        {!isLandscape && (
          <div
            className="absolute -bottom-1 left-0 w-full h-12"
            style={{
              backgroundImage: `url(${topWaveBg})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
      </div>

      {isLandscape ? (
        <div className="flex flex-col w-[54%]">
          {/* 2. Details Section */}
          <div className={detailsClass}>
            <div className="space-y-1">
              <h2 className="text-[#1B2B48] text-[24px] font-bold tracking-tight leading-tight line-clamp-2">
                {resolvedTitle}
              </h2>
              {isStoreCard ? (
                <div className="text-[#D29E53] text-base font-semibold">
                  {storeTagline || "Visit my storefront on Siiqo"}
                </div>
              ) : (
                <div className="flex items-baseline gap-1 text-[#D29E53] text-2xl font-bold">
                  <span className="text-xl font-semibold">₦</span>
                  {Number(product?.final_price || 0).toLocaleString()}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[#8A94A6] pt-2">
                <div className="p-1 rounded-full bg-[#D29E53]/10">
                  <MapPin size={14} className="text-[#D29E53] fill-[#D29E53]" />
                </div>
                <span className="text-sm font-medium">
                  {locationLabel
                    ? locationLabel
                    : isStoreCard
                      ? "Shop verified vendor"
                      : `Sold by ${storeName}`}
                </span>
              </div>
            </div>
            <div className="absolute right-8 top-8 text-[#B8D1FB] text-xl opacity-40">
              ✦
            </div>
          </div>

          {/* 3. Footer Section (Gradients & QR) */}
          <div className={footerClass}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#B8D1FB] via-[#8CACF3] to-[#7199F1]">
              <div
                className="absolute top-0 left-0 w-full h-20 opacity-30"
                style={{
                  backgroundImage: `url(${footerWaveBg})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:20px_20px] opacity-10"></div>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-[26px] p-3 flex items-center gap-3 relative z-20 shadow-xl border border-white/50">
              <div className="bg-white p-1 rounded-xl">
                <QRCodeSVG
                  value={resolvedQrValue}
                  size={72}
                  level="H"
                  includeMargin={false}
                  className="rounded-sm"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[#1B2B48] font-bold text-base leading-tight">
                  {resolvedCta}
                </span>
                <p className="text-[#1B2B48]/80 text-[11px] mt-0.5">
                  Check out my store on{" "}
                  <span className="font-extrabold">Siiqo!</span>
                </p>
                <span className="text-[#1B2B48]/40 text-[10px] mt-1 font-medium tracking-wide">
                  {displayStoreUrl}
                </span>
              </div>

              <div className="absolute top-2 right-5 text-[#D29E53] text-lg opacity-60">
                ✦
              </div>
              <div className="absolute bottom-3 right-10 text-[#D29E53] text-[10px] opacity-40">
                ✦
              </div>
            </div>

            <div className="flex justify-end items-center mt-3 gap-1.5 relative z-20">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-sm">
                <img
                  src={logoSrc}
                  alt="Siiqo"
                  className="w-3.5 h-3.5 object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <span className="text-[#1B2B48] font-bold text-sm tracking-tighter opacity-90">
                {storeName}
              </span>
            </div>
            <div className="absolute bottom-4 left-6 text-white/30 text-xs">
              ✦
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Details Section */}
          <div className={detailsClass}>
            <div className="space-y-1">
              <h2 className="text-[#1B2B48] text-[26px] font-bold tracking-tight leading-tight">
                {resolvedTitle}
              </h2>
              {isStoreCard ? (
                <div className="text-[#D29E53] text-lg font-semibold">
                  {storeTagline || "Visit my storefront on Siiqo"}
                </div>
              ) : (
                <div className="flex items-baseline gap-1 text-[#D29E53] text-3xl font-bold">
                  <span className="text-2xl font-semibold">₦</span>
                  {Number(product?.final_price || 0).toLocaleString()}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[#8A94A6] pt-2">
                <div className="p-1 rounded-full bg-[#D29E53]/10">
                  <MapPin size={14} className="text-[#D29E53] fill-[#D29E53]" />
                </div>
                <span className="text-sm font-medium">
                  {locationLabel
                    ? locationLabel
                    : isStoreCard
                      ? "Shop verified vendor"
                      : `Sold by ${storeName}`}
                </span>
              </div>
            </div>

            <div className="absolute right-10 top-12 text-[#B8D1FB] text-2xl opacity-40">
              ✦
            </div>
          </div>

          {/* 3. Footer Section (Gradients & QR) */}
          <div className={footerClass}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#B8D1FB] via-[#8CACF3] to-[#7199F1]">
              <div
                className="absolute top-0 left-0 w-full h-24 opacity-30"
                style={{
                  backgroundImage: `url(${footerWaveBg})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:20px_20px] opacity-10"></div>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-4 flex items-center gap-4 relative z-20 shadow-xl border border-white/50">
              <div className="bg-white p-1 rounded-xl">
                <QRCodeSVG
                  value={resolvedQrValue}
                  size={85}
                  level="H"
                  includeMargin={false}
                  className="rounded-sm"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[#1B2B48] font-bold text-lg leading-tight">
                  {resolvedCta}
                </span>
                <p className="text-[#1B2B48]/80 text-[12px] mt-0.5">
                  Check out my store on{" "}
                  <span className="font-extrabold">Siiqo!</span>
                </p>
                <span className="text-[#1B2B48]/40 text-[10px] mt-1 font-medium tracking-wide">
                  {displayStoreUrl}
                </span>
              </div>

              <div className="absolute top-3 right-6 text-[#D29E53] text-xl opacity-60">
                ✦
              </div>
              <div className="absolute bottom-4 right-12 text-[#D29E53] text-xs opacity-40">
                ✦
              </div>
            </div>

            <div className="flex justify-end items-center mt-4 gap-1.5 relative z-20">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-sm">
                <img
                  src={logoSrc}
                  alt="Siiqo"
                  className="w-3.5 h-3.5 object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <span className="text-[#1B2B48] font-bold text-sm tracking-tighter opacity-90">
                {storeName}
              </span>
            </div>

            <div className="absolute bottom-6 left-10 text-white/30 text-xs">
              ✦
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPromoCard;
