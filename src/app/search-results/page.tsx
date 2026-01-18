"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  Suspense,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import ProductCard from "./components/ProductCard";
import QuickFilters from "./components/QuickFilters";
import SearchSuggestions from "./components/SearchSuggestions";
import SearchResultsMap from "./components/SearchResultsMap";
import MapView from "@/components/MapView";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import { Filter } from "@/types/search-results";
import { useLocation } from "@/context/LocationContext";
import api_endpoints from "@/hooks/api_endpoints";
import { sortByProximity } from "@/utils/proximitySort";

const SearchResults = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMapFull, setShowMapFull] = useState(false);
  const [useEnhancedMapView, setUseEnhancedMapView] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<"storefront" | "product">(
    "product"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<
    string | number | null
  >(null);
  const { coords } = useLocation();

  // Default to Lagos, NG or User Coords
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 6.5244,
    lng: 3.3792,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- API Mapping Logic ---
  const transformApiItem = useCallback((item: any, isProduct: boolean): any => {
    const distanceKm = parseFloat(item.distance_km);
    const hasValidDistance = !isNaN(distanceKm) && isFinite(distanceKm);

    // Generate approximate location from coordinates if available
    const getLocationFromCoordinates = (lat: any, lng: any) => {
      if (!lat || !lng) return "Lagos, NG";
      // This is a simple approximation - in production you'd use reverse geocoding
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);

      // Nigeria approximate regions (very simplified)
      if (parsedLat > 6 && parsedLat < 7 && parsedLng > 3 && parsedLng < 4) {
        return "Lagos, NG";
      } else if (
        parsedLat > 7 &&
        parsedLat < 8 &&
        parsedLng > 5 &&
        parsedLng < 6
      ) {
        return "Ibadan, NG";
      } else if (
        parsedLat > 8 &&
        parsedLat < 9 &&
        parsedLng > 7 &&
        parsedLng < 8
      ) {
        return "Benin City, NG";
      } else if (
        parsedLat > 9 &&
        parsedLat < 10 &&
        parsedLng > 7 &&
        parsedLng < 8
      ) {
        return "Edo, NG";
      }
      return `${parsedLat.toFixed(2)}°, ${parsedLng.toFixed(2)}°`;
    };

    return {
      id: item.id,
      name: item.name || item.business_name || "Unnamed",
      price: item.price,
      originalPrice:
        item.original_price || (item.price ? Math.round(item.price * 1.2) : 0),
      image: item.image || item.logo || "/placeholder.png",
      seller: item.vendor_name || item.business_name || "Verified Seller",
      rating: "4.8",
      reviewCount: Math.floor(Math.random() * 50) + 5,
      distance: hasValidDistance ? distanceKm.toFixed(1) : "Nearby",
      condition: "New",
      isVerified: true,
      availability: "Open Now",
      isProduct: isProduct,
      location:
        item.location ||
        getLocationFromCoordinates(item.latitude, item.longitude),
      slug: item.slug,
      // Use provided coordinates or fallback to Lagos
      coordinates: {
        lat: parseFloat(item.latitude || item.lat) || 6.5244,
        lng: parseFloat(item.longitude || item.lng) || 3.3792,
      },
      // Store raw lat/lng for later fetching
      latitude: item.latitude,
      longitude: item.longitude,
    };
  }, []);

  // Fetch detailed product info to get accurate coordinates
  const fetchProductDetails = useCallback(
    async (productIds: number[]): Promise<Map<number, any>> => {
      const detailsMap = new Map();

      try {
        const responses = await Promise.all(
          productIds.map((id) =>
            fetch(api_endpoints.MARKETPLACE_PRODUCTS(String(id)))
              .then((res) => res.json())
              .catch(() => null)
          )
        );

        responses.forEach((response, index) => {
          if (response?.product) {
            const product = response.product;
            detailsMap.set(productIds[index], {
              latitude: product.latitude,
              longitude: product.longitude,
            });
          }
        });
      } catch (err) {
        console.error("Error fetching product details:", err);
      }

      return detailsMap;
    },
    []
  );

  const fetchProducts = async (query: string): Promise<void> => {
    try {
      setIsLoading(true);
      const baseUrl = api_endpoints.MARKETPLACE_SEARCH;

      const nearUrl = new URL(
        baseUrl,
        typeof window !== "undefined" ? window.location.origin : ""
      );
      if (query) nearUrl.searchParams.set("q", query);
      if (coords?.lat && coords?.lng) {
        nearUrl.searchParams.set("lat", String(coords.lat));
        nearUrl.searchParams.set("lng", String(coords.lng));
      }

      const allUrl = new URL(
        baseUrl,
        typeof window !== "undefined" ? window.location.origin : ""
      );
      if (query) allUrl.searchParams.set("q", query);

      const [nearRes, allRes] = await Promise.all([
        fetch(nearUrl.toString()),
        fetch(allUrl.toString()),
      ]);

      const nearJson = await nearRes.json();
      const allJson = await allRes.json();

      if (nearJson.status === "success" || allJson.status === "success") {
        const nearP = nearJson?.data?.nearby_products || [];
        const nearS = nearJson?.data?.nearby_stores || [];
        const allP =
          allJson?.data?.products || allJson?.data?.nearby_products || [];
        const allS =
          allJson?.data?.storefronts || allJson?.data?.nearby_stores || [];

        const dedup = (arr: any[]) => {
          const seen = new Set();
          return arr.filter((it) => {
            const id = it.id || it.slug;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });
        };

        const finalP = nearP.length > 0 ? dedup(nearP) : dedup(allP);
        const finalS = nearS.length > 0 ? dedup(nearS) : dedup(allS);

        // Fetch detailed product info to get accurate coordinates
        const productIds = finalP.map((p) => p.id).filter(Boolean);
        const storeIds = finalS.map((s) => s.id).filter(Boolean);

        const [productDetails, storeDetails] = await Promise.all([
          fetchProductDetails(productIds),
          fetchProductDetails(storeIds),
        ]);

        let productsData: any[] = [];
        let storesData: any[] = [];

        // Enrich products with detailed coordinates
        const enrichedProducts = finalP.map((p: any) => {
          const details = productDetails.get(p.id);
          return {
            ...p,
            latitude: details?.latitude || p.latitude,
            longitude: details?.longitude || p.longitude,
          };
        });

        // Enrich stores with detailed coordinates
        const enrichedStores = finalS.map((s: any) => {
          const details = storeDetails.get(s.id);
          return {
            ...s,
            latitude: details?.latitude || s.latitude,
            longitude: details?.longitude || s.longitude,
          };
        });

        // Apply proximity sorting
        if (coords?.lat && coords?.lng) {
          const productsSorted = sortByProximity(enrichedProducts, {
            lat: coords.lat,
            lng: coords.lng,
          });
          const storesSorted = sortByProximity(enrichedStores, {
            lat: coords.lat,
            lng: coords.lng,
          });

          productsData = productsSorted.map((p: any) =>
            transformApiItem(p, true)
          );
          storesData = storesSorted.map((s: any) => transformApiItem(s, false));
        } else {
          productsData = enrichedProducts.map((p: any) =>
            transformApiItem(p, true)
          );
          storesData = enrichedStores.map((s: any) =>
            transformApiItem(s, false)
          );
        }

        setProducts(productsData);
        setStores(storesData);

        // Update map center to the first result found (with accurate coordinates)
        const firstItem =
          searchMode === "product" ? productsData[0] : storesData[0];
        if (
          firstItem?.coordinates &&
          (firstItem.coordinates.lat !== 6.5244 ||
            firstItem.coordinates.lng !== 3.3792)
        ) {
          setMapCenter(firstItem.coordinates);
        } else if (coords?.lat && coords?.lng) {
          setMapCenter({ lat: coords.lat, lng: coords.lng });
        }
      }
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get("q") || "";
    if (query) {
      setSearchQuery(query);
      setHasSearched(true);
      fetchProducts(query);
      setRecentSearches((prev) => {
        const updated = [query, ...prev.filter((s) => s !== query)];
        return updated.slice(0, 5);
      });
    }
  }, [searchParams, coords]);

  useEffect(() => {
    setPopularSearches(["Electronics", "Fashion", "Home", "Sports", "Books"]);
  }, []);

  const { paginatedItems, totalPages } = useMemo(() => {
    let currentList = searchMode === "product" ? [...products] : [...stores];

    activeFilters.forEach((filter) => {
      if (filter.type === "price")
        currentList = currentList.filter((p) => p.price <= filter.value);
    });

    const total = Math.ceil(currentList.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    return {
      paginatedItems: currentList.slice(start, start + itemsPerPage),
      totalPages: Math.max(1, total),
    };
  }, [products, stores, activeFilters, searchMode, currentPage]);

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", query);
    router.push(`/search-results?${params.toString()}`);
    setShowSuggestions(false);
    setHasSearched(true);
    setCurrentPage(1);
  };

  // Helper to focus map on a specific product card click
  const focusOnMap = (item: any) => {
    if (item.coordinates) {
      setMapCenter(item.coordinates);
      setSelectedMarkerId(item.id);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1B3F61] font-sans">
      {/* Enhanced Map View Toggle */}
      {hasSearched && (
        <button
          onClick={() => setUseEnhancedMapView(!useEnhancedMapView)}
          className="fixed top-4 right-4 z-[100] px-4 py-2 bg-white text-gray-900 rounded-full shadow-lg font-medium text-sm hover:shadow-xl transition-shadow"
        >
          {useEnhancedMapView ? "Back to Results" : "Enhanced Map View"}
        </button>
      )}

      {/* Enhanced Map View */}
      {useEnhancedMapView && hasSearched && (
        <MapView
          items={searchMode === "product" ? products : stores}
          center={mapCenter}
          onItemSelect={(item) => {
            setSelectedMarkerId(item.id);
            router.push(
              item.isProduct
                ? `/products/${item.id}`
                : `/storefront-details/${item.slug}`
            );
          }}
        />
      )}

      {/* Original Map Layer */}
      {!useEnhancedMapView && (
        <>
          {/* 1. Map Layer - Shows all search results */}
          <div
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
              hasSearched ? "opacity-100" : "opacity-0"
            }`}
          >
            <SearchResultsMap
              markers={
                searchMode === "product"
                  ? products.map((p) => ({
                      id: p.id,
                      lat: p.coordinates.lat,
                      lng: p.coordinates.lng,
                      name: p.name,
                      price: p.price,
                      isProduct: true,
                    }))
                  : stores.map((s) => ({
                      id: s.id,
                      lat: s.coordinates.lat,
                      lng: s.coordinates.lng,
                      name: s.name,
                      price: s.price,
                      isProduct: false,
                    }))
              }
              center={mapCenter}
              onMarkerClick={(marker) => {
                setSelectedMarkerId(marker.id);
                setMapCenter({ lat: marker.lat, lng: marker.lng });
              }}
              selectedMarkerId={selectedMarkerId}
            />
          </div>

          {/* 2. Glass UI Panel */}
          <div
            className={`absolute top-0 bottom-0 left-0 z-50 transition-all duration-700 ease-in-out flex flex-col 
          ${
            !hasSearched
              ? "w-full h-screen items-center justify-start pt-20 bg-transparent backdrop-blur-none"
              : "w-full md:w-[450px] h-screen bg-white/70 backdrop-blur-2xl border-r border-white/40 shadow-2xl"
          } ${showMapFull ? "-translate-x-full" : "translate-x-0"}`}
          >
            <div className={`flex flex-col w-full h-full max-w-2xl px-6`}>
              <div className={`flex-none ${hasSearched ? "pt-6" : ""}`}>
                <div className="relative z-50 mb-4">
                  <div className="relative group shadow-2xl rounded-full overflow-hidden border border-white/50 bg-white/90 ring-4 ring-black/5">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Icon
                        name="Search"
                        size={20}
                        className="text-slate-400"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="What are you looking for?"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(e.target.value.length > 0);
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSearchSubmit(searchQuery)
                      }
                      className="w-full py-5 pl-14 pr-12 text-lg bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>

                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-[100]">
                      <SearchSuggestions
                        query={searchQuery}
                        onSelect={handleSearchSubmit}
                        onClose={() => setShowSuggestions(false)}
                        recentSearches={recentSearches}
                        popularSearches={popularSearches}
                      />
                    </div>
                  )}
                </div>

                {hasSearched && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-center mb-5 gap-6">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          searchMode === "storefront"
                            ? "text-[#1B3F61]"
                            : "text-slate-400"
                        }`}
                      >
                        Stores
                      </span>
                      <button
                        onClick={() => {
                          setSearchMode((prev) =>
                            prev === "product" ? "storefront" : "product"
                          );
                          setCurrentPage(1);
                        }}
                        className="relative w-14 h-7 bg-slate-200/50 rounded-full p-1 border border-white/50"
                      >
                        <div
                          className={`w-5 h-5 bg-[#1B3F61] rounded-full shadow-lg transition-transform duration-300 ${
                            searchMode === "product"
                              ? "translate-x-7"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          searchMode === "product"
                            ? "text-[#1B3F61]"
                            : "text-slate-400"
                        }`}
                      >
                        Products
                      </span>
                    </div>
                    <QuickFilters
                      onApplyFilter={(f) => {
                        setActiveFilters([{ ...f, id: `f-${Date.now()}` }]);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Results Area */}
              {hasSearched && (
                <div className="flex-1 overflow-y-auto mt-4 pr-1 scrollbar-hide">
                  <div className="space-y-1">
                    {isLoading ? (
                      <div className="flex flex-col items-center py-20 text-slate-500 space-y-4">
                        <Icon
                          name="Loader2"
                          className="animate-spin text-[#1B3F61]"
                          size={32}
                        />
                        <p className="text-xs font-bold uppercase tracking-tighter">
                          Locating Items...
                        </p>
                      </div>
                    ) : paginatedItems.length === 0 ? (
                      <div className="text-center py-20 bg-white/30 rounded-3xl border border-dashed border-white/50">
                        <Icon
                          name="PackageSearch"
                          size={40}
                          className="mx-auto mb-3 text-slate-400"
                        />
                        <p className="text-sm font-medium text-slate-500">
                          Nothing found nearby.
                        </p>
                        <button
                          onClick={() => fetchProducts("")}
                          className="text-xs font-bold text-[#1B3F61] mt-2 underline"
                        >
                          View all items
                        </button>
                      </div>
                    ) : (
                      paginatedItems.map((item) => (
                        <ProductCard
                          key={`${item.id}-${item.slug}-${searchMode}`}
                          product={item}
                          onClick={() => {
                            focusOnMap(item);
                            router.push(
                              item.isProduct
                                ? `/products/${item.id}`
                                : `/storefront-details/${item.slug}`
                            );
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {hasSearched && totalPages > 1 && !isLoading && (
                <div className="flex-none py-6 border-t border-white/20">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-[10px] uppercase tracking-widest border border-white/50 ${
                        currentPage === 1
                          ? "opacity-30 cursor-not-allowed"
                          : "bg-white shadow-xl hover:bg-slate-50"
                      }`}
                    >
                      <Icon name="ChevronLeft" size={14} /> Prev
                    </button>
                    <span className="text-[10px] font-black text-slate-500 tracking-tighter">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-[10px] uppercase tracking-widest border border-white/50 ${
                        currentPage === totalPages
                          ? "opacity-30 cursor-not-allowed"
                          : "bg-white shadow-xl hover:bg-slate-50"
                      }`}
                    >
                      Next <Icon name="ChevronRight" size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Toggle Floating Button */}
          {hasSearched && !useEnhancedMapView && (
            <button
              onClick={() => setShowMapFull(!showMapFull)}
              className="fixed z-[70] bottom-24 md:bottom-8 right-8 w-16 h-16 bg-[#1B3F61] text-white rounded-full shadow-[0_20px_50px_rgba(27,63,97,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              <Icon name={showMapFull ? "List" : "Map"} size={28} />
            </button>
          )}
        </>
      )}

      <FloatingWhatsAppButton />
    </div>
  );
};

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex flex-col items-center justify-center bg-[#1B3F61] text-white space-y-4">
          ...
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
