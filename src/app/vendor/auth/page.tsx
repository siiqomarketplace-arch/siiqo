"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, Store, Loader2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { loginSchema, LoginFormValues } from "@/lib/Validation/LoginSchema";
import axios from "axios";

// Interfaces
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token?: string;
  token?: string;
  message: string;
  role?: string;
  user?: {
    id?: string;
    email: string;
    role: "vendor";
    firstname?: string;
    first_name?: string;
    lastname?: string;
    last_name?: string;
    business_name?: string;
    phone?: string;
    business_type?: string;
    isVerified?: boolean;
    created_at?: string;
    [key: string]: unknown;
  };
  vendor?: {
    id?: string;
    email: string;
    role: "vendor";
    firstname?: string;
    first_name?: string;
    lastname?: string;
    last_name?: string;
    business_name?: string;
    phone?: string;
    business_type?: string;
    isVerified?: boolean;
    joinDate?: string;
    created_at?: string;
    [key: string]: unknown;
  };
}

interface UserRoleResponse {
  user?: {
    id: string;
    email: string;
    role: string;
    [key: string]: unknown;
  };
  vendor?: {
    id: string;
    email: string;
    role: string;
    [key: string]: unknown;
  };
  role?: string;
  message?: string;
}

const API_BASE_URL = "https://server.bizengo.com/api";

// API Service
const vendorAuthService = {
  checkUserRole: async (email: string): Promise<UserRoleResponse | null> => {
    try {
      const response = await axios.post<UserRoleResponse>(
        `${API_BASE_URL}/auth/check-role`,
        { email },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Role check failed:", error);
      return null;
    }
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/auth/login`,
      data,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },
};

// Role Redirect Modal Component
const RoleRedirectModal = ({
  show,
  onRedirect,
  onClose,
}: {
  show: boolean;
  onRedirect: () => void;
  onClose: () => void;
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-white border-2 border-orange-200 shadow-2xl rounded-xl">
        <button
          onClick={onClose}
          className="absolute text-gray-400 transition-colors top-4 right-4 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 rounded-t-xl bg-orange-50">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Store className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Not a Vendor Account
            </h3>
            <p className="leading-relaxed text-gray-700">
              We detected that you have a buyer account. This is the vendor
              login page. Please use the buyer login or upgrade your account to
              vendor.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-3 bg-white rounded-b-xl">
          <Button
            onClick={onRedirect}
            className="w-full text-white bg-orange-600 hover:bg-orange-700"
          >
            Go to Buyer Login
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full">
            Stay Here
          </Button>
        </div>
      </div>
    </div>
  );
};

const VendorLogin: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleRedirect, setShowRoleRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleRoleRedirect = () => {
    setShowRoleRedirect(false);
    router.push("/auth/login");
  };

  const closeRoleRedirect = () => {
    setShowRoleRedirect(false);
  };

  const onSubmit = async (formData: LoginFormValues) => {
    setIsLoading(true);

    try {
      // Check user role before login
      // console.log("Checking user role for email:", formData.email);

      const roleCheckResponse = await vendorAuthService.checkUserRole(
        formData.email
      );

      if (roleCheckResponse) {
        const userRole =
          roleCheckResponse.role ||
          roleCheckResponse.user?.role ||
          roleCheckResponse.vendor?.role;

        // console.log("User role detected:", userRole);

        // If user is a buyer, show redirect modal
        if (userRole === "buyer") {
          setShowRoleRedirect(true);
          setIsLoading(false);
          return;
        }

        // If user is not a vendor, show error
        if (userRole && userRole !== "vendor") {
          toast({
            variant: "destructive",
            title: "Invalid Account Type",
            description: `This account is registered as a ${userRole}. Please use the appropriate login page.`,
          });
          setIsLoading(false);
          return;
        }
      }

      const loginData: LoginRequest = {
        email: formData.email,
        password: formData.password,
      };

      // console.log("Login request:", loginData);

      const response = await vendorAuthService.login(loginData);
      // console.log("Login response:", response);

      const {message} = response

      // Double-check role in login response
      const loginUserRole =
        response.role || response.user?.role || response.vendor?.role;

      if (loginUserRole === "buyer") {
        toast({
          variant: "destructive",
          title: "Invalid Account",
          description: message || "This is not a vendor account. Please use buyer login.",
        });
        setShowRoleRedirect(true);
        setIsLoading(false);
        return;
      }

      // Extract vendor data from response
      const vendorData = {
        id: response.vendor?.id || response.user?.id || "vendor_" + Date.now(),
        email: response.vendor?.email || response.user?.email || formData.email,
        businessName:
          response.vendor?.business_name ||
          response.user?.business_name ||
          "My Business",
        firstName:
          response.vendor?.firstname ||
          response.user?.firstname ||
          response.vendor?.first_name ||
          "John",
        lastName:
          response.vendor?.lastname ||
          response.user?.lastname ||
          response.vendor?.last_name ||
          "Doe",
        phone: response.vendor?.phone || response.user?.phone || "07012345678",
        businessType:
          response.vendor?.business_type ||
          response.user?.business_type ||
          "other",
        isVerified:
          response.vendor?.isVerified || response.user?.isVerified || false,
        joinDate:
          response.vendor?.joinDate ||
          response.user?.created_at ||
          new Date().toISOString(),
        profileComplete: 100,
        token: (response.token || response.access_token) ?? "",
        role: (loginUserRole as "vendor") || "vendor",
      };

      // Store auth data
      if (typeof window !== "undefined") {
        sessionStorage.setItem("RSEmail", formData.email);
        sessionStorage.setItem("RSToken", vendorData.token);
        sessionStorage.setItem("RSUserRole", vendorData.role);
        sessionStorage.setItem("RSUser", JSON.stringify(vendorData));

        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        }
      }

      toast({
        title: "Login Successful!",
        description: message || "You're being redirected to your dashboard...",
      });

      await router.push("/vendor/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Authentication failed. Please try again.";

      if (error.response && error.response.data) {
        const backendMessage =
          error.response.data.message ||
          error.response.data.error ||
          error.response.data.detail;
        if (backendMessage) {
          errorMessage = backendMessage;
        }
      } else if (error.message) {
        // Fallback to error.message if backend didn’t send any message.
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <RoleRedirectModal
        show={showRoleRedirect}
        onRedirect={handleRoleRedirect}
        onClose={closeRoleRedirect}
      />

      <div className="flex items-center justify-center min-h-screen p-4 py-10 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="w-full max-w-md">
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Vendor Login
            </h1>
            <p className="text-gray-600">Sign in to your vendor account</p>
          </div>

          {/* Sign Up Link */}
          <div className="mb-8 text-center">
            <p className="text-gray-600">
              Don't have a vendor account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-blue-600 hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vendor@example.com"
                    disabled={isSubmitting}
                    className="h-11"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                      className="pr-10 h-11"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                      className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700 disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      disabled={isSubmitting}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      {...register("rememberMe")}
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm text-gray-600"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/auth/forgot-password?origin=vendor"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  variant="navy"
                  type="submit"
                  className="w-full text-sm h-11 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default VendorLogin;
