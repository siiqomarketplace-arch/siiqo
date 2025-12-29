"use client";
import { useState, Suspense } from "react";
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
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface DecodedToken {
  role?: string;
  [key: string]: any;
}

// --- Notification Modal (Animated) ---
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
          onClick={type !== "info" ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm overflow-hidden bg-white shadow-2xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-2 w-full ${type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"}`} />
            
            {type !== "info" && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 text-gray-400 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="p-6 text-center">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${type === "success" ? "bg-green-100 text-green-600" : type === "error" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                {type === "success" && <CheckCircle className="w-8 h-8" />}
                {type === "error" && <XCircle className="w-8 h-8" />}
                {type === "info" && <Loader2 className="w-8 h-8 animate-spin" />}
              </div>
              
              <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-gray-500">{message}</p>

              {type !== "info" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all ${type === "success" ? "bg-green-600 hover:bg-green-700 shadow-green-500/30" : "bg-red-600 hover:bg-red-700 shadow-red-500/30"}`}
                >
                  Close
                </motion.button>
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
  const [rememberMe, setRememberMe] = useState(false);
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

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const showNotification = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    setNotification({ type, title, message, show: true });
    if (type !== "info") {
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email || !password) {
    showNotification("error", "Missing Information", "Please enter both email and password.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification("error", "Invalid Email", "Please enter a valid email address.");
    return;
  }

  setIsLoading(true);
  showNotification("info", "Signing You In", "TEST MODE: Verifying credentials locally...");

  try {
    // --- LIVE CODE (COMMENTED OUT) ---
    /* 
    await login(email, password);
    const token = sessionStorage.getItem("RSToken");
    if (token) {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const userRole = decodedToken.role ? decodedToken.role.toLowerCase() : "";
    */

    // --- TEMPORARY TESTING CODE (LOCALSTORAGE/MOCK) ---
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 1. Create a dummy token and store it
    const dummyToken = "dummy_json_web_token_for_testing";
    sessionStorage.setItem("RSToken", dummyToken);
    localStorage.setItem("isLoggedIn", "true");

    // 2. Define Mock Roles based on email for testing
    let userRole = "customer"; // Default
    if (email.toLowerCase().includes("admin")) userRole = "admin";
    else if (email.toLowerCase().includes("vendor")) userRole = "vendor";
    else if (email.toLowerCase().includes("shopping")) userRole = "shopping";

    // 3. Mock logic for Admin
    if (userRole === "admin") {
      // FIX: Changed 'token' to 'dummyToken' because 'token' is commented out above
      localStorage.setItem("adminToken", dummyToken);
      localStorage.setItem("isAdminLoggedIn", "true");
    }
    // --- END TESTING CODE ---

    closeNotification();

    // 1. Priority: Redirect URL (Checking params first)
    const paramRedirect = searchParams.get("redirect") || searchParams.get("callbackUrl");
    const storageRedirect = sessionStorage.getItem("redirectUrl");
    const intendedDestination = paramRedirect || storageRedirect;

    if (intendedDestination && !intendedDestination.includes("/auth/login")) {
      showNotification("success", "Welcome Back!", "Returning you to your previous page...");
      sessionStorage.removeItem("redirectUrl");
      setTimeout(() => {
        window.location.href = intendedDestination; 
      }, 1000);
      return;
    }

    // 2. Role Based Routing
    if (userRole === "admin") {
      showNotification("success", "Admin Access Granted!", "Redirecting to admin panel...");
      setTimeout(() => router.push("/Administration"), 1500);
    } 
    else if (userRole === "vendor") {
      showNotification("success", "Vendor Login Successful!", "Redirecting to vendor dashboard...");
      setTimeout(() => router.push("/vendor/dashboard"), 1500);
    } 
    else if (["shopping", "shopper", "customer"].includes(userRole)) {
      showNotification("success", "Login Successful!", "Redirecting to your dashboard...");
      // setTimeout(() => router.push("/shopping/dashboard"), 1500);
      setTimeout(()=> router.push("/seller-details"), 1500)
    } 
    else {
      showNotification("success", "Welcome Back!", "Redirecting to marketplace...");
      setTimeout(() => router.push("/marketplace"), 1500);
    }

    /* 
    } else {
      throw new Error("No access token received");
    } 
    */
  } catch (error: any) {
    closeNotification();
    showNotification("error", "Login Failed", error.message || "Invalid credentials. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <>
      <NotificationModal
        type={notification.type}
        title={notification.title}
        message={notification.message}
        show={notification.show}
        onClose={closeNotification}
      />

      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F4F6] p-4 lg:p-8">
        
        {/* Background Pattern */}
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-200/50 blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-200/50 blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10"
        >
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl ring-1 ring-gray-200/50 rounded-3xl overflow-hidden">
            <CardHeader className="space-y-1 pb-6 pt-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                <LockKeyhole className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-500">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-10">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4 pr-12 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="remember" className="text-sm font-medium text-gray-600 cursor-pointer">
                    Remember me for 30 days
                  </Label>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-bold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                  Create free account
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <p className="mt-8 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Marketplace Inc. All rights reserved.
          </p>
        </motion.div>
      </div>
    </>
  );
};

// --- Main Page Wrapper for Suspense ---
const Login = () => {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
};

export default Login;