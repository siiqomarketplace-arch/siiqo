"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/AppIcon";
import Button from "@/components/Button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ComparisonItem {
  id: string;
  seller: string;
  price: number;
  condition: string;
  distance: number;
  rating: number;
}

interface PriceComparisonProps {
  comparisons: ComparisonItem[];
  currentPrice: number;
  isMobile?: boolean;
}

const PriceComparison = ({
  comparisons,
  currentPrice,
  isMobile = false,
}: PriceComparisonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortedComparisons = [...comparisons].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedComparisons[0]?.price;
  const savings = currentPrice - lowestPrice;

  return (
    <div className="p-4 border rounded-lg bg-surface border-border md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold font-heading text-text-primary">
            Price Comparison
          </h3>
          {savings > 0 && (
            <p className="text-sm text-primary">Save up to ${savings} nearby</p>
          )}
        </div>
        {/* Toggle button */}
        <button onClick={() => setIsExpanded(prev => !prev)}>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>

      {/* Current Product */}
      <div className="p-4 mb-3 border rounded-lg bg-primary-50 border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-text-primary">Current Product</p>
            <p className="text-sm text-text-secondary">This listing</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">${currentPrice}</p>
            <div className="flex items-center space-x-1 text-sm text-text-secondary">
              <Icon name="MapPin" size={12} />
              <span>0.8 mi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Items */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[1500px]" : "max-h-0"
        }`}
      >
        <div className="space-y-3">
          {sortedComparisons.map((comparison, index) => (
            <div
              key={comparison.id}
              className="flex items-center justify-between p-3 transition-colors duration-200 border rounded-lg border-border hover:bg-surface-secondary"
            >
              <div className="flex-1">
                <div className="flex items-center mb-1 space-x-2">
                  <p className="font-medium text-text-primary">
                    {comparison.seller}
                  </p>
                  {index === 0 && (
                    <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                      Lowest
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-text-secondary">
                  {/* <div className="flex items-center space-x-1">
                    <Icon name="Package" size={12} />
                    <span>{comparison.condition}</span>
                  </div> */}
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={12} />
                    <span>{comparison.distance} mi</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon
                      name="Star"
                      size={12}
                      className="text-orange-500 fill-current"
                    />
                    <span>{comparison.rating}</span>
                  </div>
                </div>
              </div>

              <div className="ml-4 text-right">
                <p className="text-lg font-bold text-primary">
                  ${comparison.price}
                </p>
                {comparison.price !== currentPrice && (
                  <p
                    className={`text-sm ${
                      comparison.price < currentPrice
                        ? "text-primary"
                        : "text-accent"
                    }`}
                  >
                    {comparison.price < currentPrice ? "-" : "+"}$
                    {Math.abs(comparison.price - currentPrice)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expand/Collapse Button for Mobile */}
      {isMobile && comparisons.length > 2 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 mt-3 transition-colors duration-200 text-primary hover:text-primary-700"
        >
          <span className="text-sm font-medium">
            {isExpanded ? "Show Less" : `Show ${comparisons.length - 2} More`}
          </span>
        </button>
      )}

      {/* View All Button */}
      {/* <Button
        type="button"
        variant="outline"
        className="w-full py-3 mt-4 transition-all duration-200 border rounded-lg border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
      >
        <span className="text-sm font-medium">View All Price Comparisons</span>
      </Button> */}
    </div>
  );
};

export default PriceComparison;
