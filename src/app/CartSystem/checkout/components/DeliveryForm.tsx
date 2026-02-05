"use client";

import { useState } from "react";
import { Truck, Store, Zap } from "lucide-react";
import ShippingForm from "@/app/CartSystem/checkout/components/ShippingForm";
import { useCurrency } from "@/context/CurrencyContext";

interface DeliveryFormProps {
  initialData: any;
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export default function DeliveryForm({
  initialData,
  onSubmit,
  onBack,
}: DeliveryFormProps) {
  const [formData, setFormData] = useState(initialData);
  const { formatCurrency } = useCurrency();

  const handleDeliveryMethodChange = (method: string) => {
    setFormData((prev: any) => ({ ...prev, deliveryMethod: method }));
  };

  const handleShippingSubmit = (shippingData: any) => {
    // Merge shipping data with delivery method
    const completeData = {
      ...shippingData,
      deliveryMethod: formData.deliveryMethod,
    };
    onSubmit(completeData);
  };

  return (
    <div className="space-y-6">
      {/* Delivery Method Selection */}
      <div>
        <h3 className="mb-4 font-semibold text-md">
          How would you like to receive your order?
        </h3>
        <div className="space-y-3">
          {/* Self Pickup */}
          <label
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.deliveryMethod === "self-pickup"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 hover:border-orange-300"
            }`}
          >
            <input
              type="radio"
              name="deliveryMethod"
              value="self-pickup"
              checked={formData.deliveryMethod === "self-pickup"}
              onChange={(e) => handleDeliveryMethodChange(e.target.value)}
              className="w-4 h-4 mt-1 text-orange-500"
            />
            <Store
              className={`w-5 h-5 mx-3 mt-0.5 ${
                formData.deliveryMethod === "self-pickup"
                  ? "text-orange-500"
                  : "text-gray-600"
              }`}
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">Self Pickup</span>
              <p className="mt-1 text-sm text-gray-500">
                FREE - Pick up from vendor location
              </p>
            </div>
          </label>

          {/* Vendor Delivery */}
          <label
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.deliveryMethod === "vendor-delivery"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 hover:border-orange-300"
            }`}
          >
            <input
              type="radio"
              name="deliveryMethod"
              value="vendor-delivery"
              checked={formData.deliveryMethod === "vendor-delivery"}
              onChange={(e) => handleDeliveryMethodChange(e.target.value)}
              className="w-4 h-4 mt-1 text-orange-500"
            />
            <Truck
              className={`w-5 h-5 mx-3 mt-0.5 ${
                formData.deliveryMethod === "vendor-delivery"
                  ? "text-orange-500"
                  : "text-gray-600"
              }`}
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">Vendor Delivery</span>
              <p className="mt-1 text-sm text-gray-500">
                {formatCurrency(2000)} - Delivered by vendor (1-2 days)
              </p>
            </div>
          </label>

          {/* Express Delivery - Coming Soon */}
          <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-not-allowed bg-gray-50 opacity-60">
            <input
              type="radio"
              name="deliveryMethod"
              value="express"
              disabled
              className="w-4 h-4 mt-1 text-gray-400"
            />
            <Zap className="w-5 h-5 mx-3 mt-0.5 text-gray-400" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">
                  Express Delivery
                </span>
                <span className="px-2 py-0.5 text-xs font-medium text-orange-600 bg-orange-100 rounded">
                  Coming Soon
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Fast delivery within 2-4 hours
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="mt-3 font-medium text-md">
          Please Confirm Your Delivery Informations.
        </h3>
        {/* Shipping Form Component */}
        <ShippingForm
          initialData={{
            firstName: formData.firstName || "",
            lastName: formData.lastName || "",
            email: formData.email || "",
            phone: formData.phone || "",
            address: formData.address || "",
            city: formData.city || "",
            state: formData.state || "",
            zipCode: formData.zipCode || "",
            country: formData.country || "Nigeria",
          }}
          onSubmit={handleShippingSubmit}
          onBack={onBack}
        />
      </div>
    </div>
  );
}
