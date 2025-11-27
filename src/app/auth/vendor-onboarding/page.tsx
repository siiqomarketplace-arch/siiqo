"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  vendorOnboardingSchema,
  VendorOnboardingData,
} from "@/lib/Validation/VendorOnboardingSchema";
import InputField from "@/components/Input";
import Dropdown from "@/app/auth/signup/components/DropDown";
import Button from "@/components/Button";
import { vendorOnboarding, uploadFile } from "@/services/api";
import {
  Loader2,
  CheckCircle2,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import ImageUpload from "@/components/ui/ImageUpload";

const businessTypes = [
  { value: "restaurant", label: "Restaurant" },
  { value: "retail", label: "Retail Store" },
  { value: "service", label: "Service Provider" },
  { value: "healthcare", label: "Healthcare" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "automotive", label: "Automotive" },
  { value: "home", label: "Home & Garden" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
];

const businessCategories = [
  "Electronics",
  "Fashion & Apparel",
  "Home & Kitchen",
  "Beauty & Health",
  "Automobile",
  "Food & Groceries",
  "Other",
];

const countries = [
  { value: "Nigeria", label: "Nigeria" },
  { value: "Ghana", label: "Ghana" },
  { value: "Kenya", label: "Kenya" },
  { value: "South Africa", label: "South Africa" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
];

const statesByCountry: Record<string, string[]> = {
  Nigeria: [
    "Lagos",
    "Abuja",
    "Kano",
    "Rivers",
    "Oyo",
    "Delta",
    "Kaduna",
    "Edo",
    "Plateau",
    "Kwara",
  ],
  Ghana: ["Greater Accra", "Ashanti", "Northern", "Western"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
  "South Africa": ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape"],
  "United States": ["California", "New York", "Texas", "Florida"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  Canada: ["Ontario", "Quebec", "British Columbia", "Alberta"],
};

const SuccessScreen = () => (
  <motion.div
    key="success"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center justify-center w-full max-w-md p-8 text-center bg-white border border-gray-100 rounded-xl"
  >
    <CheckCircle2 className="w-16 h-16 mb-4 text-green-600" />
    <h2 className="text-2xl font-bold text-gray-800">
      Registration Successful
    </h2>
    <p className="mt-2 text-sm text-gray-600">
      Your vendor profile has been submitted and is pending admin approval. Once
      approved, you&apos;ll receive a confirmation email.
    </p>
    <p className="mt-4 text-sm text-gray-500">
      Redirecting you to the vendor login page in 10 seconds...
    </p>
  </motion.div>
);

const VendorOnboarding = () => {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VendorOnboardingData>({
    resolver: zodResolver(vendorOnboardingSchema),
    defaultValues: {
      store_name: "",
      store_description: "",
      address: "",
      business_category: "",
      business_type: "",
      country: "",
      state: "",
      logo_url: "",
      banner_url: "",
      cac_registration_number: "",
      business_id: "",
      website: "",
    },
  });

  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, router]);

  const selectedCountry = watch("country");

  const handleCountryChange = (value: string) => {
    setValue("country", value);
    setValue("state", "");
  };

  const {
    location,
    loading: locationDetecting,
    detected: locationDetected,
    refresh: handleLocationRefresh,
  } = useLocationDetection();

  useEffect(() => {
    if (locationDetected && location.country && location.state) {
      setValue("country", location.country);
      setValue("state", location.state);
    }
  }, [locationDetected, location, setValue]);

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await uploadFile(formData);
      return response.data.url;
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        variant: "destructive",
        title: "Image Upload Failed",
        description: "Could not upload image. Please try again.",
      });
      throw error;
    }
  };

  const onSubmit = async (data: VendorOnboardingData) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, (data as any)[key]);
    });
    if (logoFile) {
      formData.append("logo_url", logoFile);
    }
    if (bannerFile) {
      formData.append("banner_url", bannerFile);
    }

    try {
      await vendorOnboarding(formData);

      toast({
        title: "Vendor Onboarding Successful",
        description:
          "Your store profile has been successfully created! Redirecting...",
      });

      sessionStorage.removeItem("RSEmail");
      sessionStorage.removeItem("RSToken");
      sessionStorage.removeItem("RSUser");
      sessionStorage.removeItem("RSUserRole");
      sessionStorage.removeItem("signupRole");
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("user");

      setIsCompleted(true);
    } catch (error: any) {
      console.error("Onboarding error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Try again.";

      if (errorMessage.toLowerCase().includes("already a seller")) {
        toast({
          variant: "default",
          title: "Onboarding Already Completed",
          description: "This account is already a vendor. Redirecting to login...",
        });
        router.push("/auth/login");
      } else {
        toast({
          variant: "destructive",
          title: "Onboarding Failed",
          description: errorMessage,
        });
      }
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 lg:p-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <AnimatePresence>
        {!isCompleted ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-2xl p-8 space-y-6 bg-white border border-gray-100 rounded-2xl"
          >
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800">
                Vendor Onboarding
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Complete your vendor profile to start selling
              </p>
            </div>

            {/* Store Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Store Information</h4>

              <InputField
                label="Store Name*"
                placeholder="Enter your store name"
                {...register("store_name")}
                error={errors.store_name?.message}
              />

              <InputField
                label="Store Description*"
                placeholder="Describe what your store offers"
                {...register("store_description")}
                error={errors.store_description?.message}
              />

              <Dropdown
                label="Business Category*"
                options={businessCategories}
                selected={watch("business_category")}
                onSelect={(value) => setValue("business_category", value)}
                error={errors.business_category?.message}
              />

              <Dropdown
                label="Business Type*"
                options={businessTypes.map((t) => t.label)}
                selected={watch("business_type")}
                onSelect={(value) => setValue("business_type", value)}
                error={errors.business_type?.message}
              />
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Location</h4>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Country *</label>
                <div className="flex items-center gap-2">
                  {locationDetected && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <MapPin className="w-3 h-3" />
                      <span>Auto-detected</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleLocationRefresh}
                    disabled={locationDetecting}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    title="Detect location"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${
                        locationDetecting ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
              <Dropdown
                label=""
                options={countries.map((c) => c.label)}
                selected={watch("country")}
                onSelect={handleCountryChange}
                error={errors.country?.message}
              />

              <Dropdown
                label="State/Region*"
                options={
                  selectedCountry ? statesByCountry[selectedCountry] || [] : []
                }
                selected={watch("state")}
                onSelect={(value) => setValue("state", value)}
                error={errors.state?.message}
              />

              <InputField
                label="Business Address*"
                placeholder="e.g. 123 Main Street"
                {...register("address")}
                error={errors.address?.message}
              />
            </div>

            {/* Business Documents */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Business Details</h4>

              <InputField
                label="CAC Registration Number (Optional)"
                placeholder="e.g. RC1234567"
                {...register("cac_registration_number")}
                error={errors.cac_registration_number?.message}
              />

              <InputField
                label="Business ID (Optional)"
                placeholder="e.g. BIZ-0021"
                {...register("business_id")}
                error={errors.business_id?.message}
              />

              <InputField
                label="Website (Optional)"
                placeholder="https://example.com"
                {...register("website")}
                error={errors.website?.message}
              />
            </div>

            {/* Branding */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">Branding</h4>

              <ImageUpload
                label="Logo"
                onFileChange={(file) => {
                  setLogoFile(file);
                  setValue("logo_url", file.name);
                }}
              />
              {errors.logo_url && errors.logo_url.message && (
                <p className="text-sm text-red-500">
                  {errors.logo_url.message.toString()}
                </p>
              )}

              <ImageUpload
                label="Banner"
                onFileChange={(file) => {
                  setBannerFile(file);
                  setValue("banner_url", file.name);
                }}
              />
              {errors.banner_url && errors.banner_url.message && (
                <p className="text-sm text-red-500">
                  {errors.banner_url.message.toString()}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full text-white transition bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Complete Onboarding"
              )}
            </Button>
          </motion.form>
        ) : (
          <SuccessScreen />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorOnboarding;