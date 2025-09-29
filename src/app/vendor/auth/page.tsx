"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
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
  Store,
  Loader2,
  Chrome,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  MapPin,
  Locate,
  ShoppingCart,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

// Updated interfaces
interface FormData {
  email: string;
  password: string;
  businessName: string;
  firstName: string;
  lastName: string;
  phone: string;
  businessType: string;
  confirmPassword: string;
  country: string;
  state: string;
  referralCode?: string;
}

interface Errors {
  email?: string;
  password?: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  businessType?: string;
  confirmPassword?: string;
  country?: string;
  state?: string;
  submit?: string;
}

interface VendorSignupRequest {
  business_name: string;
  business_type: string;
  country: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  phone: string;
  referral_code?: string;
  state: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LocationData {
  country: string;
  state?: string;
  city?: string;
  countryCode?: string;
}

// Role checking interface
interface UserRoleResponse {
  user?: {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
  };
  vendor?: {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
  };
  role?: string;
  message?: string;
}

// Constants
const businessTypes = [
  { value: "restaurant", label: "Restaurant" },
  { value: "retail", label: "Retail Store" },
  { value: "service", label: "Service Provider" },
  { value: "healthcare", label: "Healthcare" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "automotive", label: "Automotive" },
  { value: "home", label: "Home & Garden" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
];

const countries = [
  { value: "Nigeria", label: "Nigeria", code: "NG" },
  { value: "Ghana", label: "Ghana", code: "GH" },
  { value: "Kenya", label: "Kenya", code: "KE" },
  { value: "South Africa", label: "South Africa", code: "ZA" },
  { value: "United States", label: "United States", code: "US" },
  { value: "United Kingdom", label: "United Kingdom", code: "GB" },
  { value: "Canada", label: "Canada", code: "CA" },
];

const statesByCountry: Record<
  string,
  Array<{ value: string; label: string }>
> = {
  Nigeria: [
    { value: "Lagos", label: "Lagos" },
    { value: "Abuja", label: "Abuja" },
    { value: "Kano", label: "Kano" },
    { value: "Rivers", label: "Rivers" },
    { value: "Oyo", label: "Oyo" },
    { value: "Delta", label: "Delta" },
    { value: "Kaduna", label: "Kaduna" },
    { value: "Edo", label: "Edo" },
    { value: "Plateau", label: "Plateau" },
    { value: "Kwara", label: "Kwara" },
  ],
  Ghana: [
    { value: "Greater Accra", label: "Greater Accra" },
    { value: "Ashanti", label: "Ashanti" },
    { value: "Northern", label: "Northern" },
    { value: "Western", label: "Western" },
  ],
  Kenya: [
    { value: "Nairobi", label: "Nairobi" },
    { value: "Mombasa", label: "Mombasa" },
    { value: "Kisumu", label: "Kisumu" },
    { value: "Nakuru", label: "Nakuru" },
  ],
  "South Africa": [
    { value: "Gauteng", label: "Gauteng" },
    { value: "Western Cape", label: "Western Cape" },
    { value: "KwaZulu-Natal", label: "KwaZulu-Natal" },
    { value: "Eastern Cape", label: "Eastern Cape" },
  ],
  "United States": [
    { value: "California", label: "California" },
    { value: "New York", label: "New York" },
    { value: "Texas", label: "Texas" },
    { value: "Florida", label: "Florida" },
  ],
  "United Kingdom": [
    { value: "England", label: "England" },
    { value: "Scotland", label: "Scotland" },
    { value: "Wales", label: "Wales" },
    { value: "Northern Ireland", label: "Northern Ireland" },
  ],
  Canada: [
    { value: "Ontario", label: "Ontario" },
    { value: "Quebec", label: "Quebec" },
    { value: "British Columbia", label: "British Columbia" },
    { value: "Alberta", label: "Alberta" },
  ],
};

// API Service
const API_BASE_URL = "https://server.bizengo.com/api";

const vendorAuthService = {
  // Check user role before login attempt
  checkUserRole: async (email: string): Promise<UserRoleResponse | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-role`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        return null; // User might not exist, let normal login handle it
      }

      return await response.json();
    } catch (error) {
      console.error("Role check failed:", error);
      return null;
    }
  },

  signup: async (data: VendorSignupRequest) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup/vendor`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  },

  login: async (data: LoginRequest) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }

