import api from "@/lib/api_client";

// Local helper to ensure auth header is present for cart calls
const authHeaders = () => {
  if (typeof window === "undefined") return {};

  // 1. Try to get token from all possible storage locations
  const token =
    sessionStorage.getItem("RSToken") ||
    localStorage.getItem("RSToken") ||
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("RSToken="))
      ?.split("=")[1];

  // 2. Critical Fix: Ensure token exists and is not a "null"/"undefined" string
  if (!token || token === "undefined" || token === "null") {
    console.error("Cart Service: No valid RSToken found in storage or cookies");
    return {};
  }

  // 3. Clean and return the header
  const cleanToken = decodeURIComponent(token).replace(/^"|"$/g, ""); // Remove quotes if present
  return {
    Authorization: `Bearer ${cleanToken}`,
    "Content-Type": "application/json",
  };
};

export const cartService = {
  addToCart: async (productId: number, quantity: number) => {
    const headers = authHeaders();
    if (!headers.Authorization)
      throw new Error("Please sign in to add items to your cart.");

    const response = await api.post(
      "/cart/add",
      { product_id: productId, quantity },
      { headers },
    );
    return response.data;
  },

  fetchCartItems: async () => {
    const headers = authHeaders();
    // Providing headers directly to ensure the Authorization key is present
    const response = await api.get("/cart", { headers });
    return response.data;
  },

  updateCartItem: async (itemId: number | string, quantity: number) => {
    const response = await api.patch(
      `/cart/update/${itemId}`,
      { quantity },
      { headers: authHeaders() },
    );
    return response.data;
  },

  deleteCartItem: async (itemId: number | string) => {
    const response = await api.delete(`/cart/delete/${itemId}`, {
      headers: authHeaders(),
    });
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete("/cart/clear", {
      headers: authHeaders(),
    });
    return response.data;
  },

  checkout: async (checkoutData: any) => {
    const response = await api.post("/buyer-orders/checkout", checkoutData, {
      headers: authHeaders(),
    });
    return response.data;
  },
};
