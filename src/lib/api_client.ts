import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://server.bizengo.com/api";

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
        accept: "application/json",
    },
});

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
