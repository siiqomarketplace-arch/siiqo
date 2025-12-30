"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, Clock, Building, Globe, CheckCircle2, 
  MessageCircle, Palette, Layout, Phone, 
  Save, Smartphone, Monitor, Instagram, 
  Facebook, Twitter, Trash2, Plus, Lock, X, ChevronLeft
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

const StorefrontCustomization = () => {
  const [isSaving, setIsSaving] = useState(false);
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState({
    business_name: "Your Business Name",
    slug: "your-nickanme",
    about: "Describe your business",
    themeColor: "#1E293B",
    fontFamily: "Montserrat",
    workingHoursEnabled: true,
    openTime: "09:00",
    closeTime: "21:00",
    selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    showCallButton: true,
    phone: "Your phone number",
    socialLinks: { facebook: "", instagram: "", twitter: "" },
    coverImage: null as string | null,
    profileImage: null as string | null,
    products: [],
    template_options: { theme: "#1E293B", font: "Montserrat" }
  });

  useEffect(() => {
    const saved = localStorage.getItem("vendorStorefrontDetails");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("vendorStorefrontDetails", JSON.stringify(settings));
  }, [settings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "coverImage" | "profileImage") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image under 2MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSetting(type, reader.result as string);
        toast({ title: "Image uploaded successfully" });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleDay = (day: string) => {
    const current = settings.selectedDays;
    updateSetting("selectedDays", 
      current.includes(day) ? current.filter(d => d !== day) : [...current, day]
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => { 
      setIsSaving(false); 
      toast({ title: "Changes Published Live!" }); 
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Hidden File Inputs */}
      <input type="file" className="hidden" ref={coverInputRef} accept="image/*" onChange={(e) => handleFileChange(e, "coverImage")} />
      <input type="file" className="hidden" ref={profileInputRef} accept="image/*" onChange={(e) => handleFileChange(e, "profileImage")} />

      {/* --- TOP HEADER --- */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/vendor/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={20} className="text-slate-600" />
            </Link>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900">Store Identity</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customize your public presence</p>
            </div>
          </div>
          
          <Link 
            href={`/siiqo.com/${settings.slug}`} 
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            <Globe size={14} /> View Live Store
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* BRAND ASSETS SECTION */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Camera size={14} /> Brand Visuals
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cover Photo Slot */}
            <div className="md:col-span-2 space-y-2">
               <p className="text-xs font-bold text-slate-700 ml-1">Cover Banner</p>
               <div 
                onClick={() => coverInputRef.current?.click()}
                className="relative h-48 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-blue-400 transition-all"
              >
                {settings.coverImage ? (
                  <>
                    <img src={settings.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs font-bold bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">Change Cover</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Plus size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Click to upload banner</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Photo Slot */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 ml-1">Store Logo</p>
              <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 group cursor-pointer hover:border-blue-400 transition-all relative overflow-hidden"
                   onClick={() => profileInputRef.current?.click()}>
                 {settings.profileImage ? (
                  <img src={settings.profileImage} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <Building size={40} className="text-slate-200" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BASIC INFO SECTION */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Layout size={14} /> Core Details
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Official Name</span>
              <input 
                type="text"
                value={settings.business_name}
                onChange={(e) => updateSetting('business_name', e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Store Link (Slug)</span>
              <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4">
                <span className="text-xs font-bold text-slate-400 italic">/store/</span>
                <input 
                  type="text"
                  value={settings.slug}
                  onChange={(e) => updateSetting('slug', e.target.value)}
                  className="flex-1 p-4 bg-transparent text-sm font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">Store Bio / Description</span>
            <textarea 
              value={settings.about}
              onChange={(e) => updateSetting('about', e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 ring-blue-500 outline-none min-h-[120px]"
            />
          </div>
        </div>

        {/* AVAILABILITY & THEME GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Availability */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} /> Working Hours
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`py-3 rounded-xl text-[10px] font-black transition-all ${
                    settings.selectedDays.includes(day) 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'bg-slate-50 text-slate-400 border border-slate-100'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <input type="time" value={settings.openTime} onChange={(e) => updateSetting('openTime', e.target.value)} className="p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100" />
              <input type="time" value={settings.closeTime} onChange={(e) => updateSetting('closeTime', e.target.value)} className="p-4 bg-slate-50 rounded-2xl text-xs font-bold border border-slate-100" />
            </div>
          </div>

          {/* Theme Color */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Palette size={14} /> Brand Color
            </label>
            <div className="flex flex-wrap gap-3">
              {['#1E293B', '#F97316', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateSetting('themeColor', color)}
                  className={`w-12 h-12 rounded-full border-4 transition-all ${settings.themeColor === color ? 'border-blue-100 scale-110 shadow-lg' : 'border-white shadow-sm'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-4 border-white shadow-sm flex items-center justify-center bg-slate-50 cursor-pointer">
                 <input 
                  type="color" 
                  value={settings.themeColor} 
                  onChange={(e) => updateSetting('themeColor', e.target.value)}
                  className="absolute inset-0 scale-150 cursor-pointer opacity-100"
                />
              </div>
            </div>
          </div>
        </div>
{/* Phone */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Phone size={14} /> Contact Number
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="text" 
              value={settings.phone}
              onChange={(e) => updateSetting('phone', e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 ring-blue-500 outline-none"
              placeholder="Enter your phone number"
                    />
                    <button className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" title="Clear phone number">
                      <Trash2 size={18} className="text-slate-600" />
                    </button>
                    </div>
                  </div>
        {/* SOCIAL LINKS */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Globe size={14} /> Social Channels
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10  rounded-xl flex items-center justify-center text-pink-600"><Instagram size={18} /></div>
                <input 
                  type="text" 
                  placeholder="@username" 
                  value={settings.socialLinks.instagram}
                  onChange={(e) => updateSetting("socialLinks", { ...settings.socialLinks, instagram: e.target.value })}
                  className="bg-transparent flex-1 text-xs font-bold outline-none" 
                />
              </div>
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10  rounded-xl flex items-center justify-center text-blue-600 "><Facebook size={18} /></div>
                <input 
                  type="text" 
                  placeholder="Page Name" 
                  value={settings.socialLinks.facebook}
                  onChange={(e) => updateSetting("socialLinks", { ...settings.socialLinks, facebook: e.target.value })}
                  className="bg-transparent flex-1 text-xs font-bold outline-none" 
                />
              </div>
          </div>
        </div>
      </main>

      {/* --- FLOATING ACTION BAR --- */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 z-40">
        <div className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-xl p-4 rounded-[2rem] flex items-center justify-between shadow-2xl border border-white/10">
          <div className="hidden sm:flex flex-col ml-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-saved</span>
            <span className="text-white text-xs font-bold">Latest changes local</span>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
          
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] sm:flex-initial px-8 py-4 bg-white text-slate-900 rounded-2xl text-xs font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? <div className="animate-spin h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full" /> : <><CheckCircle2 size={16} /> Publish Changes</>}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontCustomization;