"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  MapPin,
  X,
  ShoppingCart,
} from "lucide-react";

import { loginSchema, LoginFormValues } from "@/lib/Validation/LoginSchema";
import { useLogin } from "@/hooks/useLogin";

import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Role Redirect Modal
const RoleRedirectModal = ({
  show,
  onRedirect,
  onClose,
}: {
  show: boolean;
  onRedirect: () => void;
  onClose: () => void;
}) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!show) return null;

  const handleRedirect = () => {
    setIsRedirecting(true);
    // Simulate loading delay before redirect
    setTimeout(() => {
      onRedirect();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white border-2 border-orange-200 shadow-2xl rounded-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute text-gray-400 transition-colors top-4 right-4 hover:text-gray-600"
          disabled={isRedirecting}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 rounded-t-xl bg-orange-50">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <ShoppingCart className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              You&apos;re a Vendor!
            </h3>
            <p className="leading-relaxed text-gray-700">
              We detected that you have a vendor account. This is the buyer
              login page. Please use the vendor login to access your{" "}
              <span className="font-bold">vendor</span> account.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3 bg-white rounded-b-xl">
          <Button
            type="button"
            title="Go to vendor login"
            variant="orange"
            onClick={handleRedirect}
            disabled={isRedirecting}
            className="flex items-center justify-center w-full gap-2 text-sm"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Go to Vendor Login"
            )}
          </Button>

          <Button
            title="stay here"
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isRedirecting}
            className="w-full text-sm"
          >
            Stay Here
          </Button>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  useEffect(() => {
    if (showRoleModal) {
      // Disable scroll
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scroll
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [showRoleModal]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const { onSubmit, isLoading } = useLogin({
    onRoleMismatch: () => setShowRoleModal(true),
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:underline hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-sm text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-blue-600 hover:underline hover:text-blue-700"
              >
                Sign up here
              </Link>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="buyer@example.com"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2"
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

              <div className="flex items-center justify-between pb-4">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    className="w-4 h-4"
                    disabled={isLoading}
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password?origin=buyer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="navy"
                disabled={isLoading}
                className="w-full text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing
                    in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Role Redirect Modal for Vendor login attempt */}
      <RoleRedirectModal
        show={showRoleModal}
        onRedirect={() => (window.location.href = "/vendor/auth")}
        onClose={() => setShowRoleModal(false)}
      />
    </div>
  );
};

export default LoginPage;
