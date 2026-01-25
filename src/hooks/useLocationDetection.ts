import { useState, useCallback, useEffect } from "react";

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1Ijoic2lpcW82MiIsImEiOiJjbWtlZWo0OGcwNmYwM2VzMDkxM215d3FuIn0.oBw8lmL9hv-N6lCyC5wHSw";

export interface LocationData {
  country: string;
  state: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  zipcode?: string;
  latitude: string;
  longitude: string;
}

export const useLocationDetection = () => {
  const [location, setLocation] = useState<LocationData>({
    country: "",
    state: "",
    city: "",
    neighborhood: "",
    address: "",
    zipcode: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState(false);

  const detectLocation = useCallback(async () => {
    setLoading(true);
    try {
      // First, get user's coordinates using browser geolocation
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        },
      );

      const { latitude, longitude } = position.coords;

      // Use Mapbox Geocoding API to reverse geocode the coordinates
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=place,region,country,postcode,neighborhood,address`,
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];

        // Extract location details from Mapbox response
        const neighborhood =
          context.find((c: any) => c.id.startsWith("neighborhood"))?.text || "";
        const city =
          context.find((c: any) => c.id.startsWith("place"))?.text || "";
        const state =
          context.find((c: any) => c.id.startsWith("region"))?.text || "";
        const country =
          context.find((c: any) => c.id.startsWith("country"))?.text || "";
        const zipcode =
          context.find((c: any) => c.id.startsWith("postcode"))?.text || "";

        const newLocation: LocationData = {
          country: country,
          state: state,
          city: city,
          neighborhood: neighborhood,
          address: feature.place_name,
          zipcode: zipcode,
          latitude: String(latitude),
          longitude: String(longitude),
        };

        setLocation(newLocation);
        setDetected(true);

        // Return formatted address string
        const addressParts = [neighborhood, city, state, country].filter(
          Boolean,
        );
        return addressParts.join(", ") || feature.place_name;
      } else {
        throw new Error(
          "We couldn't detect your location. Please check your browser settings or enter it manually.",
        );
      }
    } catch (error) {
      console.warn("Location detection failed:", error);
      // Fallback: return basic coordinates without geocoding
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          },
        );
        const basicLocation: LocationData = {
          country: "",
          state: "",
          city: "",
          neighborhood: "",
          address: "",
          zipcode: "",
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        };
        setLocation(basicLocation);
        return "Location detected (coordinates only)";
      } catch {
        return "N/A";
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return { location, loading, detected, refresh: detectLocation };
};
