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

api.interceptors.response.use(
    (response) => response, // return full response
    (error) => {
        const status = error.response?.status;
        if (status === 401) {
            console.warn("Unauthorized, redirecting to login...");
        }
        return Promise.reject(error);
    }
);

export default api;
