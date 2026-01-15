"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import Skeleton from "@/components/skeleton";
import NearbyDealCard, { DealData } from "./ui/NearbyDealsProdCard";
import { useLocation } from "@/context/LocationContext";

interface NearbyDealsProps {
  onRefresh: () => Promise<void>;
}

const ITEMS_PER_PAGE = 4;

const NearbyDeals: React.FC<NearbyDealsProps> = ({ onRefresh }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { coords } = useLocation();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      setError(null);
      const nearUrl = new URL(
        "/api/marketplace/search",
        typeof window !== "undefined" ? window.location.origin : ""
      );
      if (coords?.lat && coords?.lng) {
        nearUrl.searchParams.set("lat", String(coords.lat));
        nearUrl.searchParams.set("lng", String(coords.lng));
      }
      const allUrl = new URL(
        "/api/marketplace/search",
        typeof window !== "undefined" ? window.location.origin : ""
      );

      console.log(
        "[NearbyDeals] Fetching near:",
        nearUrl.toString(),
        "| Coords:",
        coords
      );
      console.log("[NearbyDeals] Fetching all:", allUrl.toString());

      const [nearRes, allRes] = await Promise.all([
        fetch(nearUrl.toString()),
        fetch(allUrl.toString()),
      ]);
      const nearJson = await nearRes.json();
      const allJson = await allRes.json();
      console.log("[NearbyDeals] Near Response:", nearJson);
      console.log("[NearbyDeals] All Response:", allJson);

      const nearProducts = nearJson?.data?.nearby_products || [];
      const allProducts =
        allJson?.data?.products || allJson?.data?.nearby_products || [];

      const dedupById = (arr: any[]) => {
        const seen = new Set();
        const out: any[] = [];
        for (const it of arr) {
          const id = it?.id;
          if (id == null) continue;
          if (!seen.has(id)) {
            seen.add(id);
            out.push(it);
          }
        }
        return out;
      };

      const merged = dedupById([...nearProducts, ...allProducts]);
      merged.sort((a, b) => {
        const da = typeof a.distance_km === "number" ? a.distance_km : Infinity;
        const db = typeof b.distance_km === "number" ? b.distance_km : Infinity;
        return da - db;
      });
      setProducts(merged);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [coords]);

  const generateDealData = (product: any): DealData => {
    const seed =
      typeof product.id === "string"
        ? parseInt(product.id, 10) || 123
        : product.id;
    const random = (min: number, max: number) =>
      Math.floor((Math.sin(seed * 9999) * 10000) % (max - min + 1)) + min;

    return {
      price: product.price,
      discount: random(10, 35),
      distance_km: product.distance_km,
      rating: 4.5,
      condition: "New",
      id: product.id,
      image: product.image,
      name: product.name || "",
      vendor_name: product.vendor_name,
      crypto_price: product.crypto_price,
    };
  };

  const handleDealClick = (id: number) => {
    router.push(`/products/${encodeURIComponent(id)}`);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchProducts();
      await onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (error) {
    return (
      <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
        <p className="mb-4 text-gray-500 text-sm">
          Oops! Could not load nearby deals.
        </p>
        <button
          onClick={handleRefresh}
          className="px-5 py-2 text-sm font-medium text-white rounded-full bg-[#E0921C]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-end mb-4 px-1">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh Deals</span>
        </button>
      </div>

      <div className="pb-8 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <DealCardSkeleton key={index} />
            ))
          ) : paginatedProducts.length === 0 ? (
            <div className="col-span-full w-full flex items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              No deals found in your area.
            </div>
          ) : (
            paginatedProducts.map((product) => (
              <NearbyDealCard
                key={product.id}
                product={product}
                dealData={generateDealData(product)}
                onClick={() => handleDealClick(product.id)}
              />
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
            className="p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm font-medium text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || isLoading}
            className="p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

const DealCardSkeleton = () => (
  <div className="flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-full">
    <div className="h-48 bg-gray-100 relative shrink-0">
      <Skeleton height="100%" />
    </div>

    <div className="p-4 flex flex-col">
      <div className="flex justify-between items-center mb-3 shrink-0">
        <Skeleton width={80} height={12} />
        <Skeleton width={30} height={12} />
      </div>

      <div className="flex-1 min-h-[40px]">
        <Skeleton width="90%" height={18} className="mb-1" />
        <Skeleton width="60%" height={18} />
      </div>

      <div className="flex gap-2 mb-4 mt-2 shrink-0">
        <Skeleton width={40} height={16} />
        <Skeleton width={60} height={16} />
      </div>

      <div className="flex justify-between items-end border-t border-gray-100 pt-3 mt-auto shrink-0">
        <div>
          <Skeleton width={40} height={20} className="mb-1" />
          <Skeleton width={70} height={20} />
        </div>
        <Skeleton type="circle" width={32} height={32} />
      </div>
    </div>
  </div>
);

export default NearbyDeals;
