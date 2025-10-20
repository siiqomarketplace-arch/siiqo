"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormData } from "@/lib/Validation/SignupSchema";
import InputField from "@/components/Input";
import PasswordStrengthBar from "./components/PasswordStrengthBar";
import { useLocationDetection } from "./components/useLocationDetection";
import {
  Eye,
  EyeOff,
  MapPin,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Sparkles,
  User,
  Store,
} from "lucide-react";
import Button from "@/components/Button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface SignupResponse {
  message: string;
  status: "success" | "error";
  user: {
    email: string;
    role: "buyer" | "vendor";
    user_id: string;
  };
}

const SignupForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone_number: "",
      address: { country: "", state: "" },
      referral_code: "",
      userType: "buyer",
    },
  });

  const password = watch("password", "");
  const userType = watch("userType", "buyer");

  const {
    location,
    loading: locationDetecting,
    detected: locationDetected,
    refresh: handleLocationRefresh,
  } = useLocationDetection();

  const [passwordStrengthScore, setPasswordStrengthScore] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const calcStrength = (password: string): number => {
      let score = 0;
      if (password.length >= 8) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^a-zA-Z0-9]/.test(password)) score++;
      return score;
    };
    setPasswordStrengthScore(calcStrength(password));
  }, [password]);

  useEffect(() => {
    if (locationDetected && location.country && location.state) {
      setValue("address.country", location.country);
      setValue("address.state", location.state);
    }
  }, [locationDetected, location, setValue]);

const onSubmit = async (data: SignupFormData) => {
  try {
    const { userType, confirmPassword, ...payload } = data;

    const requestBody = {
      fullname: payload.fullname,
      email: payload.email,
      password: payload.password,
      phone_number: payload.phone_number,
      address: {
        country: payload.address?.country || "",
        state: payload.address?.state || "",
      },
      ...(payload.referral_code && { referral_code: payload.referral_code }),
    };

    const response = await axios.post<SignupResponse>(
      "https://server.bizengo.com/api/auth/signup",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { status, user, message } = response.data;

    if (status === "success") {
     const emailToStore = user.email || payload.email;

     if (emailToStore) {
       sessionStorage.setItem("signupEmail", emailToStore);
       sessionStorage.setItem("signupRole", userType); // trust userType

       if (userType === "vendor") {
         sessionStorage.setItem("RSPassword", payload.password);
         sessionStorage.setItem("RSUserRole", "vendor"); // optional, for tracking
       }
     }


      toast({
        title: `${
          userType === "vendor" ? "Vendor" : "Buyer"
        } Signup Successful`,
        description: message || "Please verify your email with the OTP sent.",
      });

      // Redirect to OTP verification page
      router.push("/auth/verify-otp");
      reset();
    } else {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: message || "Something went wrong. Please try again.",
      });
    }
  } catch (error: any) {
    console.error("Signup error:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Unable to complete signup. Please try again later.";

    toast({
      variant: "destructive",
      title: "Signup Failed",
      description: errorMessage,
    });
  }
};


  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-14 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-2 text-sm text-gray-600 transition-colors hover:underline hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-xl p-6 my-10 space-y-4 bg-white border border-gray-200 rounded-2xl"
      >
        <CardHeader className="pb-2 mb-5 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Create Your Account
          </CardTitle>
          <CardDescription>
            Join thousands of Nigerian business owners
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:underline hover:text-blue-700"
            >
              Sign in here
            </Link>
          </div>
        </CardContent>

        <InputField
          label="Full Name*"
          placeholder="Enter your full name"
          {...register("fullname")}
          error={errors.fullname?.message}
        />
        <InputField
          label="Email Address*"
          type="email"
          placeholder="sam@example.com"
          {...register("email")}
          error={errors.email?.message}
        />

        <div className="flex flex-col gap-0">
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <div className="relative flex-1">
              <InputField
                label="Password*"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative flex-1 mt-3 sm:mt-0">
              <InputField
                label="Confirm Password*"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <PasswordStrengthBar
            strength={passwordStrengthScore}
            password={password}
          />
        </div>

        <InputField
          label="Phone Number*"
          type="text"
          placeholder="+2348123456789"
          {...register("phone_number")}
          error={errors.phone_number?.message}
        />

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between min-h-[24px]">
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
              <input
                type="text"
                placeholder={locationDetecting ? "Detecting..." : "Nigeria"}
                {...register("address.country")}
                disabled={locationDetecting}
                className="w-full px-3 border border-gray-300 rounded-md outline-none h-11 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 mt-3 space-y-2 sm:mt-0">
              <label className="text-sm font-medium">State *</label>
              <input
                type="text"
                placeholder={locationDetecting ? "Detecting..." : "Lagos"}
                {...register("address.state")}
                disabled={locationDetecting}
                className="w-full px-3 border border-gray-300 rounded-md outline-none h-11 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {locationDetecting && (
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Detecting your location...</span>
            </div>
          )}
        </div>

        <InputField
          label="Referral Code (optional)"
          placeholder="SAM-12A9B"
          {...register("referral_code")}
          error={errors.referral_code?.message}
        />

        <div className="pt-1"></div>

        <div className="relative flex items-center p-1 mb-4 border rounded-lg bg-gray-50">
          <div
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg transition-all duration-300 ease-in-out ${
              userType === "vendor" ? "translate-x-full" : "translate-x-0"
            }`}
          />

          <button
            type="button"
            onClick={() => setValue("userType", "buyer")}
            className={`relative z-10 flex-1 py-3 px-4 text-sm rounded-lg flex items-center justify-center gap-2 ${
              userType === "buyer"
                ? "text-white scale-105"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Register as Buyer</span>
          </button>

          <button
            type="button"
            onClick={() => setValue("userType", "vendor")}
            className={`relative z-10 flex-1 py-3 px-4 text-sm rounded-lg flex items-center justify-center gap-2 ${
              userType === "vendor"
                ? "text-white scale-105"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Register as Vendor</span>
          </button>
        </div>

        <div className="pb-8"></div>

        <Button
          type="submit"
          variant="navy"
          disabled={isSubmitting}
          className="w-full py-3 text-sm transition disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>
    </div>
  );
};

export default SignupForm;
