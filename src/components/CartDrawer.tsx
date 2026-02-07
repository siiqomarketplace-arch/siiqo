"use client";

import React, { useState } from "react";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import {
  useCartItems,
  useCartTotals,
  useCartActions,
  useCartLoading,
  useCartNotifications,
} from "@/context/CartContext";
import { cartService } from "@/services/cartService";
import { useRouter } from "next/navigation";
import Icon from "./ui/AppIcon";
import Skeleton from "./skeleton";
import { toast } from "sonner";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const cartItems = useCartItems();
  const { totalItems, totalPrice } = useCartTotals();
  const { fetchCart } = useCartActions();
  const { removeNotification } = useCartNotifications();
  const isLoading = useCartLoading();
  const router = useRouter();
  const [updatingItemId, setUpdatingItemId] = useState<number | string | null>(
    null,
  );

  const handleCheckout = () => {
    onClose();
    router.push("/CartSystem/checkout");
  };

  const handleUpdateQuantity = async (
    itemId: number | string,
    quantity: number,
  ) => {
    if (quantity < 1) {
      await handleDeleteItem(itemId);
      return;
    }

    try {
      setUpdatingItemId(itemId);
      await cartService.updateCartItem(itemId, quantity);
      toast.success("Cart updated!");
      await fetchCart();
    } catch (error: any) {
      toast.error(error.message || "Failed to update cart");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDeleteItem = async (itemId: number | string) => {
    try {
      setUpdatingItemId(itemId);
      await cartService.deleteCartItem(itemId);
      toast.success("Item removed from cart");
      await fetchCart();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full bg-white shadow-lg w-full sm:w-96 animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-text-primary">
              Shopping Cart
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton
                    type="rect"
                    width="80px"
                    height="80px"
                    className="rounded"
                  />
                  <div className="flex-1 space-y-2">
                    <Skeleton type="rect" width="100%" height="16px" />
                    <Skeleton type="rect" width="60%" height="14px" />
                  </div>
                </div>
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart size={32} className="text-gray-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-text-primary">
                  Your cart is empty
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  Add items to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-border last:border-b-0"
                >
                  {/* Product Image */}
                  <img
                    src={
                      item.product.images[0] || "https://via.placeholder.com/80"
                    }
                    alt={item.product.product_name}
                    className="w-20 h-20 object-cover rounded border border-border"
                  />

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-text-primary line-clamp-2">
                      {item.product.product_name}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      {item.product.category}
                    </p>
                    <p className="font-semibold text-primary mt-2">
                      ₦{item.subtotal.toLocaleString()}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        disabled={
                          isLoading ||
                          updatingItemId === item.id ||
                          item.quantity <= 1
                        }
                        className="p-1 border border-border rounded hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Icon name="Minus" size={14} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={
                          isLoading ||
                          updatingItemId === item.id ||
                          item.quantity >= item.available_stock
                        }
                        className="p-1 border border-border rounded hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Icon name="Plus" size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={isLoading || updatingItemId === item.id}
                        className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {cartItems.length > 0 && !isLoading && (
          <div className="border-t border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-semibold text-text-primary">
                ₦{totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Items</span>
              <span className="font-semibold text-text-primary">
                {totalItems}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
