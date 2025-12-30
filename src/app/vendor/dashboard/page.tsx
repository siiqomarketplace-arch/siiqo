"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
// import { useVendorDashboard } from "@/hooks/useVendorDashboard"; // LIVE HOOK COMMENTED OUT
import { DashboardStatsData, Order, Product, PerformanceData, Notification } from "@/types/dashboard";

import DashboardStats from "./components/DashboardStats";
import QuickActions from "./components/QuickActions";
import PerformanceChart from "./components/PerformanceChart";
import NotificationPanel from "./components/NotificationPanel";
import RecentOrders from "./components/RecentOrders";
import ProductOverview from "./components/ProductOverview";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";

// --- DUMMY DATA FOR LOCAL STORAGE INITIALIZATION ---
const MOCK_DASHBOARD_DATA = {
  stats: {
    totalSales: 1250000,
    totalOrders: 45,
    activeProducts: 12,
    customerRating: 4.8,
    salesTrend: 12.5,
  },
  performanceData: [
    { name: "Mon", value: 4000 },
    { name: "Tue", value: 3000 },
    { name: "Wed", value: 5000 },
    { name: "Thu", value: 2780 },
    { name: "Fri", value: 1890 },
    { name: "Sat", value: 2390 },
    { name: "Sun", value: 3490 },
  ],
  notifications: [
    { id: "1", title: "New Order", message: "You received a new order for iPhone 15", time: "2 mins ago", type: "order" },
    { id: "2", title: "Stock Alert", message: "MacBook Pro is running low on stock", time: "1 hour ago", type: "alert" },
  ],
  recentOrders: [
    { id: "ORD-001", customer: "Alice Johnson", product: "iPhone 15", amount: 999, status: "completed", date: "2025-12-30" },
    { id: "ORD-002", customer: "Bob Smith", product: "AirPods Pro", amount: 249, status: "pending", date: "2025-12-30" },
  ],
  topProducts: [
    { id: "p1", name: "iPhone 15 Pro", sales: 24, revenue: 24000, image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=100" },
    { id: "p2", name: "MacBook Air", sales: 12, revenue: 12000, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100" },
  ]
};

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
      await new Promise(r => setTimeout(r, 1000));

      try {
        // Check for existing dashboard data in storage
        const localData = localStorage.getItem("vendorDashboardData");
        const pendingUser = localStorage.getItem("pendingUserData");
        
        if (localData) {
          setDashboardData(JSON.parse(localData));
        } else {
          // If no dashboard data exists, initialize with mock data but keep user info synced
          const initialData = {
            ...MOCK_DASHBOARD_DATA,
            vendorName: pendingUser ? JSON.parse(pendingUser).name : "Vendor"
          };
          setDashboardData(initialData);
          localStorage.setItem("vendorDashboardData", JSON.stringify(initialData));
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
    <RoleProtectedRoute allowedRoles={["vendor"]}>
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
            {dashboardData?.stats && (
              <div className="order-1 lg:col-span-8">
                <DashboardStats stats={dashboardData.stats} />
              </div>
            )}

            {/* Quick Actions */}
            <div className="order-2 lg:col-span-4">
              <QuickActions />
            </div>

            {/* Performance Chart */}
            {dashboardData?.performanceData && (
              <div className="order-3 lg:col-span-7">
                <PerformanceChart data={dashboardData.performanceData} />
              </div>
            )}

            {/* Notifications */}
            {dashboardData?.notifications && (
              <div className="order-4 lg:col-span-5 z-0 lg:z-10">
                <NotificationPanel notifications={dashboardData.notifications} />
              </div>
            )}

            {/* Recent Orders */}
            {dashboardData?.recentOrders && (
              <div className="order-5 lg:col-span-7">
                <RecentOrders orders={dashboardData.recentOrders} />
              </div>
            )}

            {/* Product Overview */}
            {dashboardData?.topProducts && (
              <div className="order-6 lg:col-span-5">
                <ProductOverview products={dashboardData.topProducts} />
              </div>
            )}
          </div>
        </main>
      </div>
    </RoleProtectedRoute>
  );
};

export default VendorDashboard;