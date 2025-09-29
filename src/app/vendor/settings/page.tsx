"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Bell,
  Shield,
  Lock,
  CreditCard,
  HelpCircle,
  Mail,
  Phone,
  Check,
  ChevronRight,
  Key,
  Trash2,
  MessageCircle,
  FileText,
  Info,
  Building2,
  User,
  ShieldCheck,
} from "lucide-react";

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  joinDate: string;
  isVerified: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  stats: {
    itemsListed: number;
    purchasesMade: number;
    sellerRating: number;
    totalReviews: number;
  };
  bio: string;
}
interface VendorData {
  business_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  isVerified?: boolean;
  phone?: string;
}

interface SettingsState {
  location: {
    homeAddress: string;
    searchRadius: number;
    autoLocation: boolean;
    showExactLocation: boolean;
  };
  notifications: {
    newMessages: boolean;
    priceDrops: boolean;
    newListings: boolean;
    orderUpdates: boolean;
    marketingEmails: boolean;
    pushNotifications: boolean;
  };
  privacy: {
    profileVisibility: "public" | "buyers" | "private";
    showOnlineStatus: boolean;
    allowContactFromBuyers: boolean;
    showRatingsPublicly: boolean;
  };
  account: {
    twoFactorAuth: boolean;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    test?: any;
  };
}

type SettingSectionKey = keyof SettingsState;

