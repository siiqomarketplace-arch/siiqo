"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import StorefrontCustomization from "./components/StorefrontCustomization";
import StorefrontSettings from "./components/StorefrontSettings";
import Button from "@/components/ui/alt/ButtonAlt";
import Icon from "@/components/AppIcon";
import BusinessStorefrontView from "./business-view";
import { mockStorefrontData } from "@/constants/vendor/storefront";
import { ApiStorefrontResponse, StorefrontContact, StorefrontData, VendorData } from "@/types/vendor/storefront";

type TabId = "public" | "preview" | "customize" | "settings";

const VendorStorefront: React.FC = () => {
  const router = useRouter();
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [storefrontData, setStorefrontData] = useState<StorefrontData | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<TabId>("public");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    // Check if vendor is authenticated
    const isLoggedIn = localStorage.getItem("isVendorLoggedIn");
    if (!isLoggedIn) {
      router.push("../auth");
      return;
    }

    // Load vendor data
    const vendor = JSON.parse(localStorage.getItem("vendorAuth") || "{}");
    setVendorData(vendor);

    // Load storefront data
    loadStorefrontData();
  }, [router]);

const loadStorefrontData = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("vendorToken");

    if (!token) {
      throw new Error("No vendor token found");
    }

    const res = await fetch(
      "https://server.siiqo.com/api/vendor/storefront",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: ApiStorefrontResponse = await res.json();

    if (!data || typeof data !== "object") {
      throw new Error("Invalid API response format");
    }

    const sf = data.storefront || {};
    const products = Array.isArray(data.products) ? data.products : [];

    const contact: StorefrontContact = {
      email:
        typeof sf.email === "string"
          ? sf.email
          : mockStorefrontData.contact.email,
      phone:
        typeof sf.phone === "string"
          ? sf.phone
          : mockStorefrontData.contact.phone,
      address:
        sf.state && sf.country
          ? `${sf.state}, ${sf.country}`
          : mockStorefrontData.contact.address,
      website:
        typeof sf.website === "string"
          ? sf.website
          : mockStorefrontData.contact.website,
    };

    setStorefrontData({
      ...mockStorefrontData,
      businessName:
        typeof sf.business_name === "string"
          ? sf.business_name
          : mockStorefrontData.businessName,
      description:
        typeof sf.description === "string"
          ? sf.description
          : mockStorefrontData.description,
      contact,
      slug: sf.business_name
        ? sf.business_name.toLowerCase().replace(/\s+/g, "-")
        : mockStorefrontData.slug,
      gallery:
        products
          .flatMap(p => (Array.isArray(p.images) ? p.images : []))
          .filter((img): img is string => typeof img === "string") ||
        mockStorefrontData.gallery,
      bannerImage: products[0]?.images?.[0] || mockStorefrontData.bannerImage,
      // check is the is_published is true by default and set it to false until published.
      isPublished: sf.is_published === true ? true : false,
      publishedAt: sf.published_at || null,
      views: mockStorefrontData.views,
      clicks: mockStorefrontData.clicks,
      orders: mockStorefrontData.orders,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error loading storefront:", err);

    if (err instanceof Error) {
      alert(`Failed to load storefront: ${err.message}`);
    }

    setStorefrontData({
      ...mockStorefrontData,
      isPublished: false,
      publishedAt: null,
    });
  } finally {
    setLoading(false);
  }
};

  const handleSaveStorefront = async (updatedData: Partial<StorefrontData>) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("vendorToken");

      const payload = {
        business_name: updatedData.businessName || storefrontData?.businessName,
        description: updatedData.description || storefrontData?.description,
        business_banner: updatedData.gallery || storefrontData?.gallery,
      };

      const res = await fetch(
        "https://server.siiqo.com/api/vendor/storefront",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update storefront");
      const data = await res.json();

      setStorefrontData((prev) =>
        prev
          ? {
              ...prev,
              businessName: data.business_name,
              description: data.description,
              gallery: data.business_banner || prev.gallery,
              bannerImage: data.business_banner?.[0] || prev.bannerImage,
              lastUpdated: new Date().toISOString(),
            }
          : prev
      );
    } catch (error) {
      console.error("Failed to save storefront:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

const handlePublishStorefront = async () => {
  setSaving(true);
  try {
    const token = localStorage.getItem("vendorToken");

    if (!token) {
      throw new Error("No vendor token found");
    }

    const newPublishedState = !storefrontData?.isPublished;

    const payload = {
      is_published: newPublishedState,
      published_at: newPublishedState ? new Date().toISOString() : null,
    };

    const res = await fetch(
      "https://server.siiqo.com/api/vendor/storefront",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to update storefront: ${res.status}`);
    }

    const data = await res.json();

    // Update local state with the the publish response
    setStorefrontData(prev =>
      prev
        ? {
            ...prev,
            isPublished: newPublishedState,
            publishedAt: newPublishedState ? new Date().toISOString() : null,
            lastUpdated: new Date().toISOString(),
          }
        : prev
    );

    // Show success message
    alert(
      newPublishedState
        ? "Storefront published successfully!"
        : "Storefront unpublished successfully!"
    );
  } catch (error) {
    console.error("Failed to publish storefront:", error);
    alert("Failed to update storefront. Please try again.");
  } finally {
    setSaving(false);
  }
};

  const getStorefrontUrl = () => {
    return `${window.location.origin}/storefront/${storefrontData?.slug}`;
  };

  const tabs: {
    id: TabId;
    label: string;
    icon: string;
    description: string;
  }[] = [
    {
      id: "public",
      label: "Public View",
      icon: "ExternalLink",
      description: "Customer view",
    },
    {
      id: "preview",
      label: "Preview",
      icon: "Eye",
      description: "See how it looks",
    },
    {
      id: "customize",
      label: "Customize",
      icon: "Palette",
      description: "Design your storefront",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "Settings",
      description: "Configure options",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
            <p className="text-text-muted">Loading storefront...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Storefront - {vendorData?.businessName || "Business"}</title>
        <meta
          name="description"
          content="Design and manage your online storefront"
        />
      </Head>

      <div className="min-h-screen bg-background">
        <main className="max-w-[85vw] mx-auto px-0 md:px-4 py-6">
          {/* Page Header */}
          <div className="flex flex-col mb-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold font-heading text-text-primary">
                Storefront Manager
              </h1>
              <p className="text-text-muted">
                Customize your online presence and attract more customers
              </p>
            </div>

            <div className="flex items-center mt-4 space-x-3 lg:mt-0">
              {storefrontData?.isPublished && (
                <Button
                  variant="outline"
                  onClick={() => window.open(getStorefrontUrl(), "_blank")}
                >
                  <Icon name="ExternalLink" size={16} className="mr-2" />
                  View Live
                </Button>
              )}

              <Button
                variant={storefrontData?.isPublished ? "secondary" : "primary"}
                onClick={handlePublishStorefront}
                disabled={saving}
              >
                {saving ? (
                  <Icon
                    name="Loader2"
                    size={16}
                    className="mr-2 animate-spin"
                  />
                ) : (
                  <Icon
                    name={storefrontData?.isPublished ? "EyeOff" : "Eye"}
                    size={16}
                    className="mr-2"
                  />
                )}
                {storefrontData?.isPublished ? "Unpublish" : "Publish"}
              </Button>
            </div>
          </div>

          {/* Status Banner */}
          {storefrontData && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                storefrontData.isPublished
                  ? "bg-success-50 border border-success-200"
                  : "bg-warning-50 border border-warning-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      storefrontData.isPublished ? "bg-success" : "bg-warning"
                    }`}
                  ></div>
                  <div>
                    <p
                      className={`font-medium ${
                        storefrontData.isPublished
                          ? "text-success-700"
                          : "text-warning-700"
                      }`}
                    >
                      {storefrontData.isPublished
                        ? "Storefront is Live"
                        : "Storefront is Draft"}
                    </p>
                    <p
                      className={`text-sm ${
                        storefrontData.isPublished
                          ? "text-success-600"
                          : "text-warning-600"
                      }`}
                    >
                      {storefrontData.isPublished
                        ? `Customers can find you at: ${getStorefrontUrl()}`
                        : "Publish your storefront to make it visible to customers"}
                    </p>
                  </div>
                </div>

                {storefrontData.isPublished && (
                  <div className="text-sm text-right text-success-600">
                    <p>{storefrontData.views} views</p>
                    <p>{storefrontData.clicks} clicks</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center mb-8 space-x-1 overflow-x-auto border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted hover:text-text-secondary hover:border-border"
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "public" && (
              // <PublicStorefront
              // 	storefrontData={storefrontData}
              // 	isPreview={true}
              // />
              <BusinessStorefrontView />
            )}

            {activeTab === "preview" && (
              // <StorefrontPreview
              // 	storefrontData={storefrontData}
              // />
              <BusinessStorefrontView />
            )}

            {activeTab === "settings" && (
              <StorefrontSettings
                storefrontData={storefrontData}
                onSave={handleSaveStorefront}
                saving={saving}
              />
            )}

            {activeTab === "customize" && (
              <StorefrontCustomization
                storefrontData={storefrontData}
                onSave={handleSaveStorefront}
                saving={saving}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default VendorStorefront;
