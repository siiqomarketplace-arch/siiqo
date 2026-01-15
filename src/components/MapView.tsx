"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  MapPin,
  List,
  Map,
  X,
  Phone,
  MapPin as MapPinIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapViewItem {
  id: string | number;
  name: string;
  latitude?: number | string;
  longitude?: number | string;
  lat?: number | string;
  lng?: number | string;
  price?: number;
  distance_km?: number;
  image?: string;
  seller?: string;
  rating?: number | string;
  reviewCount?: number;
  isProduct?: boolean;
  [key: string]: any;
}

interface MapViewProps {
  items: MapViewItem[];
  center?: { lat: number; lng: number };
  onItemSelect?: (item: MapViewItem) => void;
}

/**
 * Enhanced map view component with list/map toggle
 * Shows search results in Uber/Bolt style map view with sidebar list
 */
const MapView: React.FC<MapViewProps> = ({
  items = [],
  center = { lat: 6.5244, lng: 3.3792 },
  onItemSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<any>({});
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedItem, setSelectedItem] = useState<MapViewItem | null>(null);

  // Extract coordinates from item
  const getCoordinates = useCallback(
    (item: MapViewItem): { lat: number; lng: number } | null => {
      const lat = parseFloat(String(item.latitude || item.lat || 0));
      const lng = parseFloat(String(item.longitude || item.lng || 0));

      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
        return null;
      }

      return { lat, lng };
    },
    []
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center.lng, center.lat],
      zoom: 12,
    });

    return () => {
      // Cleanup markers
      Object.values(markersRef.current || {}).forEach((marker: any) =>
        marker.remove()
      );
      markersRef.current = {};
    };
  }, [center]);

  // Update markers when items change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current || {}).forEach((marker: any) =>
      marker.remove()
    );
    markersRef.current = {};

    // Add new markers
    items.forEach((item) => {
      const coords = getCoordinates(item);
      if (!coords) return;

      // Create marker element
      const markerElement = document.createElement("div");
      markerElement.className =
        "flex items-center justify-center cursor-pointer";

      const isSelected = selectedItem?.id === item.id;
      markerElement.innerHTML = `
        <div class="relative">
          <div class="flex items-center justify-center w-8 h-8 rounded-full shadow-lg transform transition-all ${
            isSelected
              ? "bg-blue-600 scale-125"
              : "bg-white border-2 border-blue-600"
          }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${
              isSelected ? "white" : "#2563eb"
            }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
        </div>
      `;

      markerElement.onclick = (e) => {
        e.stopPropagation();
        setSelectedItem(item);
        onItemSelect?.(item);

        // Animate to marker
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [coords.lng, coords.lat],
            zoom: 14,
            duration: 1000,
          });
        }
      };

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([coords.lng, coords.lat])
        .addTo(mapRef.current!);

      markersRef.current[item.id] = marker;
    });
  }, [items, selectedItem, getCoordinates, onItemSelect]);

  // Mobile: Full map view
  if (viewMode === "map") {
    return (
      <div className="relative w-full h-screen flex flex-col bg-white">
        {/* Map Container */}
        <div
          ref={mapContainerRef}
          className="w-full flex-1 rounded-t-3xl md:rounded-none"
          style={{ minHeight: "400px" }}
        />

        {/* Mobile Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 flex gap-2 md:hidden z-10">
          <button
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-900 rounded-full shadow-lg font-medium text-sm hover:shadow-xl transition-shadow"
          >
            <List size={18} />
            List
          </button>
        </div>

        {/* Selected Item Info Card */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ y: 400, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 400, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 md:hidden bg-white rounded-t-3xl shadow-2xl p-4"
            >
              <div className="flex items-start gap-3">
                {selectedItem.image && (
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {selectedItem.name}
                  </h3>
                  {selectedItem.seller && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedItem.seller}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    {selectedItem.price && (
                      <span className="font-bold text-lg text-blue-600">
                        ₦{selectedItem.price.toLocaleString()}
                      </span>
                    )}
                    {selectedItem.distance_km && (
                      <span className="text-xs text-gray-500">
                        {selectedItem.distance_km.toFixed(1)} km away
                      </span>
                    )}
                  </div>
                  {selectedItem.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(Number(selectedItem.rating))
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {selectedItem.reviewCount || 0} reviews
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // List view
  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10">
        <h2 className="font-bold text-lg text-gray-900">
          {items.length} Results
        </h2>
        <button
          onClick={() => setViewMode("map")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          <Map size={18} />
          Map
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MapPinIcon size={48} className="mb-4 opacity-50" />
            <p className="font-medium">No items found</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {items.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setSelectedItem(item);
                    setViewMode("map");
                    onItemSelect?.(item);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50 border-2 border-blue-600"
                      : "bg-white border border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                        {item.name}
                      </h3>
                      {item.seller && (
                        <p className="text-xs text-gray-500">{item.seller}</p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        {item.price && (
                          <span className="font-bold text-blue-600 text-sm">
                            ₦{item.price.toLocaleString()}
                          </span>
                        )}
                        {item.distance_km && (
                          <span className="text-xs text-gray-400">
                            {item.distance_km.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
