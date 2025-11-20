"use client";
import React, { useState, useEffect } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import MyListings from "./components/MyListings";
import PurchaseHistory from "./components/PurchaseHistory";
import SavedItems from "./components/SavedItems";
import Settings from "./components/Settings";
import { useRouter } from "next/navigation";
import { QuickAction, Tab, UserProfileData } from "@/types/userProfile";
import {
  getUserProfile,
  uploadProfilePicture,
  logout,
} from "@/services/api";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState<string>("listings");
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleProfilePictureUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profile_pic", file);

      const response = await uploadProfilePicture(formData);

      if (response.data.profile_pic_url) {
        alert("Profile picture updated successfully!");
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
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      handleProfilePictureUpload(file);
    }
  };
  useEffect(() => {
    const token = sessionStorage.getItem("RSToken");
    const savedUser = sessionStorage.getItem("RSUser");

    if (!token) {
      console.error("No token found in sessionStorage");
      setLoading(false);
      router.push("/auth/signup"); // Redirect to create account page if not logged in
      return;
    }

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
      }
    }

    getUserProfile()
      .then(response => {
        setUser(response.data);
        sessionStorage.setItem("RSUser", JSON.stringify(response.data));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = (): void => {
    logout();
  };

  // Default avatar URL
  const defaultAvatar =
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face";

  // Create user profile object with fetched data or defaults
  const userProfile = user
    ? {
        id: user.id,
        name: user.name || user.business_name || "User",
        email: user.email,
        phone: user.phone || "Not provided",
        avatar: defaultAvatar, // You can add avatar field to API response later
        location:
          user.state && user.country
            ? `${user.state}, ${user.country}`
            : user.country || "Location not set",
        joinDate: "March 2023", // You can add this field to API response
        isVerified: {
          email: true, // You can determine this from API response
          phone: !!user.phone,
          identity: false,
        },
        stats: {
          itemsListed: 24, // These should come from API
          purchasesMade: 18,
          sellerRating: 4.8,
          totalReviews: 32,
        },
        bio: `Member of our marketplace community. ${
          user.role ? `Role: ${user.role}` : ""
        }`,
      }
    : null;

  const tabs: Tab[] = [
    {
      id: "listings",
      label: "My Listings",
      icon: "Package",
      count: userProfile?.stats.itemsListed,
    },
    {
      id: "history",
      label: "Purchase History",
      icon: "ShoppingBag",
      count: userProfile?.stats.purchasesMade,
    },
    { id: "saved", label: "Saved Items", icon: "Heart", count: 12 },
    { id: "settings", label: "Settings", icon: "Settings" },
  ];

  const quickActions: QuickAction[] = [
    {
      id: "list-item",
      label: "List New Item",
      icon: "Plus",
      color: "bg-primary text-white",
      action: () => router.push("/vendor/dashboard/"),
    },
    {
      id: "messages",
      label: "Messages",
      icon: "MessageCircle",
      color: "bg-secondary text-primary",
      badge: 3,
    },
    {
      id: "account-settings",
      label: "Account Settings",
      icon: "User",
      color: "bg-surface border border-border text-text-primary",
    },
    {
      id: "logout",
      label: "Logout",
      icon: "LogOut",
      color: "bg-error text-white",
      action: handleLogout,
    },
  ];

  const renderTabContent = () => {
    if (!userProfile) return null;

    switch (activeTab) {
      case "history":
        return <PurchaseHistory />;
      case "saved":
        return <SavedItems />;
      case "settings":
        return <Settings userProfile={userProfile} />;
      default:
        return <PurchaseHistory />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state - no user data
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Icon
            name="AlertCircle"
            size={48}
            className="mx-auto mb-4 text-error"
          />
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            Unable to load profile
          </h2>
          <p className="mb-4 text-text-secondary">
            There was an error loading your profile data.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="md:hidden">
        <div className="px-4 py-6 border-b bg-surface border-border">
          <div className="flex items-center mb-4 space-x-4">
            <div className="relative w-16 h-16">
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
                  className="object-cover rounded-full"
                  sizes="64px"
                />
                {userProfile.isVerified.email && (
                  <div className="absolute flex items-center justify-center w-6 h-6 rounded-full -bottom-1 -right-1 bg-primary">
                    <Icon name="Check" size={12} className="text-white" />
                  </div>
                )}
                {/* Upload overlay */}
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black bg-opacity-0 rounded-full group-hover:bg-opacity-50">
                  <Icon
                    name="Camera"
                    size={20}
                    className="text-white transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                  />
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <Icon
                      name="Loader2"
                      size={20}
                      className="text-white animate-spin"
                    />
                  </div>
                )}
              </div>
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
              <div className="flex items-center space-x-1 text-sm text-text-secondary">
                <Icon name="MapPin" size={14} />
                <span>{userProfile.location}</span>
              </div>
              <p className="mt-1 text-xs text-text-tertiary">
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
                  className="text-orange-500 fill-current"
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

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={action.action}
                className={`relative p-3 rounded-lg transition-colors duration-200 ${action.color} hover:opacity-90`}
              >
                <Icon name={action.icon} size={18} className="mx-auto mb-1" />
                <span className="block text-xs font-medium">
                  {action.label}
                </span>
                {action.badge && (
                  <div className="absolute flex items-center justify-center w-5 h-5 text-xs text-white rounded-full -top-1 -right-1 bg-accent">
                    {action.badge}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b bg-surface border-border">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
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
      <div className="hidden px-6 py-8 mx-auto md:block max-w-7xl">
        <div className="grid grid-cols-12 gap-8">
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
                <div className="flex items-center justify-center mt-2 space-x-1 text-text-secondary">
                  <Icon name="MapPin" size={16} />
                  <span>{userProfile.location}</span>
                </div>
                <p className="mt-1 text-sm text-text-tertiary">
                  Member since {userProfile.joinDate}
                </p>
                {user?.referral_code && (
                  <div className="p-2 mt-3 rounded-lg bg-primary-50">
                    <p className="text-xs text-text-secondary">Referral Code</p>
                    <p className="font-mono text-sm font-semibold text-primary">
                      {user.referral_code}
                    </p>
                  </div>
                )}
              </div>

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
                    <button className="text-xs text-primary hover:underline">
                      Verify now
                    </button>
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
                {user?.role && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-50 text-primary">
                      {user.role}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`relative w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${action.color} hover:opacity-90`}
                  >
                    <Icon name={action.icon} size={18} />
                    <span className="font-medium">{action.label}</span>
                    {action.badge && (
                      <div className="absolute flex items-center justify-center w-5 h-5 text-xs text-white rounded-full top-2 right-2 bg-accent">
                        {action.badge}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="p-6 border rounded-lg bg-surface border-border">
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
                    <Icon
                      name="Star"
                      size={16}
                      className="text-orange-500 fill-current"
                    />
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
            <div className="mb-6 border rounded-lg bg-surface border-border">
              <div className="flex border-b border-border">
                {tabs.map(tab => (
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
      {/* Hidden file input */}
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
