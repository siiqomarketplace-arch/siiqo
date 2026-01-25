"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  AlertCircle,
  MapPin,
  X,
  RefreshCw,
  ChevronRight,
  Store,
  ChevronLeft,
} from "lucide-react";
import { Storefront } from "@/types/storeFront";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  StorefrontCard,
  StorefrontSkeleton,
} from "@/app/home/ui/StoreFrontCard";
import { useRouter } from "next/navigation";
import { useLocation } from "@/context/LocationContext";
import { useLocationDetection } from "@/hooks/useLocationDetection";

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

const ITEMS_PER_PAGE = 8;

const LandingPage: React.FC<{ onRefresh?: () => Promise<void> }> = ({
  onRefresh,
}) => {
  const [distance, setDistance] = useState<string>("2 km");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showLocationPermissionPrompt, setShowLocationPermissionPrompt] =
    useState(false);

  const router = useRouter();
  const { coords } = useLocation();
  const { refresh: getCurrentLocation, loading: isDetectingLocation } =
    useLocationDetection();

  // Show location permission prompt on mount
  useEffect(() => {
    const hasSeenLocationPrompt = localStorage.getItem(
      "siiqo_location_prompt_shown"
    );
    const userCoordinates = localStorage.getItem("user_coordinates");

    // Show prompt if user hasn't granted location and hasn't seen the prompt
    if (!hasSeenLocationPrompt && !userCoordinates) {
      // Small delay to allow page to load first
      const timer = setTimeout(() => {
        setShowLocationPermissionPrompt(true);
        localStorage.setItem("siiqo_location_prompt_shown", "true");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const loadData = async (query: string = "") => {
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    try {
      const nearUrl = new URL(
        "/api/marketplace/search",
        typeof window !== "undefined" ? window.location.origin : ""
      );
      if (query.trim()) nearUrl.searchParams.set("q", query.trim());
      if (coords?.lat && coords?.lng) {
        nearUrl.searchParams.set("lat", String(coords.lat));
        nearUrl.searchParams.set("lng", String(coords.lng));
      }

      const allUrl = new URL(
        "/api/marketplace/search",
        typeof window !== "undefined" ? window.location.origin : ""
      );
      if (query.trim()) allUrl.searchParams.set("q", query.trim());

      const [nearRes, allRes] = await Promise.all([
        fetch(nearUrl.toString()),
        fetch(allUrl.toString()),
      ]);

      if (!nearRes.ok || !allRes.ok)
        throw new Error("This is not your problem, it's ours... Try again later.");

      const nearJson = await nearRes.json();
      const allJson = await allRes.json();

      // The API structure you provided shows stores are in data.nearby_stores
      const nearStores = nearJson?.data?.nearby_stores || [];
      const allStores =
        allJson?.data?.storefronts || allJson?.data?.nearby_stores || [];

      const dedupBySlugOrName = (arr: any[]) => {
        const seen = new Set();
        const out: any[] = [];
        for (const it of arr) {
          // FIX: Use slug or business_name as a fallback ID
          const key = it?.id || it?.slug || it?.business_name;

          if (!key) continue;

          if (!seen.has(key)) {
            seen.add(key);
            out.push(it);
          }
        }
        return out;
      };

      const merged = dedupBySlugOrName([...nearStores, ...allStores]);

      merged.sort((a, b) => {
        const da = typeof a.distance_km === "number" ? a.distance_km : Infinity;
        const db = typeof b.distance_km === "number" ? b.distance_km : Infinity;
        return da - db;
      });

      setStorefronts(merged);
    } catch (err: any) {
      setError(err.message);
      setStorefronts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(searchTerm);
    // re-fetch when coords change to update proximity results
  }, [coords]);

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

  const totalPages = Math.ceil(filteredStorefronts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStorefronts = filteredStorefronts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setVerifiedOnly(false);
    setDistance("2 km");
    setCurrentPage(1);
    loadData(""); // Load all results when filters are cleared
  };

  const handleRefresh = async () => {
    await loadData();
    if (onRefresh) await onRefresh();
  };

  const handleViewAll = () => {
    router.push("/marketplace");
  };

  const handleSignUp = () => {
    router.push("/auth/signup");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEnableLocation = async () => {
    try {
      await getCurrentLocation();
      setShowLocationPermissionPrompt(false);
    } catch (err) {
      console.error("Error enabling location:", err);
    }
  };

  const handleSkipLocation = () => {
    setShowLocationPermissionPrompt(false);
  };

  return (
    <section className="min-h-screen bg-gray-50 font-sans">
      {/* Location Permission Prompt Modal */}
      <AnimatePresence>
        {showLocationPermissionPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-full">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Enable Location
                    </h3>
                  </div>
                  <button
                    onClick={handleSkipLocation}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-6">
                  Allow us to access your location to show products and stores
                  sorted by proximity. You can always change this later in
                  settings.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">✓</span>
                      <span>See closest products first</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">✓</span>
                      <span>Faster checkouts with saved location</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">✓</span>
                      <span>Better local recommendations</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSkipLocation}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={handleEnableLocation}
                    disabled={isDetectingLocation}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isDetectingLocation && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {isDetectingLocation ? "Detecting..." : "Enable Location"}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Your location data is kept private and secure.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            Discover the best local services and products from verified sellers
            in your community.
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
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  setCurrentPage(1);
                  // Trigger search when user types
                  if (value.trim()) {
                    loadData(value);
                  } else {
                    loadData(""); // Load all results when search is cleared
                  }
                }}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E0921C] focus:border-transparent transition-all duration-200 sm:text-sm"
              />
            </div>

            {/* Filters Container */}
            <div className="w-full md:w-auto flex flex-wrap items-center gap-4">
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

              <label className="flex items-center cursor-pointer select-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full md:w-auto hover:bg-gray-100 transition-colors">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={verifiedOnly}
                    onChange={(e) => {
                      setVerifiedOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                  />
                  <motion.div
                    className={`block w-10 h-6 rounded-full transition-colors duration-300 ${
                      verifiedOnly ? "bg-[#E0921C]" : "bg-gray-300"
                    }`}
                  />
                  <motion.div
                    animate={{ x: verifiedOnly ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"
                  />
                </div>
                <span className="ml-3 text-sm font-medium text-[#212830]">
                  Verified Only
                </span>
              </label>

              <AnimatePresence>
                {(searchTerm || verifiedOnly || distance !== "2 km") && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleClearFilters}
                    className="flex items-center justify-center p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all w-full md:w-auto"
                  >
                    <X className="w-5 h-5" />
                    <span className="md:hidden ml-2 text-sm font-medium">
                      Clear Filters
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {!isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {filteredStorefronts.length}{" "}
                {filteredStorefronts.length === 1 ? "Result" : "Results"} Found
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {isLoading && (
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
            <h3 className="text-lg font-bold text-[#212830] mb-2">
              Unable to load storefronts
            </h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#212830] text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Content Header */}
        <div className="flex items-center justify-between pt-10 mb-6 px-1">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Featured Stores</h2>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={isLoading ? "animate-spin" : ""}
              />
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

        {/* RESULTS AREA */}
        {!isLoading && !error && (
          <>
            {filteredStorefronts.length > 0 ? (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {paginatedStorefronts.map((store, idx) => (
                    <motion.div
                      key={
                        store?.id ?? store?.slug ?? store?.business_name ?? idx
                      }
                      variants={itemVariants}
                    >
                      <StorefrontCard stores={store} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 mt-12"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              currentPage === page
                                ? "bg-[#E0921C] text-white"
                                : "border border-gray-200 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              /* EMPTY STATE */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center px-6"
              >
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                  <Store className="w-10 h-10 text-[#E0921C]" />
                </div>
                <h3 className="text-xl font-bold text-[#212830] mb-2">
                  No storefronts available at the moment
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  {searchTerm || verifiedOnly
                    ? "We couldn't find any stores matching your current filters. Try clearing them to see all stores."
                    : "Be the first to showcase your business to the community! Create your storefront today."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleSignUp}
                    className="px-8 py-3 bg-[#E0921C] text-white font-bold rounded-xl hover:bg-[#c78219] transition-all shadow-lg shadow-orange-500/20"
                  >
                    Sign Up Now
                  </button>
                  {(searchTerm || verifiedOnly) && (
                    <button
                      onClick={handleClearFilters}
                      className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default LandingPage;
