import api from "@/lib/api_client";

export const cartService = {
  // Matches your api.ts: apiClient.post("/cart/add", data)
  addToCart: async (productId: number , quantity: number) => {
    const response = await api.post("/cart/add", { 
      product_id: productId, 
      quantity 
    });
    return response.data;
  },

  // Matches your api.ts: apiClient.get("/cart")
  fetchCartItems: async () => {
    const response = await api.get("/cart");
    return response.data;
  },

  // Matches your api.ts: apiClient.patch(`/cart/update/${itemId}`, data)
  updateCartItem: async (itemId: number | string, quantity: number) => {
    const response = await api.patch(`/cart/update/${itemId}`, { quantity });
    return response.data;
  },

  // Matches your api.ts: apiClient.delete("/cart/clear")
  clearCart: async () => {
    const response = await api.delete("/cart/clear");
    return response.data;
  },

  // Matches your api.ts: apiClient.post("/buyer-orders/checkout", data)
  checkout: async (checkoutData: any) => {
    const response = await api.post("/buyer-orders/checkout", checkoutData);
    return response.data;
  }
};