// "use client";
// import React, { useEffect, useState } from "react";
// import ProductGrid from "./components/ProductGrid";
// import AboutSection from "./components/AboutSection";
// import { Storefront } from "@/types/storeFront";
// import TabNavigation from "./components/TabNavigation";
// import ContactSection from "./components/ContactSection";
// import ReviewsSection from "./components/ReviewSection";
// import Icon from "@/components/AppIcon";
// import Image from "@/components/ui/alt/AppImageAlt";
// import NotificationToast from "@/components/ui/NotificationToast";
// import { userService } from "@/services/userService";
// import { productService } from "@/services/productService";
// import { Review, Product, VendorInfo } from "@/types/seller-profile";

// type TabId = "products" | "about" | "reviews" | "contact";

// interface Notification {
//   id: string;
//   type: "success" | "error" | "info";
//   message: string;
// }


// const VendorDetails = () => {
//   const [vendorInformation, setVendorInformation] = useState<VendorInfo | null>(
//     null
//   );
//   const [products, setProducts] = useState<Product[]>([]);
//   const [business, setBusiness] = useState<Storefront | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<TabId>("products");
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [isSent, setIsSent] = useState(false);

//   const getValidImageUrl = (url?: string | null) => {
//     if (!url) return "/placeholder.jpg";
//     if (url.startsWith("http")) return url;
//     return `${process.env.NEXT_PUBLIC_API_BASE_URL || "/api"}${url}`;
//   };

//   useEffect(() => {
//     const email = sessionStorage.getItem("selectedVendorEmail");
//     if (!email) {
//       console.error("No vendor email found in sessionStorage");
//       setLoading(false);
//       return;
//     }

//     const fetchVendorData = async () => {
//       try {
//         const [vendorRes, productRes] = await Promise.all([
//           userService.getVendorByEmail(email),
//           productService.getProductsByVendorEmail(email),
//         ]);

//         setVendorInformation(vendorRes);
//         setProducts(productRes.products || []);
//         // Assuming business data can be derived or is part of vendorRes
//         // For now, setting a mock or partial Storefront based on available data
//         setBusiness({
//           id: 0, // Placeholder
//           business_name: vendorRes.name,
//           description: "", // Placeholder
//           established_at: "", // Placeholder
//           ratings: vendorRes.average_rating,
//           business_banner: vendorRes.banner || null,
//           vendor: null, // Placeholder
//           address: "", // Placeholder
//           extended: null, // Placeholder
//         });
//       } catch (error) {
//         console.error("Error fetching vendor details:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchVendorData();
//   }, []);

//   const averageRating =
//     vendorInformation?.average_rating ??
//     (vendorInformation?.reviews?.length
//       ? vendorInformation.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
//         vendorInformation.reviews.length
//       : 0);

//   const totalReviews = vendorInformation?.reviews?.length || 0;

//   const tabs = React.useMemo(
//     () => [
//       { id: "products", label: "Products", count: products.length },
//       { id: "about", label: "About" },
//       { id: "reviews", label: "Reviews", count: totalReviews },
//       { id: "contact", label: "Contact" },
//     ],
//     [products.length, totalReviews]
//   );

//   const userProfile = {
//     name: vendorInformation?.name || "Sarah Johnson",
//     phone: vendorInformation?.phone_number || "+1 (555) 123-4567",
//     banner_image: vendorInformation?.banner || "",
//     identity: vendorInformation?.is_verified || "Not verified",
//     avatar: getValidImageUrl(vendorInformation?.profile_pic),
//     location: vendorInformation?.address || "San Francisco, CA",
//     joinDate: "March 2023",
//     isVerified: { phone: true, identity: true },
//     stats: {
//       itemsListed: products.length,
//       sellerRating: averageRating.toFixed(1),
//       totalReviews,
//     },
//     bio: "Passionate about sustainable living and finding great deals on quality items...",
//   };

//   const addNotification = (
//     type: "success" | "error" | "info",
//     message: string
//   ) => {
//     const id = Date.now().toString();
//     setNotifications(prev => [...prev, { id, type, message }]);
//   };

//   const removeNotification = (id: string) => {
//     setNotifications(prev => prev.filter(n => n.id !== id));
//   };

//   const handleSubmitContactForm = async (data: {
//     name: string;
//     email: string;
//     phone: string;
//     message: string;
//   }) => {
//     if (!data.name || !data.email || !data.message) {
//       addNotification("error", "Business information is missing.");
//       return;
//     }

