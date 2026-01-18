"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import Button from "@/components/Button";
import { X, Phone, MessageSquare } from "lucide-react";
import apiClient from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface Seller {
  name: string;
  banner_url?: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  memberSince: string;
  verifiedSeller: boolean;
  phoneNumber?: string; // This will map to whatsapp_chat from API
  slug?: string; // From getActiveStoreFronts API
}

interface SellerCardProps {
  seller: Seller;
  isMobile?: boolean;
  onNavigateToVendorProfile?: () => void;
}

const SellerCard = ({
  seller,
  isMobile = false,
  onNavigateToVendorProfile = () => {},
}: SellerCardProps) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const router = useRouter();

  // Handle Initial for Avatar Fallback
  const sellerInitial = seller.name ? seller.name.charAt(0).toUpperCase() : "?";
  const hasAvatar =
    seller.banner_url &&
    seller.banner_url.trim() !== "" &&
    !seller.banner_url.includes("placeholder");

  const handleWhatsApp = () => {
    if (!seller.phoneNumber) {
      alert("WhatsApp contact not available for this seller.");
      return;
    }
    const message = encodeURIComponent(
      `Hello ${seller.name}, I'm interested in your product on siiqo.`
    );
    // Remove non-digits for the URL
    const cleanNumber = seller.phoneNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
    setShowContactModal(false);
  };

  const handleCall = () => {
    if (!seller.phoneNumber) {
      alert("Phone number not available.");
      return;
    }
    window.location.href = `tel:${seller.phoneNumber}`;
    setShowContactModal(false);
  };

  const navigateToSeller = async () => {
    try {
      // Read token explicitly and include Authorization header
      const token =
        typeof window !== "undefined"
          ? sessionStorage.getItem("RSToken") || localStorage.getItem("RSToken")
          : null;

      if (!token) {
        // If not authenticated, try the provided seller.slug
        if (seller.slug) {
          router.push(`/vendor-public-view/${seller.slug}`);
          return;
        }
        toast({
          title: "Authentication Required",
          description: "Please log in to retrieve your storefront.",
          variant: "destructive",
        });
        return;
      }

      const res = await apiClient.get("/vendor/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const slugFromSettings = res?.data?.data?.store_settings?.storefront_link;
      const finalSlug = slugFromSettings || seller.slug;

      if (!finalSlug) {
        toast({
          title: "Authentication Required",
          description: "Storefront not found.",
          variant: "destructive",
        });
      }

      router.push(`/vendor-public-view/${finalSlug}`);
    } catch (err) {
      // Fallback to provided seller.slug if API call fails
      if (seller.slug) {
        router.push(`/vendor-public-view/${seller.slug}`);
        return;
      }
      alert("Unable to retrieve store information. Please try again.");
    }
  };

  return (
    <div className="relative p-4 border rounded-lg bg-surface border-border md:p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold font-heading text-text-primary">
          Seller Information
        </h3>
        {seller.verifiedSeller && (
          <div className="flex items-center px-2 py-1 space-x-1 rounded-full bg-orange-50 text-[#E0921C]">
            <Icon name="CheckCircle" size={14} />
            <span className="text-xs font-medium">Verified</span>
          </div>
        )}
      </div>

      {/* Seller Info */}
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
            {hasAvatar ? (
              <Image
                src={seller.banner_url}
                alt={seller.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-full h-full bg-[#E0921C] flex items-center justify-center text-white text-2xl font-bold">
                {sellerInitial}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold truncate text-text-primary text-base mb-1">
            {seller.name}
          </h4>
          <div className="flex items-center mb-2 space-x-2">
            <div className="flex items-center space-x-1">
              <Icon
                name="Star"
                size={14}
                className="text-orange-500 fill-current"
              />
              <span className="text-sm font-medium text-text-primary">
                {seller.rating || "5.0"}
              </span>
            </div>
            {/* <span className="text-xs text-text-secondary">
              ({seller.reviewCount || 0} reviews)
            </span> */}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={12} className="text-gray-400" />
              <span className="text-xs text-text-secondary">
                {seller.responseTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action */}
      <Button
        type="button"
        variant="navy"
        onClick={() => setShowContactModal(true)}
        className="flex items-center justify-center w-full py-3 mt-5 space-x-2 text-sm font-bold rounded-xl shadow-lg shadow-blue-900/10"
      >
        <Icon name="MessageCircle" size={18} />
        <span>Contact Seller</span>
      </Button>

      {/* Secondary Action */}
      <div className="flex items-center justify-center pt-4 mt-4 border-t border-gray-50">
        <button
          onClick={navigateToSeller}
          className="flex items-center gap-2 text-[#E0921C] font-semibold hover:opacity-80 transition-opacity"
        >
          <Icon name="User" size={16} />
          <span className="text-sm">View Seller Profile</span>
        </button>
      </div>

      {/* --- CONTACT MODAL --- */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden bg-white rounded-3xl shadow-2xl scale-in-center">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h3 className="text-lg font-bold text-slate-900">
                Contact {seller.name}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center w-full gap-3 p-4 text-white transition-transform active:scale-95 bg-[#25D366] rounded-2xl font-bold shadow-md hover:bg-[#20ba5a]"
              >
                <MessageSquare size={20} />
                Message on WhatsApp
              </button>

              <button
                onClick={handleCall}
                className="flex items-center justify-center w-full gap-3 p-4 text-white transition-transform active:scale-95 bg-[#212830] rounded-2xl font-bold shadow-md hover:opacity-90"
              >
                <Phone size={20} />
                Call Seller
              </button>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-5 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors border-t border-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerCard;
