const API_BASE_URL = "https://server.siiqo.com/api";

const api_endpoints = {
  // ==================== MARKETPLACE ====================
  MARKETPLACE_SEARCH: `${API_BASE_URL}/marketplace/search`,
  MARKETPLACE_STORE: (storeName: string) =>
    `${API_BASE_URL}/marketplace/store/${storeName}`,
  MARKETPLACE_PRODUCTS: (productId: string | number) =>
    `${API_BASE_URL}/marketplace/products/${productId}`,

  // ==================== CART ====================
  FETCH_CART_ITEMS: "/cart",
  ADD_TO_CART_ITEMS: "/cart/add",
  UPDATE_CART_ITEMS: "/cart/update",
  DELETE_CART_ITEMS: "/cart",
  CLEAR_CART_ITEMS: "/cart/clear",

  // ==================== CHECKOUT ====================
  CHECKOUT: "/buyer-orders/checkout",
  UPLOAD_PAYMENT_PROOF: "/buyer-orders/upload-proof",

  // ==================== PRODUCTS ====================
  GET_PRODUCTS: `${API_BASE_URL}/products`,
  GET_PRODUCT_DETAIL: (productId: string | number) =>
    `${API_BASE_URL}/products/${productId}`,
  GET_MY_PRODUCTS: `${API_BASE_URL}/products/my-products`,
  GET_CATALOGS: `${API_BASE_URL}/products/catalogs`,

  // ==================== STOREFRONT ====================
  GET_STOREFRONT: (storeName: string) =>
    `${API_BASE_URL}/storefront/${storeName}`,
  STOREFRONT_DETAILS: (storeName: string) =>
    `${API_BASE_URL}/marketplace/store/${storeName}`,

  // ==================== VENDOR ====================
  VENDOR_DASHBOARD: `${API_BASE_URL}/vendor/dashboard`,
  VENDOR_PRODUCTS: `${API_BASE_URL}/vendor/products`,
  VENDOR_SETTINGS: `${API_BASE_URL}/vendor/settings`,

  // ==================== BUYER ====================
  GET_FAVOURITES: `${API_BASE_URL}/buyers/favourites`,

  // ==================== AUTH ====================
  LOGIN: `${API_BASE_URL}/auth/login`,
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  VERIFY_OTP: `${API_BASE_URL}/auth/verify-email`,
  RESEND_OTP: `${API_BASE_URL}/auth/resend-otp`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
};

export default api_endpoints;
export { API_BASE_URL };
