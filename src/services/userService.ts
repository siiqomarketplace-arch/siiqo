import api from "@/lib/api_client";
import { UserData as User } from "@/types/auth";
import { VendorInfo } from "@/types/seller-profile";
import { VendorData as VendorSettingsData } from "@/types/vendor/settings";

export const userService = {
  /**
   * Fetch current authenticated user profile
   * Replaces mock data with a direct call to the live endpoint
   */
  getUserProfile: async (): Promise<any> => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  /**
   * Get vendor details
   * Note: In your new API, this might be getStorefrontDetails by slug,
   * but if the backend still supports email, this remains valid.
   */
  getVendorByEmail: async (email: string): Promise<VendorInfo> => {
    const response = await api.get(`/user/${email}`);
    return response.data;
  },

  /**
   * Upload user profile picture
   */
  uploadProfilePicture: async (formData: FormData): Promise<any> => {
    const response = await api.post("/upload-profile-pic", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Profile verification / KYC
   * Aligns with the vendor onboarding flow in your system
   */
  submitKyc: async (formData: FormData): Promise<any> => {
    const response = await api.post("/user/kyc", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Cleanup and Logout
   * Clears all authentication storage to ensure a clean state
   */
  logout: (): void => {
    if (typeof window !== "undefined") {
      // Clear Session Storage (Used by your new interceptor)
      sessionStorage.removeItem("RSToken");
      sessionStorage.removeItem("RSUser");
      sessionStorage.removeItem("RSEmail");
      
      // Clear Local Storage (Used by older versions/admin)
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAdminLoggedIn");
      localStorage.removeItem("pendingUserData");

      // Redirect to login
      window.location.href = "/auth/login";
    }
  },
};