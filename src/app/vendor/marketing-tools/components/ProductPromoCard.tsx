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

  const headerImage = isStoreCard
    ? storeBannerUrl || storeLogoUrl || productImage
    : productImage;
  const displayStoreUrl = storeUrl?.replace(/^https?:\/\//, "") || "siiqo.com";
  const resolvedTitle = isStoreCard
    ? storeName
    : product?.name || "Product Name";
  const resolvedCta =
    ctaText || (isStoreCard ? "Visit my Store" : "Scan to Order");
  const resolvedQrValue = isStoreCard ? storeUrl : productUrl || storeUrl;

  const withProxy = (url?: string | null) => {
    if (!url || url.startsWith("/") || !/^https?:\/\//.test(url))
      return url || "";
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  const headerImageSrc = withProxy(headerImage);
  const logoSrc = withProxy(storeLogoUrl || "/assets/images/logo-icon.png");

  const isLandscape = orientation === "landscape";

  return (
    <div
      className={`relative bg-white shadow-2xl overflow-hidden flex font-sans border border-gray-100 transition-all duration-500
        ${isLandscape ? "w-[720px] h-[450px] rounded-[32px]" : "w-[400px] h-full rounded-[45px] flex-col"}`}
    >
      {/* 1. Header Image Section */}
      <div
        className={`relative overflow-hidden ${
          isLandscape
            ? "w-[45%] h-full"
            : "w-full h-[320px] sm:h-[380px] md:h-[450px]"
        }`}
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url(${headerImageSrc})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#F3F4F6",
          }}
        />
        {/* Shine/Sparkle effect */}
        <div className="absolute top-8 left-8 text-white/50 text-2xl animate-pulse">
          ✦
        </div>
      </div>

      {/* 2. Content & Footer Wrapper */}
      <div
        className={`flex flex-col flex-1 bg-white ${isLandscape ? "w-[55%] p-8" : "px-9 pt-4 pb-8"}`}
      >
        <div className="flex-1 space-y-2">
          <h2 className="text-[#0B1B3B] text-[28px] md:text-[32px] font-black tracking-tight leading-[1.1] break-words whitespace-normal">
            {resolvedTitle}
          </h2>

          {!isStoreCard && product?.final_price && (
            <div className="text-[#D29E53] text-3xl font-black flex items-baseline gap-1">
              {/* <span className="text-xl font-bold">₦</span>
              {Number(product.final_price).toLocaleString()} */}
            </div>
          )}

          {isStoreCard && (
            <p className="text-[#D29E53] text-lg font-bold italic opacity-90 md:line-clamp-2 w-full">
              {storeTagline || "Verified Local Store"}
            </p>
          )}

          <div className="flex items-center gap-2 text-[#1B2B48] pt-2">
            <div className="p-1.5 rounded-full bg-[#D29E53]/10">
              <MapPin size={16} className="text-[#D29E53] fill-[#D29E53]" />
            </div>
            <span className="text-base font-extrabold uppercase tracking-wider text-[#1B2B48]/70">
              {locationLabel ? locationLabel : `SOLD BY ${storeName}`}
            </span>
          </div>
        </div>

        {/* 3. Footer Glass Card */}
        <div className={`relative mt-6 group`}>
          <div className="bg-[#0B1B3B] text-white rounded-[30px] p-5 flex items-center gap-5 relative z-20 shadow-2xl border border-white/10">
            <div className="bg-white p-1.5 rounded-2xl shadow-inner">
              <QRCodeSVG
                value={resolvedQrValue}
                size={isLandscape ? 80 : 90}
                level="H"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-white font-black text-xl leading-tight uppercase tracking-tight">
                {resolvedCta}
              </span>
              <p className="text-white/70 text-sm mt-1">
                Shop on <span className="font-black text-white">Siiqo!</span>
              </p>
              <span className="text-[#D29E53] text-[11px] mt-2 font-mono font-extrabold  md:line-clamp-2 w-full">
                {displayStoreUrl}
              </span>
            </div>

            {/* Decorative Stars */}
            <div className="absolute top-3 right-6 text-[#D29E53] text-2xl opacity-60">
              ✦
            </div>
          </div>

          {/* Platform Branding */}
          <div className="flex justify-end items-center mt-5 gap-2 opacity-90">
            <img
              src={logoSrc}
              alt="Siiqo"
              className="w-20 h-20 rounded-full bg-white p-1"
            />
            <span className="text-[#0B1B3B] font-black text-xl tracking-tighter uppercase italic">
              {storeName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPromoCard;
