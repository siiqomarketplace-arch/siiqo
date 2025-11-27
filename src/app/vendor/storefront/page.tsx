"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import StorefrontCustomization from "./components/StorefrontCustomization";
import Button from "@/components/ui/alt/ButtonAlt";
import Icon from "@/components/AppIcon";
import BusinessStorefrontView from "./business-view";
import { ApiStorefrontResponse, StorefrontContact, StorefrontData, VendorData } from "@/types/vendor/storefront";
import { toast } from "@/hooks/use-toast";
import { storefrontService } from "@/services/storefrontService";
import { vendorService } from "@/services/vendorService";

type TabId = "public" | "preview" | "customize";

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
    const loadData = async () => {
      setLoading(true);
      try {
        const [storefrontRes, productsRes] = await Promise.all([
          vendorService.getStorefront(),
          vendorService.getMyProducts(),
        ]);
        const storefrontData = storefrontRes.data;
        const products = productsRes.products;

        setStorefrontData({
          ...storefrontData,
          products,
        });
      } catch (error) {
        console.error("Failed to load storefront data", error);
        toast({
          title: "Error",
          description: "Failed to load storefront data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveStorefront = async (updatedData: Partial<StorefrontData>) => {
    setSaving(true);
    try {
      let bannerUrl = storefrontData?.bannerImage;
      let logoUrl = storefrontData?.logo;

      if (updatedData.bannerFile) {
        const formData = new FormData();
        formData.append("file", updatedData.bannerFile);
        const response = await vendorService.uploadImage(updatedData.bannerFile);
        bannerUrl = response.urls[0];
      }

      if (updatedData.logoFile) {
        const formData = new FormData();
        formData.append("file", updatedData.logoFile);
        const response = await vendorService.uploadImage(updatedData.logoFile);
        logoUrl = response.urls[0];
      }

      const payload = {
        business_name: updatedData.businessName || storefrontData?.businessName,
        description: updatedData.description || storefrontData?.description,
        business_banner: [bannerUrl, logoUrl],
        template_options: {
          theme: updatedData.template_options?.theme || storefrontData?.template_options?.theme || 'light',
          font: updatedData.template_options?.font || storefrontData?.template_options?.font || 'Arial',
        },
        about: updatedData.about || storefrontData?.about,
        show_call_button: updatedData.showCallButton,
        team_size: updatedData.teamSize,
        business_hours: updatedData.businessHours,
        established: updatedData.established,
      };

      const response = await vendorService.updateStorefront(payload);
      const data = response.data;

      setStorefrontData((prev) =>
        prev
          ? {
              ...prev,
              ...data,
            }
          : prev
      );
      toast({
        title: "Storefront Saved!",
        description: "Your changes have been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to save storefront:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "default",
      });
    } finally {
      setSaving(false);
    }
  };

const handlePublishStorefront = async () => {
  setSaving(true);
  try {
    const newPublishedState = !storefrontData?.isPublished;

    const data = await storefrontService.publishStorefront(newPublishedState);

    console.log("Publish storefront response:", data);

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
    toast({
      title: newPublishedState ? "Storefront Published!" : "Storefront Unpublished!",
      description: newPublishedState
        ? "Your storefront is now live."
        : "Your storefront is now a draft.",
      variant: "default",
    });
  } catch (error) {
    console.error("Failed to publish storefront:", error);
    toast({
      title: "Error",
      description: "Failed to update storefront. Please try again.",
      variant: "default",
    });
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
              <BusinessStorefrontView storefrontData={storefrontData} products={storefrontData?.products || []} />
            )}

            {activeTab === "preview" && (
              <BusinessStorefrontView storefrontData={storefrontData} products={storefrontData?.products || []} />
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
