import axios from "axios";
import { logError } from "./errorHandler";

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

const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const sessionToken = sessionStorage.getItem("RSRefreshToken");
  if (sessionToken) return sessionToken;

  const localToken = localStorage.getItem("RSRefreshToken");
  if (localToken) return localToken;

  return null;
};

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response, // return full response
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // Log all server errors for debugging
    if (status && status >= 500) {
      logError(error, `API Error (${status})`);
    }

    if (status === 401 && !originalRequest?._retry) {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await refreshClient.post(
            "/auth/refresh",
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            },
          );

          const newAccessToken = refreshResponse.data?.access_token;
          const newRefreshToken = refreshResponse.data?.refresh_token;

          if (newAccessToken) {
            sessionStorage.setItem("RSToken", newAccessToken);
            if (localStorage.getItem("RSToken")) {
              localStorage.setItem("RSToken", newAccessToken);
            }
            if (newRefreshToken) {
              sessionStorage.setItem("RSRefreshToken", newRefreshToken);
              if (localStorage.getItem("RSRefreshToken")) {
                localStorage.setItem("RSRefreshToken", newRefreshToken);
              }
            }

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api.request(originalRequest);
          }
        } catch (refreshError) {
          console.warn("Refresh token failed, redirecting to login...");
          if (typeof window !== "undefined") {
            const path = window.location.pathname || "";
            if (!path.startsWith("/auth/")) {
              window.location.href = "/auth/login";
            }
          }
          return Promise.reject(refreshError);
        }
      }
    }

    if (status === 401) {
      const reqUrl = originalRequest?.url || "";
      const isAuthRequest =
        reqUrl.includes("/auth/login") || reqUrl.includes("/auth/refresh");

      console.warn("Unauthorized, redirecting to login...");
      if (typeof window !== "undefined" && !isAuthRequest) {
        const path = window.location.pathname || "";
        if (!path.startsWith("/auth/")) {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
