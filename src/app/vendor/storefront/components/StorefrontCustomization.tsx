"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, Clock, Building, Globe, CheckCircle2, 
  Palette, Layout, Phone, Instagram, 
  Facebook, Trash2, Plus, ChevronLeft
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { vendorService } from "@/services/vendorService"; // Ensure this has updateSettings and uploadImage

interface Props {
  initialData: any;
  onSuccess: () => void;
}

const StorefrontCustomization = ({ initialData, onSuccess }: Props) => {
  const [isSaving, setIsSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with API structure
  const [settings, setSettings] = useState({
    business_name: initialData?.store_settings?.business_name || "",
    description: initialData?.store_settings?.description || "",
    address: initialData?.store_settings?.address || "",
    phone: initialData?.personal_info?.phone || "",
    template_options: {
      primary_color: initialData?.store_settings?.template_options?.primary_color || "#000000",
      secondary_color: initialData?.store_settings?.template_options?.secondary_color || "#ffffff",
      layout_style: initialData?.store_settings?.template_options?.layout_style || "default"
    },
    banner_url: initialData?.store_settings?.banner_url || null,
    logo_url: initialData?.store_settings?.logo_url || null,
    social_links: initialData?.store_settings?.social_links || {},
    working_hours: initialData?.store_settings?.working_hours || {}
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handle Image Uploads to API
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "banner_url" | "logo_url") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      // Assuming vendorService.getVendorProfile returns { urls: [string] }
      const response = await vendorService.getVendorProfile();
      const uploadedUrl = response.urls[0];
      updateSetting(field, uploadedUrl);
      toast({ title: "Image uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map state back to your API's expected payload
      const payload = {
        business_name: settings.business_name,
        description: settings.description,
        address: settings.address,
        banner_url: settings.banner_url,
        logo_url: settings.logo_url,
        template_options: settings.template_options,
        social_links: settings.social_links,
        working_hours: settings.working_hours
      };

      // Ensure vendorService.updateSettings hits https://server.siiqo.com/api/vendor/update-settings
      await vendorService.updateVendorSettings(payload);
      
      toast({ title: "Settings Updated Successfully!" });
      onSuccess(); // Refresh parent state
    } catch (error) {
      toast({ 
        title: "Save Failed", 
        description: "Could not sync with server.", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <input type="file" className="hidden" ref={coverInputRef} onChange={(e) => handleImageUpload(e, "banner_url")} />
      <input type="file" className="hidden" ref={profileInputRef} onChange={(e) => handleImageUpload(e, "logo_url")} />

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/vendor/dashboard" className="p-2 hover:bg-slate-100 rounded-full">
              <ChevronLeft size={20} className="text-slate-600" />
            </Link>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900">Store Identity</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live API Sync Active</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* BRAND VISUALS */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Camera size={14} /> Brand Visuals
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
               <p className="text-xs font-bold text-slate-700">Cover Banner</p>
               <div onClick={() => coverInputRef.current?.click()} className="relative h-48 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer">
                {settings.banner_url ? (
                  <img src={settings.banner_url} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                  <Plus className="text-slate-400" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Store Logo</p>
              <div onClick={() => profileInputRef.current?.click()} className="flex items-center justify-center h-48 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 cursor-pointer overflow-hidden">
                {settings.logo_url ? (
                  <img src={settings.logo_url} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <Building size={40} className="text-slate-200" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CORE DETAILS */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Layout size={14} /> Core Details
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Business Name</span>
              <input 
                type="text"
                value={settings.business_name}
                onChange={(e) => updateSetting('business_name', e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Phone Number</span>
              <input 
                type="text"
                value={settings.phone}
                onChange={(e) => updateSetting('phone', e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Description</span>
            <textarea 
              value={settings.description}
              onChange={(e) => updateSetting('description', e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm min-h-[100px] outline-none"
            />
          </div>
        </div>

        {/* COLORS */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Palette size={14} /> Theme Colors
          </label>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Primary</span>
              <input 
                type="color" 
                value={settings.template_options.primary_color}
                onChange={(e) => updateSetting('template_options', { ...settings.template_options, primary_color: e.target.value })}
                className="w-16 h-16 rounded-xl cursor-pointer" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Secondary</span>
              <input 
                type="color" 
                value={settings.template_options.secondary_color}
                onChange={(e) => updateSetting('template_options', { ...settings.template_options, secondary_color: e.target.value })}
                className="w-16 h-16 rounded-xl cursor-pointer" 
              />
            </div>
          </div>
        </div>
      </main>

      {/* --- FLOATING SAVE BAR --- */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 z-40">
        <div className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-xl p-4 rounded-[2rem] flex items-center justify-between shadow-2xl border border-white/10">
          <div className="hidden sm:flex flex-col ml-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Server Sync</span>
            <span className="text-white text-xs font-bold">Changes will be public immediately</span>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-2xl text-xs font-black hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <div className="animate-spin h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full" />
            ) : (
              <><CheckCircle2 size={16} /> Save to Cloud</>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontCustomization;