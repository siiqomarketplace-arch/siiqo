import axios from "axios";

const vendorApiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://server.bizengo.com/api";

const vendorApi = axios.create({
    baseURL: vendorApiBaseUrl,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Attach vendor token automatically
vendorApi.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token =
                localStorage.getItem("vendorToken") ||
                JSON.parse(localStorage.getItem("vendorAuth") || "{}")?.token;

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                // Uncomment for debugging:
                console.log("Vendor Token attached:", token);
            } else {
                console.warn("No vendor token found");
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle vendor 401 errors safely
vendorApi.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            console.error("🚫 Vendor unauthorized — redirecting to vendor login...");
            if (typeof window !== "undefined") {
                localStorage.removeItem("vendorToken");
                localStorage.removeItem("vendorAuth");
                localStorage.removeItem("isVendorLoggedIn");
                window.location.href = "/vendor/login";
            }
        }

        return Promise.reject(error);
    }
);

export default vendorApi;
