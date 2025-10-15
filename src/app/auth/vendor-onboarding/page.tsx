"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  vendorOnboardingSchema,
  VendorOnboardingData,
} from "@/lib/Validation/VendorOnboardingSchema";
import InputField from "@/components/Input";
import Dropdown from "../signup/components/DropDown";
import Button from "@/components/Button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const VendorOnboarding = () => {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);

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
      logo_url: "",
      banner_url: "",
    },
  });

  const onSubmit = async (data: VendorOnboardingData) => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) throw new Error("User not authenticated");

      const response = await axios.patch(
        "https://server.bizengo.com/api/user/switch-to-vendor",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "🎉 Vendor Onboarding Successful",
        description:
          response.data.message ||
          "Your store profile has been successfully created!",
      });

      setIsCompleted(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Onboarding Failed",
        description:
          error.response?.data?.message || "Something went wrong. Try again.",
      });
    }
  };

  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        router.push("/vendor/auth");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <AnimatePresence>
        {!isCompleted ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-xl p-8 space-y-6 bg-white border border-gray-100 rounded-2xl"
          >
            <h3 className="text-2xl font-bold text-center text-gray-800">
              Vendor Onboarding 🏪
            </h3>
            <p className="text-sm text-center text-gray-500">
              Fill out your store details below to complete your vendor
              registration.
            </p>

            <InputField
              label="Store Name*"
              placeholder="Enter your store name"
              {...register("store_name")}
              error={errors.store_name?.message}
            />

            <InputField
              label="Store Description*"
              placeholder="Describe your store"
              {...register("store_description")}
              error={errors.store_description?.message}
            />

            <InputField
              label="Store Address*"
              placeholder="e.g. Abuja, Nigeria"
              {...register("address")}
              error={errors.address?.message}
            />

            <Dropdown
              label="Business Category*"
              options={[
                "Electronics",
                "Fashion & Apparel",
                "Home & Kitchen",
                "Beauty & Health",
                "Automobile",
                "Food & Groceries",
                "Other",
              ]}
              selected={watch("business_category")}
              onSelect={value => setValue("business_category", value)}
              error={errors.business_category?.message}
            />

            <InputField
              label="Logo URL*"
              placeholder="https://example.com/logo.png"
              {...register("logo_url")}
              error={errors.logo_url?.message}
            />

            <InputField
              label="Banner URL*"
              placeholder="https://example.com/banner.jpg"
              {...register("banner_url")}
              error={errors.banner_url?.message}
            />

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
              Your vendor profile has been submitted and is pending admin
              approval. Once approved, you&apos;ll receive a confirmation email.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Redirecting you to the vendor login page in 5 seconds...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorOnboarding;
