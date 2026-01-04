import api from "@/lib/api_client";
import { APIResponse } from "@/types/storeFront";
import { MarketplaceSearchResponse } from "@/types/marketplace";
export const marketplaceService = {
  /**
   * Fetch all products for the marketplace main feed
   */
  getProducts: async (params = {}): Promise<APIResponse> => {
    const response = await api.get("/products/my-products", { params });
    return response.data;
  },
     
  /**
   * Fetch all storefronts
   * Replaces the dummy data logic now that your live endpoint is ready
   */
  getStorefronts: async (params = {}): Promise<any> => {
    const response = await api.get("/buyers/storefronts", { params });
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
  // In your marketplaceService object:
search: async (query: string): Promise<MarketplaceSearchResponse> => {
  const response = await api.get("/marketplace/search", {
    params: { q: query }
  });
  
  // Ensure we return the expected structure even if the API data is slightly different
  return {
    products: response.data?.products || response.data || []
  };
}
}