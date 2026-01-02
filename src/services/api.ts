import axios from "axios";

// This points to your Next.js rewrite destination in development 
// and the direct server in production
const API_BASE_URL = process.env.NODE_ENV === "development" 
  ? "/api" 
  : "https://server.siiqo.com/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Authentication Interceptor
apiClient.interceptors.request.use(
  config => {
    // Check for token in sessionStorage
    const token = typeof window !== "undefined" ? sessionStorage.getItem("RSToken") : null;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * USER & PROFILE ENDPOINTS
 */
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
// Cart & Checkout ENDPOINTS
export const getCart = () => {
  return apiClient.get("/cart");
};
export const addToCart = (data: any) => {
  return apiClient.post("/cart/add", data);
}
export const clearCart = () => {
  return apiClient.delete("/cart/clear");
};

export const checkout = (data: any) => {
  return apiClient.post("/buyer-orders/checkout", data);
}
export const upDateCartItem = (itemId: number | string, data: any) => {
  return apiClient.patch(`/cart/update/${itemId}`, data);
}
export const updatePaymentProof = (order_id: number | string, formData: FormData) => {
  return apiClient.post(`/buyer-orders/upload-proof/${order_id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * VENDOR & PRODUCT & Inventory ENDPOINTS
 */
export const addProduct = (data: any) => {
  const headers: any = {};
  
  // Check if we are sending files/images
  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  // Note: if your baseURL is already "/api", 
  // you should just use "/products/add"
  return apiClient.post("/products/add", data, { headers });
};
export const getVendorOrders = () => {
  return apiClient.get("/vendor/orders");
};
export const confirmPayment = (order_id: number | string) => {
  return apiClient.patch(`/vendor-orders/orders/${order_id}/confirm-payment/`);
}
export const updateShippingStatus = (order_id: number | string, status: string) => {
  return apiClient.patch(`/vendor-orders/orders/${order_id}/status/`, { status });
}
export const deleteProduct = (product_id: number | string) => {
  return apiClient.delete(`/products/delete/${product_id}`);
}

export const createCatalog = (data: any) => {
  return apiClient.post("/products/catalogs", data);
};

export const createCategories = (data: any) => {  
  return apiClient.post("/products/category", data);
}
/**
 * EDIT PRODUCT
 * Updated to use the new /products/update/:id path
 * Note: Ensure 'data' contains keys: 'price-text' and 'images-file'
 */
export const editProduct = (product_id: number | string, data: any) => {
  const headers: any = {};
  
  // Since you saw "images-file" in form-data, we must handle FormData
  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  return apiClient.patch(`/products/update/${product_id}`, data, { headers });
};

export const getMyProducts = () => {
  return apiClient.get("/products/my-products");
};
export const getCatalogs = () => {
  return apiClient.get("products/catalogs")
}
export const getCategories = () => {
  return apiClient.get("products/categories")
}

export const getSettings = () => {
  return apiClient.get("/vendor/settings") 
}
export const revenueAnalytics = () => {
  return apiClient.get("/vendor-orders/analytics/revenue")
}
/**
 * VENDOR ONBOARDING (Replaces switch-to-vendor)
 * Use this for the "Become a Vendor" process
 */
export const vendorOnboarding = (data: any) => {
  const headers: any = {};
  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  }
  // Updated to your new live endpoint
  return apiClient.post("/vendor/onboard", data, { headers });
};

/**
 * VENDOR SETTINGS UPDATE
 * Use this for existing vendors to update store info/preferences
 */
export const updateVendorSettings = (data: any) => {
  const headers: any = {};
  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  }
  return apiClient.patch("/vendor/update-settings", data, { headers });
};

export const uploadFile = (formData: FormData) => {
  return apiClient.post("/vendor/upload-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * MARKETPLACE & CART ENDPOINTS
 */
export const fetchProducts = () => {
  return apiClient.get("/marketplace/products");
};

export const fetchStorefronts = () => {
  return apiClient.get("/marketplace/storefronts");
};



export const fetchCartItems = () => {
  return apiClient.get("/cart");
};
// new endpoints
export const fetchGlobalSearch = () => {
  return apiClient.get("/marketplace/search");
};
export const getStorefrontDetails = (storeSlug: string) => {
  return apiClient.get(`/marketplace/store/${storeSlug}`);
};
export const fetchProductDetails = (product_id: number | string) => {
  return apiClient.get(`/marketplace/products/${product_id}`);
}
export const fetchActiveStorefronts = () => { 
  return apiClient.get("/buyers/storefronts");
}
export const togglegFavorite = (product_id: number | string) => {
  return apiClient.post(`/buyers/favorites/${product_id}`);
}
export const fetchFavoriteItems = () => {
  return apiClient.get("/buyers/favorites");
}
/**
 * AUTHENTICATION ENDPOINTS
 */
export const login = (credentials: any) => {
  return apiClient.post("/auth/login", credentials);
};

export const signup = (data: any) => {
  return apiClient.post("/auth/register", data);
};

export const verifyEmail = (data: any) => {
  return apiClient.post("/auth/verify-email", data);
};

export const resendOtp = (email: string) => {
  return apiClient.post("/auth/verify-reset-otp", { email });
};

export const forgotPassword = (email: string) => {
  return apiClient.post("/auth/forgot-password", { email });
};

export const resetPassword = (data: any) => {
  return apiClient.post("/auth/reset-password", data);
};

export const resendVerification = (email: string) => {
  return apiClient.post("/auth/resend-verification", { email });
};

/**
 * LOGOUT UTILITY
 */
export const logout = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("RSToken");
    sessionStorage.removeItem("RSUser");
    sessionStorage.removeItem("RSEmail");
    window.location.href = "/auth/login";
  }
};

export default apiClient;