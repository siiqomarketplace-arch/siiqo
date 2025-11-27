import { useState, useEffect } from "react";
import { vendorService } from "@/services/vendorService";
import { productService } from "@/services/productService";
import { DashboardData } from "@/types/dashboard";

export const useVendorDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [myProductsRes] = await Promise.all([
          productService.getMyProducts(),
        ]);

        setDashboardData({
          stats: {
            totalSales: 0,
            totalOrders: 0,
            totalProducts: 0,
            averageRating: 0,
            monthlyGrowth: 0,
            newCustomers: 0,
            pendingOrders: 0,
            lowStockItems: 0,
          },
          recentOrders: [],
          performanceData: [],
          notifications: [],
          topProducts: myProductsRes.data?.products || [],
        });
      } catch (error) {
        console.error("An unexpected error occurred while loading dashboard data:", error);
        setDashboardData({
          stats: null,
          recentOrders: [],
          topProducts: [],
          performanceData: [],
          notifications: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return { dashboardData, isLoading };
};
