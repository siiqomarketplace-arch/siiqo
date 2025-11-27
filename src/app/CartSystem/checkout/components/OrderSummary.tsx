"use client";

import { ArrowLeft, Check } from "lucide-react";

interface OrderSummaryProps {
  cartItems: any[];
  totalItems: number;
  totalPrice: number;
  currentStep: number;
  onBack?: () => void;
}

export default function OrderSummary({
  cartItems,
  totalItems,
  totalPrice,
  currentStep,
  onBack,
}: OrderSummaryProps) {
  // Calculate additional costs
  const shipping = 1500; // ₦1,500 flat shipping
  const tax = totalPrice * 0.075; // 7.5% tax
  const total = totalPrice + shipping + tax;

  // Determine button text based on current step
  const getButtonText = () => {
    if (currentStep === 1) return "Continue to Payment";
    if (currentStep === 2) return "Complete Checkout";
    return "Continue";
  };

  // Handle form submission based on current step
  const handleContinue = () => {
    if (currentStep === 1) {
      // Trigger shipping form submission
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) form.requestSubmit();
    } else if (currentStep === 2) {
      // Trigger payment form submission
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) form.requestSubmit();
    }
  };

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-lg">
      <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>

      {/* Price Breakdown */}
      <div className="pt-4 space-y-3 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({totalItems} items)</span>
          <span>₦{totalPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span>₦{shipping.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tax (7.5%)</span>
          <span>₦{tax.toLocaleString()}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between pt-4 mt-4 text-lg font-bold text-gray-900 border-t border-gray-200">
        <span>Total</span>
        <span className="text-orange-500">₦{total.toLocaleString()}</span>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <button
          onClick={handleContinue}
          className="w-full py-3 text-sm text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
        >
          {getButtonText()}
        </button>

        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-full gap-3 py-3 text-sm text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <ArrowLeft/> Back
          </button>
        )}
      </div>

      {/* Security Badge */}
      <div className="p-3 mt-4 border border-green-200 rounded-lg bg-green-50">
        <div className="flex items-start">
          <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-green-700">
            <p className="font-medium">Free returns within 30 days</p>
            <p className="mt-1">Secure checkout guaranteed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
