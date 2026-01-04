"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import Button from "@/components/Button";
import Skeleton from "@/components/skeleton";

interface RecentItem {
  id: number;
  title: string;
  price: number;
  image: string;
  distance: string;
  seller: string;
  viewedAt: string;
  isAvailable: boolean;
  category?: string;
  description?: string;
}


const RecentlyViewed: React.FC = () => {
  const router = useRouter();
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getRecentlyViewedItems = (): RecentItem[] => {
    try {
      if (typeof window === "undefined") return [];
      const stored = localStorage.getItem("recentlyViewed");
      // Only return real items stored by the user's actual behavior
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading recently viewed items:", error);
      return [];
    }
  };
  const formatViewedAt = (isoString: string): string => {
    const now = new Date();
    const viewedDate = new Date(isoString);
    const diffInMilliseconds = now.getTime() - viewedDate.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return viewedDate.toLocaleDateString();
  };

  const clearRecentlyViewed = () => {
    try {
      localStorage.removeItem("recentlyViewed");
      setRecentItems([]);
    } catch (error) {
      console.error("Error clearing items:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const items = getRecentlyViewedItems();
      setRecentItems(items);
      setLoading(false);
    }, 600);
  }, []);

  const handleItemClick = (item: RecentItem) => {
    router.push(`/product-detail?id=${item.id}`);
  };

  const handleRemoveItem = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    try {
      const updatedItems = recentItems.filter((item) => item.id !== itemId);
      localStorage.setItem("recentlyViewed", JSON.stringify(updatedItems));
      setRecentItems(updatedItems);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton width={150} height={24} />
          <Skeleton width={80} height={20} />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="border rounded-lg bg-white overflow-hidden">
              <Skeleton height={160} />
              <div className="p-3 space-y-2">
                <Skeleton width="90%" height={16} />
                <Skeleton width="40%" height={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentItems.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center border border-dashed rounded-xl bg-gray-50">
        <Icon name="Clock" size={40} className="text-gray-300 mb-3" />
        <h3 className="text-gray-500 font-medium">No recently viewed items</h3>
        <Button 
          onClick={() => router.push("/marketplace")}
          className="mt-4 text-sm text-[#E0921C] font-semibold"
        >
          Browse Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Recently Viewed</h2>
          <p className="text-sm text-text-secondary">{recentItems.length} items</p>
        </div>
        <button
          onClick={clearRecentlyViewed}
          className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {recentItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`bg-white group rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden ${
              !item.isAvailable ? "opacity-75" : ""
            }`}
          >
            {/* Remove button */}
            <button
              onClick={(e) => handleRemoveItem(e, item.id)}
              className="absolute z-10 p-1.5 text-white bg-black/40 backdrop-blur-md rounded-full top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon name="X" size={12} />
            </button>

            {/* Image */}
            <div className="relative w-full h-32 md:h-40 bg-gray-50">
              <Image
                src={item.image}
                fill
                alt={item.title}
                className="object-cover"
                sizes="250px"
              />
              <div className="absolute px-2 py-0.5 text-[10px] font-bold text-white bg-black/50 rounded-md bottom-2 left-2">
                {item.distance}
              </div>
              {!item.isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                  <span className="px-3 py-1 bg-white/90 text-black text-xs font-bold rounded-full shadow-sm">SOLD</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-800 line-clamp-1 mb-1">
                {item.title}
              </h3>

              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-[#E0921C]">
                  ₦{item.price.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span className="truncate max-w-[60px]">{item.seller}</span>
                <span>{formatViewedAt(item.viewedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Exported helper (Preserved for real use) ---
export const addToRecentlyViewed = (item: Omit<RecentItem, "viewedAt">) => {
  try {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("recentlyViewed");
    const currentItems: RecentItem[] = stored ? JSON.parse(stored) : [];

    const filteredItems = currentItems.filter((i) => i.id !== item.id);
    const newItem: RecentItem = { ...item, viewedAt: new Date().toISOString() };
    const updatedItems = [newItem, ...filteredItems].slice(0, 20);

    localStorage.setItem("recentlyViewed", JSON.stringify(updatedItems));
  } catch (error) {
    console.error("Error saving item:", error);
  }
};

export default RecentlyViewed;