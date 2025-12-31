// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Icon from "@/components/ui/AppIcon";
// import Image from "@/components/ui/AppImage";
// import { useLocationDetection } from "@/hooks/useLocationDetection";
// import { vendorService } from "@/services/vendorService";
// import { VendorData, UserProfileData } from "@/types/vendor/settings";

// // Sub-components
// import MyListings from "../user-profile/components/MyListings";
// import PurchaseHistory from "../user-profile/components/PurchaseHistory";
// import SavedItems from "../user-profile/components/SavedItems";
// import Settings from "../user-profile/components/Settings";

// // --- Types ---
// interface Tab {
//   id: string;
//   label: string;
//   icon: string;
//   count?: number;
// }

// interface QuickAction {
//   id: string;
//   label: string;
//   icon: string;
//   color: string;
//   badge?: number;
//   action: () => void;
// }

// const VendorProfile = () => {
//   // --- State ---
//   const [activeTab, setActiveTab] = useState<string>("listings");
//   const [vendorData, setVendorData] = useState<VendorData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [uploading, setUploading] = useState(false);
//   const [uploadingCover, setUploadingCover] = useState(false);
  
//   const router = useRouter();
//   const { location, loading: locationLoading, refresh: getCurrentLocation } = useLocationDetection();

//   // --- Authentication & Data Fetching ---
//   useEffect(() => {
//     const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken") || sessionStorage.getItem("RSToken");

//     if (!token) {
//       console.warn("No token found, redirecting to login...");
//       router.push("/auth/login");
//       return;
//     }

//     const fetchProfile = async () => {
//       try {
//         const response = await vendorService.getVendorProfile();
//         const profileData = response.data || response;
//         setVendorData(profileData);
//         setLoading(false);
//       } catch (err: any) {
//         console.error("Error fetching vendor profile:", err);
//         if (err.response && err.status === 401 || err.response?.status === 401) {
//           sessionStorage.clear();
//           router.push("/auth/login");
//         } else {
//           setLoading(false);
//         }
//       }
//     };

//     fetchProfile();
//   }, [router]);

//   // --- File Upload Handlers ---
//   const handleProfilePictureUpload = async (file: File) => {
//     if (!file) return;
//     setUploading(true);
//     try {
//       const response = await vendorService.uploadProfilePicture(file);
//       if (response) {
//         alert("Profile picture updated!");
//         window.location.reload();
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       alert("Failed to upload image.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleCoverPhotoUpload = async (file: File) => {
//     if (!file) return;
//     setUploadingCover(true);
//     try {
//       const response = await vendorService.uploadImage(file);
//       if (response) {
//         alert("Cover photo updated!");
//         window.location.reload();
//       }
//     } catch (error) {
//       console.error("Cover upload error:", error);
//       alert("Failed to upload cover.");
//     } finally {
//       setUploadingCover(false);
//     }
//   };

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
//     const file = event.target.files?.[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) return alert("Please select an image file");
//       const maxSize = type === 'cover' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
//       if (file.size > maxSize) return alert(`File size must be less than ${type === 'cover' ? 10 : 5}MB`);
      
//       if (type === 'avatar') handleProfilePictureUpload(file);
//       else handleCoverPhotoUpload(file);
//     }
//   };

//   // --- View Data Construction ---
//   const defaultAvatar = "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face";
//   const defaultCover = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='420'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial, sans-serif' font-size='28'%3EVendor Cover%3C/text%3E%3C/svg%3E";

//   const profileView = vendorData ? {
//     id: (vendorData as any).id || 1,
//     name: vendorData.store_name || `${vendorData.first_name || ""} ${vendorData.last_name || ""}`.trim() || "Vendor",
//     email: vendorData.email || "",
//     phone: vendorData.phone || "No phone provided",
//     avatar: vendorData.profile_pic || defaultAvatar,
//     cover: (vendorData as any).cover_photo || defaultCover,
//     location: location 
//       ? `${location.state}, ${location.country}` 
//       : (vendorData.state && vendorData.country ? `${vendorData.state}, ${vendorData.country}` : "Location not set"),
//     joinDate: vendorData.created_at ? new Date(vendorData.created_at).toLocaleDateString() : "Unknown",
//     isVerified: {
//       email: true,
//       phone: !!vendorData.phone,
//       identity: vendorData.kyc_status === "verified" || vendorData.isVerified === true,
//     },
//     stats: {
//       itemsListed: 24, // Mock data or add to vendor type
//       purchasesMade: 12,
//       sellerRating: 4.8,
//       totalReviews: 32,
//     },
//     bio: vendorData.bio || "Welcome to my seller profile.",
//   } : null;

//   // --- Config ---
//   const tabs: Tab[] = [
//     { id: "listings", label: "My Listings", icon: "Package", count: profileView?.stats.itemsListed },
//     { id: "orders", label: "My Purchases", icon: "ShoppingBag" },
//     { id: "saved", label: "Saved Items", icon: "Heart" }, // Added Saved Items
//     { id: "settings", label: "Settings", icon: "Settings" },
//   ];

//   const quickActions: QuickAction[] = [
//     {
//       id: "list-item",
//       label: "List New Item",
//       icon: "Plus",
//       color: "bg-primary text-white",
//       action: () => router.push("/vendor/dashboard/products/add"), // Adjust route as needed
//     },
//     {
//       id: "messages",
//       label: "Messages",
//       icon: "MessageCircle",
//       color: "bg-surface border border-border text-text-primary",
//       badge: 3,
//       action: () => router.push("/messages"),
//     },
//     {
//       id: "share",
//       label: "Share Profile",
//       icon: "Share2",
//       color: "bg-surface border border-border text-text-primary",
//       action: () => {
//         if (navigator.share) {
//           navigator.share({
//             title: profileView?.name,
//             text: `Check out ${profileView?.name}'s profile`,
//             url: window.location.href,
//           });
//         } else {
//           navigator.clipboard.writeText(window.location.href);
//           alert("Profile link copied to clipboard!");
//         }
//       },
//     },
//     {
//       id: "settings",
//       label: "Account",
//       icon: "User",
//       color: "bg-surface border border-border text-text-primary",
//       action: () => setActiveTab("settings"),
//     },
//   ];

//   const renderTabContent = () => {
//     if (!profileView) return null;
//     switch (activeTab) {
//       case "listings": return <MyListings />;
//       case "orders": return <PurchaseHistory />;
//       case "saved": return <SavedItems />; // Render Saved Items
//       case "settings": return <Settings userProfile={profileView as UserProfileData} />;
//       default: return <MyListings />;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
//         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
//         <p className="text-text-secondary animate-pulse">Loading Seller Details...</p>
//       </div>
//     );
//   }

//   if (!profileView) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-background">
//         <p className="text-error mb-4">Failed to load profile data.</p>
//         <button 
//           onClick={() => window.location.reload()} 
//           className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background pb-12">
//       {/* --- Cover & Header --- */}
//       <div className="relative">
//         <div
//           className="h-40 md:h-64 w-full bg-center bg-cover relative group"
//           style={{ backgroundImage: `url(${profileView.cover})` }}
//         >
//           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all" />

//           {/* Change Cover Button */}
//           <div className="absolute right-3 top-3">
//             <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white/90 rounded-md shadow-sm cursor-pointer hover:bg-white transition-colors">
//               <Icon name="Camera" size={14} />
//               <span className="hidden md:inline">{uploadingCover ? "Uploading..." : "Edit Cover"}</span>
//               <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, 'cover')} className="hidden" />
//             </label>
//           </div>

//           {/* Avatar (Overlapping) */}
//           <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10 md:-bottom-14 flex items-end">
//             <div className="relative group/avatar">
//               <div className="w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-surface bg-surface-secondary shadow-lg">
//                 <Image src={profileView.avatar} alt={profileView.name} fill className="object-cover" />
//               </div>
//               <label 
//                 className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity"
//                 title="Change Logo"
//               >
//                 {uploading ? <Icon name="Loader2" size={24} className="animate-spin" /> : <Icon name="Camera" size={24} />}
//                 <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, 'avatar')} className="hidden" />
//               </label>
              
//               {profileView.isVerified.identity && (
//                 <div className="absolute bottom-1 right-1 bg-primary text-white p-1 rounded-full border-2 border-surface" title="Identity Verified">
//                   <Icon name="Check" size={14} />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* --- Main Content --- */}
//       <div className="max-w-7xl mx-auto px-4 md:px-6">
//         <div className="h-12 md:h-16" /> {/* Spacer */}

//         {/* Name & Location */}
//         <div className="text-center mb-4">
//           <h1 className="text-xl md:text-3xl font-heading font-bold text-text-primary flex items-center justify-center gap-2">
//             {profileView.name}
//             {profileView.isVerified.identity && <Icon name="Shield" size={20} className="text-primary" />}
//           </h1>
          
//           <div className="mt-2 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm text-text-secondary">
//             <div className="flex items-center gap-1">
//               <Icon name="MapPin" size={14} />
//               <span>{locationLoading ? "Locating..." : profileView.location}</span>
//               <button onClick={getCurrentLocation} className="text-primary hover:text-primary-700 p-1" title="Refresh Location">
//                 <Icon name="RefreshCw" size={12} />
//               </button>
//             </div>
//             <span className="hidden md:inline text-border">•</span>
//             <span>Joined {profileView.joinDate}</span>
//           </div>
//         </div>

//         {/* Mobile Quick Actions (Scrollable) */}
//         <div className="md:hidden mb-6">
//           <div className="flex justify-between gap-3 overflow-x-auto pb-2 scrollbar-hide">
//             {quickActions.map((a) => (
//               <button
//                 key={a.id}
//                 onClick={a.action}
//                 className={`flex flex-col p-3 items-center justify-center min-w-[4.5rem] rounded-xl ${a.id === 'list-item' ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'} shadow-sm`}
//               >
//                 <div className="mb-1 relative">
//                   <Icon name={a.icon as any} size={20} />
//                   {a.badge && (
//                     <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-error text-[8px] text-white">
//                       {a.badge}
//                     </span>
//                   )}
//                 </div>
//                 <div className="text-[10px] whitespace-nowrap">{a.label}</div>
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
//           {/* Sidebar */}
//           <aside className="md:col-span-4 space-y-6 order-2 md:order-1">
//             <div className="p-5 border rounded-xl bg-surface border-border shadow-sm">
//               <h3 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">About</h3>
//               <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
//                 {profileView.bio}
//               </p>
//             </div>

//             <div className="p-5 border rounded-xl bg-surface border-border shadow-sm">
//                <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Contact Info</h3>
//                <div className="space-y-4">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-surface-secondary rounded-full"><Icon name="Mail" size={16} /></div>
//                     <div className="overflow-hidden">
//                         <p className="text-xs text-text-secondary">Email</p>
//                         <p className="text-sm font-medium truncate" title={profileView.email}>{profileView.email}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-surface-secondary rounded-full"><Icon name="Phone" size={16} /></div>
//                     <div>
//                         <p className="text-xs text-text-secondary">Phone</p>
//                         <p className="text-sm font-medium">{profileView.phone}</p>
//                     </div>
//                   </div>
//                </div>
//             </div>

//             {/* Desktop Quick Actions */}
//             <div className="hidden md:block p-5 border rounded-xl bg-surface border-border shadow-sm">
//               <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Quick Actions</h3>
//               <div className="space-y-3">
//                 {quickActions.map((action) => (
//                   <button
//                     key={action.id}
//                     onClick={action.action}
//                     className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all hover:translate-x-1 ${action.color.includes('bg-primary') ? 'hover:bg-primary-700' : 'hover:bg-surface-secondary'} ${action.color}`}
//                   >
//                     <Icon name={action.icon as any} size={18} />
//                     <span className="font-medium text-sm">{action.label}</span>
//                     {action.badge && (
//                       <span className="ml-auto bg-error text-white text-xs px-2 py-0.5 rounded-full">{action.badge}</span>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </aside>

//           {/* Main Tabs Area */}
//           <main className="md:col-span-8 order-1 md:order-2">
//             <div className="border rounded-xl bg-surface border-border shadow-sm min-h-[500px]">
//               {/* Tabs Header */}
//               <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
//                 {tabs.map((tab) => (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
//                       activeTab === tab.id
//                         ? "border-primary text-primary bg-primary-50/30"
//                         : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
//                     }`}
//                   >
//                     <Icon name={tab.icon as any} size={18} />
//                     <span className="font-medium text-sm">{tab.label}</span>
//                     {tab.count !== undefined && (
//                       <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-surface-secondary text-text-secondary'}`}>
//                         {tab.count}
//                       </span>
//                     )}
//                   </button>
//                 ))}
//               </div>

//               {/* Tab Content */}
//               <div className="p-4 md:p-6">
//                 {renderTabContent()}
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VendorProfile;

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { vendorService } from "@/services/vendorService";
import { VendorData, UserProfileData } from "@/types/vendor/settings";

// Sub-components
import MyListings from "../user-profile/components/MyListings";
import PurchaseHistory from "../user-profile/components/PurchaseHistory";
import SavedItems from "../user-profile/components/SavedItems";
import Settings from "../user-profile/components/Settings";

// --- Types ---
interface Tab {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

const VendorProfile = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<string>("listings");
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [storefrontDetails, setStorefrontDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const router = useRouter();
  const { location, loading: locationLoading, refresh: getCurrentLocation } = useLocationDetection();

  // --- Data Fetching & Sync ---
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Store Details
        const savedStoreDetails = localStorage.getItem("vendorStoreDetails");
        const storeData = savedStoreDetails ? JSON.parse(savedStoreDetails) : null;
        setStorefrontDetails(storeData);

        // 2. Fetch Pending User Data
        const savedPendingUser = localStorage.getItem("pendingUserData"); 
        const pendingUser = savedPendingUser ? JSON.parse(savedPendingUser) : null;

        // 3. Merge Logic
        // Priority: Store Details (Brand info) > Pending User (Personal info)
        const merged: VendorData = {
          store_name: storeData?.store_name || pendingUser?.name || "New Store",
          first_name: pendingUser?.name?.split(' ')[0] || "",
          last_name: pendingUser?.name?.split(' ')[1] || "",
          email: pendingUser?.email || "",
          phone: pendingUser?.phone || "",
          isVerified: storeData?.status === "approved",
          created_at: storeData?.onboardedAt || pendingUser?.timestamp || new Date().toISOString(),
          address: storeData?.address || "",
          bio: storeData?.store_description || "No description provided.",
          profile_pic: storeData?.logo_url || "", // Pulls logo if available
          kyc_status: storeData?.status === "approved" ? "verified" : "pending",
          state: storeData?.state || pendingUser?.state || "Lagos",
          country: storeData?.country || pendingUser?.country || "Nigeria",
        };

        setVendorData(merged);
        setLoading(false);
      } catch (err) {
        console.error("Error loading vendor data:", err);
        setLoading(false);
      }
    };

    loadAllData();

    // Listen for storage changes to keep UI in sync
    const handleStorageChange = () => loadAllData();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // --- View Data Construction ---
  const profileView = vendorData ? {
    id: 999,
    name: vendorData.store_name,
    ownerName: `${vendorData.first_name} ${vendorData.last_name}`,
    email: vendorData.email,
    phone: vendorData.phone,
    avatar: vendorData.profile_pic || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    cover: storefrontDetails?.banner_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
    themeColor: storefrontDetails?.themeColor || "#1E293B", // Defaulting to a slate blue if not in JSON
    fontFamily: storefrontDetails?.fontFamily || "Inter",
    location: `${vendorData.state}, ${vendorData.country}`,
    joinDate: new Date(vendorData.created_at || "").toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    isVerified: {
      email: true,
      phone: true,
      identity: vendorData.kyc_status === "verified",
    },
    stats: {
      itemsListed: 0, // Set this dynamically if you have product lists
      purchasesMade: 0,
      sellerRating: 5.0,
      totalReviews: 0,
    },
    bio: vendorData.bio,
  } : null;

  const tabs: Tab[] = [
    { id: "listings", label: "My Listings", icon: "Package", count: profileView?.stats.itemsListed },
    { id: "orders", label: "My Purchases", icon: "ShoppingBag" },
    { id: "saved", label: "Saved Items", icon: "Heart" },
    { id: "settings", label: "Settings", icon: "Settings" },
  ];

  const renderTabContent = () => {
    if (!profileView) return null;
    switch (activeTab) {
      case "listings": return <MyListings />;
      const handleViewDetails = (productId: string | number) => {
        router.push(`/product/${productId}`);
      };

        const handleWriteReview = (product: any) => {
          router.push(`/product/${product.id}/review`);
        };

return <PurchaseHistory onViewDetails={handleViewDetails} onWriteReview={handleWriteReview} />;
      case "saved": return <SavedItems />;
      case "settings": return <Settings userProfile={profileView as any} />;
      default: return <MyListings />;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-12" style={{ fontFamily: profileView?.fontFamily }}>
      {/* --- Cover & Header --- */}
      <div className="relative">
        <div
          className="h-44 md:h-64 w-full bg-center bg-cover relative"
          style={{ backgroundImage: `url(${profileView?.cover})`, backgroundColor: profileView?.themeColor }}
        >
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Avatar / Logo */}
          <div className="absolute -bottom-12 left-6 md:left-12">
            <div 
              className="w-24 h-24 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-xl"
            >
              <Image src={profileView?.avatar || ''} alt="Store Logo" fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              {profileView?.name}
              {profileView?.isVerified.identity && <Icon name="ShieldCheck" size={24} className="text-blue-500" />}
            </h1>
            <p className="text-text-secondary text-sm font-medium">Owned by {profileView?.ownerName}</p>
            <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
              <span className="flex items-center gap-1"><Icon name="MapPin" size={14} /> {profileView?.location}</span>
              <span className="flex items-center gap-1"><Icon name="Calendar" size={14} /> Joined {profileView?.joinDate}</span>
            </div>
          </div>

          <button 
            onClick={() => router.push("/vendor/dashboard/products/add")}
            className="px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: profileView?.themeColor }}
          >
            + Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
          <aside className="lg:col-span-4 space-y-6">
            <div className="p-6 border rounded-2xl bg-surface shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-50">About Store</h3>
              <p className="text-sm leading-relaxed">{profileView?.bio}</p>
            </div>
            
            <div className="p-6 border rounded-2xl bg-surface shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="Mail" size={16} /> {profileView?.email}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Icon name="Phone" size={16} /> {profileView?.phone}
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-8">
            <div className="border rounded-2xl bg-surface shadow-sm overflow-hidden">
              <div className="flex border-b bg-gray-50/50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${
                      activeTab === tab.id ? "border-black text-black" : "border-transparent text-text-secondary"
                    }`}
                    style={{ borderBottomColor: activeTab === tab.id ? profileView?.themeColor : 'transparent' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;