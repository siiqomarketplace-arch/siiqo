import vendorApiClient from "@/lib/vendor_api_client";
import { ApiOrdersResponse } from "@/types/orders";

export const vendorService = {
  getDashboardStats: () => {
    return vendorApiClient.get("/dashboard-stats").catch(e => {
      console.error("Failed to load stats, using fallback data:", e);
      return {
        data: {
          totalSales: 12450,
          totalOrders: 87,
          totalProducts: 23,
          averageRating: 4.6,
          monthlyGrowth: 15.2,
          newCustomers: 34,
          pendingOrders: 5,
          lowStockItems: 3,
        }
      };
    });
  },
  getRecentOrders: () => {
    return vendorApiClient.get("/dashboard/recent-orders").catch(e => {
      console.error("Failed to load recent orders", e);
      return { data: [] };
    });
  },
  getPerformanceData: () => {
    return vendorApiClient.get("/dashboard/performance-data").catch(e => {
      console.error("Failed to load performance data", e);
      return { data: [] };
    });
  },
  getNotifications: () => {
    return vendorApiClient.get("/dashboard/notifications").catch(e => {
      console.error("Failed to load notifications", e);
      return { data: [] };
    });
  },
  getPendingOrders: () => {
    return vendorApiClient.get("/dashboard/pending-orders").catch(e => {
      console.error("Failed to load pending orders", e);
      return { data: { count: 0 } };
    });
  },
  getNewCustomers: () => {
    return vendorApiClient.get("/dashboard/new-customers").catch(e => {
      console.error("Failed to load new customers", e);
      return { data: { count: 0 } };
    });
  },
  getActiveProducts: () => {
    return vendorApiClient.get("/dashboard/active-products").catch(e => {
      console.error("Failed to load active products", e);
      return { data: { count: 0 } };
    });
  },
  getLowStockItems: () => {
    return vendorApiClient.get("/dashboard/low-stock-items").catch(e => {
      console.error("Failed to load low stock items", e);
      return { data: { count: 0 } };
    });
  },
  vendorOnboarding: (formData: FormData) => {
    return vendorApiClient.post("/onboarding", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getVendorOrders: (): Promise<ApiOrdersResponse> => {
    return vendorApiClient.get("/vendor/orders");
  },
  getVendorProfile: () => {
    return vendorApiClient.get("/user/profile");
  },
  updateOrderStatus: (orderId: string, newStatus: string) => {
    return vendorApiClient.put(`/vendor/orders/${orderId}/status`, { status: newStatus });
  },
  uploadImage: (file: File): Promise<{ urls: string[] }> => {
    const formData = new FormData();
    formData.append("files", file);
    return vendorApiClient.post("/vendor/upload-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append("profile_pic", file);
    return vendorApiClient.post("/upload-profile-pic", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getMyProducts: (): Promise<MyProductsResponse> => {
    return vendorApiClient.get("/vendor/my-products");
  },
  getStorefront: () => {
    return vendorApiClient.get("/vendor/storefront");
  },
  updateStorefront: (data: any) => {
    return vendorApiClient.post("/vendor/storefront", data);
  },
};
interface MyProductsResponse {
  products: any[];
}
