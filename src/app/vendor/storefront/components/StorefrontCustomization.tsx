"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Clock,
  Building,
  Globe,
  CheckCircle2,
  Palette,
  Layout,
  Phone,
  Instagram,
  Facebook,
  Trash2,
  Plus,
  ChevronLeft,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { vendorService } from "@/services/vendorService";
import switchMode from "@/services/api";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { getServerErrorMessage } from "@/lib/errorHandler";

interface Props {
  initialData: any;
  onSuccess: () => void;
}

const StorefrontCustomization = ({ initialData, onSuccess }: Props) => {
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<
    "banner_url" | "logo_url" | null
  >(null);
  const [uploadSuccess, setUploadSuccess] = useState<
    "banner_url" | "logo_url" | null
  >(null);
  const [activeTab, setActiveTab] = useState<
    "brand" | "details" | "location" | "design" | "social" | "hours"
  >("brand");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const {
    location: autoDetectedLocation,
    loading: isLocationLoading,
    refresh: detectLocation,
  } = useLocationDetection();

  const [settings, setSettings] = useState({
    business_name: initialData?.store_settings?.business_name || "",
    description: initialData?.store_settings?.description || "",
    address: initialData?.store_settings?.address || "",
    phone: initialData?.personal_info?.phone || "",
    website: initialData?.store_settings?.website || "",
    storefront_link: initialData?.store_settings?.storefront_link || "",
    cac_reg: initialData?.store_settings?.cac_reg || "",
    latitude: initialData?.store_settings?.latitude || "",
    longitude: initialData?.store_settings?.longitude || "",
    template_options: {
      primary_color:
        initialData?.store_settings?.template_options?.primary_color ||
        "#075E54",
      secondary_color:
        initialData?.store_settings?.template_options?.secondary_color ||
        "#ffffff",
      layout_style:
        initialData?.store_settings?.template_options?.layout_style ||
        "default",
    },
    banner_url: initialData?.store_settings?.banner_url || null,
    logo_url: initialData?.store_settings?.logo_url || null,
    social_links: initialData?.store_settings?.social_links || {},
    working_hours: initialData?.store_settings?.working_hours || {},
    is_published: initialData?.store_settings?.is_published || false,
  });

  const originalSettingsRef = React.useRef<any>(null);

  useEffect(() => {
    originalSettingsRef.current = { ...settings };
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleDetectLocation = async () => {
    try {
      await detectLocation();
      if (autoDetectedLocation.latitude && autoDetectedLocation.longitude) {
        updateSetting("latitude", autoDetectedLocation.latitude.toString());
        updateSetting("longitude", autoDetectedLocation.longitude.toString());
        toast({ title: "Location detected successfully" });
      }
    } catch (error) {
      const errorMsg = getServerErrorMessage(error, "Detect Location");
      toast({
        title: errorMsg.title,
        description: errorMsg.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (autoDetectedLocation.latitude && autoDetectedLocation.longitude) {
      if (!settings.latitude || !settings.longitude) {
        updateSetting("latitude", autoDetectedLocation.latitude.toString());
        updateSetting("longitude", autoDetectedLocation.longitude.toString());
      }
    }
  }, [autoDetectedLocation]);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "banner_url" | "logo_url",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField(field);
      const formData = new FormData();

      if (field === "banner_url") {
        formData.append("banner", file);
      } else if (field === "logo_url") {
        formData.append("logo", file);
      }

      const response = await vendorService.updateVendorSettings(formData);

      if (response?.data?.store_settings?.[field]) {
        updateSetting(field, response.data.store_settings[field]);
        setUploadSuccess(field);
        toast({ title: "Image uploaded successfully" });

        // Clear success state after 3 seconds
        setTimeout(() => setUploadSuccess(null), 3000);
      }
    } catch (error) {
      const errorMsg = getServerErrorMessage(error, "Upload Image");
      toast({
        title: errorMsg.title,
        description: errorMsg.message,
        variant: "destructive",
      });
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const original = originalSettingsRef.current || {};
      const formData = new FormData();

      const appendIfChanged = (key: string, value: any) => {
        const orig = original[key];
        if (typeof value === "object" && value !== null) {
          const a = JSON.stringify(value || {});
          const b = JSON.stringify(orig || {});
          if (a !== b) {
            formData.append(key, a);
            return true;
          }
          return false;
        }

        if (String(value ?? "") !== String(orig ?? "")) {
          formData.append(key, value ?? "");
          return true;
        }
        return false;
      };

      let changed = false;
      changed =
        appendIfChanged("business_name", settings.business_name) || changed;
      changed = appendIfChanged("description", settings.description) || changed;
      changed = appendIfChanged("address", settings.address) || changed;
      changed = appendIfChanged("phone", settings.phone) || changed;
      changed = appendIfChanged("website", settings.website) || changed;
      changed =
        appendIfChanged("storefront_link", settings.storefront_link) || changed;
      changed = appendIfChanged("cac_reg", settings.cac_reg) || changed;
      changed = appendIfChanged("latitude", settings.latitude) || changed;
      changed = appendIfChanged("longitude", settings.longitude) || changed;
      changed =
        appendIfChanged("template_options", settings.template_options) ||
        changed;
      if (settings.logo_url && typeof settings.logo_url === "string") {
        changed = appendIfChanged("logo_url", settings.logo_url) || changed;
      }
      if (settings.banner_url && typeof settings.banner_url === "string") {
        changed = appendIfChanged("banner_url", settings.banner_url) || changed;
      }
      changed =
        appendIfChanged("social_links", settings.social_links) || changed;
      changed =
        appendIfChanged("working_hours", settings.working_hours) || changed;
      changed =
        appendIfChanged("is_published", settings.is_published) || changed;

      if (!changed) {
        toast({ title: "No changes", description: "Nothing to save." });
        setIsSaving(false);
        return;
      }

      const response = await vendorService.updateVendorSettings(formData);

      if (response?.status === "success") {
        localStorage.setItem("storefrontUpdated", Date.now().toString());
        toast({
          title: "Success!",
          description: "Store settings saved successfully!",
        });
        onSuccess();
      }
    } catch (error: any) {
      const errorMsg = getServerErrorMessage(error, "Save Settings");
      toast({
        title: errorMsg.title,
        description: errorMsg.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    switchMode("vendor");
  }, []);

  const tabs = [
    { id: "brand", label: "Brand", icon: Camera },
    { id: "details", label: "Details", icon: Layout },
    { id: "location", label: "Location", icon: MapPin },
    { id: "design", label: "Design", icon: Palette },
    { id: "social", label: "Social", icon: Globe },
    { id: "hours", label: "Hours", icon: Clock },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "brand":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Cover Banner
                </label>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-gray-50 transition-all group"
                >
                  {uploadingField === "banner_url" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2
                          size={40}
                          className="text-white animate-spin"
                        />
                        <p className="text-white font-semibold text-sm">
                          Uploading...
                        </p>
                      </div>
                    </div>
                  )}

                  {uploadSuccess === "banner_url" && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-20 animate-pulse">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2
                          size={48}
                          className="text-green-600 animate-bounce"
                        />
                        <p className="text-green-700 font-semibold text-sm">
                          Uploaded!
                        </p>
                      </div>
                    </div>
                  )}

                  {settings.banner_url ? (
                    <img
                      src={settings.banner_url}
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                      alt="Banner"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera
                        size={40}
                        className="text-gray-400 mx-auto mb-2"
                      />
                      <p className="text-sm font-medium text-gray-500">
                        Click to upload banner
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Store Logo
                </label>
                <div
                  onClick={() => profileInputRef.current?.click()}
                  className="relative flex items-center justify-center h-56 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary/50 hover:bg-gray-50 transition-all overflow-hidden group"
                >
                  {uploadingField === "logo_url" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2
                          size={40}
                          className="text-white animate-spin"
                        />
                        <p className="text-white font-semibold text-sm">
                          Uploading...
                        </p>
                      </div>
                    </div>
                  )}

                  {uploadSuccess === "logo_url" && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-20 animate-pulse">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2
                          size={48}
                          className="text-green-600 animate-bounce"
                        />
                        <p className="text-green-700 font-semibold text-sm">
                          Uploaded!
                        </p>
                      </div>
                    </div>
                  )}

                  {settings.logo_url ? (
                    <img
                      src={settings.logo_url}
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                      alt="Logo"
                    />
                  ) : (
                    <div className="text-center">
                      <Building
                        size={40}
                        className="text-gray-400 mx-auto mb-2"
                      />
                      <p className="text-sm font-medium text-gray-500">
                        Click to upload
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "details":
        return (
          <div className="space-y-4">
            <FormField
              label="Business Name"
              value={settings.business_name}
              onChange={(e: { target: { value: any } }) =>
                updateSetting("business_name", e.target.value)
              }
              placeholder="Enter your business name"
            />
            <FormField
              label="Phone Number"
              value={settings.phone}
              onChange={(e: { target: { value: any } }) =>
                updateSetting("phone", e.target.value)
              }
              placeholder="Enter your phone number"
              type="tel"
            />
            <FormField
              label="Address"
              value={settings.address}
              onChange={(e: { target: { value: any } }) =>
                updateSetting("address", e.target.value)
              }
              placeholder="Enter your business address"
            />
            <FormField
              label="Website"
              value={settings.website}
              onChange={(e: { target: { value: any } }) =>
                updateSetting("website", e.target.value)
              }
              placeholder="https://example.com"
              type="url"
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Storefront Link
              </label>
              <div className="flex items-center flex-wrap gap-2">
                <span className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                  siiqo.com/
                </span>
                <input
                  type="text"
                  value={settings.storefront_link}
                  onChange={(e) =>
                    updateSetting("storefront_link", e.target.value)
                  }
                  placeholder="your-store-slug"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ring-primary/50 focus:border-primary outline-none transition-all text-sm"
                />
              </div>
            </div>
            <FormField
              label="CAC Registration"
              value={settings.cac_reg}
              onChange={(e: { target: { value: any } }) =>
                updateSetting("cac_reg", e.target.value)
              }
              placeholder="e.g., RC12345678"
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => updateSetting("description", e.target.value)}
                placeholder="Tell customers about your business..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ring-primary/50 focus:border-primary outline-none transition-all text-sm min-h-28 resize-none"
              />
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-6">
            {settings.latitude && settings.longitude && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle
                  size={20}
                  className="text-emerald-600 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    Location Detected
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Coordinates: {settings.latitude}, {settings.longitude}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleDetectLocation}
              disabled={isLocationLoading || isSaving}
              className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {isLocationLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <MapPin size={18} />
                  Auto-Detect Location
                </>
              )}
            </button>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Latitude"
                value={settings.latitude}
                onChange={(e: { target: { value: any } }) =>
                  updateSetting("latitude", e.target.value)
                }
                placeholder="e.g., 6.524379"
                type="number"
              />
              <FormField
                label="Longitude"
                value={settings.longitude}
                onChange={(e: { target: { value: any } }) =>
                  updateSetting("longitude", e.target.value)
                }
                placeholder="e.g., 3.379206"
                type="number"
              />
            </div>
            <p className="text-xs text-gray-500">
              Click "Auto-Detect Location" to fetch coordinates from your
              device, or enter them manually.
            </p>
          </div>
        );

      case "design":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Theme Colors
              </label>
              <div className="flex flex-wrap  gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Primary Color
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.template_options.primary_color}
                      onChange={(e) =>
                        updateSetting("template_options", {
                          ...settings.template_options,
                          primary_color: e.target.value,
                        })
                      }
                      className="w-20 h-20 rounded-lg cursor-pointer border border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {settings.template_options.primary_color}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Used for buttons and highlights
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Secondary Color
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.template_options.secondary_color}
                      onChange={(e) =>
                        updateSetting("template_options", {
                          ...settings.template_options,
                          secondary_color: e.target.value,
                        })
                      }
                      className="w-20 h-20 rounded-lg cursor-pointer border border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {settings.template_options.secondary_color}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Used for backgrounds
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Preview:</p>
              <div className="mt-3 flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded"
                  style={{
                    backgroundColor: settings.template_options.primary_color,
                  }}
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{
                    backgroundColor: settings.template_options.secondary_color,
                  }}
                />
              </div>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="space-y-4">
            {[
              "facebook",
              "instagram",
              "twitter",
              "linkedin",
              "youtube",
              "tiktok",
              "whatsapp",
            ].map((platform) => (
              <FormField
                key={platform}
                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                value={settings.social_links[platform] || ""}
                onChange={(e: { target: { value: any } }) =>
                  updateSetting("social_links", {
                    ...settings.social_links,
                    [platform]: e.target.value,
                  })
                }
                placeholder={`https://${platform}.com/yourpage`}
                type="url"
              />
            ))}
          </div>
        );

      case "hours":
        return (
          <div className="space-y-4 ">
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => (
              <div key={day} className="flex items-end gap-3">
                <div className="flex-1 min-w-24">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {day}
                  </label>
                  <div className="flex items-center flex-wrap gap-2">
                    <input
                      type="time"
                      value={settings.working_hours[day]?.start || "09:00"}
                      onChange={(e: { target: { value: any } }) =>
                        updateSetting("working_hours", {
                          ...settings.working_hours,
                          [day]: {
                            ...(settings.working_hours[day] || {}),
                            start: e.target.value,
                          },
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 ring-primary/50 outline-none text-sm"
                    />
                    <span className="text-gray-400 font-medium">–</span>
                    <input
                      type="time"
                      value={settings.working_hours[day]?.end || "21:00"}
                      onChange={(e) =>
                        updateSetting("working_hours", {
                          ...settings.working_hours,
                          [day]: {
                            ...(settings.working_hours[day] || {}),
                            end: e.target.value,
                          },
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 ring-primary/50 outline-none text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newHours = { ...settings.working_hours };
                    delete newHours[day];
                    updateSetting("working_hours", newHours);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    settings.working_hours[day]
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {settings.working_hours[day] ? "Close" : "Closed"}
                </button>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-32">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={coverInputRef}
        onChange={(e) => handleImageUpload(e, "banner_url")}
      />
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={profileInputRef}
        onChange={(e) => handleImageUpload(e, "logo_url")}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/vendor/dashboard"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Store Identity
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Customize your storefront appearance
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* TAB NAVIGATION */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          {renderContent()}
        </div>
      </main>

      {/* SAVE BUTTON */}
      <footer className="fixed bottom-0 md:left-48 md:right-0  bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              Changes will be published immediately
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Your storefront will be updated in real-time
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all ml-auto"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

// FormField Component
const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: any) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ring-primary/50 focus:border-primary outline-none transition-all text-sm"
    />
  </div>
);

export default StorefrontCustomization;
