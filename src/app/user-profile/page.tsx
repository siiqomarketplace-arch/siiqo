"use client";
import React, { useState, useEffect } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import SavedItems from "./components/SavedItems";
// import Settings from "./components/Settings";
import Settings from "../vendor/settings/page";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { switchMode } from "@/services/api";
import { vendorService } from "@/services/vendorService";
import { toast } from "@/hooks/use-toast";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState<string>("saved");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { logout, refreshUserProfile } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: ""
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    switchMode("buyer");
  }, []);

  console.log("USER PROFILE DATA:", user);
  useEffect(() => {
    const fetchLiveProfile = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserProfile();
        const profileData = response.data;

        setUser(profileData);
        
        // Update the AuthContext with the fresh profile data
        if (refreshUserProfile) {
          await refreshUserProfile();
        }
        
        setEditData({
          name: profileData.personal_info?.fullname || profileData.store_settings?.business_name || "User",
          email: profileData.personal_info?.email || "",
          phone: profileData.personal_info?.phone || "",
          address: profileData.store_settings?.address || "No address set",
          bio: profileData.store_settings?.description || "Community Member"
        });
      } catch (err) {
        console.error("Failed to fetch live profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveProfile();
  }, [refreshUserProfile]);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Add personal info fields
      if (editData.name) formData.append("personal_info[fullname]", editData.name);
      if (editData.email) formData.append("personal_info[email]", editData.email);
      if (editData.phone) formData.append("personal_info[phone]", editData.phone);
      
      // Add store settings fields
      if (editData.address) formData.append("store_settings[address]", editData.address);
      if (editData.bio) formData.append("store_settings[description]", editData.bio);
      
      const response = await vendorService.updateVendorSettings(formData);
      
      if (response?.status === "success" || response?.data) {
        // Update local user state with new data
        setUser((prev: any) => ({
          ...prev,
          personal_info: {
            ...prev.personal_info,
            fullname: editData.name,
            email: editData.email,
            phone: editData.phone,
          },
          store_settings: {
            ...prev.store_settings,
            address: editData.address,
            description: editData.bio,
          }
        }));
        
        setIsEditing(false);
        toast({ title: "Success", description: "Profile updated successfully!" });
        
        // Refresh profile from server
        if (refreshUserProfile) {
          await refreshUserProfile();
        }
      } else {
        toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({ 
        title: "Error", 
        description: error?.response?.data?.message || "Failed to update profile.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profile_pic", file);
      const response = await userService.uploadProfilePicture(formData);
      setUser((prev: any) => ({
        ...prev,
        store_settings: { ...prev.store_settings, logo_url: response.url }
      }));
      alert("Logo updated!");
    } catch (error) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------
  if (loading) return (
    <div className="flex flex-col h-[80vh] items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="User" className="text-primary" size={20} />
        </div>
      </div>
      <p className="mt-4 text-sm font-bold text-gray-500 animate-pulse">Synchronizing your profile...</p>
    </div>
  );

  // ---------------------------------------------------------
  // BEAUTIFUL "NOT FOUND / LOGGED OUT" STATE
  // ---------------------------------------------------------
  if (!user) return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 bg-gray-50/50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50 text-center border border-gray-100">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="UserX" size={48} className="text-orange-500" />
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Profile Not Found</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          We couldn't retrieve your profile data. You may have been logged out or your session has expired.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => router.push('/auth/login')}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Sign In to Account
          </button>
          
          <button 
            onClick={() => router.push('/marketplace')}
            className="w-full py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all"
          >
            Return to Marketplace
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Need help? <span className="underline cursor-pointer text-primary">Contact Support</span>
        </p>
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // MAIN PROFILE VIEW (RETAINED STYLES)
  // ---------------------------------------------------------
  const { personal_info, store_settings } = user;
  const avatarImage = store_settings?.logo_url || "https://ui-avatars.com/api/?name=" + editData.name;
  const coverImage = store_settings?.banner_url || "https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=80";

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* COVER SECTION */}
      <div className="relative">
        <div className="h-40 md:h-64 w-full bg-center bg-cover" style={{ backgroundImage: `url(${coverImage})` }}>
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-12">
          <div className="relative w-24 h-24 md:w-36 md:h-36 rounded-full border-[6px] border-white bg-gray-100 shadow-xl overflow-hidden group">
            <Image src={avatarImage} alt="Profile" fill className="object-cover" />
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Icon name={uploading ? "Loader2" : "Camera"} size={24} className={`text-white ${uploading ? 'animate-spin' : ''}`} />
              <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleProfilePictureUpload(e.target.files[0])} />
            </label>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16 md:mt-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold">
            {isEditing ? (
              <input 
                className="text-center bg-transparent border-b border-primary outline-none"
                value={editData.name}
                onChange={e => setEditData({...editData, name: e.target.value})}
                placeholder="Full Name"
              />
            ) : (
              editData.name
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing ? (
              <input 
                className="text-center bg-transparent border-b border-primary outline-none text-sm"
                value={editData.email}
                onChange={e => setEditData({...editData, email: e.target.value})}
                placeholder="Email Address"
              />
            ) : (
              editData.email
            )}
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            {/* <button 
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-md hover:bg-primary/90 transition-all"
            >
              {isEditing ? "SAVE CHANGES" : "EDIT PROFILE"}
            </button> */}
            {store_settings?.initialized ? (
              <button 
                onClick={() => router.push('/vendor/dashboard')} 
                className="px-6 py-2 border border-blue-200 text-blue-600 rounded-full text-sm font-bold hover:bg-blue-50 transition-all"
              >
                GO TO DASHBOARD
              </button>
            ) : (
              <button 
                onClick={() => router.push('/auth/vendor-onboarding')} 
                className="px-6 py-2 border border-green-200 text-green-600 rounded-full text-sm font-bold hover:bg-green-50 transition-all"
              >
                BECOME A VENDOR
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR */}
          <aside className="md:col-span-4 space-y-6">
            <div className="p-6 border rounded-2xl bg-white shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">Store Description</h3>
              {isEditing ? (
                <textarea 
                  className="w-full text-sm p-3 border rounded-xl bg-gray-50 outline-none"
                  value={editData.bio}
                  onChange={e => setEditData({...editData, bio: e.target.value})}
                  rows={4}
                />
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">{editData.bio || "No description set."}</p>
              )}
            </div>

            <div className="p-6 border rounded-2xl bg-white shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-gray-400">Contact Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Icon name="MapPin" size={14} className="text-primary" />
                  </div>
                  {isEditing ? (
                    <input 
                      className="flex-1 text-xs font-bold bg-transparent border-b border-primary outline-none"
                      value={editData.address}
                      onChange={e => setEditData({...editData, address: e.target.value})}
                      placeholder="Address"
                    />
                  ) : (
                    <span className="text-xs font-bold">{editData.address}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                   <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Icon name="Phone" size={14} className="text-primary" />
                  </div>
                  {isEditing ? (
                    <input 
                      className="flex-1 text-xs font-bold bg-transparent border-b border-primary outline-none"
                      value={editData.phone}
                      onChange={e => setEditData({...editData, phone: e.target.value})}
                      placeholder="Phone Number"
                    />
                  ) : (
                    <span className="text-xs font-bold">{editData.phone || "Not provided"}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border rounded-2xl bg-white shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4">Status</h3>
              <div className={`flex items-center gap-2 p-3 rounded-xl ${store_settings?.is_published ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
                <Icon name={store_settings?.is_published ? "CheckCircle" : "AlertCircle"} size={16} />
                <span className="text-xs font-bold">
                    {store_settings?.is_published ? "Store Live" : "Draft Mode"}
                </span>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="md:col-span-8">
             <div className="mb-20 border rounded-3xl bg-white shadow-sm overflow-hidden min-h-[500px]">
                <div className="flex border-b bg-gray-50/50">
                  {['saved', 'settings'].map((tab) => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-5 text-xs font-black tracking-widest transition-all ${activeTab === tab ? "border-b-2 border-primary text-primary bg-white" : "text-gray-400"}`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="p-8">
                  {activeTab === "saved" && <SavedItems />}
                  {activeTab === "settings" && <Settings />}
                  {/* {activeTab === "history" && (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                          <Icon name="History" size={48} className="text-gray-200 mb-4" />
                          <p className="text-gray-400 font-medium italic">No recent activity to show.</p>
                      </div>
                  )} */}
                </div>
             </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;