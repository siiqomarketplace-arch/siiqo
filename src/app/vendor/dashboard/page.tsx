"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useVendorDashboard } from "@/hooks/useVendorDashboard";
import { DashboardStatsData, Order, Product, PerformanceData, Notification } from "@/types/dashboard";

import DashboardStats from "./components/DashboardStats";
import QuickActions from "./components/QuickActions";
import PerformanceChart from "./components/PerformanceChart";
import NotificationPanel from "./components/NotificationPanel";
import RecentOrders from "./components/RecentOrders";
import ProductOverview from "./components/ProductOverview";

const VendorDashboard: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { dashboardData, isLoading: isDashboardLoading } = useVendorDashboard();
  const router = useRouter();

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

  // If user is null after loading, it means they are not authenticated, so return null after redirect
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[85vw] mx-auto px-0 md:px-4 py-6">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold font-heading text-text-primary">
            Welcome back, {user?.business_name || user?.name}! 👋
          </h1>
          <p className="text-text-muted">
            Here's what's happening with your business today
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {dashboardData?.stats && (
            <div className="lg:col-span-8">
              <DashboardStats stats={dashboardData.stats} />
            </div>
          )}
          <div className="lg:col-span-4">
            <QuickActions />
          </div>
          {dashboardData?.performanceData && (
            <div className="lg:col-span-8">
              <PerformanceChart data={dashboardData.performanceData} />
            </div>
          )}
          {dashboardData?.notifications && (
            <div className="z-10 lg:col-span-4">
              <NotificationPanel notifications={dashboardData.notifications} />
            </div>
          )}
          {dashboardData?.recentOrders && (
            <div className="lg:col-span-8">
              <RecentOrders orders={dashboardData.recentOrders} />
            </div>
          )}
          {dashboardData?.topProducts && (
            <div className="lg:col-span-4">
              <ProductOverview products={dashboardData.topProducts} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
