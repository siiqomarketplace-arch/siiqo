"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingBag, AlertCircle, MapPin, X, RefreshCw, ChevronRight } from "lucide-react";
import { storefrontService } from "@/services/storefrontService";
import { Storefront, APIResponse } from "@/types/storeFront";
import { motion, AnimatePresence, Variants } from "framer-motion"; // Import Framer Motion
import {
  DUMMY_STOREFRONTS,
  StorefrontCard,
  StorefrontSkeleton,
} from "@/app/home/ui/StoreFrontCard";
import { useRouter } from "next/navigation";
// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 50, damping: 15 },
  },
};

const LandingPage: React.FC = ({ onRefresh }: { onRefresh?: () => Promise<void> }) => {
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
        // if (data && Array.isArray(data.storefronts)) {
        //   setStorefronts(data.storefronts);
        // } else {
        //   setStorefronts([]);
        //   setError("Failed to load storefronts due to unexpected response.");
        // }
         // --- Directly use Dummy Data to stop the 500 error ---
    setStorefronts(DUMMY_STOREFRONTS); 
      } catch (err: any) {
        setError(err.message || "Failed to load storefronts");
        console.error("Error fetching storefronts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefronts();
  }, []);

  const filteredStorefronts = storefronts.filter((store) => {
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

  const handleClearFilters = () => {
    setSearchTerm("");
    setVerifiedOnly(false);
    setDistance("2 km");
  };
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stores, setStores] = useState<Storefront[]>([]);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStores(DUMMY_STOREFRONTS);
    } catch (err) {
      console.error("Failed to fetch storefronts", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchStores();
    if (onRefresh) await onRefresh();
    setIsLoading(false);
  };

  const handleViewAll = () => {
    router.push("/marketplace");
  };

  return (
    <section className="min-h-screen bg-gray-50 font-sans">
      {/* Header Section */}
      <div className="bg-[#001d3b] pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-7xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Explore Nearby Storefronts
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover the best local services and products from verified sellers in your community.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        {/* Floating Search & Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Search Input */}
            <div className="w-full md:flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#E0921C] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search for stores, services, or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E0921C] focus:border-transparent transition-all duration-200 sm:text-sm"
              />
            </div>

            {/* Filters Container */}
            <div className="w-full md:w-auto flex flex-wrap items-center gap-4">
              
              {/* Distance Select */}
              <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 px-3 py-3 w-full md:w-auto group focus-within:ring-2 focus-within:ring-[#E0921C] focus-within:border-transparent transition-all">
                <MapPin className="w-4 h-4 text-gray-500 mr-2 group-focus-within:text-[#E0921C]" />
                <span className="text-sm text-gray-500 mr-2">Within:</span>
                <select
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#212830] focus:outline-none cursor-pointer pr-1"
                >
                  <option value="1 km">1 km</option>
                  <option value="2 km">2 km</option>
                  <option value="5 km">5 km</option>
                  <option value="10 km">10 km</option>
                </select>
              </div>

              {/* Verified Toggle Switch */}
              <label className="flex items-center cursor-pointer select-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full md:w-auto hover:bg-gray-100 transition-colors">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                  />
                  <motion.div 
                    className={`block w-10 h-6 rounded-full transition-colors duration-300 ${verifiedOnly ? 'bg-[#E0921C]' : 'bg-gray-300'}`}
                  />
                  <motion.div 
                    animate={{ x: verifiedOnly ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"
                  />
                </div>
                <span className="ml-3 text-sm font-medium text-[#212830]">Verified Only</span>
              </label>

              {/* Clear Filters Button */}
              <AnimatePresence>
                {(searchTerm || verifiedOnly || distance !== "2 km") && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleClearFilters}
                    className="flex items-center justify-center p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all w-full md:w-auto"
                    title="Clear Filters"
                  >
                    <X className="w-5 h-5" />
                    <span className="md:hidden ml-2 text-sm font-medium">Clear Filters</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {!loading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {filteredStorefronts.length} {filteredStorefronts.length === 1 ? 'Result' : 'Results'} Found
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StorefrontSkeleton count={8} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-8 bg-white border border-red-100 rounded-2xl shadow-sm text-center"
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-[#212830] mb-2">Unable to load storefronts</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#212830] text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* No Results */}
        {!loading && !error && filteredStorefronts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-[#212830] mb-2">
              No storefronts matches found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              {searchTerm || verifiedOnly
                ? "We couldn't find any stores matching your current filters. Try adjusting your search keywords or distance."
                : "Be the first to create a storefront in your area!"}
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-[#E0921C] text-white font-medium rounded-lg hover:bg-[#c78219] transition-colors shadow-lg shadow-orange-500/20"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
{/* Header with Refresh and View All */}
      <div className="flex items-center justify-between pt-20 mb-6 px-1">
        <div className="flex items-center gap-4">
           <h2 className="text-xl font-bold text-gray-900">Featured Stores</h2>
           <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        <button 
          onClick={handleViewAll}
          className="flex items-center gap-1 text-sm font-semibold text-[#E0921C] hover:underline"
        >
          View All <ChevronRight size={16} />
        </button>
      </div>
        {/* Storefront Grid with Staggered Animation */}
        {!loading && !error && filteredStorefronts.length > 0 && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredStorefronts.map((store) => (
              <motion.div key={store.id} variants={itemVariants}>
                <StorefrontCard storefront={store} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LandingPage;