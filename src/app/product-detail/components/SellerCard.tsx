"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import Button from "@/components/Button";
import { X, Phone, MessageSquare } from "lucide-react"; // Standard icons for the modal

interface Seller {
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  memberSince: string;
  verifiedSeller: boolean;
  phoneNumber?: string; // Added for the call/whatsapp logic
}

const DUMMY_SELLER: Seller = {
  name: "John Doe",
  avatar: "",
  rating: 4.9,
  reviewCount: 128,
  responseTime: "Usually responds within 1 hour",
  memberSince: "January 2022",
  verifiedSeller: true,
  phoneNumber: "+2348012345678", // Example format
};

interface SellerCardProps {
  seller: Seller;
  onContact?: () => void;
  onNavigateToVendorProfile: () => void;
  isMobile?: boolean;
}

const SellerCard = ({
  seller: propSeller,
  onNavigateToVendorProfile,
  isMobile = false,
}: SellerCardProps) => {
  const [showContactModal, setShowContactModal] = useState(false);

  const seller = DUMMY_SELLER;
  const sellerInitial = seller.name ? seller.name.charAt(0).toUpperCase() : "?";
  const hasAvatar = seller.avatar && seller.avatar.trim() !== "" && !seller.avatar.includes("placeholder");

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hello ${seller.name}, I'm interested in your product on siiqo.`);
    window.open(`https://wa.me/${seller.phoneNumber?.replace(/\D/g, '')}?text=${message}`, '_blank');
    setShowContactModal(false);
  };

  const handleCall = () => {
    window.location.href = `tel:${seller.phoneNumber}`;
    setShowContactModal(false);
  };

  return (
    <div className="relative p-4 border rounded-lg bg-surface border-border md:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold font-heading text-text-primary">
          Seller Information
        </h3>
        {seller.verifiedSeller && (
          <div className="flex items-center px-2 py-1 space-x-1 rounded-full bg-secondary-50 text-secondary">
            <Icon name="CheckCircle" size={14} className="text-primary" />
            <span className="text-xs font-medium text-primary">Verified</span>
          </div>
        )}
      </div>

      {/* Seller Info */}
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16 overflow-hidden rounded-full bg-surface-secondary flex items-center justify-center">
            {hasAvatar ? (
              <Image
                src={seller.avatar}
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
          <h4 className="font-semibold truncate text-text-primary mb-1">
            {seller.name}
          </h4>
          <div className="flex items-center mb-2 space-x-2">
            <div className="flex items-center space-x-1">
              <Icon name="Star" size={14} className="text-orange-500 fill-current" />
              <span className="text-sm font-medium text-text-primary">{seller.rating}</span>
            </div>
            <span className="text-sm text-text-secondary">({seller.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center mb-1 space-x-2">
            <Icon name="Calendar" size={14} className="text-text-secondary" />
            <span className="text-sm text-text-secondary text-xs">Member since {seller.memberSince}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={14} className="text-text-secondary" />
            <span className="text-sm text-text-secondary text-xs">{seller.responseTime}</span>
          </div>
        </div>
      </div>

      {/* Trigger Contact Modal */}
      <Button
        type="button"
        variant="navy"
        onClick={() => setShowContactModal(true)}
        className="flex items-center justify-center w-full py-3 mt-4 space-x-2 text-sm"
      >
        <Icon name="MessageCircle" size={18} />
        <span>Contact Seller</span>
      </Button>

      <div className="flex items-center justify-center pt-4 mt-4 space-x-6 border-t border-border-light">
        <button onClick={onNavigateToVendorProfile} className="flex items-center gap-1 hover:underline text-text-secondary">
          <Icon name="User" size={16} />
          <span className="text-sm">View Profile</span>
        </button>
      </div>

      {/* --- CONTACT MODAL OVERLAY --- */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-slate-900">Contact {seller.name}</h3>
              <button onClick={() => setShowContactModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-center text-slate-600 mb-2">How would you like to reach out?</p>
              
              <button 
                onClick={handleWhatsApp}
                className="flex items-center justify-center w-full gap-3 p-4 text-white transition-transform active:scale-95 bg-[#25D366] rounded-xl font-semibold shadow-md hover:bg-[#20ba5a]"
              >
                <MessageSquare size={20} />
                Message on WhatsApp
              </button>

              <button 
                onClick={handleCall}
                className="flex items-center justify-center w-full gap-3 p-4 text-white transition-transform active:scale-95 bg-[#001F3F] rounded-xl font-semibold shadow-md hover:opacity-90"
              >
                <Phone size={20} />
                Call Seller
              </button>
            </div>
            
            <button 
              onClick={() => setShowContactModal(false)}
              className="w-full py-4 text-sm font-medium border-t text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerCard;