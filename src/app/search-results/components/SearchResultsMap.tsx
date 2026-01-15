"use client";

import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";

// Set Mapbox token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapMarker {
  id: string | number;
  lat: number;
  lng: number;
  name: string;
  price?: number;
  isProduct: boolean;
}

interface SearchResultsMapProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  onMarkerClick?: (marker: MapMarker) => void;
  selectedMarkerId?: string | number | null;
}

/**
 * A map component that displays search results with markers using Mapbox
 */
const SearchResultsMap: React.FC<SearchResultsMapProps> = ({
  markers = [],
  center = { lat: 6.5244, lng: 3.3792 },
  onMarkerClick,
  selectedMarkerId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center.lng, center.lat],
      zoom: 12,
    });

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  // Update markers and pan to center
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (popupRef.current) {
      popupRef.current.remove();
    }

    if (!markers.length) return;

    const bounds = new mapboxgl.LngLatBounds();

    // Create markers
    markers.forEach((markerData) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "32px";
      el.style.height = "40px";
      el.style.backgroundSize = "100%";
      el.style.cursor = "pointer";
      el.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30"><path fill="%23${
        markerData.isProduct ? "FF6B35" : "004E89"
      }" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>')`;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([markerData.lng, markerData.lat])
        .addTo(mapRef.current!);

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 bg-white rounded-lg shadow-lg max-w-xs">
          <h3 class="font-bold text-sm text-gray-800">${markerData.name}</h3>
          ${
            markerData.price
              ? `<p class="text-orange-600 font-semibold text-sm">₦${markerData.price.toLocaleString()}</p>`
              : ""
          }
          <p class="text-xs text-gray-600 mt-1">${
            markerData.isProduct ? "Product" : "Storefront"
          }</p>
        </div>
      `);

      // Add click listener
      el.addEventListener("click", () => {
        // Close previous popup
        if (popupRef.current) {
          popupRef.current.remove();
        }

        // Show new popup
        popup.addTo(mapRef.current!);
        popupRef.current = popup;

        if (onMarkerClick) {
          onMarkerClick(markerData);
        }
      });

      // Add hover effect
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.2)";
        el.style.filter = "drop-shadow(0 4px 8px rgba(0,0,0,0.3))";
      });

      el.addEventListener("mouseleave", () => {
        if (selectedMarkerId !== markerData.id) {
          el.style.transform = "scale(1)";
          el.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.15))";
        }
      });

      // Highlight selected marker
      if (selectedMarkerId === markerData.id) {
        el.style.transform = "scale(1.3)";
        el.style.filter = "drop-shadow(0 4px 12px rgba(0,0,0,0.4))";
      }

      markersRef.current.push(marker);
      bounds.extend([markerData.lng, markerData.lat]);
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 1) {
      mapRef.current!.fitBounds(bounds, {
        padding: 80,
        duration: 500,
      });
    } else if (markersRef.current.length === 1) {
      mapRef.current!.flyTo({
        center: [markers[0].lng, markers[0].lat],
        zoom: 14,
        duration: 500,
      });
    }
  }, [markers, onMarkerClick, selectedMarkerId]);

  // Pan to center on center prop change
  useEffect(() => {
    if (!mapRef.current || !center) return;

    mapRef.current.flyTo({
      center: [center.lng, center.lat],
      zoom: 14,
      duration: 500,
    });
  }, [center]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 relative">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />
      {!markers.length && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-white/50 backdrop-blur-sm">
          <MapPin size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No results to display on map</p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsMap;
