import api from "@/lib/api_client";
import { StorefrontData, ApiStorefrontResponse } from "@/types/vendor/storefront";

export const storefrontService = {
  /**
   * Fetch vendor settings/storefront data
   * Matches api.ts: /vendor/settings
   */
  getStorefrontData: async (): Promise<ApiStorefrontResponse> => {
    const response = await api.get("/vendor/settings");
    return response.data;
  },

  /**
   * Update storefront details
   * Matches api.ts: /vendor/update-settings using PATCH
   */
  updateStorefrontData: async (payload: Partial<StorefrontData> | FormData) => {
    const headers = payload instanceof FormData 
      ? { "Content-Type": "multipart/form-data" } 
      : {};

    const response = await api.patch("/vendor/update-settings", payload, { headers });
    return response.data;
  },

  /**
   * Publish/Unpublish Storefront
   * Uses the same update-settings endpoint to toggle visibility
   */
  publishStorefront: async (isPublished: boolean) => {
    const response = await api.patch("/vendor/update-settings", { 
      is_published: isPublished 
    });
    return response.data;
  },

  /**
   * Fetch all storefronts for the marketplace
   * Dummy data removed - now connects to live marketplace
   */
  getStorefronts: async (params = {}): Promise<any> => {
    // No more dummy data return. Using the live endpoint from your api.ts
    const response = await api.get("/marketplace/storefronts", { params });
    return response.data;
  },

  /**
   * Fetch specifically active storefronts
   */
  getActiveStorefronts: async () => {
    const response = await api.get("/buyers/storefronts");
    return response.data;
  }
};