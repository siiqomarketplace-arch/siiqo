"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/AppIcon";
import { LucideIconName } from "@/components/ui/AppIcon";

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
    emailVerified: boolean;
    phoneVerified: boolean;
  };
}

interface SettingsProps {
  userProfile: UserProfileData;
  onUpdateProfile?: (updates: Partial<UserProfileData>) => Promise<any>;
}

type SettingSectionKey = keyof SettingsState;

const Settings = ({ userProfile, onUpdateProfile }: SettingsProps) => {
  const [settings, setSettings] = useState<SettingsState>({
    location: {
      homeAddress:
        userProfile.location || "123 Main St, San Francisco, CA 94102",
      searchRadius: 10,
      autoLocation: true,
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
      emailVerified: userProfile.isVerified.email,
      phoneVerified: userProfile.isVerified.phone,
    },
  });

  const [activeSection, setActiveSection] = useState("location");
  const [updateLoading, setUpdateLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedKycFiles, setSelectedKycFiles] = useState<{
    idDocument: File | null;
    proofOfAddress: File | null;
  }>({
    idDocument: null,
    proofOfAddress: null,
  });

  // Get JWT token from localStorage or wherever you store it
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      );
    }
    return null;
  };

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

  // Update profile address
  const handleUpdateAddress = async () => {
    if (!onUpdateProfile) return;

    setUpdateLoading((prev) => ({ ...prev, address: true }));
    try {
      await onUpdateProfile({
        location: settings.location.homeAddress,
      });
    } catch (error) {
      console.error("Error updating address:", error);
    } finally {
      setUpdateLoading((prev) => ({ ...prev, address: false }));
    }
  };

  // Handle KYC file selection
  const handleKycFileChange = (
    type: "idDocument" | "proofOfAddress",
    file: File | null
  ) => {
    setSelectedKycFiles((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  // Submit KYC documents
  const handleKycSubmission = async () => {
    if (!selectedKycFiles.idDocument) {
      alert("Please select an ID document");
      return;
    }

    setUpdateLoading((prev) => ({ ...prev, kyc: true }));

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = new FormData();
      formData.append("id_document", selectedKycFiles.idDocument);

      if (selectedKycFiles.proofOfAddress) {
        formData.append("proof_of_address", selectedKycFiles.proofOfAddress);
      }

      const response = await fetch("https://server.bizengo.com/api/user/kyc", {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      alert(
        "KYC documents submitted successfully! Your identity verification is under review."
      );

      // Reset file selection
      setSelectedKycFiles({
        idDocument: null,
        proofOfAddress: null,
      });
    } catch (error) {
      console.error("Error submitting KYC:", error);
      alert("Failed to submit KYC documents. Please try again.");
    } finally {
      setUpdateLoading((prev) => ({ ...prev, kyc: false }));
    }
  };

  interface Section {
    id: string;
    label: string;
    icon: LucideIconName;
  }

  const sections: Section[] = [
    { id: "location", label: "Location", icon: "MapPin" },
    { id: "notifications", label: "Notifications", icon: "Bell" },
    { id: "privacy", label: "Privacy", icon: "Shield" },
    { id: "account", label: "Account Security", icon: "Lock" },
    { id: "payment", label: "Payment Methods", icon: "CreditCard" },
    { id: "help", label: "Help & Support", icon: "HelpCircle" },
  ];

  const renderLocationSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Home Address
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={settings.location.homeAddress}
            onChange={(e) =>
              handleSettingChange("location", "homeAddress", e.target.value)
            }
            className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
          />
          <button
            onClick={handleUpdateAddress}
            disabled={updateLoading.address}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateLoading.address ? "Updating..." : "Update"}
          </button>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          This helps us show you the most relevant nearby products
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
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
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>1 mile</span>
          <span>50 miles</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-text-primary">
              Auto-detect Location
            </h4>
            <p className="text-xs text-text-secondary">
              Automatically use your current location for searches
            </p>
          </div>
          <button
            onClick={() =>
              handleSettingChange(
                "location",
                "autoLocation",
                !settings.location.autoLocation
              )
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              settings.location.autoLocation ? "bg-primary" : "bg-border-dark"
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
            <h4 className="text-sm font-medium text-text-primary">
              Show Exact Location
            </h4>
            <p className="text-xs text-text-secondary">
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
                ? "bg-primary"
                : "bg-border-dark"
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
              <h4 className="text-sm font-medium text-text-primary">
                {labels[key].title}
              </h4>
              <p className="text-xs text-text-secondary">{labels[key].desc}</p>
            </div>
            <button
              onClick={() => handleSettingChange("notifications", key, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                value ? "bg-primary" : "bg-border-dark"
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
        <label className="block text-sm font-medium text-text-primary mb-2">
          Profile Visibility
        </label>
        <select
          value={settings.privacy.profileVisibility}
          onChange={(e) =>
            handleSettingChange("privacy", "profileVisibility", e.target.value)
          }
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
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
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-text-primary">
              Show Online Status
            </h4>
            <p className="text-xs text-text-secondary">
              Let others see when you're active
            </p>
          </div>
          <button
            onClick={() =>
              handleSettingChange(
                "privacy",
                "showOnlineStatus",
                !settings.privacy.showOnlineStatus
              )
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              settings.privacy.showOnlineStatus
                ? "bg-primary"
                : "bg-border-dark"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                settings.privacy.showOnlineStatus
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-text-primary">
              Allow Contact from Buyers
            </h4>
            <p className="text-xs text-text-secondary">
              Let potential buyers message you directly
            </p>
          </div>
          <button
            onClick={() =>
              handleSettingChange(
                "privacy",
                "allowContactFromBuyers",
                !settings.privacy.allowContactFromBuyers
              )
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              settings.privacy.allowContactFromBuyers
                ? "bg-primary"
                : "bg-border-dark"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                settings.privacy.allowContactFromBuyers
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-text-primary">
              Show Ratings Publicly
            </h4>
            <p className="text-xs text-text-secondary">
              Display your seller rating on your profile
            </p>
          </div>
          <button
            onClick={() =>
              handleSettingChange(
                "privacy",
                "showRatingsPublicly",
                !settings.privacy.showRatingsPublicly
              )
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              settings.privacy.showRatingsPublicly
                ? "bg-primary"
                : "bg-border-dark"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                settings.privacy.showRatingsPublicly
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center space-x-3">
            <Icon name="Mail" size={20} className="text-text-secondary" />
            <div>
              <h4 className="text-sm font-medium text-text-primary">
                Email Verification
              </h4>
              <p className="text-xs text-text-secondary">{userProfile.email}</p>
            </div>
          </div>
          {settings.account.emailVerified ? (
            <div className="flex items-center space-x-1 text-success">
              <Icon name="Check" size={16} />
              <span className="text-sm">Verified</span>
            </div>
          ) : (
            <button className="text-primary hover:underline text-sm">
              Verify Now
            </button>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center space-x-3">
            <Icon name="Phone" size={20} className="text-text-secondary" />
            <div>
              <h4 className="text-sm font-medium text-text-primary">
                Phone Verification
              </h4>
              <p className="text-xs text-text-secondary">{userProfile.phone}</p>
            </div>
          </div>
          {settings.account.phoneVerified ? (
            <div className="flex items-center space-x-1 text-success">
              <Icon name="Check" size={16} />
              <span className="text-sm">Verified</span>
            </div>
          ) : (
            <button className="text-primary hover:underline text-sm">
              Verify Now
            </button>
          )}
        </div>

        {/* KYC Identity Verification */}
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Icon name="Shield" size={20} className="text-text-secondary" />
              <div>
                <h4 className="text-sm font-medium text-text-primary">
                  Identity Verification (KYC)
                </h4>
                <p className="text-xs text-text-secondary">
                  Verify your identity to increase trust
                </p>
              </div>
            </div>
            {userProfile.isVerified.identity ? (
              <div className="flex items-center space-x-1 text-success">
                <Icon name="Check" size={16} />
                <span className="text-sm">Verified</span>
              </div>
            ) : (
              <span className="text-xs text-warning">Not verified</span>
            )}
          </div>

          {!userProfile.isVerified.identity && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  ID Document (Required) *
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    handleKycFileChange(
                      "idDocument",
                      e.target.files?.[0] || null
                    )
                  }
                  className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-700"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Upload your passport, driver's license, or national ID
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Proof of Address (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    handleKycFileChange(
                      "proofOfAddress",
                      e.target.files?.[0] || null
                    )
                  }
                  className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-white hover:file:bg-secondary-700"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Upload a utility bill or bank statement
                </p>
              </div>

              <button
                onClick={handleKycSubmission}
                disabled={!selectedKycFiles.idDocument || updateLoading.kyc}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {updateLoading.kyc ? "Submitting..." : "Submit KYC Documents"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center space-x-3">
            <Icon name="Shield" size={20} className="text-text-secondary" />
            <div>
              <h4 className="text-sm font-medium text-text-primary">
                Two-Factor Authentication
              </h4>
              <p className="text-xs text-text-secondary">
                Add an extra layer of security
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              handleSettingChange(
                "account",
                "twoFactorAuth",
                !settings.account.twoFactorAuth
              )
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              settings.account.twoFactorAuth ? "bg-primary" : "bg-border-dark"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                settings.account.twoFactorAuth
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button className="w-full text-left p-4 border border-border rounded-lg hover:bg-surface-secondary transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="Key" size={20} className="text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">
                Change Password
              </span>
            </div>
            <Icon
              name="ChevronRight"
              size={16}
              className="text-text-secondary"
            />
          </div>
        </button>

        <button className="w-full text-left p-4 border border-error rounded-lg hover:bg-error-50 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="Trash2" size={20} className="text-error" />
              <span className="text-sm font-medium text-error">
                Delete Account
              </span>
            </div>
            <Icon name="ChevronRight" size={16} className="text-error" />
          </div>
        </button>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="CreditCard" size={24} className="text-text-tertiary" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No Payment Methods
        </h3>
        <p className="text-text-secondary mb-6">
          Add a payment method to make purchases easier and faster.
        </p>
        <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200">
          Add Payment Method
        </button>
      </div>
    </div>
  );

  const renderHelpSettings = () => (
    <div className="space-y-3">
      <button className="w-full text-left p-4 border border-border rounded-lg hover:bg-surface-secondary transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon
              name="MessageCircle"
              size={20}
              className="text-text-secondary"
            />
            <span className="text-sm font-medium text-text-primary">
              Contact Support
            </span>
          </div>
          <Icon name="ChevronRight" size={16} className="text-text-secondary" />
        </div>
      </button>

      <button className="w-full text-left p-4 border border-border rounded-lg hover:bg-surface-secondary transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="FileText" size={20} className="text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">
              Terms of Service
            </span>
          </div>
          <Icon name="ChevronRight" size={16} className="text-text-secondary" />
        </div>
      </button>

      <button className="w-full text-left p-4 border border-border rounded-lg hover:bg-surface-secondary transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="Shield" size={20} className="text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">
              Privacy Policy
            </span>
          </div>
          <Icon name="ChevronRight" size={16} className="text-text-secondary" />
        </div>
      </button>

      <button className="w-full text-left p-4 border border-border rounded-lg hover:bg-surface-secondary transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="Info" size={20} className="text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">
              About ProductFinder
            </span>
          </div>
          <Icon name="ChevronRight" size={16} className="text-text-secondary" />
        </div>
      </button>
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
    <div className="space-y-6">
      {/* Mobile: Dropdown Section Selector */}
      <div className="md:hidden">
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
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
        <div className="flex space-x-1 bg-surface-secondary rounded-lg p-1 mb-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeSection === section.id
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon name={section.icon} size={16} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-6">
          {sections.find((s) => s.id === activeSection)?.label}
        </h3>
        {renderContent()}
      </div>
    </div>
  );
};
// good
export default Settings;
