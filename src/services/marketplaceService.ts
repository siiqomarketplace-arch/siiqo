import api from "@/lib/api_client";

export const marketplaceService = {
  fetchProducts: (params = {}) => {
    return api.get("/marketplace/products", { params });
  },
  fetchStorefronts: (params = {}) => {
    return api.get("/marketplace/storefronts", { params });
  },
  // Add other general marketplace API calls here
};
