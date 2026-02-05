"use client";

import { useEffect, useState } from "react";
import {
  useCartItems,
  useCartTotals,
  useCartActions,
  useCartNotifications,
  useCartLoading,
} from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import NotificationToast from "@/components/ui/NotificationToast";
import Skeleton from "@/components/skeleton";
import {
  ShoppingCart,
  Truck,
  CreditCard,
  Check,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import DeliveryForm from "./components/DeliveryForm";
import PaymentForm from "./components/PaymentForm";
import OrderTracking from "./components/OrderTracking";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
// import { useCurrency } from "@/context/CurrencyContext";

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useCartItems();
  const { totalItems, totalPrice } = useCartTotals();
  const { fetchCart, updateCartItem, deleteCartItem, clearCart, checkout } =
    useCartActions();
  const { notifications, removeNotification } = useCartNotifications();
  const isLoading = useCartLoading();
  const { user, isLoggedIn } = useAuth();
  // const { formatCurrency } = useCurrency();

  const [currentStep, setCurrentStep] = useState(0);
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

  const [paymentData, setPaymentData] = useState<{
    paymentMethod: "whatsapp" | "pod";
  }>({
    paymentMethod: "whatsapp",
  });

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Load cart on mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    }
  }, [isLoggedIn]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && cartItems.length === 0 && currentStep === 0) {
      router.push("/");
    }
  }, [cartItems, isLoading]);

  const handleDeliverySubmit = (data: any) => {
    setDeliveryData(data);
    setCurrentStep(1);
  };

  const handlePaymentSubmit = async (data: any) => {
    setPaymentData(data);
    setCheckoutError(null);

    try {
      const orders = await checkout(data.paymentMethod || "whatsapp");
      setOrderDetails(orders);
      setCurrentStep(2);
    } catch (error: any) {
      setCheckoutError(error.message || "Checkout failed");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const steps = [
    { id: 0, label: "Cart", icon: ShoppingCart },
    { id: 1, label: "Delivery", icon: Truck },
    { id: 2, label: "Payment", icon: CreditCard },
  ];

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <AlertCircle size={48} className="text-yellow-600 mx-auto" />
          <h1 className="text-2xl font-bold text-text-primary">
            Please Log In
          </h1>
          <p className="text-text-secondary">You need to log in to checkout.</p>
          <Button
            onClick={() => router.push("/")}
            variant="orange"
            className="mt-4"
          >
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-text-primary">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                        isCompleted
                          ? "bg-orange-500 border-orange-500 text-white"
                          : isActive
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={20} />
                      ) : (
                        <StepIcon size={20} />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium text-center ${
                        isCompleted || isActive
                          ? "text-orange-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        currentStep > step.id ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Notifications */}
            {notifications.map((notification) => (
              <NotificationToast
                key={notification.id}
                notification={notification}
                onClose={removeNotification}
              />
            ))}

            {/* Current Step Content */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-border p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShoppingCart size={20} />
                    Review Your Cart
                  </h2>

                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton
                          key={i}
                          type="rect"
                          width="100%"
                          height="80px"
                        />
                      ))}
                    </div>
                  ) : cartItems.length === 0 ? (
                    <p className="text-center py-8 text-text-secondary">
                      Your cart is empty
                    </p>
                  ) : (
                    <div className="space-y-4 divide-y divide-border">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 pb-4 pt-4 first:pt-0"
                        >
                          <img
                            src={item.product.images[0] || ""}
                            alt={item.product.product_name}
                            className="w-20 h-20 object-cover rounded border border-border"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-text-primary">
                              {item.product.product_name}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              {item.product.category}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm">
                                Qty: {item.quantity}
                              </span>
                              {/* <span className="font-semibold text-primary">
                                {formatCurrency(item.subtotal)}
                              </span> */}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => setCurrentStep(1)}
                    disabled={isLoading || cartItems.length === 0}
                    variant="orange"
                    className="w-full mt-6"
                  >
                    Continue to Delivery
                  </Button>
                </div>
              </div>
            )}

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
                orderId={orderDetails?.order_id || "N/A"}
                total={totalPrice}
                deliveryMethod={deliveryData.deliveryMethod}
                paymentMethod={paymentData.paymentMethod}
                onClose={() => {
                  setCurrentStep(0);
                  router.push("/");
                }}
              />
            )}
          </div>

          {/* Sidebar - Order Summary */}
          {currentStep < 3 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-border p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4 text-text-primary">
                  Order Summary
                </h3>

                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton type="rect" width="100%" height="16px" />
                    <Skeleton type="rect" width="100%" height="16px" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 pb-4 border-b border-border mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Subtotal</span>
                        {/* <span className="font-medium text-text-primary">
                          {formatCurrency(totalPrice)}
                        </span> */}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Items</span>
                        <span className="font-medium text-text-primary">
                          {totalItems}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Shipping</span>
                        <span className="font-medium text-text-primary">
                          TBD
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between font-semibold text-lg mb-4">
                      <span>Total</span>
                      {/* <span className="text-primary">
                        {formatCurrency(totalPrice)}
                      </span> */}
                    </div>

                    {checkoutError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-4">
                        {checkoutError}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