//     try {
//       await new Promise(resolve => setTimeout(resolve, 1500));

//       setIsSent(true);
//       addNotification("success", "Your message has been sent successfully!");

//       console.log("Simulated message data:", {
//         ...data,
//       });

//       setTimeout(() => setIsSent(false), 2000);
//     } catch (error) {
//       console.error("Simulated error sending message:", error);
//       addNotification("error", "Failed to send message. Please try again.");
//     }
//   };

//   const handleSubmitReviewForm = async (data: {
//     name: string;
//     email: string;
//     rating: number;
//     message: string;
//   }) => {
//     if (!data.name || !data.email || !data.rating || !data.message) {
//       addNotification("error", "Business information is missing.");
//       return;
//     }

//     try {
//       await new Promise(resolve => setTimeout(resolve, 1500));

//       setIsSent(true);
//       addNotification("success", "Your message has been sent successfully!");

//       console.log("Review Submitted: ", {
//         ...data,
//       });

//       setTimeout(() => setIsSent(false), 2000);
//     } catch (error) {
//       console.error("Simulated error sending message:", error);
//       addNotification("error", "Failed to send message. Please try again.");
//     }
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "products":
//         return <ProductGrid products={userProfile ? products : []} />;
//       case "about":
//         return business ? (
//           <AboutSection
//             business={{
//               name: business.business_name,
//               description: business.description,
//               hours: business.extended?.hour || [],
//             }}
//           />
//         ) : null;
//       case "reviews":
//         return (
//           <ReviewsSection
//             reviews={vendorInformation?.reviews || []}
//             businessRating={{ average: 0, total: 0 }}
//             onWriteReview={handleSubmitReviewForm}
//           />
//         );
//       case "contact":
//         return business ? (
//           <ContactSection
//             business={{
//               name: business.business_name,
//               phone: business.extended?.phone,
//               address: business.address,
//             }}
//             onSendMessage={handleSubmitContactForm}
//           />
//         ) : null;
//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-background">
//         <div className="text-center">
//           <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
//           <p className="text-text-secondary">Loading vendor details...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {notifications.map(notification => (
//         <NotificationToast
//           key={notification.id}
//           notification={notification}
//           onClose={removeNotification}
//         />
//       ))}

//       <div className="relative flex w-full h-48 mb-8 overflow-hidden sm:h-64 lg:h-72">
//         {userProfile?.banner_image &&
//         userProfile?.banner_image !== "/banner.jpg" ? (
//           <>
//             <Image
//               src={userProfile.banner_image}
//               alt={`${userProfile.name || "Vendor"} banner`}
//               className="object-cover w-full h-full"
//             />
//             <div className="absolute inset-0 bg-black/30"></div>
//           </>
//         ) : (
//           <div className="flex items-center justify-center w-full h-full bg-blue-100">
//             <h2 className="font-semibold text-blue-200 text-9xl">
//               Vendor Store
//             </h2>
//           </div>
//         )}
//       </div>

//       <div className="px-4 mt-6 mb-28">
//         <div className="grid grid-cols-1 gap-6 mx-auto md:grid-cols-12 max-w-7xl">
//           <section className="space-y-6 md:col-span-4">
//             <div className="col-span-4">
//               <div className="p-6 mb-6 border rounded-lg bg-surface border-border">
//                 <div className="mb-6 text-center">
//                   <div className="relative w-24 h-24 mx-auto overflow-hidden rounded-full">
//                     <Image
//                       src={userProfile.avatar}
//                       alt={userProfile.name}
//                       className="object-cover"
//                       sizes="96px"
//                     />
//                   </div>
//                   <h1 className="mt-4 text-2xl font-semibold font-heading text-text-primary">
//                     {userProfile.name}
//                   </h1>
//                   <span className="flex items-center justify-center gap-1 mt-2 text-sm text-text-secondary">
//                     <Icon name="MapPin" size={14} />
//                     {userProfile.location}
//                   </span>
//                   <p className="mt-2 text-sm text-text-tertiary">
//                     Member since {userProfile.joinDate}
//                   </p>
//                 </div>

