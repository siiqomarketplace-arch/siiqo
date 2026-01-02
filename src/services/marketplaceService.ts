import api from "@/lib/api_client";
import { APIResponse } from "@/types/storeFront";

export const marketplaceService = {
  /**
   * Fetch all products for the marketplace main feed
   */
  getProducts: async (params = {}): Promise<APIResponse> => {
    const response = await api.get("/marketplace/products", { params });
    return response.data;
  },

  /**
   * Fetch all storefronts
   * Replaces the dummy data logic now that your live endpoint is ready
   */
  getStorefronts: async (params = {}): Promise<any> => {
    const response = await api.get("/marketplace/storefronts", { params });
    return response.data;
  },

  /**
   * Fetch only active storefronts (new endpoint from your api.ts)
   */
  getActiveStorefronts: async (): Promise<any> => {
    const response = await api.get("/buyers/storefronts");
    return response.data;
  },

  /**
   * Fetch specific store details using the slug (e.g., 'nike-lagos')
   */
  getStoreDetails: async (storeSlug: string): Promise<any> => {
    const response = await api.get(`/marketplace/store/${storeSlug}`);
    return response.data;
  },

  /**
   * Global search across the marketplace
   */
  search: async (query: string): Promise<any> => {
    const response = await api.get("/marketplace/search", {
      params: { q: query }
    });
    return response.data;
  }
};