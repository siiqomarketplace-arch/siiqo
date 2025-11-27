import axios from "axios";

const adminApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const adminApi = axios.create({
    baseURL: adminApiBaseUrl,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

adminApi.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("adminToken");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.warn("No admin token found in localStorage");
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
    (response) => response.data,
    (error) => {
        return Promise.reject(error);
    }
);

export default adminApi;
