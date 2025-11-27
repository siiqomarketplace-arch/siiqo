"use client";

import React, { useState, useEffect } from "react";
import { authService } from "@/services/authService";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Button from "@/components/Button";

interface Props {
  otp: string;
}

const OtpActions: React.FC<Props> = ({ otp }) => {
  const router = useRouter();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [expiryTimer, setExpiryTimer] = useState(600); // 10 minutes

  const email =
    typeof window !== "undefined" ? sessionStorage.getItem("signupEmail") : null;
  const role =
    typeof window !== "undefined" ? sessionStorage.getItem("signupRole") : null;
  const password =
    typeof window !== "undefined" ? sessionStorage.getItem("RSPassword") : null;

  // Countdown for resend cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  // Countdown for OTP expiry
  useEffect(() => {
    if (expiryTimer > 0) {
      const timer = setInterval(() => setExpiryTimer(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      toast({
        title: "OTP Expired",
        description: "Your OTP has expired. Please request a new one.",
        variant: "destructive",
      });
      sessionStorage.removeItem("signupEmail");
      router.push("/auth/signup");
    }
  }, [expiryTimer, router]);

  const handleVerify = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please sign up again.",
        variant: "destructive",
      });
      return;
    }

    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a complete 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const verifyResponse = await authService.verifyEmail(email, otp);

      if (verifyResponse.data.status === "success") {
        toast({
          title: "Success",
          description:
            verifyResponse.data.message || "Email verified successfully!",
        });

        console.log("User Role: ", role);

        if (role === "vendor" && password) {
          try {
            const loginResponse = await authService.login(email, password);

            const { access_token, message, user } = loginResponse;

            if (access_token && message?.toLowerCase().includes("success")) {
              sessionStorage.setItem("authToken", access_token);
              sessionStorage.setItem("user", JSON.stringify(user));

              sessionStorage.removeItem("signupEmail");
              sessionStorage.removeItem("RSPassword");

              router.replace("/auth/vendor-onboarding");
              return;
            } else {
              console.error("Unexpected login response:", loginResponse);
              throw new Error("Auto-login failed — token missing.");
            }
          } catch (loginError: any) {
            console.error("Auto-login error:", loginError);
            toast({
              title: "Login Error",
              description:
                loginError.response?.data?.message ||
                "Auto-login failed. Please log in manually.",
              variant: "destructive",
            });
            router.push("/auth/login");
            return;
          }
        }

        toast({
          title: "Email Verified",
          description: "Redirecting to login...",
        });

        sessionStorage.removeItem("signupRole");
        sessionStorage.removeItem("signupEmail");

        router.replace("/auth/login");
      } else {
        toast({
          title: "Error",
          description: verifyResponse.data.message || "Invalid OTP.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "Failed to verify OTP. Try again later.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsVerifying(false), 1500);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "No email found. Please signup again.",
        variant: "destructive",
      });
      return;
    }

    if (cooldown > 0) return;

    setIsResending(true);
    try {
      const response = await authService.resendOtp(email);

      if (response.data.status === "success") {
        toast({
          title: "New OTP Sent",
          description: response.data.message,
        });
        setCooldown(60);
        setExpiryTimer(600);
      } else {
        toast({
          title: "Error",
          description:
            response.data.message || "Failed to resend OTP. Try again later.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Helper: format seconds as mm:ss
  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="orange"
        onClick={handleVerify}
        disabled={isVerifying || otp.length !== 6}
        className="w-full"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify OTP"
        )}
      </Button>

      <div className="space-y-2 text-sm text-center text-gray-600">
        <p>
          OTP expires in:{" "}
          <span className="font-semibold">{formatTime(expiryTimer)}</span>
        </p>

        <p>
          Didn&apos;t receive code?{" "}
          <button
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            {isResending
              ? "Sending..."
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend OTP"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default OtpActions;
