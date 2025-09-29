"use client";
import { useEffect } from "react";
import { useCartManagement } from "@/hooks/useCartManagement";
import NotificationToast from "@/components/ui/NotificationToast";

export default function JumiaCartSystem() {
  const {
    isLoading,
    cartItems,
    totalItems,
    totalPrice,
    notifications,
    fetchCart,
    updateCartItem,
    deleteCartItem,
    clearCart,
    removeNotification,
  } = useCartManagement();

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Notifications */}
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      {/* --- Main Cart Layout --- */}
      <div className="max-w-6xl px-4 py-6 mx-auto lg:px-6">
        <div className="flex flex-col gap-8">
          {/* Cart Items */}
          <div className="">
            <div className="border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">
                  Shopping Cart ({totalItems})
                </h2>
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    disabled={isLoading}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Items */}
              {isLoading ? (
                <div className="p-6 text-center text-gray-500">Loading…</div>
              ) : cartItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Your cart is empty.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex p-6 space-x-4">
                      <img
                        src={
                          item.product.images[0] ||
                          "https://via.placeholder.com/80"
                        }
                        alt={item.product.product_name}
                        className="object-cover w-20 h-20 border rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {item.product.product_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.product.category}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <button
                            onClick={() =>
                              updateCartItem(item.id, item.quantity - 1)
                            }
                            disabled={isLoading}
                            className="px-2 border rounded"
                          >
                            –
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateCartItem(item.id, item.quantity + 1)
                            }
                            disabled={isLoading}
                            className="px-2 border rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-orange-500">
                          ₦
                          {(
                            item.quantity * item.product.unit_price
                          ).toLocaleString()}
                        </span>
                        <button
                          onClick={() => deleteCartItem(item.id)}
                          disabled={isLoading}
                          className="mt-2 text-sm text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 lg:col-span-4 lg:mt-0">
            <div className="sticky p-6 bg-white border rounded-lg shadow-sm top-6">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal ({totalItems} items)</span>
                <span>₦{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-orange-500">
                <span>Total</span>
                <span>₦{totalPrice.toLocaleString()}</span>
              </div>
              <button
                disabled={isLoading || cartItems.length === 0}
                className="w-full py-3 mt-4 font-semibold text-white bg-orange-500 rounded-lg disabled:bg-gray-300"
              >
                CHECKOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
