"use client";

import { useState, useEffect } from "react";
import { Check, Package, Clock } from "lucide-react";
import Button from "@/components/Button";
import { useCurrency } from "@/context/CurrencyContext";

interface OrderTrackingProps {
  orderId: string;
  total: number;
  deliveryMethod: string;
  paymentMethod: string;
  onClose: () => void;
}

const OrderTracking = ({
  orderId,
  total,
  deliveryMethod,
  paymentMethod,
  onClose,
}: OrderTrackingProps) => {
  const { formatCurrency } = useCurrency();
  const getSteps = () => {
    switch (deliveryMethod) {
      case "self-pickup":
        return ["Order Confirmed", "Ready for Pickup", "Collected"];
      case "vendor-delivery":
        return ["Order Confirmed", "Shipped by Vendor", "Delivered"];
      default:
        return [
          "Order Placed",
          "Rider Assigned",
          "In Transit to You",
          "Delivered",
        ];
    }
  };

  const steps = getSteps();
  const [statusIndex, setStatusIndex] = useState(0);

  // Simulate step-by-step progress (demo animation)
  useEffect(() => {
    if (statusIndex < steps.length - 1) {
      const timer = setTimeout(() => {
        setStatusIndex((prev) => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusIndex, steps.length]);

  const currentStatus = steps[statusIndex];

  return (
    <div className="space-y-6 text-gray-700 transition-all">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Order #{orderId} Placed Successfully!
        </h2>
        <p className="text-sm text-gray-500">
          Thank you for your purchase. Track your order’s progress below.
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Total Amount:</span>
          <span className="font-semibold text-orange-600">
            {formatCurrency(total)}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>Delivery Method:</span>
          <span className="capitalize">{deliveryMethod.replace("-", " ")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Payment Method:</span>
          <span className="uppercase">{paymentMethod}</span>
        </div>
      </div>

      {/* ETA */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock size={16} className="text-orange-500" />
        Estimated Delivery:{" "}
        <span className="font-medium">2–4 business days</span>
      </div>

      {/* Tracking Progress */}
      <div className="relative mt-6">
        <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-200" />
        <div className="space-y-6 ml-8">
          {steps.map((step, idx) => {
            const isCompleted = idx < statusIndex;
            const isActive = idx === statusIndex;

            return (
              <div
                key={idx}
                className="relative flex items-start gap-3 transition-all"
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-orange-500 border-orange-500 text-white"
                      : isActive
                        ? "border-orange-400 text-orange-500 bg-white"
                        : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : <Package size={14} />}
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      isCompleted || isActive
                        ? "text-orange-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step}
                  </p>
                  {isActive && (
                    <p className="text-xs text-gray-500 transition-all">
                      {step === "Order Placed"
                        ? "Your order has been received."
                        : step === "Rider Assigned"
                          ? "A rider has been assigned to your delivery."
                          : step === "In Transit to You"
                            ? "Your package is on the way."
                            : step === "Ready for Pickup"
                              ? "Your order is ready for pickup."
                              : step === "Shipped by Vendor"
                                ? "The vendor has shipped your order."
                                : step === "Collected"
                                  ? "You’ve collected your order."
                                  : "Your order has been delivered successfully."}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-6">
        <Button
          variant="orange"
          className="w-full py-2 text-sm"
          onClick={() => alert("View Order Status (coming soon)")}
        >
          View Order Status
        </Button>
        <Button
          variant="outline"
          className="w-full py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-100"
          onClick={onClose}
        >
          Continue Shopping
        </Button>
      </div>

      {/* Contact Support */}
      <div className="pt-3 text-center text-sm text-gray-500">
        <p>
          Need help?{" "}
          <button className="text-orange-600 underline hover:text-orange-700">
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
};

export default OrderTracking;