    return response.json();
  },
};

// Location Detection Service
const locationService = {
  // Method 1: IP-based location detection using ipapi.co
  detectLocationByIP: async (): Promise<LocationData | null> => {
    try {
      const response = await fetch("https://ipapi.co/json/", {
        method: "GET",
        headers: {
          "User-Agent": "VendorApp/1.0",
        },
      });

      if (!response.ok) throw new Error("IP location failed");

      const data = await response.json();

      return {
        country: data.country_name || "",
        state: data.region || "",
        city: data.city || "",
        countryCode: data.country_code || "",
      };
    } catch (error) {
      console.error("IP location detection failed:", error);
      return null;
    }
  },

  // Method 2: Browser geolocation API
  detectLocationByGeolocation: async (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Use reverse geocoding with OpenStreetMap Nominatim
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              {
                headers: {
                  "User-Agent": "VendorApp/1.0",
                },
              }
            );

            if (!response.ok) throw new Error("Geocoding failed");

            const data = await response.json();
            const address = data.address || {};

            resolve({
              country: address.country || "",
              state: address.state || address.region || "",
              city: address.city || address.town || address.village || "",
              countryCode: address.country_code?.toUpperCase() || "",
            });
          } catch (error) {
            console.error("Geolocation reverse geocoding failed:", error);
            resolve(null);
          }
        },
        (error) => {
          console.error("Geolocation failed:", error);
          resolve(null);
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  },

  // Combined location detection
  detectLocation: async (): Promise<LocationData | null> => {
    // Try IP-based detection first (faster)
    let location = await locationService.detectLocationByIP();

    // If IP detection fails, try geolocation
    if (!location) {
      location = await locationService.detectLocationByGeolocation();
    }

    return location;
  },
};

// Role Redirect Modal Component
const RoleRedirectModal = ({
  show,
  onRedirect,
  onClose,
}: {
  show: boolean;
  onRedirect: () => void;
  onClose: () => void;
}) => {
  if (!show) return null;

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
              You're a Buyer!
            </h3>
            <p className="leading-relaxed text-gray-700">
              We detected that you have a buyer account. This is the vendor
              login page. Please use the buyer login to access your account.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3 bg-white rounded-b-xl">
          <Button
            onClick={onRedirect}
            className="w-full text-white bg-orange-600 hover:bg-orange-700"
          >
            Go to Buyer Login
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full">
            Stay Here
          </Button>
        </div>
      </div>
    </div>
  );
};

