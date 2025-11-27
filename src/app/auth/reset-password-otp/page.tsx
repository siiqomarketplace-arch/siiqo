
"use client";

import { ArrowLeft, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { resetPassword, resendVerification } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Button from "@/components/Button";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { resetPasswordSchema } from "@/lib/Validation/ResetPasswordSchema";

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordOTPPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("reset_email");
    if (!storedEmail) {
      toast({
        variant: "destructive",
        title: "Session expired",
        description: "Please request a new password reset code.",
      });
      router.push("/auth/forgot-password");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    const otpString = newOtp.join("");
    setValue("otp", otpString);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    setValue("otp", pastedData);

    const lastIndex = Math.min(pastedData.length, 5);
    document.getElementById(`otp-${lastIndex}`)?.focus();
  };

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);

    const payload = {
      email,
      otp: data.otp,
      new_password: data.confirmPassword,
    };

    try {
      const response = await resetPassword(payload);

      toast({
        title: "Success!",
        description:
          response.data.message || "Your password has been reset successfully.",
      });

      sessionStorage.removeItem("reset_email");

      const origin = sessionStorage.getItem("reset_origin");

      setTimeout(() => {
        if (origin === "vendor") {
          router.replace("/auth/login");
        } else {
          router.replace("/auth/login");
        }
        sessionStorage.removeItem("reset_origin");
        sessionStorage.removeItem("reset_email");
      }, 1500);
    } catch (error: any) {
      console.error(
        "Reset password error:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const storedEmail = sessionStorage.getItem("reset_email");
      if (!storedEmail) {
        toast({
          variant: "destructive",
          title: "Session expired",
          description: "Please request a new password reset code.",
        });
        router.push("/auth/forgot-password");
        return;
      }

      const { data } = await resendVerification(storedEmail);

      toast({
        title: "Code resent",
        description: data.message || "A new code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 py-10 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:underline hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        <Card className="border bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to{" "}
              {email ? email.replace(/(.{3}).*(@.*)/, "$1***$2") : "your email"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-[2.9rem] h-[2.6rem] sm:w-[55px] sm:h-[50px] lg:w-14 lg:h-14 text-center text-lg font-semibold border-2 border-gray-100 focus:border-navy-600 rounded-md"
                      disabled={isLoading}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-sm text-red-500">{errors.otp.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="relative space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  {...register("newPassword")}
                  disabled={isLoading}
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 right-3 top-9 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {errors.newPassword && (
                  <p className="text-sm text-red-500">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-gray-400 right-3 top-9 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                variant="navy"
                type="submit"
                className="w-full text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              {/* Resend Code */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                >
                  Didn&apos;t receive the code? Resend
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
