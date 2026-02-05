"use client";

import React, { useState } from "react";
import { Wallet, DollarSign, Loader2, AlertCircle, Store, MessageCircle } from "lucide-react";
import Button from "@/components/Button";
import { useCurrency } from "@/context/CurrencyContext";

interface PaymentFormProps {
  initialData: PaymentData;
  onSubmit: (data: PaymentData) => Promise<void>;
  onBack: () => void;
  summary: {
    cartItems: any[];
    totalItems: number;
    totalPrice: number;
  };
  deliveryMethod: string;
}

export type PaymentData = {
  paymentMethod: "whatsapp" | "pod";
};

export default function PaymentForm({
  initialData,
  onSubmit,
  onBack,
  summary,
  deliveryMethod,
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { formatCurrency } = useCurrency();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ paymentMethod: value as "whatsapp" | "pod" });
    setSubmitError(null);
  };

  // Calculate delivery fee based on method
  const getDeliveryFee = () => {
    if (deliveryMethod === "self-pickup") return 0;
    if (deliveryMethod === "vendor-delivery") return 2000;
    if (deliveryMethod === "express") return 1500;
    return 0;
  };

  const deliveryFee = getDeliveryFee();
  const total = summary.totalPrice + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(formData);
    } catch (error: any) {
      setSubmitError(error.message || "Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium text-md">Select Payment Method</h3>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        {/* WhatsApp Payment */}
        <label
          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.paymentMethod === "whatsapp"
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-green-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="whatsapp"
            checked={formData.paymentMethod === "whatsapp"}
            onChange={handleChange}
            className="w-4 h-4 text-green-500"
          />
          <MessageCircle
            className={`w-5 h-5 mx-3 ${
              formData.paymentMethod === "whatsapp"
                ? "text-green-500"
                : "text-gray-600"
            }`}
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900">
              Pay via WhatsApp
            </span>
            <p className="mt-1 text-sm text-gray-500">
              Contact seller on WhatsApp for payment instructions
            </p>
          </div>
        </label>

        {/* Pay on Delivery */}
        <label
          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.paymentMethod === "pod"
              ? "border-orange-500 bg-orange-50"
              : "border-gray-300 hover:border-orange-300"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="pod"
            checked={formData.paymentMethod === "pod"}
            onChange={handleChange}
            className="w-4 h-4 text-orange-500"
          />
          <DollarSign
            className={`w-5 h-5 mx-3 ${
              formData.paymentMethod === "pod"
                ? "text-orange-500"
                : "text-gray-600"
            }`}
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900">
              Pay on Delivery (POD)
            </span>
            <p className="mt-1 text-sm text-gray-500">
              Pay with cash or POS upon arrival
            </p>
          </div>
        </label>

        {/* Wallet - Coming Soon */}
        <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-not-allowed bg-gray-50 opacity-60">
          <input
            type="radio"
            name="paymentMethod"
            disabled
            className="w-4 h-4 text-gray-400"
          />
          <Wallet className="w-5 h-5 mx-3 text-gray-400" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600">Pay with Wallet</span>
              <span className="px-2 py-0.5 text-xs font-medium text-orange-600 bg-orange-100 rounded">
                Coming Soon
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Secure wallet payment integration
            </p>
          </div>
        </label>
      </div>

      {/* WhatsApp Info */}
      {formData.paymentMethod === "whatsapp" && (
        <div className="p-4 space-y-3 border border-green-200 rounded-lg bg-green-50">
          <div className="flex items-start">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">
                WhatsApp Payment Selected
              </p>
              <p className="mt-1 text-sm text-green-700">
                You'll be connected to the seller via WhatsApp for payment arrangements. Include your Order ID in the conversation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* POD Info */}
      {formData.paymentMethod === "pod" && (
        <div className="p-4 space-y-3 border border-green-200 rounded-lg bg-blue-50">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 text-slate-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">
                Payment on Delivery Selected
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Have your payment ready when your order arrives. We accept cash,
                POS payments or Bank Transfers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Self Pickup Info */}
      {deliveryMethod === "self-pickup" && (
        <div className="p-4 space-y-3 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-start">
            <Store className="w-5 h-5 mr-2 text-slate-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">
                Self Pickup Selected — FREE
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Pickup Location: <strong>Fabulous Kicks</strong>, Shop 45
                Genesis Centre, GRA. <br />
                Open Hours: <strong>9 AM - 6 PM</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="p-6 my-4 bg-white border rounded-lg">
        <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({summary.totalItems} items)</span>
            <span>{formatCurrency(summary.totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span
              className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}
            >
              {deliveryFee === 0 ? "FREE" : formatCurrency(deliveryFee)}
            </span>
          </div>
          <div className="pt-2 mt-2 border-t">
            <div className="flex justify-between font-bold text-orange-500">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-3 pt-6">
        <Button
          variant="outline"
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-1/2 py-2 text-sm font-semibold"
        >
          Back
        </Button>
        <Button
          disabled={isSubmitting}
          variant="orange"
          type="submit"
          className="flex items-center justify-center w-1/2 gap-2 py-2 text-sm font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </form>
  );
}
