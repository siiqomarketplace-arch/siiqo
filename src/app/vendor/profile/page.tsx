"use client";
import React, { useEffect, useState } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import MyListings from "./components/MyListings";
import Settings from "./components/Settings";
import { useRouter } from "next/navigation";
import { LucideIconName } from "@/components/ui/AppIcon";
import { vendorService } from "@/services/vendorService";
import { useAuth } from "@/context/AuthContext";

// --- Interfaces ---
interface Tab {
  id: string;
  label: string;
  icon: LucideIconName;
  count?: number;
}
interface QuickAction {
  id: string;
  label: string;
  icon: LucideIconName;
  color: string;
  action?: () => void;
  badge?: number;
}
interface VendorData {
  business_name?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  isVerified?: boolean;
  phone?: string;
  created_at?: string;
  address?: string;
  bio?: string;
  profile_pic?: string;
  kyc_status?: string;
  state?: string;
  country?: string;
}
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
import { locationService } from "@/services/locationService";
import VendorDashboard from "../dashboard/page";
import VendorProfile from "@/app/seller-details/page";

// --- Hook for location ---
const useAutoLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);

  const getAddressFromCoordinates = async (lat: number, lon: number) => {
    try {
      const data = await locationService.getAddressFromCoordinates(lat, lon);
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
      async (pos) => {
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
      (err) => {
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
interface UploadProfilePicResponse {
  profile_pic_url: string;
}

// --- Main Component ---
const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("listings");
  const { user: vendorData } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleProfilePictureUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const response = await vendorService.getVendorProfile();
      const data = response.data as UploadProfilePicResponse;

      // Update the user profile with new avatar URL if returned
      if (data.profile_pic_url) {
        // Update your userProfile state or refetch profile data
        // You might want to update vendorData state here
        alert("Profile picture updated successfully!");
        // Optionally refresh the profile data
        window.location.reload();
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      handleProfilePictureUpload(file);
    }
  };
  const {
    location,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
    clearLocation,
  } = useAutoLocation();



  // --- Profile Fallback ---
  const userProfile = {
    id: 1,
    name:
      vendorData?.business_name ||
      vendorData?.name ||
      "",
    email: vendorData?.email || "",
    phone: vendorData?.phone || "",
    avatar: vendorData?.profile_pic ||
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    location: `${vendorData?.state || ""}${vendorData?.state && vendorData?.country ? ", " : ""}${vendorData?.country || ""}` || location?.fullAddress || "Not set",
    joinDate: vendorData?.created_at
      ? new Date(vendorData.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        })
      : "Not set",
    isVerified: {
      email: vendorData?.kyc_status === "verified",
      phone: true,
      identity: false,
    },
    stats: {
      itemsListed: 24,
      purchasesMade: 18,
      sellerRating: 4.8,
      totalReviews: 32,
    },
    bio: vendorData?.bio || "No bio yet.",
  };

  const tabs: Tab[] = [
    {
      id: "listings",
      label: "My Listings",
      icon: "Package",
      count: userProfile.stats.itemsListed,
    },
    { id: "settings", label: "Settings", icon: "Settings" },
  ];

  const quickActions: QuickAction[] = [
    {
      id: "list-item",
      label: "List New Item",
      icon: "Plus",
      color: "bg-primary text-white",
      action: () => router.push("/create-listing"),
    },
    {
      id: "messages",
      label: "Messages",
      icon: "MessageCircle",
      color: "bg-secondary text-white",
      badge: 3,
    },
    {
      id: "account-settings",
      label: "Account Settings",
      icon: "User",
      color: "bg-surface border border-border text-text-primary",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "listings":
        return <MyListings />;
      case "settings":
        return <Settings userProfile={userProfile} />;
      default:
        return <MyListings />;
    }
  };

  // Location display component
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
          className="text-xs text-primary hover:underline ml-1"
          title="Update location"
        >
          📍
        </button>
      )}
      {location && (
        <button
          onClick={clearLocation}
          className="text-xs text-gray-400 hover:text-red-500 ml-1"
          title="Clear location"
        >
          ✕
        </button>
      )}
    </div>
  );

  return (

    <VendorProfile />
  );
};

export default UserProfile;
