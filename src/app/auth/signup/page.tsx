"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { authService } from "@/services/authService";
import { SignupResponse } from "@/types/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Utility for password strength
const passwordStrength = (password: string): number => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.match(/[a-z]+/)) score++;
  if (password.match(/[A-Z]+/)) score++;
  if (password.match(/[0-9]+/)) score++;
  if (password.match(/[^a-zA-Z0-9]+/)) score++;
  return score;
};

// Password Strength Bar Component
const PasswordStrengthBar = ({ strength, password }: { strength: number; password: string }) => {
  let color = "red";
  let strengthText = "Poor";
  if (strength >= 2) { color = "yellow"; strengthText = "Weak"; }
  if (strength >= 4) { color = "green"; strengthText = "Strong"; }

  return (
    <div>
      {password && (
        <div className={`text-xs ${strengthText === "Poor" ? "text-red-600" : strengthText === "Weak" ? "text-yellow-500" : "text-green-600"} mb-1`}>
          {strengthText}
        </div>
      )}
      {password && (
        <div className="w-full h-1 mt-1 bg-gray-200 rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(strength * 25, 100)}%`, backgroundColor: color }}
          ></div>
        </div>
      )}
    </div>
  );
};

// Modal Notification Component
const NotificationModal = ({ type, title, message, show, onClose }: { type: "success" | "error" | "info"; title: string; message: string; show: boolean; onClose: () => void; }) => {
  if (!show) return null;
  const getIcon = () => {
    switch (type) {
      case "success": return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "error": return <XCircle className="w-12 h-12 text-red-500" />;
      case "info": return <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success": return { bg: "bg-green-50", border: "border-green-200", button: "bg-green-600 hover:bg-green-700" };
      case "error": return { bg: "bg-red-50", border: "border-red-200", button: "bg-red-600 hover:bg-red-700" };
      case "info": return { bg: "bg-blue-50", border: "border-blue-200", button: "bg-blue-600 hover:bg-blue-700" };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={type !== "info" ? onClose : undefined} />
      <div className={`relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border-2 ${colors.border}`}>
        {type !== "info" && (
          <button onClick={onClose} className="absolute text-gray-400 transition-colors top-4 right-4 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        )}
        <div className={`p-8 rounded-t-xl ${colors.bg}`}>
          <div className="text-center">
            <div className="flex justify-center mb-4">{getIcon()}</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
            <p className="leading-relaxed text-gray-700">{message}</p>
          </div>
        </div>
        {type !== "info" && (
          <div className="p-6 bg-white rounded-b-xl">
            <Button onClick={onClose} className={`w-full ${colors.button} text-white`}>OK</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Signup = () => {
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
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; title: string; message: string; show: boolean }>({
    type: "info", title: "", message: "", show: false,
  });

  useEffect(() => { detectLocation(); }, []);
  useEffect(() => { setPasswordStrengthScore(passwordStrength(formData.password)); }, [formData.password]);
  useEffect(() => {
    setPasswordsMatch(formData.confirmPassword ? formData.password === formData.confirmPassword : true);
  }, [formData.password, formData.confirmPassword]);

  const detectLocation = async () => {
    if (formData.country && formData.state && locationDetected) return;
    setLocationDetecting(true);
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, country: data.country_name, state: data.region }));
        setLocationDetected(true);
      }
    } catch (error) {
      console.log("Location detection failed.");
    } finally {
      setLocationDetecting(false);
    }
  };

  const showNotification = (type: "success" | "error" | "info", title: string, message: string) => {
    setNotification({ type, title, message, show: true });
  };

  const closeNotification = () => setNotification(prev => ({ ...prev, show: false }));

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
    showNotification("info", "Creating Your Account", "Please wait while we set up your account...");

    try {
      // --- LIVE API PAYLOAD ---
      const payload = {
        fullname: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        country: formData.country,
        state: formData.state,
        ...(formData.referral_code && { referral_code: formData.referral_code })
      };

      const response: SignupResponse = await authService.signup(payload);

      // Check for success from your live API client
      if (response.status === "success" || (response as any).success) {
        // Persist email for OTP screen
        sessionStorage.setItem("RSEmail", formData.email);
        
        showNotification(
          "success", 
          "Account Created!", 
          "Please check your email for the verification code."
        );

        // Transition to OTP screen
        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "An error occurred during signup.";
      showNotification("error", "Signup Failed", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NotificationModal {...notification} onClose={closeNotification} />

      <div className="flex items-center justify-center min-h-screen p-4 py-10 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>

          <Card className="border border-gray-200 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
              <CardDescription>Join thousands of Nigerian business owners</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleInputChange} required disabled={isLoading} className="h-11" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} required disabled={isLoading} className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="08012345678" value={formData.phone} onChange={handleInputChange} required disabled={isLoading} className="h-11" />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="country">Country *</Label>
                      {locationDetected && <div className="flex items-center gap-1 text-xs text-green-600"><MapPin className="w-3 h-3" /> Auto-detected</div>}
                    </div>
                    <Input id="country" name="country" value={formData.country} onChange={handleInputChange} required disabled={isLoading || locationDetecting} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required disabled={isLoading || locationDetecting} className="h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} required disabled={isLoading} className="pr-10 h-11" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthBar strength={passwordStrengthScore} password={formData.password} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleInputChange} required disabled={isLoading} className="h-11" />
                  {!passwordsMatch && formData.confirmPassword && <p className="text-xs text-red-500">Passwords do not match.</p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                  disabled={isLoading || !passwordsMatch || passwordStrengthScore < 3}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Create Account"}
                </Button>
              </form>

              <div className="text-sm text-center text-gray-600">
                Already have an account? <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-700">Sign in here</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Signup;