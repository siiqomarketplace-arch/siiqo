"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  MapPin,
  Calendar,
  ArrowRight,
  BadgeCheck,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import Skeleton from "@/components/skeleton";
import { Storefront } from "@/types/storeFront";
import { storefrontService } from "@/services/storefrontService";
import {
  fetchGlobalSearch,
  getStorefrontDetails,
  fetchActiveStorefronts,
} from "@/services/api";
import { useLocation } from "@/context/LocationContext";
import { toast } from "sonner";
import { getServerErrorMessage } from "@/lib/errorHandler";

/**
 * STOREFRONT LIST COMPONENT
 * Handles the Refresh and View All UI
 */
/**
 * STOREFRONT LIST COMPONENT
 * Handles the Live API Fetching
 */
export const StorefrontList = ({
  onRefresh,
}: {
  onRefresh?: () => Promise<void>;
}) => {
  const router = useRouter();
  const { coords } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [stores, setStores] = useState<Storefront[]>([]);
  const [error, setError] = useState(false);

  const fetchStores = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const nearUrl = new URL(
        "/api/marketplace/search",
        typeof window !== "undefined" ? window.location.origin : "",
      );
      if (coords?.lat && coords?.lng) {
        nearUrl.searchParams.set("lat", String(coords.lat));
        nearUrl.searchParams.set("lng", String(coords.lng));
      }
      const allUrl = new URL(
        "/api/marketplace/search",
        typeof window !== "undefined" ? window.location.origin : "",
      );

      const [nearRes, allRes] = await Promise.all([
        fetch(nearUrl.toString()),
        fetch(allUrl.toString()),
      ]);

      const nearJson = await nearRes.json();
      const allJson = await allRes.json();

      const nearStores = nearJson?.data?.nearby_stores || [];
      const allStores =
        allJson?.data?.storefronts || allJson?.data?.nearby_stores || [];

      const dedupById = (arr: any[]) => {
        const seen = new Set();
        const out: any[] = [];
        for (const it of arr) {
          const key = it?.id ?? it?.slug ?? it?.business_name;
          if (!key) continue; // skip completely unidentified entries
          if (!seen.has(key)) {
            seen.add(key);
            out.push(it);
          }
        }
        return out;
      };

      const merged = dedupById([...nearStores, ...allStores]);
      merged.sort((a, b) => {
        const da = typeof a.distance_km === "number" ? a.distance_km : Infinity;
        const db = typeof b.distance_km === "number" ? b.distance_km : Infinity;
        return da - db;
      });

      setStores(merged);
    } catch (err) {
      console.error("Failed to fetch live storefronts", err);
      const errorMessage = getServerErrorMessage(err, "Fetch Storefronts");
      if (errorMessage.isServerError) {
        toast.error(errorMessage.title, { description: errorMessage.message });
      }
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [coords]);

  const handleRefresh = async () => {
    await fetchStores();
    if (onRefresh) await onRefresh();
  };

  if (error) {
    // ... (Error UI remains the same)
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <StorefrontSkeleton count={3} />
        ) : stores.length === 0 ? (
          // Better empty state for buyers
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <MapPin className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-bold">No Stores Found</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              There are currently no active storefronts in your area. Check back
              later!
            </p>
          </div>
        ) : (
          stores.map((store) => (
            <StorefrontCard key={store.id} stores={store} />
          ))
        )}
      </div>
    </div>
  );
};

/**
 * INDIVIDUAL STOREFRONT CARD
 */
export const StorefrontCard = ({ stores }: { stores: Storefront }) => {
  const router = useRouter();

  const formatEstablishedDate = (dateString: string | undefined): string => {
    if (!dateString) return "New";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      return `Since ${year}`;
    } catch {
      return "";
    }
  };

  const getFallbackImage = (businessName: string): string => {
    const colors = ["2563EB", "059669", "7C3AED", "EA580C", "DC2626", "0D9488"];
    const colorIndex = businessName.length % colors.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      businessName,
    )}&background=${
      colors[colorIndex]
    }&color=fff&size=400&font-size=0.33&bold=true`;
  };

  const handleClick = () => {
    if (stores.business_name) {
      const slugify = (text: string) =>
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

      const businessSlug = slugify(stores.slug || stores.business_name);
      router.push(`/${encodeURIComponent(businessSlug)}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gray-50">
        <img
          src={stores.banner || getFallbackImage(stores.business_name)}
          alt={stores.business_name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getFallbackImage(
              stores.business_name,
            );
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />

        {/* <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {stores.ratings > 0 ? (
            <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-900 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span>{stores.ratings.toFixed(1)}</span>
            </div>
          ) : (
            <div />
          )}

          {stores.vendor && (
            <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50/90 backdrop-blur-md rounded-full shadow-sm">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
          )}
        </div> */}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-5">
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-[#E0921C] transition-colors">
              {stores.business_name}
            </h3>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
            {stores.description || "Welcome to our store!"}
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {formatEstablishedDate(stores.vendor_info?.member_since)}
            </div>
            {stores.address && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="max-w-[100px] truncate">{stores.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Vendor Info */}
        <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-gradient-to-br from-[#0E2848] to-[#0E2848]/60 rounded-full shadow-sm">
                {/* {stores.vendor?.firstname?.charAt(0) || "V"} */}
                <img
                  src={stores.logo || getFallbackImage(stores.business_name)}
                  alt={stores.business_name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getFallbackImage(
                      stores.business_name,
                    );
                  }}
                />
              </div>
              {/* <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div> */}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-900">
                {stores.business_name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 group-hover:text-[#E0921C] transition-colors">
            View Storefront <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * UPDATED SKELETON
 */
export const StorefrontSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden"
        >
          <div className="h-48 w-full bg-gray-100 relative">
            <Skeleton type="rect" height="100%" width="100%" />
          </div>

          <div className="p-5 flex flex-col flex-grow">
            <Skeleton width="60%" height={24} className="mb-3" />
            <Skeleton width="100%" height={16} count={2} className="mb-4" />

            <div className="flex gap-2 mb-6">
              <Skeleton width={80} height={24} className="rounded-md" />
              <Skeleton width={80} height={24} className="rounded-md" />
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton type="circle" width={32} height={32} />
                <div className="flex flex-col">
                  <Skeleton width={80} height={12} />
                  <Skeleton width={50} height={10} />
                </div>
              </div>
              <Skeleton type="circle" width={32} height={32} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default StorefrontCard;
