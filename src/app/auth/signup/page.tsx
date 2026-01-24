"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  MapPin,
  Sparkles,
} from "lucide-react";
import { authService } from "@/services/authService";
import { getServerErrorMessage } from "@/lib/errorHandler";
import { SignupResponse } from "@/types/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// --- Notification Modal ---
const NotificationModal = ({
  type,
  title,
  message,
  show,
  onClose,
}: {
  type: "success" | "error" | "info";
  title: string;
  message: string;
  show: boolean;
  onClose: () => void;
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden bg-white shadow-2xl rounded-2xl"
          >
            <div
              className={`h-2 w-full ${
                type === "success"
                  ? "bg-green-500"
                  : type === "error"
                    ? "bg-red-500"
                    : "bg-blue-500"
              }`}
            />
            <div className="p-6 text-center">
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                  type === "success"
                    ? "bg-green-100 text-green-600"
                    : type === "error"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                }`}
              >
                {type === "success" && <CheckCircle className="w-8 h-8" />}
                {type === "error" && <XCircle className="w-8 h-8" />}
                {type === "info" && (
                  <Loader2 className="w-8 h-8 animate-spin" />
                )}
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-gray-500">{message}</p>
              {type !== "info" && (
                <Button onClick={onClose} className="mt-6 w-full rounded-xl">
                  Close
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Password Strength Bar ---
const PasswordStrengthBar = ({
  strength,
  password,
}: {
  strength: number;
  password: string;
}) => {
  if (!password) return null;
  const colors = [
    "bg-gray-200",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-emerald-500",
  ];
  const labels = ["", "Very Weak", "Weak", "Fair", "Strong", "Excellent"];

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
          Security Strength
        </span>
        <span
          className={`text-[10px] font-bold ${
            strength >= 4 ? "text-emerald-600" : "text-gray-500"
          }`}
        >
          {labels[strength]}
        </span>
      </div>
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`h-full flex-1 rounded-full transition-all duration-500 ${
              strength >= step ? colors[strength] : "bg-gray-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const passwordStrength = (password: string): number => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.match(/[a-z]+/)) score++;
  if (password.match(/[A-Z]+/)) score++;
  if (password.match(/[0-9]+/)) score++;
  if (password.match(/[^a-zA-Z0-9]+/)) score++;
  return score;
};

const SignupForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    state: "",
    referral_code: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrengthScore, setPasswordStrengthScore] = useState(0);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
    show: boolean;
  }>({
    type: "info",
    title: "",
    message: "",
    show: false,
  });

  useEffect(() => {
    detectLocation();
  }, []);
  useEffect(() => {
    setPasswordStrengthScore(passwordStrength(formData.password));
  }, [formData.password]);
  useEffect(() => {
    setPasswordsMatch(
      formData.confirmPassword
        ? formData.password === formData.confirmPassword
        : true,
    );
  }, [formData.password, formData.confirmPassword]);

  const showNotification = (
    type: "success" | "error" | "info",
    title: string,
    message: string,
  ) => {
    setNotification({ type, title, message, show: true });
  };

  const closeNotification = () =>
    setNotification((prev) => ({ ...prev, show: false }));

  const detectLocation = async () => {
    setLocationDetecting(true);
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          country: data.country_name,
          state: data.region,
        }));
        setLocationDetected(true);
      }
    } catch (error) {
      console.log("Location detection failed.");
    } finally {
      setLocationDetecting(false);
    }
  };

  // Suspenseful navigation
  const handleSuspenseNavigation = (path: string, label: string) => {
    setIsLoading(true);
    showNotification("info", `Opening ${label}`, "Preparing the page...");
    setTimeout(() => {
      router.push(path);
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showNotification("error", "Password Mismatch", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    showNotification(
      "info",
      "Creating Your Account",
      "Setting up your secure profile...",
    );

    try {
      const payload = {
        fullname: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        country: formData.country,
        state: formData.state,
        ...(formData.referral_code && {
          referral_code: formData.referral_code,
        }),
      };

      const response: SignupResponse = await authService.signup(payload);

      if (response.status === "success" || (response as any).success) {
        sessionStorage.setItem("RSEmail", formData.email);
        showNotification(
          "success",
          "Registration Successful!",
          "Redirecting to email verification...",
        );
        setTimeout(() => {
          router.push(
            `/auth/verify-otp?email=${encodeURIComponent(formData.email)}`,
          );
        }, 2000);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      const errorResponse = getServerErrorMessage(error, "Signup");
      const title = errorResponse.isServerError
        ? errorResponse.title
        : "Signup Failed";
      showNotification("error", title, errorResponse.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NotificationModal {...notification} onClose={closeNotification} />

      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F4F6] p-4 lg:p-8 overflow-x-hidden">
        {/* Animated Background Blobs */}
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
          <div className="absolute top-[-5%] right-[-5%] h-[600px] w-[600px] rounded-full bg-blue-200/50 blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[-5%] h-[600px] w-[600px] rounded-full bg-purple-200/50 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl z-10 my-10"
        >
          <div className="mb-6 text-center space-y-4">
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => handleSuspenseNavigation("/", "Home")}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4" /> Back to Marketplace
              </button>
            </div>

            {/* Sign In Link - Prominent */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-sm text-gray-600">
                Already part of the community?{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl ring-1 ring-gray-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="space-y-1 pb-6 pt-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                <img src="/images/siiqo.png" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
                Get Started
              </CardTitle>
              <CardDescription className="text-base">
                Join the community of modern Nigerian vendors
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 lg:px-12 pb-12">
              <form onSubmit={handleSignup} className="space-y-6">
                {/* Personal Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl bg-white/50 border-gray-200 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl bg-white/50 border-gray-200 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="08012345678"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl bg-white/50 border-gray-200 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="referral">Referral Code (Optional)</Label>
                    </div>
                    <Input
                      id="referral"
                      name="referral_code"
                      placeholder="ABC-123"
                      value={formData.referral_code}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="h-12 rounded-xl bg-white/50 border-gray-200 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Location Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      Country{" "}
                      {locationDetected && (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading || locationDetecting}
                        className="h-12 rounded-xl pl-10 bg-white"
                      />
                      <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>State / Region</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading || locationDetecting}
                      className="h-12 rounded-xl bg-white"
                    />
                  </div>
                </div>

                {/* Password Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="password">Create Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="h-12 rounded-xl pr-12 bg-white/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <PasswordStrengthBar
                      strength={passwordStrengthScore}
                      password={formData.password}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className={`h-12 rounded-xl bg-white/50 ${
                        !passwordsMatch && formData.confirmPassword
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                    {!passwordsMatch && formData.confirmPassword && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight flex items-center gap-1">
                        <XCircle size={12} /> Passwords do not match
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isLoading || !passwordsMatch || passwordStrengthScore < 3
                  }
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/20 text-white rounded-2xl text-lg font-bold transition-all hover:scale-[1.01] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Verifying Details...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

const Signup = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
};

export default Signup;
