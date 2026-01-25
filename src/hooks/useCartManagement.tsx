import { useState, useCallback, useMemo } from "react";
import { cartService } from "@/services/cartService";
import type { CartItem, AppNotification } from "@/types/cart";
import { useAuth } from "@/context/AuthContext";

export const useCartManagement = () => {
  const { user, isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // User must be logged in to use cart
  const isBuyerMode = isLoggedIn;

  // --- callbacks ---
  const addNotification = useCallback(
    (type: AppNotification["type"], message: string) => {
      const id = crypto.randomUUID();
      setNotifications((prev) => [...prev, { id, type, message }]);
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const fetchCart = useCallback(async () => {
    if (!isBuyerMode) {
      addNotification("error", "Please log in to view your cart");
      return;
    }

    try {
      setIsLoading(true);
      const data = await cartService.fetchCartItems();

      const mappedItems: CartItem[] = (data.cart_items || []).map(
        (item: any) => ({
          id: item.cart_item_id,
          product_id: item.product_id,
          quantity: item.quantity,
          subtotal: item.subtotal,
          available_stock: item.available_stock,
          display_image: item.image,
          product: {
            id: item.product_id,
            product_name: item.product_name,
            unit_price: item.unit_price,
            images: item.image ? [item.image] : [],
            category: item.category,
          },
        }),
      );

      setCartItems(mappedItems);
      setTotalItems(mappedItems.reduce((sum, item) => sum + item.quantity, 0));
      setTotalPrice(data.total_price || 0);
    } catch (error: any) {
      addNotification(
        "error",
        error.message?.includes("token")
          ? "Please log in"
          : "Failed to load cart",
      );
      setCartItems([]);
      setTotalItems(0);
      setTotalPrice(0);
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, isBuyerMode]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1) => {
      if (!isBuyerMode) {
        addNotification("error", "Please log in to add items to cart");
        return;
      }

      try {
        setIsLoading(true);
        await cartService.addToCart(productId, quantity);
        addNotification("success", "Item added to cart!");
        await fetchCart();
      } catch (error: any) {
        addNotification("error", error.message || "Failed to add item to cart");
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification, fetchCart, isBuyerMode],
  );

  const updateCartItem = useCallback(
    async (productId: number, quantity: number) => {
      if (!isBuyerMode) {
        addNotification("error", "Please log in to update cart");
        return;
      }

      if (quantity < 1) return deleteCartItem(productId);
      try {
        setIsLoading(true);
        await cartService.updateCartItem(productId, quantity);
        addNotification("success", "Cart updated successfully!");
        await fetchCart();
      } catch (error: any) {
        addNotification("error", error.message || "Failed to update cart item");
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification, fetchCart, isBuyerMode],
  );

  const deleteCartItem = useCallback(
    async (productId: number) => {
      if (!isBuyerMode) {
        addNotification("error", "Please log in to remove items");
        return;
      }

      try {
        setIsLoading(true);
        await cartService.deleteCartItem(productId);
        addNotification("success", "Item removed from cart");
        await fetchCart();
      } catch (error: any) {
        addNotification("error", error.message || "Failed to remove item");
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification, fetchCart, isBuyerMode],
  );

  const clearCart = useCallback(async () => {
    if (!isBuyerMode) {
      addNotification("error", "Please log in to clear cart");
      return;
    }

    if (!window.confirm("Clear your entire cart?")) return;
    try {
      setIsLoading(true);
      await cartService.clearCart();
      addNotification("success", "Cart cleared!");
      setCartItems([]);
      setTotalItems(0);
      setTotalPrice(0);
    } catch (error: any) {
      addNotification("error", error.message || "Failed to clear cart");
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, isBuyerMode]);

  const checkout = useCallback(
    async (paymentMethod: "whatsapp" | "pod" = "whatsapp") => {
      if (!isBuyerMode) {
        addNotification("error", "Please log in to checkout");
        return;
      }

      try {
        setIsLoading(true);
        const response = await cartService.checkout({
          payment_method: paymentMethod,
        });
        addNotification("success", "Order created successfully!");
        return response;
      } catch (error: any) {
        addNotification("error", error.message || "Failed to create order");
        throw new Error(
          "We couldn't complete your order. Please check your information and try again.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification, isBuyerMode],
  );

  const uploadPaymentProof = useCallback(
    async (orderId: number, proofUrl: string) => {
      if (!isBuyerMode) {
        addNotification("error", "Please log in to upload payment proof");
        return;
      }

      try {
        setIsLoading(true);
        const response = await cartService.checkout({
          order_id: orderId,
          proof: proofUrl,
        });
        addNotification("success", "Payment proof submitted successfully!");
        return response;
      } catch (error: any) {
        addNotification(
          "error",
          error.message || "Failed to upload payment proof",
        );
        throw new Error(
          "File upload failed. Please check your connection and try again.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification, isBuyerMode],
  );

  // --- stable return object for better performance. ---
  return useMemo(
    () => ({
      isLoading,
      cartItems,
      totalItems,
      totalPrice,
      notifications,
      isBuyerMode,
      fetchCart,
      addToCart,
      updateCartItem,
      deleteCartItem,
      clearCart,
      checkout,
      uploadPaymentProof,
      removeNotification,
    }),
    [
      isLoading,
      cartItems,
      totalItems,
      totalPrice,
      notifications,
      isBuyerMode,
      fetchCart,
      addToCart,
      updateCartItem,
      deleteCartItem,
      clearCart,
      checkout,
      uploadPaymentProof,
      removeNotification,
    ],
  );
};
