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
  AlertTriangle,
  Loader2,
  X,
  MapPin,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const passwordStrength = (password: string): number => {
  let score = 0;
  if (password.length >= 8) {
    score++;
  }
  if (password.match(/[a-z]+/)) {
    score++;
  }
  if (password.match(/[A-Z]+/)) {
    score++;
  }
  if (password.match(/[0-9]+/)) {
    score++;
  }
  if (password.match(/[^a-zA-Z0-9]+/)) {
    score++;
  }

  return score;
};

const PasswordStrengthBar = ({
  strength,
  password,
}: {
  strength: number;
  password: string;
}) => {
  let color = "red";
  let strengthText = "Poor";
  if (strength >= 2) {
    color = "yellow";
    strengthText = "Weak";
  }
  if (strength >= 4) {
    color = "green";
    strengthText = "Strong";
  }

  return (
    <div>
      {password && (
        <div
          className={`text-xs ${
            strengthText === "Poor"
              ? "text-red-600"
              : strengthText === "Weak"
              ? "text-yellow-500"
              : strengthText === "Strong"
              ? "text-green-600"
              : "text-gray-500"
          } mb-1`}
        >
          {strengthText}
        </div>
      )}
      {password && (
        <div className="w-full h-1 mt-1 bg-gray-200 rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-300`}
            style={{
              width: `${Math.min(strength * 25, 100)}%`,
              backgroundColor: color,
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

// Modal Notification Component
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
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "error":
        return <XCircle className="w-12 h-12 text-red-500" />;
      case "info":
        return <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />;
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
        onClick={type !== "info" ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border-2 ${colors.border}`}
      >
        {/* Close button - only show for non-info modals */}
        {type !== "info" && (
          <button
            onClick={onClose}
            className="absolute text-gray-400 transition-colors top-4 right-4 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className={`p-8 rounded-t-xl ${colors.bg}`}>
          <div className="text-center">
            <div className="flex justify-center mb-4">{getIcon()}</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <p className="leading-relaxed text-gray-700">{message}</p>
          </div>
        </div>

        {/* Actions - only show for non-info modals */}
        {type !== "info" && (
          <div className="p-6 bg-white rounded-b-xl">
            <Button
              onClick={onClose}
              className={`w-full ${colors.button} text-white`}
            >
              OK
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Signup = () => {
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
  const router = useRouter();

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  useEffect(() => {
    setPasswordStrengthScore(passwordStrength(formData.password));
  }, [formData.password]);

  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [formData.password, formData.confirmPassword]);

  // Location detection function
  const detectLocation = async () => {
    if (formData.country && formData.state && locationDetected) {
      return; // Don't re-detect if already filled and detected
    }

    setLocationDetecting(true);
    try {
      // Use multiple fallback services for better reliability
      const response = await fetch("https://ipapi.co/json/");

      if (response.ok) {
        const data = await response.json();

        if (data.country_name && data.region) {
          setFormData((prev) => ({
            ...prev,
            country: data.country_name,
            state: data.region,
          }));
          setLocationDetected(true);
        } else {
          throw new Error("Incomplete location data");
        }
      } else {
        throw new Error("Primary location service failed");
      }
    } catch (error) {
      // Fallback to alternative service
      try {
        const fallbackResponse = await fetch("https://ip-api.com/json/");

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();

          if (
            fallbackData.status === "success" &&
            fallbackData.country &&
            fallbackData.regionName
          ) {
            setFormData((prev) => ({
              ...prev,
              country: fallbackData.country,
              state: fallbackData.regionName,
            }));
            setLocationDetected(true);
          } else {
            throw new Error("Fallback location service failed");
          }
        } else {
          throw new Error("Fallback location service failed");
        }
      } catch (fallbackError) {
        // Second fallback
        try {
          const secondFallbackResponse = await fetch("https://ipinfo.io/json");

          if (secondFallbackResponse.ok) {
            const secondFallbackData = await secondFallbackResponse.json();

            if (secondFallbackData.country && secondFallbackData.region) {
              // Convert country code to country name if needed
              const countryName =
                secondFallbackData.country === "NG"
                  ? "Nigeria"
                  : secondFallbackData.country === "US"
                  ? "United States"
                  : secondFallbackData.country === "GB"
                  ? "United Kingdom"
                  : secondFallbackData.country === "CA"
                  ? "Canada"
                  : secondFallbackData.country;

              setFormData((prev) => ({
                ...prev,
                country: countryName,
                state: secondFallbackData.region,
              }));
              setLocationDetected(true);
            }
          }
        } catch (secondFallbackError) {
          console.log("Location detection failed, user can enter manually");
        }
      }
    } finally {
      setLocationDetecting(false);
    }
  };

  // Show notification function
  const showNotification = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    setNotification({ type, title, message, show: true });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Manual location refresh
  const handleLocationRefresh = () => {
    setLocationDetected(false);
    detectLocation();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      showNotification(
        "error",
        "Password Mismatch",
        "Passwords do not match. Please check and try again."
      );
      return;
    }

    if (passwordStrengthScore < 3) {
      showNotification(
        "error",
        "Weak Password",
        "Please create a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters."
      );
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.country ||
      !formData.state
    ) {
      showNotification(
        "error",
        "Missing Information",
        "Please fill in all required fields."
      );
      return;
    }

    setIsLoading(true);

    // Show loading notification
    showNotification(
      "info",
      "Creating Your Account",
      "Please wait while we set up your account. This may take a few moments..."
    );

    try {
      const requestBody = {
        country: formData.country,
        email: formData.email,
        name: formData.name,
        password: formData.password,
        phone: formData.phone,
        referral_code: formData.referral_code || undefined,
        state: formData.state,
      };

      console.log("Sending signup request...", requestBody);

      // Try HTTPS first, then fallback to HTTP for development
      let response;
      try {
        response = await fetch(
          "https://server.bizengo.com/api/auth/signup/buyer",
          {
            method: "POST",
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );
      } catch (httpsError) {
        console.log(
          "HTTPS failed due to SSL issue, trying HTTP...",
          httpsError
        );
        // Fallback to HTTP for development
        response = await fetch(
          "http://server.bizengo.com/api/auth/signup/buyer",
          {
            method: "POST",
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );
      }

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      // Check for success - handle both standard success and "pending verification" response
      if (
        response.ok ||
        (data && data.message === "Account is pending verification")
      ) {
        // Close loading modal first
        closeNotification();

        setTimeout(() => {
          // Store email for OTP verification
          sessionStorage.setItem("RSEmail", formData.email);

          // Success notification
          showNotification(
            "success",
            "Account Created Successfully!",
            data.message ||
              "Please check your email for the OTP verification code."
          );

          // Clear form data
          setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            country: "",
            state: "",
            referral_code: "",
          });

          // Redirect to OTP verification
          setTimeout(() => {
            router.push(
              `/auth/verify-otp?email=${encodeURIComponent(formData.email)}`
            );
          }, 2000);
        }, 500);
      } else {
        // Handle API error responses
        let errorMessage = "Failed to create account. Please try again.";
        let errorTitle = "Signup Failed";

        if (data && data.message) {
          errorMessage = data.message;
        } else if (data && data.error) {
          errorMessage = data.error;
        } else if (data && data.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join(", ");
        }

        // Handle specific error cases
        if (response.status === 400) {
          errorTitle = "Invalid Information";
          if (errorMessage.toLowerCase().includes("email")) {
            errorMessage =
              "This email address is already registered or invalid.";
          } else if (errorMessage.toLowerCase().includes("phone")) {
            errorMessage =
              "This phone number is already registered or invalid.";
          }
        } else if (response.status === 409) {
          errorTitle = "Account Already Exists";
          errorMessage =
            "An account with this email or phone number already exists. Please try logging in instead.";
        } else if (response.status === 422) {
          errorTitle = "Validation Error";
          errorMessage =
            errorMessage || "Please check your information and try again.";
        } else if (response.status === 500) {
          errorTitle = "Server Error";
          errorMessage =
            "Our servers are experiencing issues. Please try again later.";
        }

        // Close loading modal first
        closeNotification();

        setTimeout(() => {
          showNotification("error", errorTitle, errorMessage);
        }, 500);
      }
    } catch (error: any) {
      console.error("Signup error:", error);

      let errorMessage = "Failed to create account. Please try again.";
      let errorTitle = "Connection Error";

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        // Network error
        errorMessage =
          "Unable to connect to our servers. This appears to be an SSL certificate issue. Please contact support or try again later.";
      } else if (error.message.includes("timeout")) {
        errorTitle = "Request Timeout";
        errorMessage =
          "The request took too long to complete. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Close loading modal first
      closeNotification();

      setTimeout(() => {
        showNotification("error", errorTitle, errorMessage);
      }, 500);
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

      <div className="flex items-center justify-center min-h-screen p-4 py-10 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          <Card className="border border-gray-200 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Create Your Account
              </CardTitle>
              <CardDescription>
                Join thousands of Nigerian business owners
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="08012345678"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="country">Country *</Label>
                      <div className="flex items-center gap-2">
                        {locationDetected && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <MapPin className="w-3 h-3" />
                            <span>Auto-detected</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleLocationRefresh}
                          disabled={locationDetecting || isLoading}
                          className="p-1 text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-50"
                          title="Detect location"
                        >
                          <RefreshCw
                            className={`h-3 w-3 ${
                              locationDetecting ? "animate-spin" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <Input
                      id="country"
                      name="country"
                      type="text"
                      placeholder={
                        locationDetecting ? "Detecting..." : "Nigeria"
                      }
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading || locationDetecting}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      placeholder={locationDetecting ? "Detecting..." : "Lagos"}
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading || locationDetecting}
                      className="h-11"
                    />
                  </div>
                </div>

                {locationDetecting && (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Detecting your location...</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="referral_code">
                    Referral Code (Optional)
                  </Label>
                  <Input
                    id="referral_code"
                    name="referral_code"
                    type="text"
                    placeholder="ABCD1234"
                    value={formData.referral_code}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="pr-10 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700 disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <PasswordStrengthBar
                    strength={passwordStrengthScore}
                    password={formData.password}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                  {formData.confirmPassword && (
                    <div className="flex items-center gap-2 mt-1">
                      {passwordsMatch ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <p className="text-xs text-green-600">
                            Passwords match!
                          </p>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <p className="text-xs text-red-500">
                            Passwords do not match.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full transition-all duration-200 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    isLoading || !passwordsMatch || passwordStrengthScore < 3
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {/* Validation hints */}
                <div className="space-y-1 text-xs text-gray-500">
                  <p>* Required fields</p>
                  <p>
                    Password must be strong (at least 8 characters with mixed
                    case, numbers, and symbols)
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location is auto-detected for your convenience. You can edit
                    if needed.
                  </p>
                </div>
              </form>

              <div className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Signup;
