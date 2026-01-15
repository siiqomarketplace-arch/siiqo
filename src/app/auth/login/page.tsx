"use client";
import { useState, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden bg-white shadow-2xl rounded-2xl"
          >
            <div className={`h-2 w-full ${type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"}`} />
            <div className="p-6 text-center">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${type === "success" ? "bg-green-100 text-green-600" : type === "error" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                {type === "success" && <CheckCircle className="w-8 h-8" />}
                {type === "error" && <XCircle className="w-8 h-8" />}
                {type === "info" && <Loader2 className="w-8 h-8 animate-spin" />}
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-gray-500">{message}</p>
              {type !== "info" && (
                <Button onClick={onClose} className="mt-6 w-full rounded-xl">Close</Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Login Form Logic ---
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
    show: boolean;
  }>({ type: "info", title: "", message: "", show: false });

  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const showNotification = (type: "success" | "error" | "info", title: string, message: string) => {
    setNotification({ type, title, message, show: true });
  };

  const closeNotification = () => setNotification((prev) => ({ ...prev, show: false }));

  // Helper for "Suspenseful" navigation between auth pages
  const handleSuspenseNavigation = (path: string, label: string) => {
    setIsLoading(true);
    showNotification("info", `Opening ${label}`, "Preparing the page...");
    setTimeout(() => {
      router.push(path);
    }, 800); // Small delay to show the "Suspense" loader
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    showNotification("info", "Signing You In", "Verifying credentials...");

    try {
      const isPending = localStorage.getItem("isRegistrationPending");
      const pendingData = localStorage.getItem("pendingUserData");
      if (isPending === "true" && pendingData) {
        const parsed = JSON.parse(pendingData);
        if (parsed.email === email) {
          showNotification("error", "Email Not Verified", "Please verify your email first.");
          setTimeout(() => router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`), 2000);
          return;
        }
      }

      await login(email, password);
      
      const userRole = sessionStorage.getItem("RSUsertarget_view") || "customer";
      showNotification("success", "Welcome Back!", "Login successful. Redirecting...");

      const callbackUrl = searchParams.get("redirect") || sessionStorage.getItem("redirectUrl");
      
      setTimeout(() => {
        if (callbackUrl && !callbackUrl.includes("/auth/")) {
          sessionStorage.removeItem("redirectUrl");
          window.location.href = callbackUrl;
        } else {
          switch (userRole.toLowerCase()) {
            case "admin":
              router.push("/Administration");
              break;
            case "vendor":
              router.push("/vendor/dashboard");
              break;
            default:
              router.push("/user-profile");
              break;
          }
        }
      }, 1500);

    } catch (error: any) {
      showNotification("error", "Login Failed", "Your credentials are invalid or the account does not exist.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NotificationModal {...notification} onClose={closeNotification} />

      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F4F6] p-4 lg:p-8">
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-200/50 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-200/50 blur-[100px]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10">
          <div className="mb-8 text-center">
            <button 
              onClick={() => handleSuspenseNavigation("/", "Marketplace")}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" /> Back to Marketplace
            </button>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl ring-1 ring-gray-200/50 rounded-3xl overflow-hidden">
            <CardHeader className="space-y-1 pb-6 pt-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ">
                <img src='/images/siiqo.png' alt="Siiqo Logo" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Welcome Back</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-10">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button 
                      type="button"
                      onClick={() => handleSuspenseNavigation("/auth/forgot-password", "Recovery")}
                      className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 rounded-xl"
                >
                  {isLoading && notification.type === "info" && notification.title === "Signing You In" ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <button 
                  onClick={() => handleSuspenseNavigation("/auth/signup", "Registration")}
                  className="font-bold text-blue-600 hover:underline disabled:opacity-50"
                  disabled={isLoading}
                >
                  Create free account
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

const Login = () => {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}>
      <LoginForm />
    </Suspense>
  );
};

export default Login;