//                 <div className="mb-6 space-y-2">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <Icon
//                         name="Phone"
//                         size={16}
//                         className="text-text-secondary"
//                       />
//                       <span className="text-sm text-text-secondary">Phone</span>
//                     </div>
//                     {userProfile.isVerified.phone ? (
//                       <span className="text-sm">{userProfile.phone}</span>
//                     ) : (
//                       <span className="text-xs text-text-tertiary">
//                         Not available
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 <div className="mb-6">
//                   <h3 className="mb-2 text-sm font-medium text-text-primary">
//                     About
//                   </h3>
//                   <p className="text-sm leading-relaxed text-text-secondary">
//                     {userProfile.bio}
//                   </p>
//                 </div>
//               </div>

//               <div className="p-6 border rounded-lg bg-surface border-border">
//                 <h3 className="mb-4 text-lg font-semibold font-heading text-text-primary">
//                   Activity Stats
//                 </h3>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <Icon name="Package" size={16} className="text-primary" />
//                       <span className="text-sm text-text-secondary">
//                         Items Listed
//                       </span>
//                     </div>
//                     <span className="font-semibold text-text-primary">
//                       {userProfile.stats.itemsListed}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <Icon
//                         name="Star"
//                         size={16}
//                         className="text-orange-500 fill-current"
//                       />
//                       <span className="text-sm text-text-secondary">
//                         Seller Rating
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <span className="font-semibold text-text-primary">
//                         {userProfile.stats.sellerRating}
//                       </span>
//                       <span className="text-xs text-text-tertiary">
//                         ({userProfile.stats.totalReviews})
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>

//           <section className="max-h-screen px-4 md:col-span-8 lg:overflow-y-auto custom-scrollbar">
//             <TabNavigation
//               activeTab={activeTab}
//               onTabChange={id => setActiveTab(id as TabId)}
//               tabs={tabs}
//             />
//             <div className="mt-4">{renderTabContent()}</div>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VendorDetails;
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Star, Package, CheckCircle2, 
  Calendar, ShieldCheck, Info, Share2,
  ChevronLeft, Search, User, MessageCircle,
  ExternalLink, Clock, Building
} from "lucide-react";

import ProductGrid from "./components/ProductGrid";
import TabNavigation from "./components/TabNavigation";
import ContactSection from "./components/ContactSection";
import ReviewsSection from "./components/ReviewSection";
import Image from "@/components/ui/alt/AppImageAlt";
import NotificationToast from "@/components/ui/NotificationToast";

// Logic Services
import { userService } from "@/services/userService";
import { VendorInfo } from "@/types/seller-profile";

type TabId = "products" | "about" | "reviews" | "contact";

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

