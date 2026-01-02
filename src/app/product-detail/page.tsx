"use client";
import React, { useState, useEffect } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import PurchaseHistory from "../user-profile/components/PurchaseHistory";
import SavedItems from "../user-profile/components/SavedItems";
import Settings from "../user-profile/components/Settings";
import { useRouter } from "next/navigation";
import { QuickAction, Tab, UserProfileData } from "@/types/userProfile";
import target_viewProtectedRoute from "@/components/auth/target_viewProtectedRoute";

// --- DUMMY FALLBACK DATA ---
const DUMMY_USER_FALLBACK: Partial<UserProfileData> = {
  id: 999,
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+234 800 000 0000",
  profile_pic_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  country: "Nigeria",
  state: "Lagos",
  target_view: "shopper",
};

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState<string>("history");
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Persistence Helper for testing locally
  const updateLocalStorageUser = (key: string, value: string) => {
    const savedUserJson = localStorage.getItem("pendingUserData"); 
    if (savedUserJson) {
      const userObj = JSON.parse(savedUserJson);
      userObj[key] = value;
      localStorage.setItem("pendingUserData", JSON.stringify(userObj));
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const localUrl = URL.createObjectURL(file);
      await new Promise(r => setTimeout(r, 1000)); 
      
      setUser(prev => prev ? { ...prev, profile_pic_url: localUrl } : null);
      updateLocalStorageUser("profile_pic_url", localUrl);
      
      alert("Test Mode: Profile picture updated locally!");
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
      const localUrl = URL.createObjectURL(file);
      await new Promise(r => setTimeout(r, 1000)); 

      setUser(prev => prev ? { ...prev, cover_photo_url: localUrl } as any : null);
      updateLocalStorageUser("cover_photo_url", localUrl);

      alert("Test Mode: Cover photo updated locally!");
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
      await new Promise(r => setTimeout(r, 800));

      const pendingUserData = localStorage.getItem("pendingUserData");
      if (pendingUserData) {
        try {
          const parsed = JSON.parse(pendingUserData);
          setUser({
            ...DUMMY_USER_FALLBACK,
            ...parsed,
            name: parsed.name || DUMMY_USER_FALLBACK.name,
            email: parsed.email || DUMMY_USER_FALLBACK.email,
            phone: parsed.phone || DUMMY_USER_FALLBACK.phone,
            profile_pic_url: parsed.profile_pic_url || DUMMY_USER_FALLBACK.profile_pic_url,
          } as UserProfileData);
        } catch (e) {
          setUser(DUMMY_USER_FALLBACK as UserProfileData);
        }
      } else {
        setUser(DUMMY_USER_FALLBACK as UserProfileData);
      }
      setLoading(false);
    };
    loadProfile();
  }, [router]);

  const defaultAvatar = "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face";
  const defaultCover = "https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=80";

  const userProfile = user
    ? {
        id: user.id,
        name: user.name || (user as any).business_name || "Test User",
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

  // Logic for the requested actions in Purchase History
  const handleViewDetails = (productId: string | number) => {
    router.push(`/product/${productId}`);
  };

  const handleWriteReview = (product: any) => {
    setSelectedProductForReview(product);
    setShowReviewModal(true);
  };

  const renderTabContent = () => {
    if (!userProfile) return null;
    switch (activeTab) {
      case "history": 
        return (
          <PurchaseHistory 
            onViewDetails={handleViewDetails} 
            onWriteReview={handleWriteReview}
            // reorder is commented out inside the PurchaseHistory component logically
          />
        );
      case "saved": return <SavedItems />;
      case "settings": return <Settings userProfile={userProfile} />;
      default: return <PurchaseHistory onViewDetails={handleViewDetails} onWriteReview={handleWriteReview} />;
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
    <target_viewProtectedRoute allowedtarget_views={["shopper", "customer", "shopping"]}>
    <div className="min-h-screen h-full bg-background pb-10">
      <div className="relative">
        <div
          className="h-40 md:h-64 w-full bg-center bg-cover relative group"
          style={{ backgroundImage: `url(${userProfile.cover})` }}
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
          <div className="absolute right-3 top-3">
            <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white/90 backdrop-blur-sm rounded-full shadow-sm cursor-pointer hover:bg-white transition-all">
              {uploadingCover ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Camera" size={14} />}
              <span className="hidden md:inline">{uploadingCover ? "Uploading..." : "EDIT COVER"}</span>
              <input type="file" accept="image/*" onChange={handleCoverFileSelect} className="hidden" />
            </label>
          </div>

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

          <div className="mt-6 md:hidden">
            <div className="flex justify-center gap-4">
              {quickActions.map((a) => (
                <button key={a.id} onClick={a.action} className="flex flex-col items-center gap-1">
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

      {/* Write Review Modal Implementation */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-text-primary">Rate Product</h2>
              <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Icon name="X" size={24} />
              </button>
            </div>
            
            <div className="text-center mb-6">
                <p className="text-sm text-text-secondary mb-4">How would you rate the quality of this item?</p>
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="text-yellow-400 hover:scale-110 transition-transform">
                            <Icon name="Star" size={32} className="fill-current" />
                        </button>
                    ))}
                </div>
            </div>

            <textarea 
                className="w-full border border-border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none mb-6 min-h-[120px]"
                placeholder="Write your experience with this product..."
            />

            <button 
                onClick={() => {
                    alert("Review submitted successfully!");
                    setShowReviewModal(false);
                }}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
                Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
    </target_viewProtectedRoute>
  );
};

export default UserProfile;

function setSelectedProductForReview(product: any) {
  throw new Error("Function not implemented.");
}
