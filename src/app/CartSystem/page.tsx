"use client";

import { useEffect, useState } from "react";
import {
  useCartItems,
  useCartTotals,
  useCartActions,
  useCartNotifications,
  useCartLoading,
} from "@/context/CartContext";

import NotificationToast from "@/components/ui/NotificationToast";
import Skeleton from "@/components/skeleton";
import {
  LucideMinus,
  LucidePlus,
  ShoppingCart,
  Truck,
  CreditCard,
  Check,
} from "lucide-react";
import DeliveryForm from "@/app/CartSystem/checkout/components/DeliveryForm";
import PaymentForm from "@/app/CartSystem/checkout/components/PaymentForm";
import Button from "@/components/Button";
import OrderTracking from "./checkout/components/OrderTracking";
import { useCartModal } from "@/context/cartModalContext";

export default function JumiaCartSystem() {
  const cartItems = useCartItems();
  const { totalItems, totalPrice } = useCartTotals();
  const { fetchCart, updateCartItem, deleteCartItem, clearCart } =
    useCartActions();
  const { notifications, removeNotification } = useCartNotifications();
  const isLoading = useCartLoading();

const { isCartOpen, currentStep, setCurrentStep, closeCart, openCart } = useCartModal();

  const [deliveryData, setDeliveryData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    deliveryMethod: "self-pickup",
    deliveryInstructions: "",
  });

  const [paymentData, setPaymentData] = useState({
    paymentMethod: "pod",
  });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

const handleCheckout = () => {
  openCart(1);
  setCurrentStep(1);
};

  const handleDeliverySubmit = (data: any) => {
    setDeliveryData(data);
    setCurrentStep(2);
  };

  const handlePaymentSubmit = (data: any) => {
    setPaymentData(data);

    console.log("Order Summary:", {
      delivery: deliveryData,
      payment: data,
      items: cartItems,
      total: totalPrice,
    });

    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else closeCart();
  };

  // Progress steps data
  const steps = [
    { id: 0, label: "Cart", icon: ShoppingCart },
    { id: 1, label: "Delivery", icon: Truck },
    { id: 2, label: "Payment", icon: CreditCard },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen mx-auto">
      <div className="flex flex-col w-full h-full lg:w-96">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}

        {/* Cart Area */}
        <div className="flex-1 p-2 pb-20 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Cart Box */}
          <div className="border border-gray-100 rounded-lg">
            <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100">
              <h2 className="flex items-center justify-between gap-3 text-lg font-semibold ">
                My Cart Items{" "}
                <span className="text-orange-500">{totalItems}</span>
              </h2>

              {cartItems.length > 0 && !isLoading && (
                <button
                  onClick={clearCart}
                  disabled={isLoading}
                  className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Clear all
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="divide-y divide-gray-200">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex p-4 space-x-4">
                    <Skeleton
                      type="rect"
                      width="80px"
                      height="80px"
                      className="rounded"
                    />
                    <div className="flex-1 space-y-2">
                      <Skeleton type="rect" width="60%" height="16px" />
                      <Skeleton type="rect" width="40%" height="14px" />
                    </div>
                  </div>
                ))}
              </div>
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
                      <div className="flex items-center mt-2 space-x-4">
                        <button
                          onClick={() =>
                            updateCartItem(item.id, item.quantity - 1)
                          }
                          disabled={isLoading}
                          className="p-2 border border-gray-200 rounded-full"
                        >
                          <LucideMinus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateCartItem(item.id, item.quantity + 1)
                          }
                          disabled={isLoading}
                          className="p-2 border border-gray-200 rounded-full"
                        >
                          <LucidePlus size={12} />
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

          {/* Summary */}
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal ({totalItems} items)</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-orange-500">
              <span>Total</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </div>
            <Button
              type="button"
              variant="orange"
              onClick={handleCheckout}
              disabled={isLoading || cartItems.length === 0}
              className="w-full py-2 mt-4 text-sm disabled:bg-gray-300"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>

      {/* Unified Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header with Progress */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-md">
              {currentStep === 1
                ? "Delivery Information"
                : currentStep === 2
                ? "Payment Method"
                : "Order Confirmed"}
            </h2>
            <button onClick={closeCart}>✕</button>
          </div>

          {/* Progress bar */}
          <div className="relative flex items-center justify-between">
            {/* Background line */}
            <div className="absolute top-[14px] left-6 right-6 h-[2px] bg-gray-200" />

            {/* Active progress line */}
            <div
              className="absolute top-[14px] left-6 h-[2px] bg-orange-500 transition-all duration-500 ease-in-out"
              style={{
                width:
                  currentStep === 1
                    ? "0%"
                    : currentStep === 2
                    ? "calc(50% - 24px)"
                    : currentStep === 3
                    ? "calc(100% - 48px)"
                    : "0%",
              }}
            />

            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center"
                >
                  {/* Circle container */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-orange-500 border-orange-500 text-white"
                        : isActive
                        ? "bg-orange-500 border-orange-500 text-white scale-110"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={13} strokeWidth={3} />
                    ) : (
                      <Icon size={13} strokeWidth={isActive ? 2.5 : 2} />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                      isCompleted || isActive
                        ? "text-orange-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drawer Content */}
        <div className="p-4 pb-8 overflow-y-auto h-[calc(100%-130px)] custom-scrollbar">
          {currentStep === 1 && (
            <DeliveryForm
              initialData={deliveryData}
              onSubmit={handleDeliverySubmit}
              onBack={handleBack}
            />
          )}

          {currentStep === 2 && (
            <PaymentForm
              initialData={paymentData}
              onSubmit={handlePaymentSubmit}
              onBack={handleBack}
              summary={{ cartItems, totalItems, totalPrice }}
              deliveryMethod={deliveryData.deliveryMethod}
            />
          )}

          {currentStep === 3 && (
            <OrderTracking
              orderId="84932"
              total={totalPrice}
              deliveryMethod={deliveryData.deliveryMethod}
              paymentMethod={paymentData.paymentMethod}
              onClose={() => {
                closeCart();
                setCurrentStep(0);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
