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

vendorApi.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = sessionStorage.getItem("RSToken");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.warn("No vendor token found in sessionStorage");
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

vendorApi.interceptors.response.use(
    (response) => response.data,
    (error) => {
        return Promise.reject(error);
    }
);

export default vendorApi;
