"use client";
import React, { useEffect, useState } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import { useRouter } from "next/navigation";
import { VendorData } from "@/types/vendor/storefront";
import MyListings from "./components/Listing";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { userService } from "@/services/userService";

const VendorProfile: React.FC = () => {
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const router = useRouter();

  const {
    location,
    loading: locationLoading,
    refresh: getCurrentLocation,
  } = useLocationDetection();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getUserProfile();
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
    location: location ? `${location.state}, ${location.country}` : "San Francisco, CA",
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
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
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

        <div className="px-4 py-4 border-b bg-surface border-border">
          <h2 className="text-lg font-semibold font-heading text-text-primary">
            Products
          </h2>
        </div>

        <div className="p-4">
          <MyListings />
        </div>
      </div>

      <div className="hidden px-6 py-8 mx-auto md:block max-w-7xl">
        <div className="grid grid-cols-12 gap-4">
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

              <div className="mb-6">
                <h3 className="mb-2 text-sm font-medium text-text-primary">
                  About
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {userProfile.bio}
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-8">
            <div className="mb-6 border rounded-lg bg-surface border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold font-heading text-text-primary">
                  Products
                </h2>
              </div>

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
