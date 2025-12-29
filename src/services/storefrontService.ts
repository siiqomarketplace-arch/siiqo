import api from "@/lib/api_client";
import { StorefrontData, ApiStorefrontResponse } from "@/types/vendor/storefront";
import { DUMMY_STOREFRONTS } from "@/types/storeFront";

export const storefrontService = {
  getStorefrontData: async (): Promise<ApiStorefrontResponse> => {
    const response = await api.get("/vendor/storefront");
    return response.data;
  },
  updateStorefrontData: async (payload: Partial<StorefrontData>) => {
    const response = await api.put("/vendor/storefront", payload);
    return response.data;
  },
  publishStorefront: async (isPublished: boolean) => {
    const response = await api.put("/vendor/storefront", { is_published: isPublished });
    return response.data;
  },
  // getStorefronts: async () => {
  //   const response = await api.get("/marketplace/storefronts");
  //   return response.data;
  // },
   getStorefronts: async (): Promise<any> => {
      /* --- Temporarily disabled due to 500 error ---
      const response = await api.get("/marketplace/storefronts");
      return response.data;
      */
      
      // Return dummy structure so the app doesn't break
      return { count: DUMMY_STOREFRONTS.length, storefronts: DUMMY_STOREFRONTS };
    },
};
