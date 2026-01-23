"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  vendorOnboardingSchema,
  VendorOnboardingData,
} from "@/lib/Validation/VendorOnboardingSchema";

import InputField from "@/components/Input";
import Button from "@/components/Button";
import { vendorService } from "@/services/vendorService";
import { switchMode } from "@/services/api";
import {
  Loader2,
  MapPin,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import Link from "next/link";
import MapboxAutocomplete from "@/components/MapboxAutocomplete";

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
      Your vendor profile has been submitted and is pending admin approval.
    </p>
    <p className="mt-4 text-sm text-gray-500 font-medium">
      Redirecting to login to refresh your session...
    </p>
  </motion.div>
);

const VendorOnboarding = () => {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    location,
    loading: locationDetecting,
    detected: locationDetected,
    refresh: handleLocationRefresh,
  } = useLocationDetection();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VendorOnboardingData>({
    resolver: zodResolver(vendorOnboardingSchema),
    defaultValues: {
      business_name: "",
      description: "",
      address: "",
      country: "",
      state: "",
      // CHANGED: file inputs should not default to ""
      logo: undefined,
      banner: undefined,
      bank_name: "",
      account_number: "",
      wallet_address: "",
      latitude: "",
      longitude: "",
    },
  });

  // AUTOFILL LOGIC
  useEffect(() => {
    if (locationDetected) {
      if (location.country) setValue("country", location.country);
      if (location.state) setValue("state", location.state);

      if (location.latitude) setValue("latitude", location.latitude);
      if (location.longitude) setValue("longitude", location.longitude);

      if (location.country) {
        setValue("address", `${location.country}, ${location.state}`, {
          shouldValidate: true,
        });
      }
    }
  }, [locationDetected, location, setValue]);

  // Show welcome toast on mount
  useEffect(() => {
    toast({
      title: "📸 Upload Your Store Images",
      description:
        "Add a logo and banner. You can update them anytime after setup.",
    });
  }, []);

  // Handle Redirection
  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        router.push("/user-profile");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, router]);

  const onSubmit = async (data: VendorOnboardingData) => {
    try {
      // Validate that we have all required fields before submission
      const missingFields = [];

      if (!data.business_name?.trim()) missingFields.push("Store Name");
      if (!data.description?.trim()) missingFields.push("Store Description");
      if (!data.address?.trim()) missingFields.push("Business Address");
      if (!(data as any).logo?.[0]) missingFields.push("Logo");
      if (!(data as any).banner?.[0]) missingFields.push("Banner");

      if (missingFields.length > 0) {
        toast({
          variant: "destructive",
          title: "Missing Fields",
          description: `Please fill in: ${missingFields.join(", ")}`,
        });
        return;
      }

      // CHANGED: prepare multipart FormData so logo/banner files are uploaded
      const formData = new FormData();

      formData.append("business_name", data.business_name);
      formData.append("address", data.address);
      formData.append("description", data.description);

      const lat =
        Number((data as any).latitude) || (location.latitude as any) || 6.4698;
      const lng =
        Number((data as any).longitude) ||
        (location.longitude as any) ||
        3.5852;

      formData.append("latitude", String(lat));
      formData.append("longitude", String(lng));

      formData.append("business_name", data.business_name ?? "");
      formData.append("address", data.address ?? "");
      formData.append("description", data.description ?? "");
      formData.append("bank_name", data.bank_name ?? "");
      formData.append("account_number", data.account_number ?? "");
      formData.append("wallet_address", data.wallet_address ?? "");

      // Pull files from RHF (file inputs return a FileList)
      const logoFile: File | undefined = (data as any).logo?.[0];
      const bannerFile: File | undefined = (data as any).banner?.[0];

      if (logoFile) formData.append("logo", logoFile);
      if (bannerFile) formData.append("banner", bannerFile);

      // IMPORTANT: vendorService should send FormData (multipart)
      await vendorService.vendorOnboarding(formData);

      await switchMode("vendor");

      localStorage.removeItem("user");
      sessionStorage.removeItem("RSUser");

      toast({
        title: "Success!",
        description: "Store created and role updated.",
      });
      setIsCompleted(true);
    } catch (error: any) {
      console.error("Onboarding error:", error);

      // Extract specific error messages from API response
      let errorMessage = "Onboarding failed";

      if (error.response?.data?.errors) {
        // Handle validation errors object format
        const errors = error.response.data.errors;
        if (typeof errors === "object") {
          const fieldErrors = Object.entries(errors)
            .map(([field, messages]: [string, any]) => {
              const fieldName = field
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase());
              const message = Array.isArray(messages) ? messages[0] : messages;
              return `${fieldName}: ${message}`;
            })
            .join("; ");
          errorMessage = fieldErrors || errorMessage;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 lg:p-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <AnimatePresence>
        <div key="header" className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Marketplace
          </Link>
        </div>

        {!isCompleted ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-xl p-8 space-y-8 bg-white border border-gray-100 rounded-2xl shadow-sm"
          >
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800">Store Setup</h3>
              <p className="mt-2 text-sm text-gray-600">
                Provide your basic business details to go live.
              </p>
            </div>

            <div className="space-y-5">
              <InputField
                label="Store Name*"
                placeholder="Olowo Ventures"
                {...register("business_name")}
                error={errors.business_name?.message}
              />

              <InputField
                label="Store Description*"
                placeholder="Best shoes in Lagos..."
                {...register("description")}
                error={errors.description?.message}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Business Address*
                </label>
                <MapboxAutocomplete
                  value={watch("address") || ""}
                  onChange={(value, coordinates, details) => {
                    setValue("address", value);
                    if (coordinates) {
                      setValue("latitude", String(coordinates.lat));
                      setValue("longitude", String(coordinates.lng));
                    }
                    if (details?.state) setValue("state", details.state);
                    if (details?.country) setValue("country", details.country);
                  }}
                  onDetectLocation={handleLocationRefresh}
                  isDetecting={locationDetecting}
                  placeholder="Type to search (e.g., Nelocap estate, Lokogoma, Abuja)"
                  showDetectButton={true}
                />
                {errors.address && (
                  <p className="text-xs text-red-600">
                    {errors.address.message}
                  </p>
                )}

                {locationDetected &&
                  location.latitude &&
                  location.longitude && (
                    <p className="text-[10px] text-green-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> GPS Locked:{" "}
                      {location.latitude}, {location.longitude}
                    </p>
                  )}
              </div>

              {/* File inputs for Logo and Banner */}
              <div className="space-y-1">
                <InputField
                  label="Logo*"
                  type="file"
                  accept="image/*"
                  {...register("logo")}
                  error={(errors as any).logo?.message}
                />
                <p className="text-xs text-gray-500">
                  Upload your store logo. You can change it later.
                </p>
              </div>

              <div className="space-y-1">
                <InputField
                  label="Banner*"
                  type="file"
                  accept="image/*"
                  {...register("banner")}
                  error={(errors as any).banner?.message}
                />
                <p className="text-xs text-gray-500">
                  Upload your store banner. You can change it later.
                </p>
              </div>

              <InputField
                label="Bank Name (Optional)"
                placeholder="Access Bank"
                {...register("bank_name")}
                error={errors.bank_name?.message}
              />

              <InputField
                label="Account Number (Optional)"
                placeholder="1234567890"
                {...register("account_number")}
                error={errors.account_number?.message}
              />

              <InputField
                label="Wallet Address (Optional)"
                placeholder="0x..."
                {...register("wallet_address")}
                error={errors.wallet_address?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Latitude"
                  placeholder="6.4698"
                  {...register("latitude")}
                  error={errors.latitude?.message}
                  readOnly
                />
                <InputField
                  label="Longitude"
                  placeholder="3.5852"
                  {...register("longitude")}
                  error={errors.longitude?.message}
                  readOnly
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-white bg-[#0E2848] hover:bg-[#0E2848]/90 py-6 text-lg rounded-xl"
              disabled={isSubmitting || locationDetecting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" /> Finalizing...
                </div>
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
