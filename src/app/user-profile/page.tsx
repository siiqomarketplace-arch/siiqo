// // src/app/user-profile/page.tsx
// "use client";
// import React, { useState, useEffect } from "react";
// import Icon from "@/components/ui/AppIcon";
// import Image from "@/components/ui/AppImage";
// import MyListings from "./components/MyListings";
// import PurchaseHistory from "./components/PurchaseHistory";
// import SavedItems from "./components/SavedItems";
// import Settings from "./components/Settings";
// import { useRouter } from "next/navigation";
// import { QuickAction, Tab, UserProfileData } from "@/types/userProfile";
// import { userService } from "@/services/userService";

// const UserProfile = () => {
//   const [activeTab, setActiveTab] = useState<string>("listings");
//   const [user, setUser] = useState<UserProfileData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const router = useRouter();
//   const [uploading, setUploading] = useState(false);
//   const [uploadingCover, setUploadingCover] = useState(false);

//   const handleProfilePictureUpload = async (file: File) => {
//     if (!file) return;
//     setUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("profile_pic", file);
//       const response = await userService.uploadProfilePicture(formData);
//       if (response.data?.profile_pic_url || response.profile_pic_url) {
//         alert("Profile picture updated successfully!");
//         window.location.reload();
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       alert("Failed to upload profile picture. Please try again.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleCoverPhotoUpload = async (file: File) => {
//     if (!file) return;
//     setUploadingCover(true);
//     try {
//       const formData = new FormData();
//       formData.append("cover_photo", file);
//       let response;
//       if (typeof (userService as any).uploadCoverPhoto === "function") {
//         response = await (userService as any).uploadCoverPhoto(formData);
//       } else {
//         response = await userService.uploadProfilePicture(formData);
//       }
//       if (
//         response?.data?.cover_photo_url ||
//         response?.cover_photo_url ||
//         response?.data?.profile_pic_url
//       ) {
//         alert("Cover photo updated successfully!");
//         window.location.reload();
//       } else {
//         window.location.reload();
//       }
//     } catch (error) {
//       console.error("Cover upload error:", error);
//       alert("Failed to upload cover photo. Please try again.");
//     } finally {
//       setUploadingCover(false);
//     }
//   };

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         alert("Please select an image file");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         alert("File size must be less than 5MB");
//         return;
//       }
//       handleProfilePictureUpload(file);
//     }
//   };

//   const handleCoverFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         alert("Please select an image file");
//         return;
//       }
//       if (file.size > 10 * 1024 * 1024) {
//         alert("Cover file size must be less than 10MB");
//         return;
//       }
//       handleCoverPhotoUpload(file);
//     }
//   };

//   useEffect(() => {
//     const token = sessionStorage.getItem("RSToken");
//     const savedUser = sessionStorage.getItem("RSUser");

//     if (!token) {
//       console.error("No token found in sessionStorage");
//       setLoading(false);
//       router.push("/auth/signup");
//       return;
//     }

//     if (savedUser) {
//       try {
//         const userData = JSON.parse(savedUser);
//         setUser(userData);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error parsing saved user data:", error);
//       }
//     }

//     userService
//       .getUserProfile()
//       .then((response) => {
//         setUser(response);
//         sessionStorage.setItem("RSUser", JSON.stringify(response));
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching profile:", err);
//         setLoading(false);
//       });
//   }, [router]);

//   const handleLogout = (): void => {
//     userService.logout();
//   };

//   const defaultAvatar =
//     "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face";
//   const defaultCover =
//     "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='420'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial, sans-serif' font-size='28'%3ECover Photo Placeholder%3C/text%3E%3C/svg%3E";

//   const userProfile = user
//     ? {
//         id: user.id,
//         name: user.name || user.business_name || "User",
//         email: user.email,
//         phone: user.phone || "Not provided",
//         avatar: user.profile_pic_url || defaultAvatar,
//         cover: (user as any).cover_photo_url || (user as any).cover || defaultCover,
//         location:
//           user.state && user.country
//             ? `${user.state}, ${user.country}`
//             : user.country || "Location not set",
//         joinDate: "March 2023",
//         isVerified: {
//           email: true,
//           phone: !!user.phone,
//           identity: false,
//         },
//         stats: {
//           itemsListed: 24,
//           purchasesMade: 18,
//           sellerRating: 4.8,
//           totalReviews: 32,
//         },
//         bio: `Member of our marketplace community. ${user.role ? `Role: ${user.role}` : ""}`,
//       }
//     : null;

//   const tabs: Tab[] = [
//     // {
//     //   id: "listings",
//     //   label: "Listings",
//     //   icon: "Package",
//     //   count: userProfile?.stats.itemsListed,
//     // },
//     {
//       id: "history",
//       label: "Purchase History",
//       icon: "ShoppingBag",
//       count: userProfile?.stats.purchasesMade,
//     },
//     { id: "saved", label: "Saved Items", icon: "Heart", count: 12 },
//     { id: "settings", label: "Settings", icon: "Settings" },
//   ];

//   const quickActions: QuickAction[] = [
//     // {
//     //   id: "list-item",
//     //   label: "List New Item",
//     //   icon: "Plus",
//     //   color: "bg-primary text-white",
//     //   action: () => router.push("/vendor/dashboard/create"),
//     // },
//     {
//       id: "messages",
//       label: "Messages",
//       icon: "MessageCircle",
//       color: "bg-secondary text-primary",
//       badge: 3,
//     },
//     {
//       id: "account-settings",
//       label: "Account Settings",
//       icon: "User",
//       color: "bg-surface border border-border text-text-primary",
//     },
//       {
//       id: "share",
//       label: "Share Profile",
//       icon: "Share2",
//       color: "bg-secondary text-primary",
//       action: () => {
//         if (navigator.share) {
//           navigator.share({
//             title: userProfile?.name,
//             text: `Check out ${userProfile?.name}'s profile on our marketplace`,
//             url: window.location.href,
//           });
//         } else {
//           navigator.clipboard.writeText(window.location.href);
//           alert("Profile link copied to clipboard!");
//         }
//       },
//     },
//   ];

//   const renderTabContent = () => {
//     if (!userProfile) return null;
//     switch (activeTab) {
//       // case "listings":
//       //   return <MyListings />;
//       case "history":
//         return <PurchaseHistory />;
//       case "saved":
//         return <SavedItems />;
//       case "settings":
//         return <Settings userProfile={userProfile} />;
//       default:
//         return <PurchaseHistory />;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-background">
//         <div className="text-center">
//           <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
//           <p className="text-text-secondary">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!userProfile) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-background">
//         <div className="text-center">
//           <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-error" />
//           <h2 className="mb-2 text-xl font-semibold text-text-primary">Unable to load profile</h2>
//           <p className="mb-4 text-text-secondary">There was an error loading your profile data.</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen  h-full bg-background">
//       {/* Cover + Profile header (mobile-first FB Marketplace style) */}
//       <div className="relative">
//         <div
//           className="h-40 md:h-64 w-full bg-center bg-cover relative"
//           style={{
//             backgroundImage: `url(${userProfile.cover})`,
//           }}
//         >
//           <div className="absolute inset-0 bg-black/10" />

//           {/* cover change - top right */}
//           <div className="absolute right-3 top-3">
//             <label
//               htmlFor="cover-input"
//               className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium bg-white/90 rounded-md shadow-sm cursor-pointer hover:opacity-95"
//             >
//               <Icon name="Camera" size={14} />
//               <span className="hidden md:inline">{uploadingCover ? "Uploading..." : "Change Cover Photo"}</span>
//             </label>
//             <input id="cover-input" type="file" accept="image/*" onChange={handleCoverFileSelect} className="hidden" />
//           </div>

//           {/* Centered profile box (overlapping) */}
//           <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10 md:-bottom-14 flex items-end">
//             <div className="relative">
//               <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white bg-gray-100">
//                 <Image src={userProfile.avatar} alt={userProfile.name} fill className="object-cover" sizes="128px" />
//               </div>

//               <div
//                 className="absolute -right-1 -bottom-1 bg-white rounded-full p-1 shadow-sm cursor-pointer"
//                 onClick={() => document.getElementById("profile-pic-input")?.click()}
//                 title="Change profile picture"
//               >
//                 {uploading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Camera" size={16} />}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main container */}
//       <div className="max-w-7xl mx-auto px-4 md:px-6">
//         <div className="h-12 md:h-20" />

//         {/* Header info */}
//         <div className="text-center mb-3">
//           <h1 className="text-lg md:text-2xl font-heading font-semibold text-text-primary">
//             {userProfile.name}
//           </h1>
//           <div className="mt-1 flex items-center justify-center space-x-2 text-xs text-text-secondary">
//             <div className="flex items-center space-x-1">
//               <Icon name="MapPin" size={12} />
//               <span>{userProfile.location}</span>
//             </div>
//             <span className="hidden md:inline">•</span>
//             <div className="hidden md:block">Member since {userProfile.joinDate}</div>
//           </div>

//           {/* Mobile quick actions (scrollable small icons) */}
//           <div className="mt-3 md:hidden">
//             <div className="flex justify-between overflow-x-auto px-2 py-1">
//               {quickActions.map((a) => (
//                 <button
//                   key={a.id}
//                   onClick={a.action}
//                   className="flex flex-col p-4 items-center justify-center w-14 h-14 rounded-lg bg-white/90 border border-border text-sm text-text-primary shadow-sm"
//                   title={a.label}
//                 >
//                   <div className="mb-1">
//                     <Icon name={a.icon} size={18} />
//                   </div>
//                   <div className="text-[10px] truncate">{a.label}</div>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Action buttons (icon + label on desktop; icon-only on mobile) */}
//           {/* <div className="mt-4 flex items-center justify-center space-x-3">
//             <button className="px-3 py-2 rounded-md bg-primary text-white hover:opacity-95 flex items-center gap-2">
//               <Icon name="MessageCircle" size={16} />
//               <span className="hidden md:inline">Message</span>
//             </button>
//             <button className="p-2 md:px-4 md:py-2 rounded-md bg-surface border border-border text-text-primary hover:opacity-95 flex items-center gap-2">
//               <Icon name="Share2" size={16} />
//               <span className="hidden md:inline">Share</span>
//             </button>
//             <button className="p-2 md:px-4 md:py-2 rounded-md bg-surface border border-border text-text-primary hover:opacity-95 flex items-center gap-2">
//               <Icon name="MoreHorizontal" size={16} />
//               <span className="hidden md:inline">More</span>
//             </button>
//           </div> */}
//         </div>

//         {/* two-column layout: main first on mobile, sidebar below */}
//         <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Main: show first on mobile */}
//           <main className="md:col-span-8 order-1 md:order-2">
//             <div className="mb-6 border rounded-lg bg-surface border-border">
//               {/* Tabs row - horizontally scrollable for mobile */}
//               <div className="flex border-b border-border overflow-x-auto">
//                 {tabs.map((tab) => (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors duration-200 min-w-[110px] ${
//                       activeTab === tab.id
//                         ? "border-primary text-primary bg-primary-50"
//                         : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
//                     }`}
//                   >
//                     <Icon name={tab.icon} size={18} />
//                     <span className="font-medium text-sm">{tab.label}</span>
//                     {tab.count && (
//                       <span
//                         className={`ml-2 px-2 py-1 rounded-full text-xs ${
//                           activeTab === tab.id ? "bg-primary text-white" : "bg-surface-secondary text-text-secondary"
//                         }`}
//                       >
//                         {tab.count}
//                       </span>
//                     )}
//                   </button>
//                 ))}
//               </div>

//               <div className="p-4 md:p-6">{renderTabContent()}</div>
//             </div>
//           </main>

//           {/* Sidebar: placed below on mobile */}
//           <aside className="md:col-span-4 space-y-6 order-2 md:order-1">
//             <div className="p-4 md:p-6 border rounded-lg bg-surface border-border">
//               <h3 className="text-sm font-medium text-text-primary mb-2">About</h3>
//               <p className="text-sm text-text-secondary leading-relaxed">{userProfile.bio}</p>

//               <div className="mt-3">
//                 {user?.role && (
//                   <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-50 text-primary">
//                     {user.role}
//                   </span>
//                 )}
//               </div>

//               <div className="mt-4 grid grid-cols-3 gap-3 text-center">
//                 <div>
//                   <div className="text-lg font-semibold text-text-primary">{userProfile.stats.itemsListed}</div>
//                   <div className="text-xs text-text-secondary">Listings</div>
//                 </div>
//                 <div>
//                   <div className="text-lg font-semibold text-text-primary">{userProfile.stats.purchasesMade}</div>
//                   <div className="text-xs text-text-secondary">Purchases</div>
//                 </div>
//                 <div>
//                   <div className="text-lg font-semibold text-text-primary">{userProfile.stats.sellerRating}</div>
//                   <div className="text-xs text-text-secondary">Rating</div>
//                 </div>
//               </div>
//             </div>

//             <div className="p-4 md:p-6 border rounded-lg bg-surface border-border">
//               <h3 className="mb-3 text-sm font-medium text-text-primary">Contact</h3>
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2">
//                     <Icon name="Mail" size={16} />
//                     <span className="text-sm text-text-secondary">Email</span>
//                   </div>
//                   <span className="text-sm text-text-primary">{userProfile.email}</span>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2">
//                     <Icon name="Phone" size={16} />
//                     <span className="text-sm text-text-secondary">Phone</span>
//                   </div>
//                   <span className="text-sm text-text-primary">{userProfile.phone}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Desktop quick actions (hidden on mobile, visible on md+) */}
//             <div className="hidden md:block p-4 md:p-6 border rounded-lg bg-surface border-border">
//               <h3 className="mb-3 text-sm font-medium text-text-primary">Quick Actions</h3>
//               <div className="space-y-3">
//                 {quickActions.map((action) => (
//                   <button
//                     key={action.id}
//                     onClick={action.action}
//                     className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${action.color} hover:opacity-90`}
//                   >
//                     <Icon name={action.icon} size={18} />
//                     <span className="font-medium">{action.label}</span>
//                     {action.badge && (
//                       <div className="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs text-white rounded-full bg-accent">
//                         {action.badge}
//                       </div>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </aside>
//         </div>
//       </div>

//       {/* Hidden file inputs */}
//       <input id="profile-pic-input" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
//       <input id="cover-input-hidden" type="file" accept="image/*" onChange={handleCoverFileSelect} className="hidden" />
//     </div>
//   );
// };

// export default UserProfile;


"use client";
import React, { useState, useEffect } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import MyListings from "./components/MyListings";
import PurchaseHistory from "./components/PurchaseHistory";
import SavedItems from "./components/SavedItems";
import Settings from "./components/Settings";
import { useRouter } from "next/navigation";
import { QuickAction, Tab, UserProfileData } from "@/types/userProfile";
import { userService } from "@/services/userService";

// --- DUMMY FALLBACK DATA ---
const DUMMY_USER_FALLBACK: Partial<UserProfileData> = {
  id: 999,
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+234 800 000 0000",
  profile_pic_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  country: "Nigeria",
  state: "Lagos",
  role: "shopper",
};

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState<string>("history"); // Defaulted to history since listings is commented out
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Persistence Helper for testing locally
  const updateLocalStorageUser = (key: string, value: string) => {
    const savedUserJson = localStorage.getItem("user");
    if (savedUserJson) {
      const userObj = JSON.parse(savedUserJson);
      userObj[key] = value;
      localStorage.setItem("user", JSON.stringify(userObj));
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      // --- MOCK LOGIC ---
      const localUrl = URL.createObjectURL(file);
      await new Promise(r => setTimeout(r, 1000)); // Simulate delay
      
      setUser(prev => prev ? { ...prev, profile_pic_url: localUrl } : null);
      updateLocalStorageUser("profile_pic_url", localUrl);
      
      alert("Test Mode: Profile picture updated locally!");

      /* --- LIVE CODE (COMMENTED OUT) ---
      const formData = new FormData();
      formData.append("profile_pic", file);
      const response = await userService.uploadProfilePicture(formData);
      if (response.data?.profile_pic_url || response.profile_pic_url) {
        window.location.reload();
      }
      */
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleCoverPhotoUpload = async (file: File) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      // --- MOCK LOGIC ---
      const localUrl = URL.createObjectURL(file);
      await new Promise(r => setTimeout(r, 1000)); // Simulate delay

      setUser(prev => prev ? { ...prev, cover_photo_url: localUrl } as any : null);
      updateLocalStorageUser("cover_photo_url", localUrl);

      alert("Test Mode: Cover photo updated locally!");

      /* --- LIVE CODE (COMMENTED OUT) ---
      const formData = new FormData();
      formData.append("cover_photo", file);
      let response = await userService.uploadProfilePicture(formData);
      window.location.reload();
      */
    } catch (error) {
      console.error("Cover upload error:", error);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) return alert("Please select an image file");
      handleProfilePictureUpload(file);
    }
  };

  const handleCoverFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) return alert("Please select an image file");
      handleCoverPhotoUpload(file);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(r => setTimeout(r, 800));

      // Check LocalStorage first (data from our dummy login/signup)
      const savedUserJson = localStorage.getItem("user");
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (savedUserJson) {
        try {
          const parsed = JSON.parse(savedUserJson);
          setUser({
            ...DUMMY_USER_FALLBACK,
            ...parsed,
            // Ensure image fields match component expectations
            profile_pic_url: parsed.profile_pic_url || parsed.profile_pic || DUMMY_USER_FALLBACK.profile_pic_url,
          } as UserProfileData);
        } catch (e) {
          setUser(DUMMY_USER_FALLBACK as UserProfileData);
        }
      } else {
        // If nothing in storage, use fallback for testing
        setUser(DUMMY_USER_FALLBACK as UserProfileData);
      }

      /* --- LIVE CODE (COMMENTED OUT) ---
      const token = sessionStorage.getItem("RSToken");
      if (!token) { router.push("/auth/signup"); return; }
      userService.getUserProfile().then((response) => {
        setUser(response);
      });
      */

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const defaultAvatar = "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face";
  const defaultCover = "https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=80";

  const userProfile = user
    ? {
        id: user.id,
        name: user.name || user.business_name || "Test User",
        email: user.email,
        phone: user.phone || "Not provided",
        avatar: user.profile_pic_url || defaultAvatar,
        cover: (user as any).cover_photo_url || (user as any).cover || defaultCover,
        location: user.state && user.country ? `${user.state}, ${user.country}` : "Lagos, Nigeria",
        joinDate: "December 2025",
        isVerified: { email: true, phone: !!user.phone, identity: false },
        stats: {
          itemsListed: 5,
          purchasesMade: 12,
          sellerRating: 4.5,
          totalReviews: 8,
        },
        bio: `Community member interested in local marketplace deals.`,
      }
    : null;

  const tabs: Tab[] = [
    { id: "history", label: "Purchase History", icon: "ShoppingBag", count: userProfile?.stats.purchasesMade },
    { id: "saved", label: "Saved Items", icon: "Heart", count: 12 },
    { id: "settings", label: "Settings", icon: "Settings" },
  ];

  const quickActions: QuickAction[] = [
    {
      id: "messages",
      label: "Messages",
      icon: "MessageCircle",
      color: "bg-secondary text-primary",
      badge: 3,
      action: () => router.push("/messages"),
    },
    {
      id: "account-settings",
      label: "Settings",
      icon: "User",
      color: "bg-surface border border-border text-text-primary",
      action: () => setActiveTab("settings"),
    },
    {
      id: "share",
      label: "Share",
      icon: "Share2",
      color: "bg-secondary text-primary",
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied!");
      },
    },
  ];

  const renderTabContent = () => {
    if (!userProfile) return null;
    switch (activeTab) {
      case "history": return <PurchaseHistory />;
      case "saved": return <SavedItems />;
      case "settings": return <Settings userProfile={userProfile} />;
      default: return <PurchaseHistory />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="text-text-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <div className="min-h-screen h-full bg-background pb-10">
      {/* Cover Section */}
      <div className="relative">
        <div
          className="h-40 md:h-64 w-full bg-center bg-cover relative group"
          style={{ backgroundImage: `url(${userProfile.cover})` }}
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />

          {/* Change Cover */}
          <div className="absolute right-3 top-3">
            <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white/90 backdrop-blur-sm rounded-full shadow-sm cursor-pointer hover:bg-white transition-all">
              {uploadingCover ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Camera" size={14} />}
              <span className="hidden md:inline">{uploadingCover ? "Uploading..." : "EDIT COVER"}</span>
              <input type="file" accept="image/*" onChange={handleCoverFileSelect} className="hidden" />
            </label>
          </div>

          {/* Avatar Section */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10 md:-bottom-14 flex items-end">
            <div className="relative group/avatar">
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden border-[6px] border-white bg-gray-100 shadow-xl">
                <Image src={userProfile.avatar} alt={userProfile.name} fill className="object-cover" sizes="150px" />
              </div>

              <div
                className="absolute right-1 bottom-1 bg-white rounded-full p-2 shadow-lg border border-gray-100 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => document.getElementById("profile-pic-input")?.click()}
              >
                {uploading ? <Icon name="Loader2" size={20} className="animate-spin" /> : <Icon name="Camera" size={18} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="h-14 md:h-20" />

        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-text-primary">
            {userProfile.name}
          </h1>
          <div className="mt-2 flex items-center justify-center gap-3 text-sm text-text-secondary font-medium">
            <div className="flex items-center gap-1">
              <Icon name="MapPin" size={14} className="text-primary" />
              <span>{userProfile.location}</span>
            </div>
            <span>•</span>
            <div>Joined {userProfile.joinDate}</div>
          </div>

          {/* Mobile Actions */}
          <div className="mt-6 md:hidden">
            <div className="flex justify-center gap-4">
              {quickActions.map((a) => (
                <button
                  key={a.id}
                  onClick={a.action}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`p-4 rounded-2xl ${a.color} shadow-sm border border-gray-100 relative`}>
                    <Icon name={a.icon} size={20} />
                    {a.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                        {a.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase text-gray-500">{a.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Area */}
          <main className="md:col-span-8 order-1 md:order-2">
            <div className="mb-6 border rounded-2xl bg-surface border-border shadow-sm overflow-hidden min-h-[500px]">
              <div className="flex border-b border-border bg-gray-50/50 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 border-b-2 transition-all min-w-[140px] ${
                      activeTab === tab.id
                        ? "border-primary text-primary font-bold bg-white"
                        : "border-transparent text-text-secondary hover:text-text-primary hover:bg-white/50"
                    }`}
                  >
                    <Icon name={tab.icon} size={18} />
                    <span className="text-sm">{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`ml-2 px-2 py-1 rounded-full text-[10px] ${
                          activeTab === tab.id ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">{renderTabContent()}</div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="md:col-span-4 space-y-6 order-2 md:order-1">
            <div className="p-6 border rounded-2xl bg-surface border-border shadow-sm">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-4">About Me</h3>
              <p className="text-sm text-text-secondary leading-relaxed font-medium">{userProfile.bio}</p>

              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-50 pt-4">
                <div className="text-center">
                  <div className="text-lg font-black text-text-primary">{userProfile.stats.itemsListed}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Listings</div>
                </div>
                <div className="text-center border-x border-gray-50">
                  <div className="text-lg font-black text-text-primary">{userProfile.stats.purchasesMade}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-text-primary">{userProfile.stats.sellerRating}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Rating</div>
                </div>
              </div>
            </div>

            <div className="p-6 border rounded-2xl bg-surface border-border shadow-sm">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-4">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg"><Icon name="Mail" size={16} /></div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                    <p className="text-sm font-bold truncate">{userProfile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Icon name="Phone" size={16} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                    <p className="text-sm font-bold">{userProfile.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <input id="profile-pic-input" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  );
};

export default UserProfile;