const Settings = () => {
  const [settings, setSettings] = useState<SettingsState>({
    location: {
      homeAddress: "123 Main St, San Francisco, CA 94102",
      searchRadius: 10,
      autoLocation: false,
      showExactLocation: false,
    },
    notifications: {
      newMessages: true,
      priceDrops: true,
      newListings: false,
      orderUpdates: true,
      marketingEmails: false,
      pushNotifications: true,
    },
    privacy: {
      profileVisibility: "public",
      showOnlineStatus: true,
      allowContactFromBuyers: true,
      showRatingsPublicly: true,
    },
    account: {
      twoFactorAuth: false,
    },
  });

  const [activeSection, setActiveSection] = useState("location");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
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
        console.error("Error fetching vendor profile:", err);
      }
    };

    fetchProfile();
  }, []);
  // Function to get user's current location
  const getCurrentLocation = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by this browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Use reverse geocoding to get address
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            if (!response.ok) {
              throw new Error("Failed to get address");
            }

            const data = await response.json();
            const address = `${data.locality || ""}, ${
              data.principalSubdivision || ""
            } ${data.postcode || ""}`.trim();
            resolve(
              address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            );
          } catch (error) {
            // If reverse geocoding fails, just use coordinates
            resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        },
        (error) => {
          let errorMessage = "Unable to retrieve location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          reject(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  };

  // Auto-fetch location when autoLocation is enabled
  useEffect(() => {
    if (settings.location.autoLocation) {
      setLocationLoading(true);
      setLocationError(null);

      getCurrentLocation()
        .then((address) => {
          setSettings((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              homeAddress: address,
            },
          }));
          setLocationLoading(false);
        })
        .catch((error) => {
          setLocationError(error);
          setLocationLoading(false);
          // Turn off auto-location if it fails
          setSettings((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              autoLocation: false,
            },
          }));
        });
    }
  }, [settings.location.autoLocation]);

  const handleSettingChange = (
    section: SettingSectionKey,
    key: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as SettingSectionKey],
        [key]: value,
      },
    }));
  };

  const handleAutoLocationToggle = () => {
    const newAutoLocation = !settings.location.autoLocation;

    if (newAutoLocation) {
      // Clear any previous errors when enabling
      setLocationError(null);
    }

    handleSettingChange("location", "autoLocation", newAutoLocation);
  };

  const handleManualLocationUpdate = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const address = await getCurrentLocation();
      setSettings((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          homeAddress: address,
        },
      }));
    } catch (error) {
      setLocationError(error as string);
    } finally {
      setLocationLoading(false);
    }
  };

  interface Section {
    id: string;
    label: string;
    icon: React.ElementType;
  }

  const sections: Section[] = [
    { id: "location", label: "Location", icon: MapPin },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "account", label: "Account Security", icon: Lock },
    { id: "payment", label: "Payment Methods", icon: CreditCard },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ];

  const renderLocationSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Home Address
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={
              locationLoading
                ? "Getting location..."
                : settings.location.homeAddress
            }
            onChange={(e) =>
              handleSettingChange("location", "homeAddress", e.target.value)
            }
            disabled={settings.location.autoLocation || locationLoading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {!settings.location.autoLocation && (
            <button
              onClick={handleManualLocationUpdate}
              disabled={locationLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locationLoading ? "Getting..." : "Update"}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1">
          This helps us show you the most relevant nearby products
        </p>
        {locationError && (
          <p className="text-xs text-red-600 mt-1">{locationError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Default Search Radius: {settings.location.searchRadius} miles
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={settings.location.searchRadius}
          onChange={(e) =>
            handleSettingChange(
              "location",
              "searchRadius",
              parseInt(e.target.value)
            )
          }
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>1 mile</span>
          <span>50 miles</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Auto-detect Location
            </h4>
            <p className="text-xs text-gray-600">
              Automatically use your current location for searches
            </p>
          </div>
          <button
            onClick={handleAutoLocationToggle}
            disabled={locationLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${
              settings.location.autoLocation ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                settings.location.autoLocation
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Show Exact Location
            </h4>
            <p className="text-xs text-gray-600">
              Display your precise location to other users
            </p>
          </div>
          <button
            onClick={() =>
              handleSettingChange(
                "location",
                "showExactLocation",
                !settings.location.showExactLocation
              )
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              settings.location.showExactLocation
                ? "bg-blue-600"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                settings.location.showExactLocation
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {!settings.location.autoLocation && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <MapPin
                size={20}
                className="text-blue-600 mt-0.5 flex-shrink-0"
              />
              <div>
                <h4 className="text-sm font-medium text-blue-900">
                  Enable Auto-Location
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Turn on auto-location to automatically update your address and
                  get more accurate search results.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {Object.entries(settings.notifications).map(([key, value]) => {
        const labels: { [key: string]: { title: string; desc: string } } = {
          newMessages: {
            title: "New Messages",
            desc: "When someone sends you a message",
          },
          priceDrops: {
            title: "Price Drops",
            desc: "When items in your wishlist drop in price",
          },
          newListings: {
            title: "New Listings",
            desc: "When new items match your saved searches",
          },
          orderUpdates: {
            title: "Order Updates",
            desc: "Shipping and delivery notifications",
          },
          marketingEmails: {
            title: "Marketing Emails",
            desc: "Promotional offers and updates",
          },
          pushNotifications: {
            title: "Push Notifications",
            desc: "Browser notifications for important updates",
          },
        };

        return (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {labels[key].title}
              </h4>
              <p className="text-xs text-gray-600">{labels[key].desc}</p>
            </div>
            <button
              onClick={() => handleSettingChange("notifications", key, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                value ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Profile Visibility
        </label>
        <select
          value={settings.privacy.profileVisibility}
          onChange={(e) =>
            handleSettingChange("privacy", "profileVisibility", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        >
          <option value="public">Public - Anyone can see your profile</option>
          <option value="buyers">
            Buyers Only - Only people you're selling to
          </option>
          <option value="private">
            Private - Only you can see your profile
          </option>
        </select>
      </div>

      <div className="space-y-4">
        {Object.entries(settings.privacy)
          .filter(([key]) => key !== "profileVisibility")
          .map(([key, value]) => {
            const labels: { [key: string]: { title: string; desc: string } } = {
              showOnlineStatus: {
                title: "Show Online Status",
                desc: "Let others see when you're active",
              },
              allowContactFromBuyers: {
                title: "Allow Contact from Buyers",
                desc: "Let potential buyers message you directly",
              },
              showRatingsPublicly: {
                title: "Show Ratings Publicly",
                desc: "Display your seller rating on your profile",
              },
            };

            return (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {labels[key].title}
                  </h4>
                  <p className="text-xs text-gray-600">{labels[key].desc}</p>
                </div>
                <button
                  onClick={() => handleSettingChange("privacy", key, !value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    value ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-4">
      {vendorData ? (
        <>
          {/* Business Name */}
          <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <Building2 size={20} className="text-gray-600" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Business</h4>
                <p className="text-xs text-gray-600">
                  {vendorData.business_name ?? "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <User size={20} className="text-gray-600" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Name</h4>
                <p className="text-xs text-gray-600">
                  {vendorData.first_name} {vendorData.last_name}
                </p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-gray-600" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Email</h4>
                <p className="text-xs text-gray-600">{vendorData.email}</p>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <Phone size={20} className="text-gray-600" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Phone</h4>
                <p className="text-xs text-gray-600">
                  {vendorData.phone ?? "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <ShieldCheck size={20} className="text-gray-600" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Status</h4>
                <p className="text-xs text-gray-600">
                  Vendor account verification status
                </p>
              </div>
            </div>
            {vendorData.isVerified ? (
              <div className="flex items-center space-x-1 text-green-600">
                <ShieldCheck size={16} />
                <span className="text-sm">Verified</span>
              </div>
            ) : (
              <span className="text-sm text-red-600">Not Verified</span>
            )}
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm">Loading profile...</p>
      )}
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard size={24} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Payment Methods
        </h3>
        <p className="text-gray-600 mb-6">
          Add a payment method to make purchases easier and faster.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
          Add Payment Method
        </button>
      </div>
    </div>
  );

  const renderHelpSettings = () => (
    <div className="space-y-3">
      {[
        { icon: MessageCircle, label: "Contact Support" },
        { icon: FileText, label: "Terms of Service" },
        { icon: Shield, label: "Privacy Policy" },
        { icon: Info, label: "About ProductFinder" },
      ].map((item, index) => (
        <button
          key={index}
          className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <item.icon size={20} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                {item.label}
              </span>
            </div>
            <ChevronRight size={16} className="text-gray-600" />
          </div>
        </button>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "location":
        return renderLocationSettings();
      case "notifications":
        return renderNotificationSettings();
      case "privacy":
        return renderPrivacySettings();
      case "account":
        return renderAccountSettings();
      case "payment":
        return renderPaymentSettings();
      case "help":
        return renderHelpSettings();
      default:
        return renderLocationSettings();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Mobile: Dropdown Section Selector */}
      <div className="md:hidden">
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        >
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: Tab Navigation */}
      <div className="hidden md:block">
        <div className="flex items-center justify-center space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-8 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeSection === section.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <IconComponent size={16} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="justify-self-center w-full md:w-2/3 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {sections.find((s) => s.id === activeSection)?.label}
        </h3>
        {renderContent()}
      </div>
    </div>
  );
};

export default Settings;
