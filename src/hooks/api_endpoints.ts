export const baseURL =
    process.env.NEXT_PUBLIC_API_URL || "https://server.bizengo.com/api";

// export const mockApiBaseURL = "https://68ee74e8df2025af7803c34e.mockapi.io/signup"
// // export const mockApiBaseURL = "https://admin.mockwave.io/mockwave/blessed_sam_747679/bizengo-auth/api/v1/auth/signup"

const api_endpoints = {
    // authentications.
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    FORGOT_PASSWORD_REQUEST: "/auth/request-password-reset",
    RESET_PASSWORD: "/auth/reset-password",

    // user endpoints.
    PROFILE: "/user/profile",

    // Cart
    FETCH_CART_ITEMS: "/cart",
    UPDATE_CART_ITEMS: "/cart/update",
    DELETE_CART_ITEMS: "/cart/delete",
    CLEAR_CART_ITEMS: "/cart/clear",
    ADD_TO_CART_ITEMS: "/cart/add",

    // Products.
    FETCH_POPULAR_PRODUCTS: "/marketplace/popular-products",
    FETCH_PRODUCTS: "/marketplace/products",

    // Storefronts
    FETCH_STOREFRONTS: "/admin/storefronts",

    // vendor apis
    VENDOR_LOGIN: "vendor/login",
};

export default api_endpoints;
