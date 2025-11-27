import api from "@/lib/api_client";

export const cartService = {
  addToCart: (productId: number, quantity: number) => {
    return api.post("/cart", { product_id: productId, quantity });
  },
  fetchCartItems: () => {
    return api.get("/cart");
  },
};
