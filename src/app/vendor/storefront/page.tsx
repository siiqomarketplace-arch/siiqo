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

type TabId = "public" | "preview" | "customize";

const VendorStorefront: React.FC = () => {
  const router = useRouter();
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [storefrontData, setStorefrontData] = useState<StorefrontData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("public");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // --- LOCAL STORAGE & API SYNC ---
  useEffect(() => {
   const loadData = async () => {
    setLoading(true);
    try {
      const [storefrontRes, productsRes] = await Promise.all([
        storefrontService.getStorefronts(),
        productService.getMyProducts(),
      ]);
      
      // Use the 'data' object directly from your API response structure
      setStorefrontData({
        ...storefrontRes.data,
        products: productsRes.products,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch live settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  }, []);
  const handleSaveStorefront = async (updatedData: Partial<StorefrontData>) => {
    setSaving(true);
    try {
      // --- LOCAL STORAGE PERSISTENCE ---
      // We save the updated data locally first so the "Preview" and "Public View" tabs 
      // can read it immediately.
      const currentLocal = JSON.parse(localStorage.getItem("vendorStorefrontDetails") || "{}");
      const mergedData = { ...currentLocal, ...updatedData };
      localStorage.setItem("vendorStorefrontDetails", JSON.stringify(mergedData));

      // --- LIVE API LOGIC (COMMENTED OUT) ---
      /*
      let bannerUrl = storefrontData?.bannerImage;
      let logoUrl = storefrontData?.logo;

      if (updatedData.bannerFile) {
        const response = await vendorService.uploadImage(updatedData.bannerFile);
        bannerUrl = response.urls[0];
      }

      if (updatedData.logoFile) {
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
      */

      // Update local state to trigger re-renders in other tabs
      setStorefrontData((prev) =>
        prev ? { ...prev, ...mergedData } : mergedData
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

  // Rest of the functions (handlePublishStorefront, getStorefrontUrl) remain unchanged 
  // as they deal with the Published state which is fine to keep live.
  const handlePublishStorefront = async () => {
    setSaving(true);
    try {
      const newPublishedState = !storefrontData?.isPublished;
      // await storefrontService.publishStorefront(newPublishedState); // Live toggle

      setStorefrontData(prev =>
        prev ? { ...prev, isPublished: newPublishedState } : prev
      );

      toast({
        title: newPublishedState ? "Storefront Published!" : "Storefront Unpublished!",
        variant: "default",
      });
    } catch (error) {
      console.error("Publish error:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStorefrontUrl = () => {
    return `${window.location.origin}/storefront/${storefrontData?.slug || 'my-shop'}`;
  };

  const tabs: { id: TabId; label: string; icon: string; description: string; }[] = [
    { id: "public", label: "Public View", icon: "ExternalLink", description: "Customer view" },
    { id: "preview", label: "Preview", icon: "Eye", description: "See how it looks" },
    { id: "customize", label: "Customize", icon: "Palette", description: "Design your storefront" },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Icon name="Loader2" className="animate-spin text-primary" size={40} />
    </div>
  );

  function loadData(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <Head>
        <title>Storefront Manager</title>
      </Head>

      <div className="min-h-screen bg-background">
        <main className="max-w-[85vw] mt-16 md:mt-0 mx-auto px-0 md:px-4 py-6">
          {/* Header and Buttons */}
          <div className="flex flex-col mb-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Storefront Manager</h1>
              <p className="text-text-muted">Manage your local and live presence</p>
            </div>
            <div className="flex items-center mt-4 space-x-3 lg:mt-0">
              <Button variant="outline" onClick={() => setActiveTab("preview")}>
                <Icon name="Eye" size={16} className="mr-2" />
                Live Preview
              </Button>
              <Button 
                variant={storefrontData?.isPublished ? "secondary" : "primary"}
                onClick={handlePublishStorefront}
              >
                {storefrontData?.isPublished ? "Unpublish" : "Publish Store"}
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
                  activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-text-muted"
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

            {activeTab === "preview" && (
              <BusinessStorefrontPreview />
            )}

            {activeTab === "customize" && (
    <StorefrontCustomization
      initialData={storefrontData}
      onSuccess={loadData} // Refresh data after save
    />
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default VendorStorefront;