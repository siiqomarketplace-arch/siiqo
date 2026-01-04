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
  ChevronDown,
} from "lucide-react";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { userService } from "@/services/userService";
import {
  UserProfileData,
  VendorData,
  SettingsState,
} from "@/types/vendor/settings";
import { vendorService } from "@/services/vendorService";

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
  const [vendorData, setVendorData] = useState<VendorData | null>(null);

  const {
    location: autoDetectedLocation,
    loading: isAutoLocationLoading,
    refresh: getCurrentLocation,
  } = useLocationDetection();

  const [isManualLocationLoading, setManualLocationLoading] = useState(false);

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Home Address
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={
              isAutoLocationLoading || isManualLocationLoading
                ? "Detecting location..."
                : settings.location.homeAddress
            }
            onChange={(e) =>
              handleSettingChange("location", "homeAddress", e.target.value)
            }
            disabled={
              settings.location.autoLocation ||
              isAutoLocationLoading ||
              isManualLocationLoading
            }
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          />
          {!settings.location.autoLocation && (
            <button
              onClick={handleManualLocationUpdate}
              disabled={isManualLocationLoading}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 text-sm whitespace-nowrap flex items-center justify-center gap-2"
            >
               {isManualLocationLoading && <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />}
               {isManualLocationLoading ? "Locating..." : "Use Current"}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This address is used to calculate shipping and show local products.
        </p>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <label className="block text-sm font-semibold text-gray-900 mb-4">
          Search Radius: <span className="text-blue-600">{settings.location.searchRadius} miles</span>
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

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors -mx-3">
          <div>
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
      settings.location.autoLocation ? "translate-x-6" : "translate-x-1"
    }`}
  >
    {/* Subtle loader inside the toggle dot if loading */}
    {isAutoLocationLoading && (
      <div className="h-2 w-2 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    )}
  </span>
</button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors -mx-3">
          <div>
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
    settings.location.showExactLocation ? "bg-blue-600" : "bg-slate-200"
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
    <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {Object.entries(settings.notifications).map(([key, value], index) => {
        const labels: { [key: string]: { title: string; desc: string } } = {
          newMessages: { title: "New Messages", desc: "Direct messages from buyers/sellers" },
          priceDrops: { title: "Price Drops", desc: "Alerts when saved items get cheaper" },
          newListings: { title: "Saved Search Alerts", desc: "New items matching your interests" },
          orderUpdates: { title: "Order Status", desc: "Shipping, delivery, and returns" },
          marketingEmails: { title: "Promotions", desc: "Deals, discounts, and news" },
          pushNotifications: { title: "Push Notifications", desc: "Enable browser alerts" },
        };

        return (
          <div key={key} className={`flex items-center justify-between p-4 rounded-xl transition-colors ${value ? 'bg-blue-50/50' : 'bg-transparent hover:bg-gray-50'}`}>
            <div className="pr-4">
              <h4 className={`text-sm font-medium ${value ? 'text-blue-900' : 'text-gray-900'}`}>
                {labels[key].title}
              </h4>
              <p className={`text-xs mt-0.5 ${value ? 'text-blue-700' : 'text-gray-500'}`}>{labels[key].desc}</p>
            </div>
            <button
              onClick={() => handleSettingChange("notifications", key, !value)}
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
  );

  const renderPrivacySettings = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
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

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 px-1">Interactions</h3>
        {Object.entries(settings.privacy)
          .filter(([key]) => key !== "profileVisibility")
          .map(([key, value]) => {
            const labels: { [key: string]: { title: string; desc: string } } = {
              showOnlineStatus: { title: "Show Online Status", desc: "Let others see when you're active" },
              allowContactFromBuyers: { title: "Direct Messaging", desc: "Allow buyers to start chats" },
              showRatingsPublicly: { title: "Public Ratings", desc: "Show seller rating on profile" },
            };

            return (
              <div key={key} className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {labels[key].title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">{labels[key].desc}</p>
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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {vendorData ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Card Component for Info */}
          {[
            { label: "Business Name", value: vendorData.business_name, icon: Building2 },
            { label: "Contact Name", value: `${vendorData.first_name} ${vendorData.last_name}`, icon: User },
            { label: "Email Address", value: vendorData.email, icon: Mail },
            { label: "Phone Number", value: vendorData.phone, icon: Phone },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all duration-200">
              <div className="p-2 bg-white rounded-lg border border-gray-100 mr-4 text-gray-500">
                <item.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{item.value || "Not Set"}</p>
              </div>
            </div>
          ))}

          {/* Verification Status */}
          <div className={`flex items-center justify-between p-4 border rounded-xl mt-2 ${vendorData.isVerified ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
            <div className="flex items-center space-x-3">
              <ShieldCheck size={20} className={vendorData.isVerified ? "text-green-600" : "text-amber-600"} />
              <div>
                <h4 className={`text-sm font-semibold ${vendorData.isVerified ? "text-green-900" : "text-amber-900"}`}>
                  Identity Verification
                </h4>
                <p className={`text-xs ${vendorData.isVerified ? "text-green-700" : "text-amber-700"}`}>
                  {vendorData.isVerified ? "Your account is fully verified" : "Action required to verify account"}
                </p>
              </div>
            </div>
            {vendorData.isVerified ? (
              <div className="bg-white p-1 rounded-full text-green-600">
                <Check size={16} />
              </div>
            ) : (
              <button className="text-xs font-semibold bg-white text-amber-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-50 transition-colors">
                Verify Now
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="pt-6 mt-6 border-t border-gray-100">
         <button className="flex items-center text-red-600 text-sm font-medium hover:text-red-700 transition-colors">
            <Trash2 size={16} className="mr-2" />
            Delete Account
         </button>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
          <CreditCard size={28} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Payment Methods Added
        </h3>
        <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
          Securely save your payment details to checkout faster. We support all major credit cards.
        </p>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200 active:scale-95">
          Add New Card
        </button>
      </div>
    </div>
  );

  const renderHelpSettings = () => (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {[
        { icon: MessageCircle, label: "Contact Support", desc: "Get help with your orders" },
        { icon: FileText, label: "Terms of Service", desc: "Read our T&Cs" },
        { icon: Shield, label: "Privacy Policy", desc: "How we handle data" },
        { icon: Info, label: "About ProductFinder", desc: "App version 1.0.0" },
      ].map((item, index) => (
        <button
          key={index}
          className="w-full text-left p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                <item.icon size={20} />
              </div>
              <div>
                  <span className="block text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {item.label}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {item.desc}
                  </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>
      ))}
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
    <div className="w-full max-w-5xl mx-auto md:p-6 p-24">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 min-h-[600px]">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
            {/* Mobile Horizontal Scroll */}
            <div className="md:hidden -mx-4 px-4 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex space-x-2">
                    {sections.map((section) => {
                        const IconComponent = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                            isActive
                                ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
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
                <h2 className="text-xl font-bold text-gray-900 px-3 mb-4 font-heading">Settings</h2>
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
                            <IconComponent size={18} className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} />
                            <span>{section.label}</span>
                        </div>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 min-h-full">
                <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                        {sections.find((s) => s.id === activeSection)?.label}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Manage your {sections.find((s) => s.id === activeSection)?.label.toLowerCase()} preferences</p>
                    </div>
                    {/* Optional: Add save button here if form logic exists */}
                </div>
                
                {renderContent()}
             </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;