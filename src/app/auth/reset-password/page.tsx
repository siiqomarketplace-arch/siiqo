"use client";

import { ArrowLeft, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import api_endpoints, { baseURL } from "@/hooks/api_endpoints";

// ============================
// Password Validation Helper
// ============================
const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);

  if (password.length < minLength)
    return "Password must be at least 8 characters long.";
  if (!hasUpperCase)
    return "Password must contain at least one uppercase letter.";
  if (!hasLowerCase)
    return "Password must contain at least one lowercase letter.";
  if (!hasNumbers) return "Password must contain at least one number.";
  if (!hasNonalphas)
    return "Password must contain at least one special character.";

  return null;
};

// ============================
// Reset Password Page Wrapper
// ============================
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div>Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

// ============================
// Reset Password Content
// ============================
function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState<string | null>(null);

  // useEffect(() => {
  //   const storedEmail = sessionStorage.getItem("reset_email");
  //   const storedOtp = sessionStorage.getItem("reset_code");

  //   if (!storedEmail || !storedOtp) {
  //     router.push("/auth/forgot-password");
  //   } else {
  //     setEmail(storedEmail);
  //     setOtp(storedOtp);
  //   }
  // }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast({
        variant: "destructive",
        title: "Invalid password",
        description: passwordError,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post(
        "https://server.bizengo.com/api/auth/reset-password",
        {
          email,
          new_password: newPassword,
          otp,
        },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
      );

      toast({
        title: "Password reset successful",
        description: data.message || "Your password has been updated. Redirecting to login...",
      });

      // Clear session storage
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_code");

      // Redirect to login
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";

      toast({
        variant: "destructive",
        title: "Reset failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:underline hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forgot Password
          </Link>
        </div>

        <Card className="border bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {/* <p className="text-xs text-gray-500">
                  Password must be at least 8 characters with uppercase,
                  lowercase, number and special character.
                </p> */}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
