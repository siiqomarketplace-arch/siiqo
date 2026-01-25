"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
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
  ChevronDown,
  Link,
  Edit2,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { userService } from "@/services/userService";
import {
  UserProfileData,
  VendorData,
  SettingsState,
} from "@/types/vendor/settings";
import { vendorService } from "@/services/vendorService";
import MapboxAutocomplete from "@/components/MapboxAutocomplete";
import { switchMode } from "@/services/api";
type SettingSectionKey = keyof SettingsState;

interface SettingsProps {
  isReadOnly?: boolean; // When true, account section won't be editable
}

const Settings: React.FC<SettingsProps> = ({ isReadOnly = false }) => {
  // Initialize settings with accountData location if available, fallback to localStorage
  const [settings, setSettings] = useState<SettingsState>(() => {
    if (typeof window !== "undefined") {
      const savedLocation = localStorage.getItem("siiqo_location_settings");
      if (savedLocation) {
        try {
          const parsedLocation = JSON.parse(savedLocation);
          return {
            location: parsedLocation,
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
          };
        } catch (error) {
          console.error("Error parsing saved location settings:", error);
        }
      }
    }
    return {
      location: {
        homeAddress: "",
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
    };
  });

  const [activeSection, setActiveSection] = useState("location");
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [accountData, setAccountData] = useState<any>(null);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedAccountData, setEditedAccountData] = useState<any>(null);
  const [editedFinancialData, setEditedFinancialData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    location: autoDetectedLocation,
    loading: isAutoLocationLoading,
    refresh: getCurrentLocation,
  } = useLocationDetection();

  const [isManualLocationLoading, setManualLocationLoading] = useState(false);

  // Save location settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "siiqo_location_settings",
        JSON.stringify(settings.location)
      );
    }
  }, [settings.location]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await vendorService.getVendorProfile();
        setVendorData(data);
      } catch (err) {
        console.error("Error fetching vendor profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // Fetch dashboard settings (financial, account, and store data)
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingFinancials(true);
      setLoadingAccount(true);
      try {
        const response = await vendorService.getDashboardStats();
        if (response.data) {
          // Set financial data
          if (response.data.financials) {
            setFinancialData(response.data.financials);
          }

          // Set account data with financials included
          const data = {
            personal_info: response.data.personal_info,
            store_settings: response.data.store_settings,
            financials: response.data.financials,
          };
          setAccountData(data);

          // Update location settings from store_settings if available
          if (response.data.store_settings?.address) {
            setSettings((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                homeAddress: response.data.store_settings.address,
              },
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoadingFinancials(false);
        setLoadingAccount(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    switchMode("vendor");
  }, []);

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

  // Account edit mode handlers
  const handleAccountEditToggle = () => {
    if (!isEditMode) {
      // Enter edit mode - copy current data
      setEditedAccountData(JSON.parse(JSON.stringify(accountData)));
    }
    setIsEditMode(!isEditMode);
  };

  const handleAccountEditChange = (path: string, value: any) => {
    setEditedAccountData((prev: any) => {
      const keys = path.split(".");
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;

      // Navigate to the nested property
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleSaveAccountChanges = async () => {
    if (!editedAccountData) {
      toast.error("Missing data");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();

      // Add only basic personal info
      if (editedAccountData.personal_info?.fullname) {
        formData.append("fullname", editedAccountData.personal_info.fullname);
      }
      if (editedAccountData.personal_info?.phone) {
        formData.append("phone", editedAccountData.personal_info.phone);
      }

      // Add store settings data
      if (editedAccountData.store_settings?.business_name) {
        formData.append(
          "business_name",
          editedAccountData.store_settings.business_name
        );
      }
      if (editedAccountData.store_settings?.description) {
        formData.append(
          "description",
          editedAccountData.store_settings.description
        );
      }
      if (editedAccountData.store_settings?.website) {
        formData.append("website", editedAccountData.store_settings.website);
      }

      // Add financial data
      if (editedAccountData.financials?.bank_name) {
        formData.append("bank_name", editedAccountData.financials.bank_name);
      }
      if (editedAccountData.financials?.account_number) {
        formData.append(
          "account_number",
          editedAccountData.financials.account_number
        );
      }
      if (editedAccountData.financials?.wallet_address) {
        formData.append(
          "wallet_address",
          editedAccountData.financials.wallet_address
        );
      }
      if (editedAccountData.financials?.business_address) {
        formData.append(
          "business_address",
          editedAccountData.financials.business_address
        );
      }

      console.log("Sending FormData:", {
        fullname: editedAccountData.personal_info?.fullname,
        phone: editedAccountData.personal_info?.phone,
        business_name: editedAccountData.store_settings?.business_name,
        description: editedAccountData.store_settings?.description,
        website: editedAccountData.store_settings?.website,
        bank_name: editedAccountData.financials?.bank_name,
        account_number: editedAccountData.financials?.account_number,
        wallet_address: editedAccountData.financials?.wallet_address,
        business_address: editedAccountData.financials?.business_address,
      });

      // Call API
      const response = await vendorService.updateVendorSettings(formData);

      if (response.status === "success" || response.data) {
        // Update local state with new data
        setAccountData(editedAccountData);
        setFinancialData(editedAccountData.financials);
        setIsEditMode(false);
        toast.success("Settings updated successfully!");
      } else {
        toast.error("Failed to update settings... Please try again.");
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(error.response?.data?.message || "Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoLocationToggle = async () => {
    const newAutoLocation = !settings.location.autoLocation;

    if (newAutoLocation) {
      const address = await getCurrentLocation();
      setSettings((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          homeAddress: address,
          autoLocation: newAutoLocation,
        },
      }));
    } else {
      handleSettingChange("location", "autoLocation", newAutoLocation);
    }
  };

  // Auto-sync address in real-time when autoLocation is enabled
  useEffect(() => {
    if (settings.location.autoLocation && autoDetectedLocation) {
      const addressString =
        typeof autoDetectedLocation === "string"
          ? autoDetectedLocation
          : `${autoDetectedLocation.state}, ${autoDetectedLocation.country}`;
      setSettings((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          homeAddress: addressString,
        },
      }));
    }
  }, [autoDetectedLocation, settings.location.autoLocation]);

  // Kick off detection when toggled on
  useEffect(() => {
    if (settings.location.autoLocation) {
      getCurrentLocation();
    }
  }, [settings.location.autoLocation]);

  const handleManualLocationUpdate = async () => {
    setManualLocationLoading(true);

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
      console.error("Error getting location:", error);
    } finally {
      setManualLocationLoading(false);
    }
  };

  // Save location to vendor store settings on the backend
  const saveLocationToBackend = async (address: string) => {
    try {
      await vendorService.updateVendorSettings({ address });
      // Update local accountData to reflect the change
      if (accountData?.store_settings) {
        setAccountData((prev: any) => ({
          ...prev,
          store_settings: {
            ...prev.store_settings,
            address: address,
          },
        }));
      }
    } catch (error) {
      console.error("Error saving location to backend:", error);
    }
  };

  // Debounce location changes to save to backend
  useEffect(() => {
    const timer = setTimeout(() => {
      if (settings.location.homeAddress && accountData?.store_settings) {
        // Only save if the location has actually changed from what's on the backend
        if (
          settings.location.homeAddress !== accountData.store_settings?.address
        ) {
          saveLocationToBackend(settings.location.homeAddress);
        }
      }
    }, 1500); // Save after 1.5 seconds of inactivity

    return () => clearTimeout(timer);
  }, [settings.location.homeAddress]);

  // Edit mode handlers
  const handleEditToggle = () => {
    if (!isEditMode) {
      // Enter edit mode - copy current data
      setEditedAccountData(JSON.parse(JSON.stringify(accountData)));
      setEditedFinancialData(JSON.parse(JSON.stringify(financialData)));
    }
    setIsEditMode(!isEditMode);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedAccountData(null);
    setEditedFinancialData(null);
  };

  const handleEditChange = (section: string, key: string, value: any) => {
    if (section === "account") {
      setEditedAccountData((prev: any) => ({
        ...prev,
        [key.split(".")[0]]: {
          ...(prev?.[key.split(".")[0]] || {}),
          [key.split(".")[1]]: value,
        },
      }));
    } else if (section === "financial") {
      setEditedFinancialData((prev: any) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleSaveChanges = async () => {
    if (!editedAccountData) {
      toast.error("Missing data");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();

      // Add personal info data
      if (editedAccountData.personal_info?.fullname)
        formData.append("fullname", editedAccountData.personal_info.fullname);
      // Note: Email is not editable and should not be sent
      if (editedAccountData.personal_info?.phone)
        formData.append("phone", editedAccountData.personal_info.phone);

      // Add store settings data
      if (editedAccountData.store_settings?.business_name)
        formData.append(
          "business_name",
          editedAccountData.store_settings.business_name
        );
      if (editedAccountData.store_settings?.description)
        formData.append(
          "description",
          editedAccountData.store_settings.description
        );
      if (editedAccountData.store_settings?.website)
        formData.append("website", editedAccountData.store_settings.website);

      // Add financial data from editedAccountData
      if (editedAccountData.financials?.bank_name)
        formData.append("bank_name", editedAccountData.financials.bank_name);
      if (editedAccountData.financials?.account_number)
        formData.append(
          "account_number",
          editedAccountData.financials.account_number
        );
      if (editedAccountData.financials?.wallet_address)
        formData.append(
          "wallet_address",
          editedAccountData.financials.wallet_address
        );
      if (editedAccountData.financials?.business_address)
        formData.append(
          "business_address",
          editedAccountData.financials.business_address
        );

      console.log("Sending FormData to backend");

      // Call API
      const response = await vendorService.updateVendorSettings(formData);

      if (response.status === "success" || response.data) {
        // Update local state with new data
        setAccountData(editedAccountData);
        setFinancialData(editedAccountData.financials);
        setIsEditMode(false);
        toast.success("Settings updated successfully!");
      } else {
        toast.error("Failed to update settings... Please try again.");
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(error.response?.data?.message || "Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  interface Section {
    id: string;
    label: string;
    icon: React.ElementType;
    description?: string;
  }

  const sections: Section[] = [
    { id: "location", label: "Location", icon: MapPin },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "account", label: "Account", icon: User }, // Changed Icon for clarity
    { id: "payment", label: "Payments", icon: CreditCard },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  // --- Render Sections ---

  const renderLocationSettings = () => (
    <div className="space-y-3 sm:space-y-4 md:space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Home Address
        </label>
        <MapboxAutocomplete
          value={
            isAutoLocationLoading || isManualLocationLoading
              ? "Detecting location..."
              : settings.location.homeAddress
          }
          onChange={(value, coordinates, details) => {
            handleSettingChange("location", "homeAddress", value);
            if (coordinates && details) {
              // Optionally store coordinates for proximity sorting
              localStorage.setItem(
                "user_coordinates",
                JSON.stringify(coordinates)
              );
            }
          }}
          onDetectLocation={handleManualLocationUpdate}
          isDetecting={isManualLocationLoading}
          disabled={settings.location.autoLocation || isAutoLocationLoading}
          placeholder="Type to search location (e.g., Nelocap estate, Lokogoma, Abuja)"
          showDetectButton={!settings.location.autoLocation}
        />
        <p className="text-xs text-gray-500 mt-2">
          This address is used to calculate shipping and show local products.
        </p>
        {settings.location.autoLocation && (
          <div className="mt-2 flex items-center gap-2 text-xs text-blue-700">
            {isAutoLocationLoading && (
              <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            <span>
              {isAutoLocationLoading
                ? "Auto-updating from device location..."
                : "Auto-updating from device location"}
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 sm:pt-4 border-t border-gray-100">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Search Radius:{" "}
          <span className="text-blue-600">
            {settings.location.searchRadius} miles
          </span>
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
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
          <span>1 mile</span>
          <span>50 miles</span>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors -mx-3 sm:-mx-4">
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm font-medium text-gray-900">
              Auto-detect Location
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Always update my location automatically
            </p>
          </div>
          <button
            onClick={handleAutoLocationToggle}
            disabled={isAutoLocationLoading}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.location.autoLocation ? "bg-blue-600" : "bg-slate-200"
            } ${isAutoLocationLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`pointer-events-none flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                settings.location.autoLocation
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            >
              {/* Subtle loader inside the toggle dot if loading */}
              {isAutoLocationLoading && (
                <div className="h-2 w-2 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              )}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors -mx-3 sm:-mx-4">
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm font-medium text-gray-900">
              Precise Location Visibility
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Allow other users to see your exact coordinates
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
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.location.showExactLocation
                ? "bg-blue-600"
                : "bg-slate-200"
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                settings.location.showExactLocation
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="px-3 sm:px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 sm:gap-3">
        <span className="px-2 sm:px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full whitespace-nowrap flex-shrink-0">
          Coming Soon
        </span>
        <p className="text-xs sm:text-sm text-yellow-700">
          Notification preferences are being prepared and will be available
          soon.
        </p>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {Object.entries(settings.notifications).map(([key, value], index) => {
          const labels: { [key: string]: { title: string; desc: string } } = {
            newMessages: {
              title: "New Messages",
              desc: "Direct messages from buyers/sellers",
            },
            priceDrops: {
              title: "Price Drops",
              desc: "Alerts when saved items get cheaper",
            },
            newListings: {
              title: "Saved Search Alerts",
              desc: "New items matching your interests",
            },
            orderUpdates: {
              title: "Order Status",
              desc: "Shipping, delivery, and returns",
            },
            marketingEmails: {
              title: "Promotions",
              desc: "Deals, discounts, and news",
            },
            pushNotifications: {
              title: "Push Notifications",
              desc: "Enable browser alerts",
            },
          };

          return (
            <div
              key={key}
              className={`flex items-center justify-between p-3 sm:p-4 rounded-xl transition-colors ${
                value ? "bg-blue-50/50" : "bg-transparent hover:bg-gray-50"
              }`}
            >
              <div className="pr-3 flex-1 min-w-0">
                <h4
                  className={`text-sm font-medium ${
                    value ? "text-blue-900" : "text-gray-900"
                  }`}
                >
                  {labels[key].title}
                </h4>
                <p
                  className={`text-xs mt-0.5 ${
                    value ? "text-blue-700" : "text-gray-500"
                  }`}
                >
                  {labels[key].desc}
                </p>
              </div>
              <button
                onClick={() =>
                  handleSettingChange("notifications", key, !value)
                }
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  value ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
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

  const renderPrivacySettings = () => (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="px-3 sm:px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 sm:gap-3">
        <span className="px-2 sm:px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full whitespace-nowrap flex-shrink-0">
          Coming Soon
        </span>
        <p className="text-xs sm:text-sm text-yellow-700">
          Privacy settings are being prepared and will be available soon.
        </p>
      </div>
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 opacity-50 pointer-events-none">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Profile Visibility
        </label>
        <select
          value={settings.privacy.profileVisibility}
          onChange={(e) =>
            handleSettingChange("privacy", "profileVisibility", e.target.value)
          }
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all outline-none"
        >
          <option value="public">Public (Recommended)</option>
          <option value="buyers">Buyers Only</option>
          <option value="private">Private</option>
        </select>
        <p className="text-xs text-gray-500 mt-2">
          Controls who can see your contact details and listings history.
        </p>
      </div>

      <div className="space-y-4 opacity-50 pointer-events-none">
        <h3 className="text-sm font-semibold text-gray-900 px-1">
          Interactions
        </h3>
        {Object.entries(settings.privacy)
          .filter(([key]) => key !== "profileVisibility")
          .map(([key, value]) => {
            const labels: { [key: string]: { title: string; desc: string } } = {
              showOnlineStatus: {
                title: "Show Online Status",
                desc: "Let others see when you're active",
              },
              allowContactFromBuyers: {
                title: "Direct Messaging",
                desc: "Allow buyers to start chats",
              },
              showRatingsPublicly: {
                title: "Public Ratings",
                desc: "Show seller rating on profile",
              },
            };

            return (
              <div
                key={key}
                className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {labels[key].title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {labels[key].desc}
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange("privacy", key, !value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    value ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {loadingAccount ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : accountData ? (
        <>
          {/* Read-Only Indicator */}
          {isReadOnly && (
            <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <Shield size={16} className="text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                <span className="font-semibold">View Only:</span> Account
                settings cannot be edited from this page. Visit vendor settings
                to make changes.
              </p>
            </div>
          )}

          {/* Edit Button */}
          {!isReadOnly && (
            <div className="flex justify-end gap-2 mb-4">
              {isEditMode ? (
                <>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAccountChanges}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAccountEditToggle}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit Information
                </button>
              )}
            </div>
          )}

          {/* Personal Information Section */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 px-1">
              <User size={18} className="text-blue-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
              {/* Full Name */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Full Name
                </p>
                {isEditMode && !isReadOnly ? (
                  <input
                    type="text"
                    value={editedAccountData?.personal_info?.fullname || ""}
                    onChange={(e) =>
                      handleAccountEditChange(
                        "personal_info.fullname",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {accountData.personal_info?.fullname || "Not Set"}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Email Address
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {accountData.personal_info?.email || "Not Set"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone Number */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Phone Number
                </p>
                {isEditMode && !isReadOnly ? (
                  <input
                    type="tel"
                    value={editedAccountData?.personal_info?.phone || ""}
                    onChange={(e) =>
                      handleAccountEditChange(
                        "personal_info.phone",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {accountData.personal_info?.phone || "Not Set"}
                  </p>
                )}
              </div>

              {/* Referral Code (Read-only) */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Referral Code
                </p>
                <p className="text-sm font-semibold text-gray-900 font-mono">
                  {accountData.personal_info?.referral_code || "Not Set"}
                </p>
              </div>
            </div>
          </div>

          {/* Store Information Section */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 px-1">
              <Building2 size={18} className="text-blue-600" />
              Store Information
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
              {/* Business Name */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Business Name
                </p>
                {isEditMode && !isReadOnly ? (
                  <input
                    type="text"
                    value={
                      editedAccountData?.store_settings?.business_name || ""
                    }
                    onChange={(e) =>
                      handleAccountEditChange(
                        "store_settings.business_name",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {accountData.store_settings?.business_name || "Not Set"}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Business Address
                </p>
                {isEditMode && !isReadOnly ? (
                  <input
                    type="text"
                    value={editedAccountData?.store_settings?.address || ""}
                    onChange={(e) =>
                      handleAccountEditChange(
                        "store_settings.address",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {accountData.store_settings?.address || "Not Set"}
                  </p>
                )}
              </div>

              {/* Storefront Link */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Storefront Link
                </p>
                {isEditMode && !isReadOnly ? (
                  <input
                    type="text"
                    value={
                      editedAccountData?.store_settings?.storefront_link || ""
                    }
                    onChange={(e) =>
                      handleAccountEditChange(
                        "store_settings.storefront_link",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {accountData.store_settings?.storefront_link || "Not Set"}
                  </p>
                )}
              </div>

              {/* Website */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Website
                </p>
                {isEditMode && !isReadOnly ? (
                  <input
                    type="url"
                    value={editedAccountData?.store_settings?.website || ""}
                    onChange={(e) =>
                      handleAccountEditChange(
                        "store_settings.website",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {accountData.store_settings?.website || "Not Set"}
                  </p>
                )}
              </div>

              {/* CAC Registration */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  CAC Registration
                </p>
                {isEditMode && !isReadOnly ? (
                  <input
                    type="text"
                    value={editedAccountData?.store_settings?.cac_reg || ""}
                    onChange={(e) =>
                      handleAccountEditChange(
                        "store_settings.cac_reg",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {accountData.store_settings?.cac_reg || "Not Set"}
                  </p>
                )}
              </div>

              {/* Store Description */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200 md:col-span-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Description
                </p>
                {isEditMode && !isReadOnly ? (
                  <textarea
                    value={editedAccountData?.store_settings?.description || ""}
                    onChange={(e) =>
                      handleAccountEditChange(
                        "store_settings.description",
                        e.target.value
                      )
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {accountData.store_settings?.description || "Not Set"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Information Section */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 px-1">
              <CreditCard size={18} className="text-blue-600" />
              Financial Information
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
              {/* Bank Name */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Bank Name
                </p>
                {isEditMode && !isReadOnly ? (
                  <input
                    type="text"
                    value={editedAccountData?.financials?.bank_name || ""}
                    onChange={(e) =>
                      handleAccountEditChange(
                        "financials.bank_name",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {accountData.financials?.bank_name || "Not Set"}
                  </p>
                )}
              </div>

              {/* Account Number */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Account Number
                </p>
                {isEditMode && !isReadOnly ? (
                  <input
                    type="text"
                    value={editedAccountData?.financials?.account_number || ""}
                    onChange={(e) =>
                      handleAccountEditChange(
                        "financials.account_number",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900 font-mono">
                    {accountData.financials?.account_number || "Not Set"}
                  </p>
                )}
              </div>

              {/* Wallet Address */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Wallet Address
                </p>
                {isEditMode && !isReadOnly ? (
                  <input
                    type="text"
                    value={editedAccountData?.financials?.wallet_address || ""}
                    onChange={(e) =>
                      handleAccountEditChange(
                        "financials.wallet_address",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900 font-mono break-all">
                    {accountData.financials?.wallet_address || "Not Set"}
                  </p>
                )}
              </div>

              {/* Business Address (Financial) */}
              <div className="p-2.5 sm:p-3 md:p-4 border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Business Address
                </p>
                {isEditMode && !isReadOnly ? (
                  <input
                    type="text"
                    value={
                      editedAccountData?.financials?.business_address || ""
                    }
                    onChange={(e) =>
                      handleAccountEditChange(
                        "financials.business_address",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {accountData.financials?.business_address || "Not Set"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
            <User size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Account Information Unavailable
          </h3>
          <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
            Unable to load account information. Please try again later.
          </p>
        </div>
      )}
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3 sm:space-y-4 md:space-y-5">
      {loadingFinancials ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : financialData ? (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* Bank Account Information */}
          <div className="border border-gray-100 rounded-lg sm:rounded-xl bg-gray-50/50 overflow-hidden">
            <div className="bg-white border-b border-gray-100 px-3 sm:px-4 md:px-6 py-3 md:py-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" />
                Bank Account Information
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {/* Bank Name */}
              <div className="p-3 sm:p-4 md:p-6 hover:bg-white transition-colors">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Bank Name
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {financialData.bank_name &&
                  financialData.bank_name.trim() !== ""
                    ? financialData.bank_name
                    : "Not Set"}
                </p>
              </div>

              {/* Account Number */}
              <div className="p-3 sm:p-4 md:p-6 hover:bg-white transition-colors">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Account Number
                </p>
                <p className="text-sm font-semibold text-gray-900 font-mono break-all">
                  {financialData.account_number &&
                  financialData.account_number.trim() !== ""
                    ? financialData.account_number
                    : "Not Set"}
                </p>
              </div>

              {/* Wallet Address */}
              <div className="p-3 sm:p-4 md:p-6 hover:bg-white transition-colors">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Wallet Address
                </p>
                <p className="text-sm font-semibold text-gray-900 break-all font-mono">
                  {financialData.wallet_address &&
                  financialData.wallet_address.trim() !== ""
                    ? financialData.wallet_address
                    : "Not Set"}
                </p>
              </div>

              {/* Business Address */}
              <div className="p-3 sm:p-4 md:p-6 hover:bg-white transition-colors">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Business Address
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {financialData.business_address || "Not Set"}
                </p>
              </div>
            </div>
          </div>

          {/* Add Payment Method Card */}
          <div className="text-center py-8 sm:py-10 md:py-12 px-3 sm:px-4 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
            <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm border border-gray-200">
              <CreditCard
                size={24}
                className="sm:w-[28px] sm:h-[28px] text-gray-400"
              />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
              Add New Card
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 max-w-xs mx-auto">
              Securely save your payment details for faster transactions.
            </p>
            <button className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm cursor-not-allowed shadow-sm opacity-75">
              Coming Soon
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
            <CreditCard size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Payment Information Unavailable
          </h3>
          <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
            Unable to load payment information. Please try again later.
          </p>
        </div>
      )}
    </div>
  );

  const renderHelpSettings = () => (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="px-3 sm:px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 sm:gap-3">
        <span className="px-2 sm:px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full whitespace-nowrap flex-shrink-0">
          Coming Soon
        </span>
        <p className="text-xs sm:text-sm text-yellow-700">
          Help features are being prepared and will be available soon.
        </p>
      </div>
      <div className="space-y-2 sm:space-y-3 opacity-50 pointer-events-none">
        {[
          {
            icon: MessageCircle,
            label: "Contact Support",
            desc: "Get help with your orders",
          },
          { icon: FileText, label: "Terms of Service", desc: "Read our T&Cs" },
          { icon: Shield, label: "Privacy Policy", desc: "How we handle data" },
          {
            icon: Info,
            label: "About ProductFinder",
            desc: "App version 1.0.0",
          },
        ].map((item, index) => (
          <button
            key={index}
            className="w-full text-left p-3 sm:p-4 bg-white border border-gray-100 rounded-lg sm:rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
          >
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors flex-shrink-0">
                  <item.icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {item.label}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {item.desc}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderContent = (): React.ReactNode => {
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
        return null;
    }
  };

  // --- Main Render ---

  return (
    <div className="w-full max-w-5xl mx-auto p-3 mt-12  sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col  md:flex-row gap-3 sm:gap-4 md:gap-6 lg:gap-8 min-h-[600px]">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          {/* Mobile Horizontal Tabs - Sticky */}
          <div className="md:hidden sticky  z-40 -mx-3 sm:-mx-4 px-3 sm:px-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex gap-1 overflow-x-auto overflow-y-hidden pb-0 scrollbar-hide">
              {sections.map((section) => {
                const IconComponent = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                      isActive
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent size={16} />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Vertical Sidebar */}
          <div className="hidden md:flex flex-col space-y-1 sticky top-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 px-3 mb-4 font-heading">
              Settings
            </h2>
            {sections.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm border border-gray-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent
                      size={18}
                      className={
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }
                    />
                    <span>{section.label}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 md:mt-0 mt-3 sm:mt-4">
          <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4 md:p-6 lg:p-8 min-h-full">
            <div className="mb-3 sm:mb-4 md:mb-6 pb-3 sm:pb-4 border-b border-gray-100 flex items-center justify-between">
              <div className="min-w-0   flex-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {sections.find((s) => s.id === activeSection)?.label}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Manage your{" "}
                  {sections
                    .find((s) => s.id === activeSection)
                    ?.label.toLowerCase()}{" "}
                  preferences
                </p>
              </div>
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
