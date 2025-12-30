"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  MessageCircle, 
  Clock, 
  Building,
  ChevronLeft,
  User,
  Search,
  Globe,
  Lock,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import TabNavigation from "./TabNavigation";
import ProductGrid from "./ProductGrid";
import ContactSection from "./ContactSection";
import { StorefrontData } from "@/types/vendor/storefront";

const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 13 Pro Max - 256GB Gold",
    product_price: 750000,
    description: "Smartphones",
    images: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800"],
    stock: 5,
    rating: 4.8
  }
];

interface Props {
  storefrontData: StorefrontData | null;
  products: any[];
}

type TabId = "products" | "about" | "reviews" | "contact";

const BusinessStorefrontView: React.FC<Props> = ({ storefrontData, products: initialProducts }) => {
  const [activeTab, setActiveTab] = useState<TabId>("products");
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncData = () => {
      const savedLocal = localStorage.getItem("vendorStorefrontDetails");
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        setBusiness({
          ...storefrontData,
          ...parsed,
          products: parsed.products?.length > 0 ? parsed.products : DUMMY_PRODUCTS,
          selectedDays: parsed.selectedDays || []
        });
      } else {
        setBusiness({ 
          ...storefrontData, 
          products: DUMMY_PRODUCTS,
          selectedDays: [] 
        });
      }
      setLoading(false);
    };

    syncData();
    window.addEventListener('storage', syncData);
    return () => window.removeEventListener('storage', syncData);
  }, [storefrontData]);

  if (loading || !business) return null;

  const themeColor = business.themeColor || "#1E293B";
  const fontFamily = business.fontFamily || "Inter";

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <ProductGrid />
          </div>
        );
      case "about":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16" />
               <div className="relative">
                 <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Our Mission</h4>
                 <h3 className="text-xl font-black text-slate-900 mb-4">{business.business_name}</h3>
                 <p className="text-sm text-slate-500 leading-relaxed font-medium">
                   {business.about || "This business hasn't shared their story yet."}
                 </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-100 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl shadow-lg" style={{ backgroundColor: themeColor }} />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Theme</p>
                  <p className="text-xs font-black text-slate-800 tracking-tight">{themeColor}</p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-slate-100 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
                  <Globe size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Typography</p>
                  <p className="text-xs font-black text-slate-800 tracking-tight">{fontFamily}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "contact":
        return <ContactSection business={business} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-44" style={{ fontFamily }}>
      
      {/* 1. DRAFT BANNER - Sleeker */}
      <div className="bg-slate-900 text-white/90 py-3 px-4 flex items-center justify-center gap-3 text-[10px] font-black tracking-[0.15em] sticky top-0 z-[100] backdrop-blur-md">
        <ShieldCheck size={14} className="text-orange-400" />
        <span className="uppercase">Merchant Preview Mode</span>
      </div>

      {/* 2. HERO SECTION - Modern Gradient */}
      <div className="relative pt-8 pb-24 px-8 text-white overflow-hidden" style={{ backgroundColor: themeColor }}>
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
        
        <div className="flex justify-between items-center relative z-10 mb-10">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10 active:scale-90 transition-transform">
            <ChevronLeft size={20} />
          </div>
          <div className="flex gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10">
              <Search size={20} />
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10">
              <User size={20} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center p-1 shadow-2xl rotate-3">
              <div className="w-full h-full bg-slate-50 rounded-[2.2rem] overflow-hidden">
                {business.profileImage ? (
                  <img src={business.profileImage} className="w-full h-full object-cover" alt="Profile" />
                ) : <Building size={32} className="text-slate-200 mt-6 mx-auto" />}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-2xl border-4 border-white shadow-xl">
              <CheckCircle2 size={16} fill="currentColor" className="text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-black leading-none mb-2 tracking-tighter uppercase">
            {business.business_name}
          </h2>
          <div className="flex items-center gap-2 bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
            <span className="text-[10px] font-bold tracking-widest text-white/70">siiqo.com/{business.slug}</span>
            <ExternalLink size={10} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* 3. FLOATING INFO CARD */}
      <div className="max-w-xl mx-auto px-6 -mt-12 relative z-50">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-900 font-black text-lg tracking-tight">
              <Clock size={18} className="text-blue-500" />
              <span>{business.openTime || "09:00"} — {business.closeTime || "21:00"}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Store Business Hours</p>
          </div>

          <div className="flex -space-x-2">
            {(business.selectedDays || []).slice(0, 5).map((day: string, index: number) => (
              <div 
                key={index} 
                className="w-9 h-9 rounded-2xl text-white text-[11px] font-black flex items-center justify-center border-4 border-white shadow-sm transition-transform hover:-translate-y-1" 
                style={{ backgroundColor: themeColor, zIndex: 10 - index }}
              >
                {day.charAt(0)}
              </div>
            ))}
            {business.selectedDays?.length > 5 && (
              <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-400 text-[10px] font-bold flex items-center justify-center border-4 border-white">
                +{business.selectedDays.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. TABS & CONTENT */}
      <div className="max-w-xl mx-auto px-6 mt-10">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabId)}
          tabs={[
            { id: "products", label: "Catalogs", count: business.products?.length || 0 },
            { id: "about", label: "Info" },
            { id: "contact", label: "Support" }
          ]}
        />

        <div className="mt-10">
          {renderTabContent()}
        </div>
      </div>

      {/* 5. BOTTOM CTA - "The App Feel" */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-[100]">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button className="flex-1 bg-slate-900 text-white h-16 rounded-[2rem] text-sm font-black shadow-2xl shadow-slate-400 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group">
            Publish Live Storefront
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            className="w-16 h-16 bg-green-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-green-100 active:scale-90 transition-all"
            onClick={() => window.open(`https://wa.me/${business.phone}`)}
          >
            <MessageCircle size={24} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessStorefrontView;