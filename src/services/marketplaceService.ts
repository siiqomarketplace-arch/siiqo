import { APIResponse } from "@/types/storeFront";
import { DUMMY_STOREFRONTS } from "@/types/storeFront";
import api from "@/services/api"; // or the correct path to your api instance
export const marketplaceService = {
  getProducts: async (): Promise<APIResponse> => {
    const response = await api.get("/marketplace/products");
    return response.data;
  },
  
  getStorefronts: async (): Promise<any> => {
    /* --- Temporarily disabled due to 500 error ---
    const response = await api.get("/marketplace/storefronts");
    return response.data;
    */
    
    // Return dummy structure so the app doesn't break
    return { count: DUMMY_STOREFRONTS.length, storefronts: DUMMY_STOREFRONTS };
  },
};