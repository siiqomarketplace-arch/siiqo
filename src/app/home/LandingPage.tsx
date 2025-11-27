"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingBag, AlertCircle } from "lucide-react";
import { storefrontService } from "@/services/storefrontService";
import { Storefront, APIResponse } from "@/types/storeFront";
import {
  StorefrontCard,
  StorefrontSkeleton,
} from "@/app/home/ui/StoreFrontCard";

const LandingPage: React.FC = () => {
  const [distance, setDistance] = useState<string>("2 km");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchStorefronts = async () => {
      setLoading(true);
      setError(null);

      try {
        const data: APIResponse = await storefrontService.getStorefronts();
        console.log("Storefronts response:", data);
        if (data && data.storefronts) {
          setStorefronts(data.storefronts);
        } else {
          setStorefronts([]);
          setError("Failed to load storefronts due to unexpected response.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load storefronts");
        console.error("Error fetching storefronts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefronts();
  }, []);

  const filteredStorefronts = storefronts.filter(store => {
    if (
      searchTerm &&
      !store.business_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !store.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    if (verifiedOnly && !store.vendor) return false;

    return true;
  });

  return (
    <section className="min-h-screen py-12 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Explore Nearby Storefronts
          </h2>
          <p className="text-gray-600">
            Find the best local services and products from verified sellers.
            {!loading && ` (${filteredStorefronts.length} storefronts found)`}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-sm">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search storefronts..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <label className="font-medium text-gray-700">Distance</label>
              <select
                value={distance}
                onChange={e => setDistance(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="1 km">1 km</option>
                <option value="2 km">2 km</option>
                <option value="5 km">5 km</option>
                <option value="10 km">10 km</option>
              </select>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={e => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Verified Only</span>
            </label>

            <button
              onClick={() => {
                setSearchTerm("");
                setVerifiedOnly(false);
                setDistance("2 km");
              }}
              className="text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StorefrontSkeleton count={6} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 mb-8 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-medium text-red-800">
                Failed to load storefronts
              </h3>
            </div>
            <p className="mt-2 text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 mt-4 text-white transition-colors bg-red-500 rounded hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredStorefronts.length === 0 && (
          <div className="py-16 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2 text-xl font-medium text-gray-900">
              No storefronts found
            </h3>
            <p className="text-gray-600">
              {searchTerm || verifiedOnly
                ? "Try adjusting your search or filters."
                : "Be the first to create a storefront in your area!"}
            </p>
          </div>
        )}

        {/* Storefront Grid */}
        {!loading && !error && filteredStorefronts.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {filteredStorefronts.map(store => (
              <StorefrontCard key={store.id} storefront={store} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LandingPage;
