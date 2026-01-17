import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

// Best-effort token lookup to avoid missing Authorization header
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  // Primary source used throughout the app
  const sessionToken = sessionStorage.getItem("RSToken");
  if (sessionToken) return sessionToken;

  // Fallbacks in case the token was stored elsewhere
  const localToken = localStorage.getItem("RSToken");
  if (localToken) return localToken;

  const cookieMatch = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("RSToken="));
  if (cookieMatch) return decodeURIComponent(cookieMatch.split("=")[1]);

  return null;
};

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track if we're already attempting to handle a 401 to avoid infinite loops
let is401HandlerActive = false;

api.interceptors.response.use(
  (response) => response, // return full response
  (error) => {
    const status = error.response?.status;

    if (
      status === 401 &&
      !is401HandlerActive &&
      typeof window !== "undefined"
    ) {
      is401HandlerActive = true;

      // Try to restore from Remember Me token
      const rememberToken = localStorage.getItem("RSToken");
      const rememberExpiry = localStorage.getItem("RSTokenExpiry");

      if (rememberToken && rememberExpiry) {
        const expiryTime = parseInt(rememberExpiry, 10);

        // If remember me token is still valid, try to use it
        if (expiryTime > Date.now()) {
          console.log(
            "Token expired, attempting to restore from Remember Me..."
          );
          sessionStorage.setItem("RSToken", rememberToken);

          const userRole = localStorage.getItem("RSUsertarget_view");
          if (userRole) {
            sessionStorage.setItem("RSUsertarget_view", userRole);
          }

          const userData = localStorage.getItem("RSUser");
          if (userData) {
            sessionStorage.setItem("RSUser", userData);
          }

          // Retry the original request with the restored token
          const token = sessionStorage.getItem("RSToken");
          if (token) {
            error.config.headers.Authorization = `Bearer ${token}`;
            is401HandlerActive = false;
            return api.request(error.config);
          }
        } else {
          // Remember Me token expired, clear it
          localStorage.removeItem("RSToken");
          localStorage.removeItem("RSTokenExpiry");
          localStorage.removeItem("RSUser");
          localStorage.removeItem("RSUsertarget_view");
        }
      }

      // No valid token recovery, redirect to login
      console.warn(
        "Unauthorized and no valid Remember Me token, redirecting to login..."
      );
      sessionStorage.clear();
      window.location.href = "/auth/login";
      is401HandlerActive = false;
    }

    return Promise.reject(error);
  }
);

export default api;
