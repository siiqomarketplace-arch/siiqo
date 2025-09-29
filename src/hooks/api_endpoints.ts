const api_endpoints = {
    // authentications.
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",

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
};

export default api_endpoints;
