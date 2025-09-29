"use client";
import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Sparkles, Clock } from "lucide-react";
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
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes = 600 seconds
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlEmail = searchParams.get("email");
    const sessionEmail = sessionStorage.getItem("RSEmail");

    let foundEmail = null;
    if (urlEmail) {
      foundEmail = urlEmail;
    } else if (sessionEmail) {
      foundEmail = sessionEmail;
    }

    if (foundEmail) {
      setEmail(foundEmail);
    } else {
      toast({
        title: "Error",
        description: "Email not found. Please signup or login.",
        variant: "destructive",
      });
      router.push("/auth/signup");
    }

    return () => {
      sessionStorage.removeItem("RSEmail");
    };
  }, [router, searchParams]);

  // OTP Timer - 10 minutes countdown
  useEffect(() => {
    if (otpTimer > 0 && !isOtpExpired) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0) {
      setIsOtpExpired(true);
      toast({
        title: "OTP Expired",
        description: "Your OTP has expired. Please request a new one.",
        variant: "destructive",
      });
    }
  }, [otpTimer, isOtpExpired]);

  // Countdown timer for resend button cooldown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format timer display (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleOtpChange = (otpValue: string) => {
    setOtp(otpValue);
  };

  const handleResendOtp = async () => {
    if (!email || isResending || countdown > 0) return;

    setIsResending(true);
    try {
      const response = await axios.post(
        "https://server.bizengo.com/api/auth/resend-otp",
        { email: email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast({
          title: "OTP Sent",
          description: "A new OTP has been sent to your email.",
        });
        setCountdown(60); // 60 second cooldown
        setOtp(""); // Clear current OTP
        setOtpTimer(600); // Reset 10-minute timer
        setIsOtpExpired(false); // Reset expiry status
      } else {
        throw new Error(response.data.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email is missing. Please signup or login.",
        variant: "destructive",
      });
      router.push("/auth/signup");
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

    if (isOtpExpired) {
      toast({
        title: "Error",
        description: "OTP has expired. Please request a new one.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        email: email,
        otp: otp,
      };

      let response;
      try {
        // Try HTTPS first
        response = await axios.post(
          "https://server.bizengo.com/api/auth/verify-email",
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (httpsError) {
        console.log(
          "HTTPS failed due to SSL issue, trying HTTP...",
          httpsError
        );
        // Fallback to HTTP for development
        response = await axios.post(
          "http://server.bizengo.com/api/auth/verify-email",
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const data = response.data;
      console.log("OTP verification response:", data);

      if (data.status === "success" || response.status === 200) {
        toast({
          title: "Success",
          description: data.message || "OTP verified successfully!",
        });

        // Clear the stored email
        sessionStorage.removeItem("RSEmail");

        // Redirect to login or dashboard
        router.push("/auth/login");
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);

      let errorMessage = "Failed to connect to the server. Please try again.";

      if (error.response) {
        // Server responded with error status
        errorMessage =
          error.response.data?.message || "Invalid OTP. Please try again.";
      } else if (
        error.code === "NETWORK_ERROR" ||
        error.message.includes("Network Error")
      ) {
        errorMessage =
          "Unable to connect to server. SSL certificate issue detected. Please contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
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
            <ArrowLeft className="h-4 w-4" />
            Back to Signup
          </Link>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
            <CardDescription>
              Enter the 6-digit OTP sent to your email
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {email && (
              <div className="text-center">
                An OTP has been sent to <b>{email}</b>.
              </div>
            )}

            {/* Timer Display */}
            <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <Clock
                className={`h-4 w-4 ${
                  isOtpExpired
                    ? "text-red-500"
                    : otpTimer <= 120
                    ? "text-orange-500"
                    : "text-blue-500"
                }`}
              />
              <span
                className={`font-mono font-semibold ${
                  isOtpExpired
                    ? "text-red-500"
                    : otpTimer <= 120
                    ? "text-orange-500"
                    : "text-blue-500"
                }`}
              >
                {isOtpExpired ? "Expired" : formatTime(otpTimer)}
              </span>
              <span className="text-sm text-gray-500">
                {isOtpExpired ? "" : "remaining"}
              </span>
            </div>

            {/* OTP Expiry Warning */}
            {isOtpExpired && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-red-600 text-sm font-medium">
                  Your OTP has expired. Please request a new one to continue.
                </p>
              </div>
            )}

            {/* Low Time Warning */}
            {!isOtpExpired && otpTimer <= 120 && otpTimer > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                <p className="text-orange-600 text-sm font-medium">
                  ⚠️ Your OTP will expire in {formatTime(otpTimer)}
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                disabled={isOtpExpired}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || !email || otp.length !== 6 || isOtpExpired}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            {/* Resend OTP Section */}
            <div className="text-center text-sm text-gray-600">
              {isOtpExpired ? (
                <div className="space-y-2">
                  <p>Your OTP has expired.</p>
                  <button
                    onClick={handleResendOtp}
                    disabled={isResending || countdown > 0}
                    className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    {isResending
                      ? "Sending New OTP..."
                      : countdown > 0
                      ? `Wait ${countdown}s`
                      : "Send New OTP"}
                  </button>
                </div>
              ) : (
                <div>
                  Didn't receive the code?{" "}
                  <button
                    onClick={handleResendOtp}
                    disabled={isResending || countdown > 0}
                    className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {isResending
                      ? "Sending..."
                      : countdown > 0
                      ? `Resend in ${countdown}s`
                      : "Resend OTP"}
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const VerifyOTP = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpPage />
    </Suspense>
  );
};

export default VerifyOTP;
