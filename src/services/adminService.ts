import adminApi from "@/lib/admin_api_client";
import { UserDetails, AdminStats, User, StorefrontResponse } from "@/types/admin";

export const adminService = {
  getUserDetails: (accountType: string, id: string): Promise<UserDetails> => {
    return adminApi.get(`/admin/users/${accountType}/${id}`);
  },
  getDashboardStats: (): Promise<AdminStats> => {
    return adminApi.get("/admin/stats");
  },
  getAllUsers: (): Promise<{ users: User[] }> => {
    return adminApi.get("/admin/users");
  },
  getAllStorefronts: (): Promise<StorefrontResponse> => {
    return adminApi.get("/marketplace/storefronts");
  },
  deleteUser: (accountType: string, userId: number): Promise<void> => {
    return adminApi.delete(`/admin/users/${accountType}/${userId}`);
  },
  deleteStorefront: (storefrontId: number): Promise<void> => {
    return adminApi.delete(`/marketplace/storefronts/${storefrontId}`);
  },
  getMyProducts: (): Promise<any> => {
    return adminApi.get("/vendor/my-products");
  },
  login: (email: string, password: string): Promise<any> => {
    return adminApi.post("/vendor/login", { email, password });
  },
};
