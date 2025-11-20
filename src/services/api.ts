import axios from "axios";

const API_BASE_URL = "https://server.bizengo.com/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem("RSToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const getUserProfile = () => {
  return apiClient.get("/user/profile");
};

export const uploadProfilePicture = (formData: FormData) => {
  return apiClient.post("/upload-profile-pic", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const addProduct = (data: any) => {
  return apiClient.post("/vendor/add-product", data);
};

export const editProduct = (productId: number, data: any) => {
  return apiClient.put(`/vendor/edit-product/${productId}`, data);
};

export const getMyProducts = () => {
  return apiClient.get("/vendor/my-products");
};

export const getVendorOrders = () => {
  return apiClient.get("/vendor/orders");
};

export const fetchProducts = () => {
  return apiClient.get("/marketplace/popular-products");
};

export const addToCart = (data: any) => {
  return apiClient.post("/cart/add", data);
};

export const fetchCartItems = () => {
  return apiClient.get("/cart");
};

export const vendorOnboarding = (data: any) => {
  return apiClient.patch("/user/switch-to-vendor", data);
};

export const uploadFile = (formData: FormData) => {
  return apiClient.post("/vendor/upload-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const verifyEmail = (data: any) => {
  return apiClient.post("/auth/verify-email", data);
};

export const resendOtp = (email: string) => {
  return apiClient.post("/auth/resend-otp", { email });
};

export const resetPassword = (data: any) => {
  return apiClient.post("/auth/reset-password", data);
};

export const resendVerification = (email: string) => {
  return apiClient.post("/auth/resend-verification", { email });
};

export const forgotPassword = (email: string) => {
  return apiClient.post("/auth/request-password-reset", { email });
};

export const login = (credentials: any) => {
  return apiClient.post("/auth/login", credentials);
};

export const signup = (data: any) => {
  return apiClient.post("/auth/signup", data);
};

export const logout = () => {
  sessionStorage.removeItem("RSToken");
  sessionStorage.removeItem("RSUser");
  sessionStorage.removeItem("RSEmail");
  window.location.href = "/auth/login";
};

export default apiClient;
