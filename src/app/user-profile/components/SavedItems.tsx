"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";

interface WishlistItem {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: string;
  distance: string;
  isAvailable: boolean;
  savedDate: string;
  priceDropped?: boolean;
  originalSavedPrice?: number;
  unavailableReason?: string;
}

interface SavedSearch {
  id: number;
  query: string;
  filters: {
    category?: string;
    maxPrice?: number;
    distance?: number;
    condition?: string;
  };
  createdDate: string;
  newResults: number;
  lastChecked: string;
}

const SavedItems = () => {
  const [activeTab, setActiveTab] = useState<"wishlist" | "searches">(
    "wishlist"
  );
  const router = useRouter();

  const wishlistItems: WishlistItem[] = [
    {
      id: 1,
      title: "Professional Camera Lens - 50mm",
      price: 450,
      originalPrice: 599,
      image:
        "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300&h=300&fit=crop",
      seller: "PhotoGear Pro",
      distance: "2.3 miles",
      isAvailable: true,
      savedDate: "2024-01-20",
      priceDropped: true,
      originalSavedPrice: 520,
    },
    {
      id: 2,
      title: "Vintage Wooden Dining Table",
      price: 280,
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
      seller: "Antique Finds",
      distance: "4.1 miles",
      isAvailable: false,
      savedDate: "2024-01-18",
      unavailableReason: "Sold",
    },
    {
      id: 3,
      title: "Mountain Bike - Trek 2023",
      price: 850,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
      seller: "Cycle World",
      distance: "1.8 miles",
      isAvailable: true,
      savedDate: "2024-01-15",
    },
    {
      id: 4,
      title: "Designer Sunglasses - Ray-Ban",
      price: 120,
      image:
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop",
      seller: "Fashion Hub",
      distance: "3.2 miles",
      isAvailable: true,
      savedDate: "2024-01-12",
    },
  ];

  const savedSearches: SavedSearch[] = [
    {
      id: 1,
      query: "iPhone 14 Pro",
      filters: {
        category: "Electronics",
        maxPrice: 900,
        distance: 10,
        condition: "Like New",
      },
      createdDate: "2024-01-22",
      newResults: 3,
      lastChecked: "2024-01-25",
    },
    {
      id: 2,
      query: "Vintage leather jacket",
      filters: {
        category: "Clothing",
        maxPrice: 200,
        distance: 15,
        condition: "Good",
      },
      createdDate: "2024-01-20",
      newResults: 1,
      lastChecked: "2024-01-24",
    },
    {
      id: 3,
      query: "Gaming setup",
      filters: {
        category: "Electronics",
        maxPrice: 1500,
        distance: 20,
      },
      createdDate: "2024-01-18",
      newResults: 0,
      lastChecked: "2024-01-25",
    },
  ];

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleRemoveFromWishlist = (itemId: number) => {
    // Handle remove from wishlist
    console.log("Remove item:", itemId); // Implement actual logic
  };

  const handleDeleteSearch = (searchId: number) => {
    // Handle delete saved search
    console.log("Delete search:", searchId); // Implement actual logic
  };

  const handleRunSearch = (search: SavedSearch) => {
    // Navigate to search results with filters
    const params = new URLSearchParams();
    if (search.filters.category)
      params.set("category", search.filters.category);
    if (search.filters.maxPrice)
      params.set("maxPrice", search.filters.maxPrice.toString());
    if (search.filters.distance)
      params.set("distance", search.filters.distance.toString());
    if (search.filters.condition)
      params.set("condition", search.filters.condition);

    router.push(`/search-results?q=${search.query}&${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-surface-secondary rounded-lg p-1">
        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeTab === "wishlist"
              ? "bg-surface text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Icon name="Heart" size={16} />
          <span>Wishlist</span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              activeTab === "wishlist"
                ? "bg-primary text-white"
                : "bg-border text-text-tertiary"
            }`}
          >
            {wishlistItems.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("searches")}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeTab === "searches"
              ? "bg-surface text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Icon name="Search" size={16} />
          <span>Saved Searches</span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              activeTab === "searches"
                ? "bg-primary text-white"
                : "bg-border text-text-tertiary"
            }`}
          >
            {savedSearches.length}
          </span>
        </button>
      </div>

      {/* Wishlist Tab */}
      {activeTab === "wishlist" && (
        <div className="space-y-4">
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-surface border border-border rounded-lg overflow-hidden hover:shadow-elevation-2 transition-shadow duration-200 ${
                    !item.isAvailable ? "opacity-75" : ""
                  }`}
                >
                  <div className="relative">
                    <Image
                      src={item.image}
                      fill
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 flex space-x-2">
                      {item.priceDropped && (
                        <span className="px-2 py-1 bg-success text-white text-xs font-medium rounded-full">
                          Price Drop!
                        </span>
                      )}
                      {!item.isAvailable && (
                        <span className="px-2 py-1 bg-error text-white text-xs font-medium rounded-full">
                          {item.unavailableReason}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="absolute top-3 right-3 p-2 bg-surface bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors duration-200"
                    >
                      <Icon
                        name="Heart"
                        size={16}
                        className="text-accent fill-current"
                      />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-text-primary line-clamp-2 mb-2">
                      {item.title}
                    </h3>

                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg font-semibold text-text-primary">
                        ${item.price}
                      </span>
                      {item.originalPrice &&
                        item.originalPrice > item.price && (
                          <span className="text-sm text-text-tertiary line-through">
                            ${item.originalPrice}
                          </span>
                        )}
                      {item.priceDropped && item.originalSavedPrice && (
                        <span className="text-xs text-success">
                          (-${item.originalSavedPrice - item.price})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-text-secondary mb-3">
                      <span>{item.seller}</span>
                      <div className="flex items-center space-x-1">
                        <Icon name="MapPin" size={12} />
                        <span>{item.distance}</span>
                      </div>
                    </div>

                    <div className="text-xs text-text-tertiary mb-3">
                      Saved on {formatDate(item.savedDate)}
                    </div>

                    <div className="flex space-x-2">
                      {item.isAvailable ? (
                        <>
                          <button
                            onClick={() => router.push("/product-detail")}
                            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
                          >
                            View Item
                          </button>
                          <button className="p-2 border border-border rounded-lg hover:bg-surface-secondary transition-colors duration-200">
                            <Icon
                              name="MessageCircle"
                              size={16}
                              className="text-text-secondary"
                            />
                          </button>
                        </>
                      ) : (
                        <button
                          disabled
                          className="flex-1 bg-surface-secondary text-text-tertiary py-2 px-4 rounded-lg text-sm font-medium cursor-not-allowed"
                        >
                          No Longer Available
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Heart" size={24} className="text-text-tertiary" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-text-secondary mb-6">
                Save items you're interested in to keep track of them and get
                notified of price changes.
              </p>
              <button
                onClick={() => router.push("/")}
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Browse Products
              </button>
            </div>
          )}
        </div>
      )}

      {/* Saved Searches Tab */}
      {activeTab === "searches" && (
        <div className="space-y-4">
          {savedSearches.length > 0 ? (
            <div className="space-y-3">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="bg-surface border border-border rounded-lg p-4 hover:shadow-elevation-1 transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon
                          name="Search"
                          size={16}
                          className="text-text-secondary"
                        />
                        <h3 className="font-medium text-text-primary">
                          "{search.query}"
                        </h3>
                        {search.newResults > 0 && (
                          <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                            {search.newResults} new
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {search.filters.category && (
                          <span className="px-2 py-1 bg-surface-secondary text-text-secondary text-xs rounded-full">
                            {search.filters.category}
                          </span>
                        )}
                        {search.filters.maxPrice && (
                          <span className="px-2 py-1 bg-surface-secondary text-text-secondary text-xs rounded-full">
                            Under ${search.filters.maxPrice}
                          </span>
                        )}
                        {search.filters.distance && (
                          <span className="px-2 py-1 bg-surface-secondary text-text-secondary text-xs rounded-full">
                            Within {search.filters.distance} miles
                          </span>
                        )}
                        {search.filters.condition && (
                          <span className="px-2 py-1 bg-surface-secondary text-text-secondary text-xs rounded-full">
                            {search.filters.condition}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-text-tertiary">
                        Created {formatDate(search.createdDate)} • Last checked{" "}
                        {formatDate(search.lastChecked)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSearch(search.id)}
                      className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                    >
                      <Icon
                        name="Trash2"
                        size={16}
                        className="text-text-secondary"
                      />
                    </button>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleRunSearch(search)}
                      className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
                    >
                      Run Search
                    </button>
                    <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors duration-200">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Search" size={24} className="text-text-tertiary" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No saved searches
              </h3>
              <p className="text-text-secondary mb-6">
                Save your searches to get notified when new matching items are
                listed.
              </p>
              <button
                onClick={() => router.push("/search-results")}
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Start Searching
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
