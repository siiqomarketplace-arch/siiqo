"use client";
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface Location {
  country: string;
  state: string;
}

export const useLocationDetection = () => {
  const [location, setLocation] = useState<Location>({ country: "", state: "" });
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setDetected(false);
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) {
        throw new Error("Failed to fetch location");
      }
      const data = await response.json();
      setLocation({
        country: data.country_name || "",
        state: data.region || "",
      });
      setDetected(true);
      toast({
        title: "Location Detected",
        description: `Country: ${data.country_name}, State: ${data.region}`,
      });
    } catch (error) {
      console.error("Location detection error:", error);
      toast({
        variant: "destructive",
        title: "Location Detection Failed",
        description: "Could not automatically detect your location.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { location, loading, detected, refresh };
};
