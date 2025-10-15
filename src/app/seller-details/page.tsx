"use client";
import React, { useEffect, useState } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
// import MyListings from "../user-profile/components/MyListings";
import { useRouter } from "next/navigation";
import { VendorData } from "@/types/vendor/storefront";
import MyListings from "./components/Listing";

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  fullAddress?: string;
}

interface LocationError {
  code: number;
  message: string;
}

// --- Hook for location ---
const useAutoLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);

  const getAddressFromCoordinates = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      );
      const data = await res.json();
      const address = data.address;
      const city = address.city || address.town || address.village || "";
      const state = address.state || address.region || "";
      const country = address.country || "";
      return `${city}${state ? ", " + state : ""}${
        country ? ", " + country : ""
      }`;
    } catch {
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError({ code: 0, message: "Geolocation not supported" });
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        const fullAddress = await getAddressFromCoordinates(
          latitude,
          longitude
        );
        const addressParts = fullAddress.split(", ");
        const locationData: LocationData = {
          latitude,
          longitude,
          city: addressParts[0] || "",
          state: addressParts[1] || "",
          country: addressParts[2] || "",
          fullAddress,
        };
        setLocation(locationData);
        localStorage.setItem("userLocation", JSON.stringify(locationData));
        setLoading(false);
      },
      err => {
        setError({ code: err.code, message: getErrorMessage(err.code) });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const getErrorMessage = (code: number) => {
    switch (code) {
      case 1:
        return "Location access denied";
      case 2:
        return "Location unavailable";
      case 3:
        return "Request timed out";
      default:
        return "Unknown error";
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
    localStorage.removeItem("userLocation");
  };

  useEffect(() => {
    const saved = localStorage.getItem("userLocation");
    if (saved) {
      try {
        setLocation(JSON.parse(saved));
      } catch {
        localStorage.removeItem("userLocation");
      }
    }
  }, []);

  return { location, loading, error, getCurrentLocation, clearLocation };
};

const VendorProfile: React.FC = () => {
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const router = useRouter();

  const {
    location,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
    clearLocation,
  } = useAutoLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("https://server.bizengo.com/api/user/profile", {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("vendorToken")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setVendorData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const userProfile = {
    id: 1,
    name:
      vendorData?.business_name ||
      `${vendorData?.first_name || "Sarah"} ${
        vendorData?.last_name || "Johnson"
      }`,
    email: vendorData?.email || "sarah.johnson@email.com",
    phone: vendorData?.phone || "+1 (555) 123-4567",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    location: location?.fullAddress || "San Francisco, CA",
    joinDate: "March 2023",
    isVerified: {
      email: vendorData?.isVerified ?? true,
      phone: true,
      identity: false,
    },
    stats: {
      itemsListed: 24,
      purchasesMade: 18,
      sellerRating: 4.8,
      totalReviews: 32,
    },
    bio: "Passionate about sustainable living and finding great deals on quality items...",
  };

  const LocationDisplay = ({ className = "" }: { className?: string }) => (
    <div
      className={`flex items-center space-x-1 text-text-secondary text-sm ${className}`}
    >
      <Icon name="MapPin" size={14} />
      <span>
        {locationLoading
          ? "Getting location..."
          : locationError
          ? "Location unavailable"
          : userProfile.location}
      </span>
      {!locationLoading && (
        <button
          onClick={getCurrentLocation}
          className="ml-1 text-xs text-primary hover:underline"
          title="Update location"
        >
          📍
        </button>
      )}
      {location && (
        <button
          onClick={clearLocation}
          className="ml-1 text-xs text-gray-400 hover:text-red-500"
          title="Clear location"
        >
          ✕
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="px-4 py-6 border-b bg-surface border-border">
          <div className="flex items-center mb-4 space-x-4">
            <div className="relative w-16 h-16">
              <Image
                src={userProfile.avatar}
                alt={userProfile.name}
                fill
                className="object-cover rounded-full"
                sizes="64px"
              />
              {userProfile.isVerified.email && (
                <div className="absolute flex items-center justify-center w-6 h-6 rounded-full -bottom-1 -right-1 bg-primary">
                  <Icon name="Check" size={12} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-semibold font-heading text-text-primary">
                {userProfile.name}
              </h1>
              <LocationDisplay />
              <p className="mt-1 text-xs text-text-tertiary">
                Member since {userProfile.joinDate}
              </p>
            </div>
          </div>
        </div>

        {/* Products Header */}
        <div className="px-4 py-4 border-b bg-surface border-border">
          <h2 className="text-lg font-semibold font-heading text-text-primary">
            Products
          </h2>
        </div>

        {/* Products Content */}
        <div className="p-4">
          <MyListings />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden px-6 py-8 mx-auto md:block max-w-7xl">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar - Profile Info */}
          <div className="col-span-4">
            <div className="p-6 mb-6 border rounded-lg bg-surface border-border">
              <div className="mb-6 text-center">
                <div className="relative w-24 h-24 mx-auto overflow-hidden rounded-full">
                  <Image
                    fill
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="object-cover"
                    sizes="96px"
                  />
                  {userProfile.isVerified.email && (
                    <div className="absolute flex items-center justify-center w-6 h-6 rounded-full -bottom-1 -right-1 bg-primary">
                      <Icon name="Check" size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <h1 className="mt-4 text-2xl font-semibold font-heading text-text-primary">
                  {userProfile.name}
                </h1>
                <LocationDisplay className="justify-center mt-2" />
                <p className="mt-1 text-sm text-text-tertiary">
                  Member since {userProfile.joinDate}
                </p>
              </div>

              {/* Location Error Display */}
              {locationError && (
                <div className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="AlertCircle"
                      size={16}
                      className="text-red-500"
                    />
                    <span className="text-sm text-red-700">
                      {locationError.message}
                    </span>
                  </div>
                  <button
                    onClick={getCurrentLocation}
                    className="mt-2 text-xs text-red-600 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Verification Badges */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="Mail"
                      size={16}
                      className="text-text-secondary"
                    />
                    <span className="text-sm text-text-secondary">Email</span>
                  </div>
                  {userProfile.isVerified.email ? (
                    <div className="flex items-center space-x-1 text-success">
                      <Icon name="Check" size={14} />
                      <span className="text-xs">Verified</span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-tertiary">
                      Not verified
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="Phone"
                      size={16}
                      className="text-text-secondary"
                    />
                    <span className="text-sm text-text-secondary">Phone</span>
                  </div>
                  {userProfile.isVerified.phone ? (
                    <div className="flex items-center space-x-1 text-success">
                      <Icon name="Check" size={14} />
                      <span className="text-xs">Verified</span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-tertiary">
                      Not verified
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="Shield"
                      size={16}
                      className="text-text-secondary"
                    />
                    <span className="text-sm text-text-secondary">
                      Identity
                    </span>
                  </div>
                  {userProfile.isVerified.identity ? (
                    <div className="flex items-center space-x-1 text-success">
                      <Icon name="Check" size={14} />
                      <span className="text-xs">Verified</span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-tertiary">
                      Not verified
                    </span>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-medium text-text-primary">
                  About
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {userProfile.bio}
                </p>
              </div>
            </div>

            {/* Stats Card */}
            {/* <div className="p-6 border rounded-lg bg-surface border-border">
              <h3 className="mb-4 text-lg font-semibold font-heading text-text-primary">
                Activity Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Package" size={16} className="text-primary" />
                    <span className="text-sm text-text-secondary">
                      Items Listed
                    </span>
                  </div>
                  <span className="font-semibold text-text-primary">
                    {userProfile.stats.itemsListed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="ShoppingBag"
                      size={16}
                      className="text-primary"
                    />
                    <span className="text-sm text-text-secondary">
                      Purchases Made
                    </span>
                  </div>
                  <span className="font-semibold text-text-primary">
                    {userProfile.stats.purchasesMade}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Star" size={16} className="text-orange-500 fill-current" />
                    <span className="text-sm text-text-secondary">
                      Seller Rating
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-text-primary">
                      {userProfile.stats.sellerRating}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      ({userProfile.stats.totalReviews})
                    </span>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Right Content Area */}
          <div className="col-span-8">
            {/* Products Header */}
            <div className="mb-6 border rounded-lg bg-surface border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold font-heading text-text-primary">
                  Products
                </h2>
              </div>

              {/* Products Content */}
              <div className="p-6">
                <MyListings />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
