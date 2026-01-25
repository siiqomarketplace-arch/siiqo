"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import StorefrontCustomization from "./components/StorefrontCustomization";
import Button from "@/components/ui/alt/ButtonAlt";
import Icon from "@/components/AppIcon";
import BusinessStorefrontView from "./business-view/components/BusinessStorefrontView";
import { StorefrontData, VendorData } from "@/types/vendor/storefront";
import { toast } from "@/hooks/use-toast";
import { storefrontService } from "@/services/storefrontService";
import { vendorService } from "@/services/vendorService";
import BusinessStorefrontPreview from "./business-view/components/BusinessStorefrontPreview";
import { productService } from "@/services/productService";
import AddCatalog from "./components/AddCatalog";
import { switchMode } from "@/services/api";
type TabId = "public" | "customize" | "add-catalog";

const VendorStorefront: React.FC = () => {
  const router = useRouter();
  const [storefrontData, setStorefrontData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("public");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // --- DATA FETCHING LOGIC ---
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch from the specific settings API
      const settingsResult = await storefrontService.getStorefrontData();

      // 2. Fetch products
      const productsRes = await productService.getMyProducts();

      if (settingsResult.status === "success") {
        const store = settingsResult.data.store_settings;

        // Map API response to the local StorefrontData interface
        const mappedData: any = {
          id: store.storefront_link,
          businessName: store.business_name,
          description: store.description,
          bannerImage: store.banner_url,
          logo: store.logo_url,
          isPublished: store.is_published,
          slug: store.storefront_link,
          address: store.address,
          template_options: {
            theme: store.template_options?.layout_style || "light",
            primaryColor: store.template_options?.primary_color,
            secondaryColor: store.template_options?.secondary_color,
          },
          socialLinks: store.social_links,
          businessHours: store.working_hours,
          products: productsRes.products || [],
          // Metadata from personal info
          vendorEmail: settingsResult.data.personal_info?.email,
          vendorName: settingsResult.data.personal_info?.fullname,
        };

        setStorefrontData(mappedData);
      } else {
        throw new Error(
          "Unable to load your storefront settings. Please refresh the page.",
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch live settings from server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    switchMode("vendor");
  });
  const handleSaveStorefront = async (updatedData: Partial<StorefrontData>) => {
    setSaving(true);
    try {
      // LOCAL PERSISTENCE for immediate UI feedback
      const currentLocal = JSON.parse(
        localStorage.getItem("vendorStorefrontDetails") || "{}",
      );
      const mergedData = { ...currentLocal, ...updatedData };
      localStorage.setItem(
        "vendorStorefrontDetails",
        JSON.stringify(mergedData),
      );

      // Update local state to trigger re-renders
      setStorefrontData((prev: any) =>
        prev ? { ...prev, ...mergedData } : (mergedData as StorefrontData),
      );

      toast({
        title: "Storefront Updated",
        description: "Changes saved to local preview.",
      });
    } catch (error) {
      console.error("Failed to save storefront:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishStorefront = async () => {
    if (!storefrontData) return;

    setSaving(true);
    try {
      // Toggle the published state
      const newPublishedState = !storefrontData.isPublished;

      // Prepare FormData with string value for is_published
      const formData = new FormData();
      formData.append("is_published", newPublishedState ? "true" : "false");

      const response = await vendorService.updateVendorSettings(formData);

      // Check for success status from API
      if (response.status === "success") {
        // Update local state only after successful API call
        setStorefrontData((prev: any) =>
          prev ? { ...prev, isPublished: newPublishedState } : prev,
        );

        toast({
          title: newPublishedState
            ? "Storefront Published!"
            : "Storefront Unpublished!",
          description: newPublishedState
            ? "Your store is now visible to customers on the homepage."
            : "Your store has been taken offline and won't appear on the homepage.",
          variant: "default",
        });
      } else {
        throw new Error(
          response.message ||
            "We couldn't update your storefront status. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Publish error:", error);
      toast({
        title: "Update Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "Could not update store status.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  const getStorefrontUrl = () => {
    return `${window.location.origin}/storefront/${storefrontData?.slug || "my-shop"}`;
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
    // { id: "preview", label: "Preview", icon: "Eye", description: "See how it looks" },
    {
      id: "customize",
      label: "Customize",
      icon: "Palette",
      description: "Design your storefront",
    },
    {
      id: "add-catalog",
      label: "Add Catalog",
      icon: "Add",
      description: "Create your catalog",
    },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" className="animate-spin text-primary" size={40} />
      </div>
    );

  return (
    <>
      <Head>
        <title>
          Storefront Manager | {storefrontData?.businessName || "Vendor"}
        </title>
      </Head>

      <div className="min-h-screen bg-background">
        <main className="max-w-[85vw] mt-16 md:mt-0 mx-auto px-0 md:px-4 py-6">
          {/* Header and Buttons */}
          <div className="flex flex-col mb-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Storefront Manager
              </h1>
              <p className="text-text-muted">
                Manage your business:{" "}
                <strong>{storefrontData?.businessName}</strong>
              </p>
            </div>
            <div className="flex items-center mt-4 space-x-3 lg:mt-0">
              {/* <Button variant="outline" onClick={() => setActiveTab("public")}>
                <Icon name="Eye" size={16} className="mr-2" />
                Live Preview
              </Button> */}
              <Button
                variant={storefrontData?.isPublished ? "secondary" : "primary"}
                onClick={handlePublishStorefront}
                disabled={saving || loading}
              >
                {saving ? (
                  <>
                    <Icon
                      name="Loader2"
                      size={16}
                      className="mr-2 animate-spin"
                    />
                    Processing...
                  </>
                ) : storefrontData?.isPublished ? (
                  "Unpublish Store"
                ) : (
                  "Publish Live Store"
                )}
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center mb-8 space-x-1 overflow-x-auto border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-bold text-sm border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted"
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in duration-500">
            {activeTab === "public" && (
              <BusinessStorefrontView
                storefrontData={storefrontData}
                products={storefrontData?.products || []}
              />
            )}

            {/* {activeTab === "preview" && (
              <BusinessStorefrontPreview />
            )} */}

            {activeTab === "customize" && (
              <StorefrontCustomization
                initialData={storefrontData}
                onSuccess={loadData} // Refresh data after save
              />
            )}
            {activeTab === "add-catalog" && (
              <AddCatalog
              // initialData={storefrontData}
              // onSuccess={loadData} // Refresh data after save
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default VendorStorefront;
