"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Icon from "@/components/ui/AppIcon";

// Set Mapbox token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface Location {
  address: string;
  lat: number;
  lng: number;
}

interface LocationDetails {
  address: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
}

interface LocationMapProps {
  location: Location;
  onGetDirections: () => void;
  isMobile?: boolean;
}

const LocationMap = ({
  location,
  onGetDirections,
  isMobile = false,
}: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [locationDetails, setLocationDetails] = useState<LocationDetails>({
    address: location.address,
  });
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [location.lng, location.lat],
      zoom: 15,
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add marker
    const el = document.createElement("div");
    el.className = "marker";
    el.style.backgroundImage =
      "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDAgQzE1LjIwNTQgMCAxNC40NzI0IDAgMTMuNzQxMiAwLjE3QzEyLjAxMDMgMC41MTAzIDEwLjMyNTUgMS4yMzExIDkuMDI2NTUgMi41MzAyQzQuNzg3NzcgNi43Njg2IDMgMTEuNjc5NyAzIDE2LjZDMyAyMS41MjAzIDQuNzg3NzcgMjYuNDMxNCA5LjAyNjU1IDMwLjY2OThDMTAuMzI1NSAzMS45NjkgMTIuMDEwMyAzMi41MTA2IDE0IDMyLjg0OTRWNDhIMTZWMzIuODQ5NEM5LjkzMDUgMzIuNjQwNyA0IDE0Ljk1MjcgNCA0LjhDNCAyMi4zNDU1IDkuOTMwNSAyNi4xNDAxIDE2IDI4VjQ4SDE4VjI4QzI0LjA2OTUgMjYuMTQwMSAzMCAyMi4zNDU1IDMwIDQuOEMzMCAxMS4zNjc1IDI0LjA2OTUgMTYuMDE0MyAxOCAxNi4yMjMxVjMyLjg0OTRDMTkuOTkgMzIuNTEwNiAyMS42NzQ1IDMxLjk2OSAyMi45NzM0IDMwLjY2OThDMjcuMjEyMiAyNi40MzE0IDI5IDIxLjUyMDMgMjkgMTYuNkMyOSAxMS42Nzk3IDI3LjIxMjIgNi43Njg2IDIyLjk3MzQgMi41MzAyQzIxLjY3NDUgMS4yMzExIDE5Ljk5IDAuNTEwMyAxOCAwLjE3QzE3LjUyNzYgMC4wNjY2IDE3LjA1MjQgMCAxNi41IDAgWiIgZmlsbD0iIzAwOTBEQSIvPgo8L3N2Zz4=)";
    el.style.width = "32px";
    el.style.height = "48px";
    el.style.backgroundSize = "100%";
    el.style.backgroundRepeat = "no-repeat";
    el.style.cursor = "pointer";

    marker.current = new mapboxgl.Marker({ element: el })
      .setLngLat([location.lng, location.lat])
      .addTo(map.current);

    return () => {
      if (marker.current) marker.current.remove();
      if (map.current) map.current.remove();
    };
  }, [location]);

  // Fetch detailed location info from Mapbox Geocoding API
  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;

      setIsLoadingDetails(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lng},${location.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const context = feature.context || [];

          const details: LocationDetails = {
            address: feature.place_name,
            neighborhood: context.find((c: any) =>
              c.id.startsWith("neighborhood")
            )?.text,
            city: context.find((c: any) => c.id.startsWith("place"))?.text,
            state: context.find((c: any) => c.id.startsWith("region"))?.text,
            country: context.find((c: any) => c.id.startsWith("country"))?.text,
            zipcode: context.find((c: any) => c.id.startsWith("postcode"))
              ?.text,
          };

          setLocationDetails(details);
        }
      } catch (error) {
        console.error("Failed to fetch location details:", error);
        // Fall back to the original address
        setLocationDetails({ address: location.address });
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchLocationDetails();
  }, [location]);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-semibold text-text-primary">
          Location
        </h3>
        <button
          onClick={onGetDirections}
          className="flex items-center space-x-2 text-primary hover:text-primary-700 transition-colors duration-200"
        >
          <Icon name="Navigation" size={16} />
          <span className="text-sm font-medium">Get Directions</span>
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {/* Map Container */}
        <div
          ref={mapContainer}
          className={`relative ${isMobile ? "h-48" : "h-64"}`}
        >
          {/* Overlay for interaction */}
          <div
            className="absolute inset-0 bg-transparent cursor-pointer z-10 hover:bg-black hover:bg-opacity-5 transition-colors"
            onClick={onGetDirections}
          />
        </div>

        {/* Address Information */}
        <div className="p-4 border-t border-border">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Icon name="MapPin" size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-text-primary font-medium mb-1">
                Pickup Location
              </p>

              {isLoadingDetails ? (
                <div className="space-y-1 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {locationDetails.address}
                  </p>
                  {(locationDetails.neighborhood || locationDetails.city) && (
                    <p className="text-text-secondary text-xs">
                      {[locationDetails.neighborhood, locationDetails.city]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {(locationDetails.state || locationDetails.zipcode) && (
                    <p className="text-text-secondary text-xs">
                      {[locationDetails.state, locationDetails.zipcode]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-border-light">
            <button
              onClick={onGetDirections}
              className="flex items-center space-x-2 text-primary hover:text-primary-700 transition-colors duration-200"
            >
              <Icon name="Navigation" size={16} />
              <span className="text-sm font-medium">Directions</span>
            </button>

            <button
              onClick={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  locationDetails.address
                )}`;
                window.open(url, "_blank");
              }}
              className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              <Icon name="ExternalLink" size={16} />
              <span className="text-sm font-medium">View in Maps</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
