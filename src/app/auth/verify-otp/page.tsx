"use client";
import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Sparkles, Clock, UserCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";

const VerifyOtpPage = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlEmail = searchParams.get("email");
    const sessionEmail = sessionStorage.getItem("RSEmail");
    const savedPendingData = localStorage.getItem("pendingUserData");

    let finalEmail = urlEmail || sessionEmail;

    if (savedPendingData) {
      const parsedData = JSON.parse(savedPendingData);
      setUserData(parsedData);
      if (!finalEmail) finalEmail = parsedData.email;
    }

    if (finalEmail) {
      setEmail(finalEmail);
    } else {
      toast({
        title: "Session Expired",
        description: "Please sign up again.",
        variant: "destructive",
      });
      router.push("/auth/signup");
    }
  }, [router, searchParams]);

  // OTP Expiry Timer
  useEffect(() => {
    if (otpTimer > 0 && !isOtpExpired) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0) {
      setIsOtpExpired(true);
    }
  }, [otpTimer, isOtpExpired]);

  // Resend Cooldown Timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleResendOtp = async () => {
    if (!email || isResending || countdown > 0) return;

    setIsResending(true);
    try {
      // --- LIVE API CALL ---
      const response = await axios.post(
        "/api/auth/resend-otp",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success") {
        toast({
          title: "OTP Sent",
          description: "A new verification code has been sent to your email.",
        });
        setCountdown(60);
        setOtp("");
        setOtpTimer(600);
        setIsOtpExpired(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to resend OTP. Please wait for 10 mins before trying to resend again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || otp.length !== 6) return;

    setIsLoading(true);
    try {
      // --- LIVE API CALL ---
      const response = await axios.post(
        "/api/auth/verify-email",
        { email, otp },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success") {
        // Clear registration flags
        localStorage.setItem("isRegistrationPending", "false");
        localStorage.setItem("userVerified", "true");
        sessionStorage.removeItem("RSEmail");

        toast({
          title: "Success!",
          description: "Your email has been verified. Redirecting to login...",
        });

        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Invalid code.");
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description:
          error.response?.data?.message ||
          "The code you entered is incorrect or expired.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Signup
          </Link>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Verify Your Email
            </CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to your inbox
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {email && (
              <div className="text-center p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-600">
                  Verification code sent to:
                </p>
                <p className="font-semibold text-gray-900 break-all">{email}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg border shadow-sm">
              <Clock
                className={`h-4 w-4 ${
                  isOtpExpired ? "text-red-500" : "text-blue-500"
                }`}
              />
              <span
                className={`font-mono font-semibold ${
                  isOtpExpired ? "text-red-500" : "text-blue-500"
                }`}
              >
                {isOtpExpired ? "Expired" : formatTime(otpTimer)}
              </span>
              <span className="text-sm text-gray-500">
                {isOtpExpired ? "" : "remaining"}
              </span>
            </div>

            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isOtpExpired || isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-12 w-10 md:w-12" />
                  <InputOTPSlot index={1} className="h-12 w-10 md:w-12" />
                  <InputOTPSlot index={2} className="h-12 w-10 md:w-12" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} className="h-12 w-10 md:w-12" />
                  <InputOTPSlot index={4} className="h-12 w-10 md:w-12" />
                  <InputOTPSlot index={5} className="h-12 w-10 md:w-12" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6 || isOtpExpired}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-md text-white"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </span>
              ) : (
                "Complete Registration"
              )}
            </Button>

            <div className="text-center text-sm text-gray-600 pt-2">
              Didn't receive the code?{" "}
              <button
                onClick={handleResendOtp}
                disabled={isResending || countdown > 0}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend OTP"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const VerifyOTP = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-gray-500">
          Loading...
        </div>
      }
    >
      <VerifyOtpPage />
    </Suspense>
  );
};

export default VerifyOTP;
