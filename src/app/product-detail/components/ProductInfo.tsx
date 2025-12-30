"use client";

import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { useToast } from "@/hooks/use-toast"; // Assuming you have a toast hook for feedback

interface Product {
    title: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviewCount: number;
    distance: number; 
    availability: string;
    views: number;
    watchers: number;
    condition: string;
    lastUpdated: Date;
    description: string;
    specifications: { [key: string]: string };
}

interface ProductInfoProps {
    product: Product;
    isWishlisted: boolean;
    onWishlistToggle: () => void;
    // onShare is now handled internally or passed as a callback
    showFullDescription: boolean;
    onToggleDescription: () => void;
    isMobile?: boolean;
}

const ProductInfo = ({
    product,
    isWishlisted,
    onWishlistToggle,
    showFullDescription,
    onToggleDescription,
    isMobile = false
}: ProductInfoProps) => {
    const { toast } = useToast();

    const formatTimeAgo = (date: Date): string => {
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    // --- CUSTOM SHARE LOGIC ---
    const handleShare = async () => {
        // 1. Format the name and distance (location)
        // Replaces spaces with hyphens and makes lowercase for a clean URL feel
        const formattedName = product.title.toLowerCase().trim().replace(/\s+/g, '-');
        const locationTag = `${product.distance}-miles-away`;
        
        // 2. Construct the specific string: name+location
        const shareUrl = `${formattedName}+${locationTag}`;
        
        // 3. Copy to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast({
                title: "Link Copied!",
                description: "Product details copied to clipboard.",
            });
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    return (
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="mb-2 text-xl font-bold md:text-2xl font-heading text-text-primary">
              {product.title}
            </h1>

            {/* Price Section */}
            <div className="flex items-center mb-3 space-x-3">
              <span className="text-2xl font-bold md:text-3xl text-text-primary">
                ${product.price}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-lg line-through text-text-secondary">
                    ${product.originalPrice}
                  </span>
                  <span className="px-2 py-1 text-sm font-medium text-orange-500 bg-orange-100 rounded">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Rating and Distance */}
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <div className="flex items-center space-x-1">
                <Icon
                  name="Star"
                  size={16}
                  className="text-orange-500 fill-current"
                />
                <span className="font-medium text-text-primary">
                  {product.rating}
                </span>
                <span>({product.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={16} className="text-primary" />
                <span>{product.distance} miles away</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row items-center space-x-2">
            <button
              type="button"
              onClick={onWishlistToggle}
              className={`p-1 rounded-full transition-all duration-200 ${
                isWishlisted
                  ? "bg-white text-slate-900"
                  : "bg-white text-orange-500"
              }`}
            >
              <Icon
                name="Heart"
                size={15}
                className={isWishlisted ? "fill-current" : ""}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-3 transition-all duration-200 rounded-full bg-surface-secondary text-text-secondary hover:bg-surface hover:text-text-primary"
              aria-label="Share product"
            >
              <Icon name="Share" size={20} />
            </button>
          </div>
        </div>

        {/* ... Rest of your existing JSX (Status, Condition, Description, Specs) ... */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium text-primary">
              {product.availability}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <Icon name="Eye" size={16} />
            <span>{product.views} views</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <Icon name="Users" size={16} />
            <span>{product.watchers} watching</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-t border-b border-border">
          <div>
            <span className="text-sm text-text-secondary">Condition</span>
            <p className="font-medium text-text-primary">{product.condition}</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-text-secondary">Updated</span>
            <p className="font-medium text-text-primary">
              {formatTimeAgo(product.lastUpdated)}
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold font-heading text-text-primary">
            Description
          </h3>
          <div className="leading-relaxed text-text-secondary">
            <p className={`${!showFullDescription && isMobile ? "line-clamp-3" : ""}`}>
              {product.description}
            </p>
            {isMobile && (
              <button
                onClick={onToggleDescription}
                className="mt-2 font-medium transition-colors duration-200 text-primary hover:text-primary-700"
              >
                {showFullDescription ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold font-heading text-text-primary">
            Specifications
          </h3>
          <div className="space-y-3">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b border-border-light last:border-b-0"
              >
                <span className="text-text-secondary">{key}</span>
                <span className="font-medium text-right text-text-primary">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
};

export default ProductInfo;