// Modal Notification Component
const NotificationModal = ({
  type,
  message,
  show,
  onClose,
}: {
  type: "success" | "error" | "info";
  message: string;
  show: boolean;
  onClose: () => void;
}) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "error":
        return <XCircle className="w-12 h-12 text-red-500" />;
      case "info":
        return <AlertTriangle className="w-12 h-12 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          button: "bg-green-600 hover:bg-green-700",
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          button: "bg-red-600 hover:bg-red-700",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          button: "bg-blue-600 hover:bg-blue-700",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border-2 ${colors.border}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute text-gray-400 transition-colors top-4 right-4 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className={`p-8 rounded-t-xl ${colors.bg}`}>
          <div className="text-center">
            <div className="flex justify-center mb-4">{getIcon()}</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {type === "success" && "Success!"}
              {type === "error" && "Error"}
              {type === "info" && "Processing..."}
            </h3>
            <p className="leading-relaxed text-gray-700">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-white rounded-b-xl">
          <Button
            onClick={onClose}
            className={`w-full ${colors.button} text-white`}
          >
            {type === "info" ? "Please Wait..." : "OK"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const VendorAuth: React.FC = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] =
    useState<boolean>(false);
  const [locationDetected, setLocationDetected] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRoleRedirect, setShowRoleRedirect] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false); 
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    businessName: "",
    firstName: "",
    lastName: "",
    phone: "",
    businessType: "",
    confirmPassword: "",
    country: "",
    state: "",
    referralCode: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
    show: boolean;
  }>({
    type: "info",
    message: "",
    show: false,
  });

  // Auto-detect location on component mount for signup mode
  useEffect(() => {
    if (!isLogin && !locationDetected) {
      autoDetectLocation();
    }
  }, [isLogin, locationDetected]);

  // Auto-detect location function
  const autoDetectLocation = async () => {
    setIsDetectingLocation(true);

    try {
      const location = await locationService.detectLocation();

      if (location && location.country) {
        // Find matching country in our list
        const matchingCountry = countries.find(
          (country) =>
            country.label.toLowerCase() === location.country.toLowerCase() ||
            country.code === location.countryCode
        );

        if (matchingCountry) {
          setFormData((prev) => ({
            ...prev,
            country: matchingCountry.value,
            state: "", // Reset state when country changes
          }));

          // Try to match state if available
          if (location.state && statesByCountry[matchingCountry.value]) {
            const matchingState = statesByCountry[matchingCountry.value].find(
              (state) =>
                state.label.toLowerCase() === location.state!.toLowerCase()
            );

            if (matchingState) {
              setFormData((prev) => ({
                ...prev,
                state: matchingState.value,
              }));
            }
          }

          setLocationDetected(true);
          showNotification(
            "success",
            `Location detected: ${matchingCountry.label}${
              location.state ? `, ${location.state}` : ""
            }`
          );
        } else {
          // Default to Nigeria if country not in our list
          setFormData((prev) => ({
            ...prev,
            country: "Nigeria",
          }));
          showNotification(
            "info",
            `Location detected (${location.country}), but defaulting to Nigeria. Please update if needed.`
          );
        }
      } else {
        // Default to Nigeria if detection fails
        setFormData((prev) => ({
          ...prev,
          country: "Nigeria",
        }));
        showNotification(
          "info",
          "Could not detect location. Defaulted to Nigeria. Please update if needed."
        );
      }
    } catch (error) {
      console.error("Location detection failed:", error);
      // Default to Nigeria on error
      setFormData((prev) => ({
        ...prev,
        country: "Nigeria",
      }));
      showNotification(
        "info",
        "Location detection failed. Defaulted to Nigeria. Please update if needed."
      );
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Manual location detection
  const manualDetectLocation = async () => {
    await autoDetectLocation();
  };

  // Show notification function
  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message, show: true });

    // Auto hide after 5 seconds for non-info messages
    if (type !== "info") {
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  // Close notification function
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  // Handle role redirect
  const handleRoleRedirect = () => {
    setShowRoleRedirect(false);
    router.push("/auth/login"); // Redirect to buyer login
  };

  // Close role redirect modal
  const closeRoleRedirect = () => {
    setShowRoleRedirect(false);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Reset state when country changes
    if (name === "country") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        state: "", // Reset state
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Toggle between login and signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setLocationDetected(false);

    // Reset form when switching modes
    setFormData({
      email: "",
      password: "",
      businessName: "",
      firstName: "",
      lastName: "",
      phone: "",
      businessType: "",
      confirmPassword: "",
      country: "",
      state: "",
      referralCode: "",
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin) {
      if (!formData.businessName) {
        newErrors.businessName = "Business name is required";
      }
      if (!formData.firstName) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.lastName) {
        newErrors.lastName = "Last name is required";
      }
      if (!formData.phone) {
        newErrors.phone = "Phone number is required";
      }
      if (!formData.businessType) {
        newErrors.businessType = "Business type is required";
      }
      if (!formData.country) {
        newErrors.country = "Country is required";
      }
      if (!formData.state) {
        newErrors.state = "State is required";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simple password strength function (0–4 score)
  const getPasswordStrengthScore = (password: string): number => {
    let score = 0;
    if (!password) return score;

    // length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // contains lower + upper
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;

    // contains number
    if (/\d/.test(password)) score++;

    // contains special char
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return Math.min(score, 4); // max 4
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear any previous errors

    try {
      if (isLogin) {
        // ========== ROLE CHECK BEFORE LOGIN ==========
        console.log("Checking user role for email:", formData.email);

        // Check if user exists and get their role
        const roleCheckResponse = await vendorAuthService.checkUserRole(
          formData.email
        );

        if (roleCheckResponse) {
          const userRole =
            roleCheckResponse.role ||
            roleCheckResponse.user?.role ||
            roleCheckResponse.vendor?.role;

          console.log("User role detected:", userRole);

          // If user is a buyer, show redirect modal
          if (userRole === "buyer") {
            setIsLoading(false);
            setShowRoleRedirect(true);
            return;
          }

          // If user is not a vendor, show error
          if (userRole && userRole !== "vendor") {
            setIsLoading(false);
            showNotification(
              "error",
              `This account is registered as a ${userRole}. Please use the appropriate login page.`
            );
            return;
          }
        }

        // ========== PROCEED WITH VENDOR LOGIN ==========
        showNotification("info", "Signing you in, please wait...");

        const loginData: LoginRequest = {
          email: formData.email,
          password: formData.password,
        };

        console.log("Login request:", loginData);

        const response = await vendorAuthService.login(loginData);
        console.log("Login response:", response);

        // Double-check role in login response
        const loginUserRole =
          response.role || response.user?.role || response.vendor?.role;

        if (loginUserRole === "buyer") {
          setIsLoading(false);
          closeNotification();
          setShowRoleRedirect(true);
          return;
        }

        const vendorData = {
          id:
            response.vendor?.id || response.user?.id || "vendor_" + Date.now(),
          email:
            response.vendor?.email || response.user?.email || formData.email,
          businessName:
            response.vendor?.business_name ||
            response.user?.business_name ||
            "My Business",
          firstName:
            response.vendor?.firstname ||
            response.user?.firstname ||
            response.vendor?.first_name ||
            "John",
          lastName:
            response.vendor?.lastname ||
            response.user?.lastname ||
            response.vendor?.last_name ||
            "Doe",
          phone:
            response.vendor?.phone || response.user?.phone || formData.phone,
          businessType:
            response.vendor?.business_type ||
            response.user?.business_type ||
            "other",
          isVerified:
            response.vendor?.isVerified || response.user?.isVerified || false,
          joinDate:
            response.vendor?.joinDate ||
            response.user?.created_at ||
            new Date().toISOString(),
          profileComplete: 100,
          token: response.token || response.access_token,
          role: loginUserRole || "vendor",
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("vendorAuth", JSON.stringify(vendorData));
          localStorage.setItem("isVendorLoggedIn", "true");

          if (vendorData.token) {
            localStorage.setItem("vendorToken", vendorData.token);
          }
        }

        closeNotification();

        setTimeout(() => {
          showNotification(
            "success",
            "Login successful! You're being redirected to your dashboard."
          );
          setTimeout(() => {
            router.push("../dashboard");
          }, 2000);
        }, 500);
      } else {
        // ========== SIGNUP ==========
        // Validation
        if (formData.password !== formData.confirmPassword) {
          showNotification(
            "error",
            "Passwords do not match. Please check and try again."
          );
          setIsLoading(false);
          return;
        }

        if (getPasswordStrengthScore(formData.password) < 3) {
          showNotification(
            "error",
            "Please create a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters."
          );
          setIsLoading(false);
          return;
        }

        if (
          !formData.firstName ||
          !formData.lastName ||
          !formData.businessName ||
          !formData.businessType ||
          !formData.email ||
          !formData.phone ||
          !formData.country ||
          !formData.state
        ) {
          showNotification("error", "Please fill in all required fields.");
          setIsLoading(false);
          return;
        }

        // Show loading notification
        showNotification(
          "info",
          "Please wait while we set up your account. This may take a few moments..."
        );

        const requestBody: VendorSignupRequest = {
          business_name: formData.businessName,
          business_type: formData.businessType,
          country: formData.country,
          email: formData.email,
          firstname: formData.firstName,
          lastname: formData.lastName,
          password: formData.password,
          phone: formData.phone,
          state: formData.state,
          ...(formData.referralCode && {
            referral_code: formData.referralCode,
          }),
        };

        console.log("Sending vendor signup request...", requestBody);

        // Try HTTPS first, fallback to HTTP
        let response;
        try {
          response = await fetch(
            "https://server.bizengo.com/api/auth/signup/vendor",
            {
              method: "POST",
              headers: {
                accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            }
          );
        } catch (fetchError) {
          console.error("Network error during signup:", fetchError);
          // Handle network errors
          throw new Error(
            "Network error. Please check your connection and try again."
          );
        }

        const data = await response.json();
        console.log("Response data:", data);

        if (
          response.ok ||
          (data && data.message === "Account is pending verification")
        ) {
          closeNotification();

          setTimeout(() => {
            // Store email for OTP verification
            sessionStorage.setItem("VendorEmail", formData.email);

            showNotification(
              "success",
              data.message ||
                "Please check your email for the OTP verification code."
            );

            // Clear form
            setFormData({
              businessName: "",
              businessType: "",
              firstName: "",
              lastName: "",
              email: "",
              password: "",
              confirmPassword: "",
              phone: "",
              country: "",
              state: "",
              referralCode: "",
            });

            // Redirect to OTP verification
            setTimeout(() => {
              router.push(
                `/vendor/verify-otp?email=${encodeURIComponent(formData.email)}`
              );
            }, 2000);
          }, 500);
        } else {
          // Handle API errors
          let errorMessage = "Failed to create account. Please try again.";

          if (data && data.message) {
            errorMessage = data.message;
          } else if (data && data.error) {
            errorMessage = data.error;
          } else if (data && data.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors.join(", ");
          }

          if (response.status === 400) {
            if (errorMessage.toLowerCase().includes("email")) {
              errorMessage =
                "This email address is already registered or invalid.";
            } else if (errorMessage.toLowerCase().includes("phone")) {
              errorMessage =
                "This phone number is already registered or invalid.";
            }
          } else if (response.status === 409) {
            errorMessage =
              "An account with this email or phone number already exists. Please try logging in instead.";
          } else if (response.status === 422) {
            errorMessage =
              errorMessage || "Please check your information and try again.";
          } else if (response.status === 500) {
            errorMessage =
              "Our servers are experiencing issues. Please try again later.";
          }

          closeNotification();
          setTimeout(() => {
            showNotification("error", errorMessage);
          }, 500);
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);

      let errorMessage =
        error.message || "Authentication failed. Please try again.";

      if (
        errorMessage.includes("Invalid credentials") ||
        errorMessage.includes("Unauthorized")
      ) {
        errorMessage = "Please check your email and password and try again.";
      } else if (errorMessage.includes("User not found")) {
        errorMessage =
          "No account found with this email. Please sign up first.";
      } else if (errorMessage.includes("already exists")) {
        errorMessage =
          "An account with this email already exists. Please try logging in.";
      }

      closeNotification();
      setTimeout(() => {
        showNotification("error", errorMessage);
      }, 500);

      setErrors({
        submit: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    showNotification("info", "Connecting with Google, please wait...");

    try {
      // For now, keeping the demo implementation
      // You can integrate with Google OAuth later
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const vendorData = {
        id: "vendor_google_" + Date.now(),
        email: "demo@example.com",
        businessName: "Demo Business",
        firstName: "Demo",
        lastName: "User",
        phone: "+234-555-0123",
        businessType: "retail",
        country: "Nigeria",
        state: "Lagos",
        isVerified: true,
        joinDate: new Date().toISOString(),
        profileComplete: 100,
        authProvider: "google",
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("vendorAuth", JSON.stringify(vendorData));
        localStorage.setItem("isVendorLoggedIn", "true");
      }

      // Close info modal first
      closeNotification();

      setTimeout(() => {
        showNotification(
          "success",
          "Google sign-in successful! You're being redirected to your dashboard."
        );

        setTimeout(() => {
          router.push("../dashboard");
        }, 2000);
      }, 500);
    } catch (error) {
      // Close info modal first
      closeNotification();

      setTimeout(() => {
        showNotification(
          "error",
          "Google Authentication Failed: Unable to connect with Google. Please try again or use email/password login."
        );
      }, 500);

      setErrors({ submit: "Google authentication failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Get available states for selected country
  const getAvailableStates = () => {
    return statesByCountry[formData.country] || [];
  };

  return (
    <>
      <NotificationModal
        type={notification.type}
        message={notification.message}
        show={notification.show}
        onClose={closeNotification}
      />

      <RoleRedirectModal
        show={showRoleRedirect}
        onRedirect={handleRoleRedirect}
        onClose={closeRoleRedirect}
      />

      <div className="flex items-center justify-center min-h-screen p-4 py-10 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="w-full max-w-md">
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              {isLogin ? "Welcome Back" : "Start Selling Online"}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? "Sign in to your vendor account"
                : "Create your storefront and reach more customers"}
            </p>
          </div>

          {/* Auth Form */}
          <Card className="mb-6 border shadow-xl border-gary-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div onSubmit={handleSubmit} className="space-y-4">
                {/* Registration Fields */}
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="h-11"
                          required
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-500">
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="h-11"
                          required
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-500">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder="Enter your business name"
                        className="h-11"
                        required
                      />
                      {errors.businessName && (
                        <p className="text-sm text-red-500">
                          {errors.businessName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="08012345678"
                        className="h-11"
                        required
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone}</p>
                      )}
                    </div>

                    {/* Location Section with Auto-Detection */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">
                          Location *
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={manualDetectLocation}
                          disabled={isDetectingLocation}
                          className="h-8 px-3 text-xs"
                        >
                          {isDetectingLocation ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Detecting...
                            </>
                          ) : (
                            <>
                              <Locate className="w-3 h-3 mr-1" />
                              Auto-detect
                            </>
                          )}
                        </Button>
                      </div>

                      {isDetectingLocation && (
                        <div className="flex items-center gap-2 p-3 text-sm text-blue-600 rounded-lg bg-blue-50">
                          <MapPin className="w-4 h-4" />
                          <span>Detecting your location...</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="country">Country *</Label>
                          <select
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className={`w-full h-11 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.country
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            required
                          >
                            <option value="">Select country</option>
                            {countries.map((country) => (
                              <option key={country.value} value={country.value}>
                                {country.label}
                              </option>
                            ))}
                          </select>
                          {errors.country && (
                            <p className="text-sm text-red-500">
                              {errors.country}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state">State/Region *</Label>
                          <select
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={`w-full h-11 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.state
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            required
                            disabled={!formData.country}
                          >
                            <option value="">
                              {formData.country
                                ? "Select state"
                                : "Select country first"}
                            </option>
                            {getAvailableStates().map((state) => (
                              <option key={state.value} value={state.value}>
                                {state.label}
                              </option>
                            ))}
                          </select>
                          {errors.state && (
                            <p className="text-sm text-red-500">
                              {errors.state}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className={`w-full h-11 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.businessType
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      >
                        <option value="">Select business type</option>
                        {businessTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.businessType && (
                        <p className="text-sm text-red-500">
                          {errors.businessType}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referralCode">
                        Referral Code (Optional)
                      </Label>
                      <Input
                        id="referralCode"
                        name="referralCode"
                        value={formData.referralCode || ""}
                        onChange={handleInputChange}
                        placeholder="Enter referral code if any"
                        className="h-11"
                      />
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="h-11"
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        id="remember"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600">
                        Remember me
                      </Label>
                    </div>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="h-11"
                      required
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                {errors.submit && (
                  <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </div>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-500 bg-white">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <Chrome className="w-5 h-5 mr-2" />
                Google
              </Button>
            </CardContent>
          </Card>

          {/* Toggle Auth Mode */}
          <div className="text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="ml-1 font-medium text-blue-600 hover:underline"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>

          {/* Location Detection Info */}
          {!isLogin && (
            <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="mb-1 font-medium">Auto-Location Detection</p>
                  <p>
                    We automatically detect your location to help you set up
                    your business profile faster. You can always change this
                    information later or click "Auto-detect" to try again.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VendorAuth;
