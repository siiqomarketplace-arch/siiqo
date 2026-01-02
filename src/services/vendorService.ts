import api from "@/lib/api_client";
import { ApiOrdersResponse } from "@/types/orders";

export const vendorService = {
  /**
   * VENDOR ANALYTICS & DASHBOARD
   */
  getRevenueAnalytics: async () => {
    // Matches your api.ts: /vendor-orders/analytics/revenue
    const response = await api.get("/vendor-orders/analytics/revenue");
    return response.data;
  },

  getDashboardStats: async () => {
    // Pointing to your live settings/profile for basic stats
    const response = await api.get("/vendor/settings");
    return response.data;
  },

  /**
   * ORDER MANAGEMENT
   */
  getVendorOrders: async (): Promise<ApiOrdersResponse> => {
    // Matches your api.ts: /vendor/orders
    const response = await api.get("/vendor/orders");
    return response.data;
  },

  confirmPayment: async (orderId: string | number) => {
    // Matches your api.ts: /vendor-orders/orders/${order_id}/confirm-payment/
    const response = await api.patch(`/vendor-orders/orders/${orderId}/confirm-payment/`);
    return response.data;
  },

  updateShippingStatus: async (orderId: string | number, status: string) => {
    // Matches your api.ts: /vendor-orders/orders/${order_id}/status/
    const response = await api.patch(`/vendor-orders/orders/${orderId}/status/`, { status });
    return response.data;
  },

  /**
   * VENDOR ONBOARDING & SETTINGS
   */
  vendorOnboarding: async (formData: FormData) => {
    // Matches your api.ts: /vendor/onboard
    const response = await api.post("/vendor/onboard", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateVendorSettings: async (data: FormData | any) => {
    // Matches your api.ts: /vendor/update-settings
    const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    const response = await api.patch("/vendor/update-settings", data, { headers });
    return response.data;
  },

  getVendorProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  /**
   * INVENTORY MANAGEMENT
   */
  getMyProducts: async (): Promise<MyProductsResponse> => {
    // Matches your api.ts: /products/my-products
    const response = await api.get("/products/my-products");
    return response.data;
  },

  uploadFile: async (file: File): Promise<{ urls: string[] }> => {
    const formData = new FormData();
    formData.append("file", file); // Ensure key matches 'uploadFile' in api.ts
    const response = await api.post("/vendor/upload-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
};

interface MyProductsResponse {
  products: any[];
}