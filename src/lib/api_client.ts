import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create Axios instance
const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
        accept: "application/json",
    },
});

// Request interceptor which attaches token automatically
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = sessionStorage.getItem("RSToken");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response.data, // unwrap data
    (error) => {
        const status = error.response?.status;
        if (status === 401) {
            console.warn("Unauthorized, redirecting to login...");
            // optionally logout here or redirect
        }
        return Promise.reject(error);
    }
);

export default api;