const VendorDetails = () => {
  const [vendorInformation, setVendorInformation] = useState<VendorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("products");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Local Storage / Theme State
  const [localStore, setLocalStore] = useState<any>(null);

  useEffect(() => {
    const syncAndFetch = async () => {
      const email = sessionStorage.getItem("selectedVendorEmail") || "emmanuelolamide706@gmail.com";
      
      // 1. Sync from Local Storage (for draft/preview feel)
      const savedLocal = localStorage.getItem("vendorStorefrontDetails");
      if (savedLocal) {
        setLocalStore(JSON.parse(savedLocal));
      }

      // 2. Fetch from Service (for production data)
      try {
        const vendorRes = await userService.getVendorByEmail(email);
        setVendorInformation(vendorRes);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      } finally {
        setLoading(false);
      }
    };

    syncAndFetch();
    window.addEventListener('storage', syncAndFetch);
    return () => window.removeEventListener('storage', syncAndFetch);
  }, []);

  // Derived Business Data with Fallbacks
  const business = {
    name: localStore?.business_name || vendorInformation?.name || "TWEG001",
    themeColor: localStore?.themeColor || "#075E54",
    fontFamily: localStore?.fontFamily || "Inter",
    slug: localStore?.slug || "store",
    profileImage: localStore?.profileImage || `https://ui-avatars.com/api/?background=075E54&color=fff&name=${vendorInformation?.name || 'Store'}`,
    description: localStore?.about || vendorInformation?.address || "Premium vendor on our platform.",
    phone: localStore?.phone || vendorInformation?.phone_number || "0000000000",
    openTime: localStore?.openTime || "09:00",
    closeTime: localStore?.closeTime || "18:00",
    selectedDays: localStore?.selectedDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  };

  const averageRating = vendorInformation?.average_rating || 4.8;
  const totalReviews = vendorInformation?.reviews?.length || 0;

  const handleShare = async () => {
    const shareData = {
      title: business.name,
      text: `Check out ${business.name} on our platform!`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        addNotification("success", "Link copied to clipboard!");
      }
    } catch (err) { console.error(err); }
  };

  const addNotification = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const tabs = useMemo(() => [
    { id: "products", label: "Catalog", count: 0 },
    { id: "about", label: "About" },
    { id: "reviews", label: "Reviews", count: totalReviews },
    { id: "contact", label: "Contact" },
  ], [totalReviews]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "products": return <ProductGrid />;
      case "about":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
               <div className="relative">
                 <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Our Mission</h4>
                 <h3 className="text-xl font-black text-slate-900 mb-4">{business.name}</h3>
                 <p className="text-sm text-slate-500 leading-relaxed font-medium">{business.description}</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-100 flex items-center gap-3">
                <ShieldCheck className="text-green-600" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                  <p className="text-xs font-black text-slate-800 tracking-tight">Verified Seller</p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-slate-100 flex items-center gap-3">
                <Calendar className="text-blue-600" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Joined</p>
                  <p className="text-xs font-black text-slate-800 tracking-tight">Dec 2025</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "reviews":
        return <ReviewsSection reviews={vendorInformation?.reviews || []} businessRating={{ average: averageRating, total: totalReviews }} onWriteReview={() => {}} />;
      case "contact":
        return <ContactSection business={{ name: business.name, phone: business.phone, address: vendorInformation?.address }} onSendMessage={async () => addNotification("success", "Message Sent!")} />;
      default: return null;
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#075E54]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-44" style={{ fontFamily: business.fontFamily }}>
      <AnimatePresence>
        {notifications.map(n => (
          <NotificationToast key={n.id} notification={n} onClose={(id) => setNotifications(prev => prev.filter(x => x.id !== id))} />
        ))}
      </AnimatePresence>

      {/* HERO SECTION */}
      <div className="relative pt-8 pb-24 px-8 text-white overflow-hidden" style={{ backgroundColor: business.themeColor }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
        
        <div className="flex justify-between items-center relative z-10 mb-10">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10 active:scale-90 transition-transform cursor-pointer" onClick={() => window.history.back()}>
            <ChevronLeft size={20} />
          </div>
          <div className="flex gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10 cursor-pointer" onClick={handleShare}>
              <Share2 size={20} />
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
                <Image src={business.profileImage} className="w-full h-full object-cover" alt="Profile" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-2xl border-4 border-white shadow-xl">
              <CheckCircle2 size={16} fill="currentColor" />
            </div>
          </div>

          <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase">{business.name}</h2>
          <div className="flex items-center gap-2 bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
            <span className="text-[10px] font-bold tracking-widest text-white/70">siiqo.com/{business.slug}</span>
            <ExternalLink size={10} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* FLOATING ACTION CARD */}
      <div className="max-w-xl mx-auto px-6 -mt-12 relative z-50">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-900 font-black text-lg tracking-tight">
              <Star size={18} className="text-orange-400 fill-orange-400" />
              <span>{averageRating}</span>
              <span className="text-slate-300 font-medium">/ 5.0</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{totalReviews} Customer Reviews</p>
          </div>

          <div className="flex -space-x-2">
            {business.selectedDays.slice(0, 5).map((day: string, index: number) => (
              <div 
                key={index} 
                className="w-9 h-9 rounded-2xl text-white text-[11px] font-black flex items-center justify-center border-4 border-white shadow-sm transition-transform hover:-translate-y-1" 
                style={{ backgroundColor: business.themeColor, zIndex: 10 - index }}
              >
                {day.charAt(0)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-xl mx-auto px-6 mt-10">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabId)}
          tabs={tabs}
        />

        <div className="mt-10">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>

      {/* STICKY BOTTOM ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-[100] pointer-events-none">
        <div className="max-w-xl mx-auto flex items-center gap-3 pointer-events-auto">
          <button 
            className="flex-1 bg-slate-900 text-white h-16 rounded-[2rem] text-sm font-black shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
            onClick={() => setActiveTab("products")}
          >
            <Package size={18} />
            View Full Catalog
          </button>
          
          <button 
            className="w-16 h-16 bg-green-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl active:scale-90 transition-all"
            onClick={() => window.open(`https://wa.me/${business.phone}`)}
          >
            <MessageCircle size={24} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;