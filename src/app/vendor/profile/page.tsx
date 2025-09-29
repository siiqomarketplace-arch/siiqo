"use client";
import React, { useEffect, useState } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import MyListings from "./components/MyListings";
import Settings from "./components/Settings";
import { useRouter } from "next/navigation";
import { LucideIconName } from "@/components/ui/AppIcon";

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
  first_name?: string;
  last_name?: string;
  email?: string;
  isVerified?: boolean;
  phone?: string;
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

// --- Main Component ---
const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("listings");
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleProfilePictureUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profile_pic", file);

      const token = localStorage.getItem("vendorToken");

      const response = await fetch(
        "https://server.bizengo.com/api/upload-profile-pic",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();

      // Update the user profile with new avatar URL if returned
      if (result.profile_pic_url) {
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

  // --- Profile Fallback ---
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
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="bg-surface border-b border-border px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            {/* For mobile layout - replace the existing avatar div */}
            <div
              className="relative w-16 h-16 cursor-pointer group"
              onClick={() =>
                document.getElementById("profile-pic-input")?.click()
              }
            >
              <Image
                src={userProfile.avatar}
                alt={userProfile.name}
                fill
                className="rounded-full object-cover"
                sizes="64px"
              />
              {userProfile.isVerified.email && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Check" size={12} className="text-white" />
                </div>
              )}
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all duration-200">
                <Icon
                  name="Camera"
                  size={20}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Icon
                    name="Loader2"
                    size={20}
                    className="text-white animate-spin"
                  />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-heading font-semibold text-text-primary">
                {userProfile.name}
              </h1>
              <LocationDisplay />
              <p className="text-text-tertiary text-xs mt-1">
                Member since {userProfile.joinDate}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                {userProfile.stats.itemsListed}
              </div>
              <div className="text-xs text-text-secondary">Listed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                {userProfile.stats.purchasesMade}
              </div>
              <div className="text-xs text-text-secondary">Purchased</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Icon
                  name="Star"
                  size={14}
                  className="text-warning fill-current"
                />
                <span className="text-lg font-semibold text-text-primary">
                  {userProfile.stats.sellerRating}
                </span>
              </div>
              <div className="text-xs text-text-secondary">
                ({userProfile.stats.totalReviews} reviews)
              </div>
            </div>
          </div>

          {/* Location Error Display */}
          {locationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-red-500" />
                <span className="text-sm text-red-700">
                  {locationError.message}
                </span>
                <button
                  onClick={getCurrentLocation}
                  className="text-xs text-red-600 hover:underline ml-auto"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className={`relative p-3 rounded-lg transition-colors duration-200 ${action.color} hover:opacity-90`}
              >
                <Icon name={action.icon} size={18} className="mx-auto mb-1" />
                <span className="text-xs font-medium block">
                  {action.label}
                </span>
                {action.badge && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                    {action.badge}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-surface border-b border-border">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-primary text-primary bg-primary-50"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id
                        ? "bg-primary text-white"
                        : "bg-surface-secondary text-text-secondary"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">{renderTabContent()}</div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="col-span-4">
            <div className="bg-surface rounded-lg border border-border p-6 mb-6">
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto">
                  <Image
                    fill
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="object-cover"
                    sizes="96px"
                  />
                  {userProfile.isVerified.email && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="Check" size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-heading font-semibold text-text-primary mt-4">
                  {userProfile.name}
                </h1>
                <LocationDisplay className="justify-center mt-2" />
                <p className="text-text-tertiary text-sm mt-1">
                  Member since {userProfile.joinDate}
                </p>
              </div>

              {/* Location Error Display */}
              {locationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
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
                    className="text-xs text-red-600 hover:underline mt-2"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Verification Badges */}
              <div className="space-y-2 mb-6">
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
                    <button className="text-xs text-primary hover:underline">
                      Verify now
                    </button>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-primary mb-2">
                  About
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {userProfile.bio}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`relative w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${action.color} hover:opacity-90`}
                  >
                    <Icon name={action.icon} size={18} />
                    <span className="font-medium">{action.label}</span>
                    {action.badge && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                        {action.badge}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
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
                      className="text-secondary"
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
                    <Icon name="Star" size={16} className="text-warning" />
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
            </div>
          </div>

          {/* Right Content Area */}
          <div className="col-span-8">
            {/* Tab Navigation */}
            <div className="bg-surface rounded-lg border border-border mb-6">
              <div className="flex border-b border-border">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "border-primary text-primary bg-primary-50"
                        : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                    }`}
                  >
                    <Icon name={tab.icon} size={18} />
                    <span className="font-medium">{tab.label}</span>
                    {tab.count && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          activeTab === tab.id
                            ? "bg-primary text-white"
                            : "bg-surface-secondary text-text-secondary"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">{renderTabContent()}</div>
            </div>
          </div>
        </div>
      </div>
      <input
        id="profile-pic-input"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default UserProfile;
