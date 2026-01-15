"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import { toast } from "sonner"; // Assuming you use sonner for notifications
import { switchMode } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import api_endpoints from "@/hooks/api_endpoints";

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  vendor_name: string;
}

const SavedItems = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();

  // 1. Fetch data from API
  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get token from localStorage
        const token = sessionStorage.getItem("RSToken");

        if (!token) {
          setError("Not authenticated. Please log in.");
          setIsLoading(false);
          return;
        }

        const response = await fetch(api_endpoints.GET_FAVOURITES, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || data.status === "error") {
          setError(data.message || "Failed to fetch favourites");
          return;
        }

        // Map your API response to the WishlistItem interface
        setItems(data.favourites || []);
      } catch (err) {
        setError("Failed to load your wishlist. Please try again later.");
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchFavorites();
    } else {
      setIsLoading(false);
      setError("Please log in to view your saved items.");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    switchMode("buyer");
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  const handleRemoveItem = (itemId: number) => {
    setItems(items.filter((item) => item.id !== itemId));
    toast.success("Item removed from wishlist");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-surface-secondary rounded-lg flex items-center justify-center">
            <Icon name="Heart" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Saved Items
            </h2>
            <p className="text-sm text-text-secondary">
              {items.length} items saved
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Logic */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-text-secondary text-sm">
            Loading your items...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="AlertCircle" size={24} className="text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Access Restricted
          </h3>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Log In as Buyer
          </button>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(`/products/${item.id}`)}
              >
                {/* Image Container */}
                <div className="relative h-40 bg-surface-secondary overflow-hidden">
                  <Image
                    src={item.image}
                    fill
                    alt={item.name}
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(item.id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Icon name="X" size={16} className="text-red-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs text-text-tertiary mb-1">
                    {item.vendor_name}
                  </p>
                  <h3 className="font-medium text-text-primary line-clamp-2 mb-2">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-primary">
                      ₦{item.price.toLocaleString()}
                    </p>
                    <Icon
                      name="ChevronRight"
                      size={16}
                      className="text-text-secondary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8 pt-4 border-t border-border">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="ChevronLeft" size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "border border-border hover:bg-surface-secondary"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="ChevronRight" size={18} />
              </button>
            </div>
          )}

          {/* Page Info */}
          <p className="text-center text-sm text-text-secondary">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, items.length)} of{" "}
            {items.length} items
          </p>
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Heart" size={24} className="text-text-tertiary" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No saved items yet
          </h3>
          <p className="text-text-secondary mb-6">
            Start adding items to your wishlist
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Start exploring
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedItems;
