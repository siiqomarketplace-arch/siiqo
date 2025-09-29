import { useState } from "react";
import api from "@/lib/api_client";
import api_endpoints from "./api_endpoints";

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  subtotal: number;
  available_stock: number;
  display_image: string | null;
  product: {
    id: number;
    product_name: string;
    unit_price: number;
    images: string[];
    category: string;
  };
}

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export const useCartManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: Notification["type"], message: string) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const data: any = await api.get(api_endpoints.FETCH_CART_ITEMS);

      const mappedItems: CartItem[] = (data.cart_items || []).map(
        (item: any) => ({
          id: item.cart_item_id,
          product_id: item.product_id,
          quantity: item.quantity_in_cart,
          subtotal: item.subtotal,
          available_stock: item.available_stock,
          display_image: item.display_image,
          product: {
            id: item.product_id,
            product_name: item.product_name,
            unit_price: item.unit_price,
            images: item.images || [],
            category: item.category,
          },
        })
      );

      setCartItems(mappedItems);
      setTotalItems(mappedItems.reduce((sum, item) => sum + item.quantity, 0));
      setTotalPrice(data.total_price || 0);
    } catch (error: any) {
      addNotification(
        "error",
        error.message?.includes("token")
          ? "Please log in"
          : "Failed to load cart"
      );
      setCartItems([]);
      setTotalItems(0);
      setTotalPrice(0);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity = 1) => {
    try {
      setIsLoading(true);
      await api.post(api_endpoints.ADD_TO_CART_ITEMS, {
        product_id: productId,
        quantity,
      });
      addNotification("success", "Item added to cart!");
      await fetchCart();
    } catch {
      addNotification("error", "Failed to add item to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    if (quantity < 1) return deleteCartItem(itemId);
    try {
      setIsLoading(true);
      await api.put(`${api_endpoints.UPDATE_CART_ITEMS}/${itemId}`, {
        quantity,
      });
      addNotification("success", "Cart updated successfully!");
      await fetchCart();
    } catch {
      addNotification("error", "Failed to update cart item");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCartItem = async (itemId: number) => {
    try {
      setIsLoading(true);
      await api.delete(`${api_endpoints.DELETE_CART_ITEMS}/${itemId}`);
      addNotification("success", "Item removed from cart");
      await fetchCart();
    } catch {
      addNotification("error", "Failed to remove item");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Clear your entire cart?")) return;
    try {
      setIsLoading(true);
      await api.delete(api_endpoints.CLEAR_CART_ITEMS);
      addNotification("success", "Cart cleared!");
      setCartItems([]);
      setTotalItems(0);
      setTotalPrice(0);
    } catch {
      addNotification("error", "Failed to clear cart");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    cartItems,
    totalItems,
    totalPrice,
    notifications,
    fetchCart,
    addToCart,
    updateCartItem,
    deleteCartItem,
    clearCart,
    removeNotification,
  };
};
