"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
// import { useVendorDashboard } from "@/hooks/useVendorDashboard"; // LIVE HOOK COMMENTED OUT
import {
  DashboardStatsData,
  Order,
  Product,
  PerformanceData,
  Notification,
} from "@/types/dashboard";

import DashboardStats from "./components/DashboardStats";
import QuickActions from "./components/QuickActions";
import PerformanceChart from "./components/PerformanceChart";
import NotificationPanel from "./components/NotificationPanel";
import RecentOrders from "./components/RecentOrders";
import ProductOverview from "./components/ProductOverview";

const VendorDashboard: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // --- LOCAL STORAGE LOGIC ---
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  // const { dashboardData, isLoading: isDashboardLoading } = useVendorDashboard(); // LIVE DATA COMMENTED OUT

  useEffect(() => {
    const fetchLocalData = async () => {
      setIsDashboardLoading(true);

      // Simulate network delay
      await new Promise((r) => setTimeout(r, 1000));

      try {
        // Check for existing dashboard data in storage
        const localData = localStorage.getItem("vendorDashboardData");

        if (localData) {
          setDashboardData(JSON.parse(localData));
        } else {
          setDashboardData(null);
        }
      } catch (error) {
        console.error("Error loading local dashboard data", error);
      } finally {
        setIsDashboardLoading(false);
      }
    };

    fetchLocalData();
  }, []);

  const isLoading = isAuthLoading || isDashboardLoading;

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/auth/login");
    }
  }, [isAuthLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="text-text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background mt-14 md:mt-0 pb-10">
      <main className="w-full md:max-w-[85vw] mx-auto px-4 py-4 md:py-6">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="mb-1 md:mb-2 text-xl md:text-2xl font-bold font-heading text-text-primary">
            Welcome back, {user?.business_name || user?.name}! 👋
          </h1>
          <p className="text-sm md:text-base text-text-muted">
            Here's what's happening with your business today
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12">
          {/* Stats */}
          <div className="order-1 lg:col-span-8">
            <DashboardStats />
          </div>

          {/* Quick Actions */}
          <div className="order-2 lg:col-span-4">
            <QuickActions />
          </div>
          {/* Product Overview */}
          <div className="order-3 lg:col-span-5">
            <ProductOverview />
          </div>
          {/* Performance Chart - Coming Soon */}
          <div className="order-4 lg:col-span-7 opacity-40 pointer-events-none relative">
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/5 z-10">
              <span className="text-sm font-medium text-text-muted">
                Coming Soon
              </span>
            </div>
            <PerformanceChart data={[]} />
          </div>

          {/* Notifications - Coming Soon */}
          <div className="order-5 lg:col-span-5 z-0 lg:z-10 opacity-40 pointer-events-none relative">
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/5 z-10">
              <span className="text-sm font-medium text-text-muted">
                Coming Soon
              </span>
            </div>
            <NotificationPanel notifications={[]} />
          </div>

          {/* Recent Orders - Coming Soon */}
          <div className="order-6 lg:col-span-7 opacity-40 pointer-events-none relative">
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/5 z-10">
              <span className="text-sm font-medium text-text-muted">
                Coming Soon
              </span>
            </div>
            <RecentOrders orders={[]} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
