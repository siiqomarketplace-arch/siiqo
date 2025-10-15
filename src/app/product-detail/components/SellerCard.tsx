"use client";

import React from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import Button from "@/components/Button";

interface Seller {
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  memberSince: string;
  verifiedSeller: boolean;
}

interface SellerCardProps {
  seller: Seller;
  onContact: () => void;
  onNavigateToVendorProfile: () => void;
  isMobile?: boolean;
}

const SellerCard = ({
  seller,
  onContact,
  onNavigateToVendorProfile,
  isMobile = false,
}: SellerCardProps) => {
  return (
    <div className="p-4 border rounded-lg bg-surface border-border md:p-4">
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
          <div className="relative w-16 h-16 overflow-hidden rounded-full bg-surface-secondary">
            <Image
              src={seller.avatar}
              alt={seller.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-2 space-x-2">
            <h4 className="font-semibold truncate text-text-primary">
              {seller.name}
            </h4>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-2 space-x-2">
            <div className="flex items-center space-x-1">
              <Icon
                name="Star"
                size={14}
                className="text-orange-500 fill-current"
              />
              <span className="text-sm font-medium text-text-primary">
                {seller.rating}
              </span>
            </div>
            <span className="text-sm text-text-secondary">
              ({seller.reviewCount} reviews)
            </span>
          </div>

          {/* Member Since */}
          <div className="flex items-center mb-2 space-x-2">
            <Icon name="Calendar" size={14} className="text-text-secondary" />
            <span className="text-sm text-text-secondary">
              Member since {seller.memberSince}
            </span>
          </div>

          {/* Response Time */}
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={14} className="text-text-secondary" />
            <span className="text-sm text-text-secondary">
              {seller.responseTime}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Button */}
      <Button
        type="button"
        variant="navy"
        onClick={onContact}
        className="flex items-center justify-center w-full py-3 mt-4 space-x-2 text-sm transition-colors duration-200"
      >
        <Icon name="MessageCircle" size={18} />
        <span>Contact Seller</span>
      </Button>

      {/* Actions */}
      <div className="flex items-center justify-center pt-4 mt-4 space-x-6 border-t border-border-light">
        <button
          onClick={onNavigateToVendorProfile}
          className="flex items-center gap-1 transition-colors duration-200 hover:underline text-text-secondary"
        >
          <Icon name="User" size={16} />
          <span className="text-sm">View Profile</span>
        </button>

        {/* <button className="flex items-center gap-1 transition-colors duration-200 text-text-secondary hover:text-text-primary">
          <Icon name="Package" size={16} />
          <span className="text-sm">Other Items</span>
        </button>

        <Button
          type="button"
          variant="navy"
          className="flex items-center gap-1 text-sm transition-colors duration-200"
        >
          <Icon name="Flag" size={16} />
          <span className="text-sm">Report</span>
        </Button> */}
      </div>
    </div>
  );
};

export default SellerCard;
