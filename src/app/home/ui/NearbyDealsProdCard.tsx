"use client";

import React from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import Button from "@/components/Button";

export interface DealData {
  originalPrice: number;
  discount: number;
  distance: string;
  rating: number;
  condition: string;
}

export interface NearbyDealCardProps {
  product: {
    id: number;
    product_name: string;
    product_price: number;
    images: string[];
    vendor?: { business_name?: string } | null;
  };
  dealData: DealData;
  onClick: (id: number) => void;
}

const NearbyDealCard: React.FC<NearbyDealCardProps> = ({
  product,
  dealData,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(product.id)}
      className="flex-shrink-0 transition-all duration-200 border rounded-lg cursor-pointer w-72 bg-surface border-border hover:shadow-elevation-2"
    >
      <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
        <Image
          src={
            product.images?.[0] ||
            "https://via.placeholder.com/400x300?text=No+Image"
          }
          alt={product.product_name}
          fill={true}
          className="object-cover"
          sizes="288px"
        />
        <div className="absolute px-2 py-1 text-xs font-medium text-black rounded-full top-3 left-3 bg-accent">
          {dealData.discount}% OFF
        </div>
        <div className="absolute px-2 py-1 text-xs text-white bg-black bg-opacity-50 rounded-full top-3 right-3">
          {dealData.distance}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="flex-1 text-base font-medium text-text-primary line-clamp-2">
            {product.product_name}
          </h3>
          <button className="p-1 ml-2 transition-colors duration-200 rounded-full hover:bg-surface-secondary">
            <Icon name="Heart" size={16} className="text-text-secondary" />
          </button>
        </div>

        <div className="flex items-center mb-2 space-x-2">
          <span className="text-lg font-semibold text-text-primary">
            ₦{product.product_price.toLocaleString()}
          </span>
          <span className="text-sm line-through text-text-secondary">
            ₦{dealData.originalPrice.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3 text-sm text-text-secondary">
          <span className="px-2 py-1 text-xs rounded-full bg-success-50 text-success">
            {dealData.condition}
          </span>
          <div className="flex items-center space-x-1">
            <Icon name="Star" size={12} className="fill-current text-warning" />
            <span>{dealData.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            {product.vendor?.business_name ?? "siiqo Vendor"}
          </span>
          <Button
            onClick={() => onClick(product.id)}
            type="button"
            className="px-3 py-1 text-sm font-medium text-white transition-colors duration-200 rounded-lg bg-primary hover:bg-primary-700"
          >
            View Deal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NearbyDealCard;
