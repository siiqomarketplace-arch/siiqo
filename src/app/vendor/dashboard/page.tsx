"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import VendorHeader from "./components/VendorHeader";
import DashboardStats from "./components/DashboardStats";
import QuickActions from "./components/QuickActions";
import RecentOrders from "./components/RecentOrders";
import ProductOverview from "./components/ProductOverview";
import PerformanceChart from "./components/PerformanceChart";
import NotificationPanel from "./components/NotificationPanel";

interface PerformanceData {
  name: string;
  sales: number;
  orders: number;
}

interface VendorData {
  business_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  isVerified?: boolean;
}

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  monthlyGrowth: number;
  newCustomers: number;
  pendingOrders: number;
  lowStockItems: number;
}

interface Order {
  id: string;
  customerName: string;
  items: string[];
  total: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  orderDate: string;
  deliveryType: "delivery" | "pickup" | "in-store";
}

interface Product {
  id: string;
  name: string;
  image: string;
  orders: number;
  revenue: number;
  rating: number;
}

interface Notification {
  id: string;
  type: "order" | "review" | "inventory" | "payment" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: Order[];
  topProducts: Product[];
  performanceData: PerformanceData[];
  notifications: Notification[];
}

const VendorDashboard: React.FC = () => {
  const router = useRouter();
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [pathname, setPathname] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    // Check if vendor is authenticated
    const isLoggedIn = localStorage.getItem("isVendorLoggedIn");
    if (!isLoggedIn) {
      router.push("../auth");
      return;
    }

    // Load vendor data
    const vendor = JSON.parse(localStorage.getItem("vendorAuth") || "{}");
    setVendorData(vendor);

    // Load dashboard data
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async (): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockDashboardData: DashboardData = {
        stats: {
          totalSales: 12450,
          totalOrders: 87,
          totalProducts: 23,
          averageRating: 4.6,
          monthlyGrowth: 15.2,
          newCustomers: 34,
          pendingOrders: 5,
          lowStockItems: 3,
        },
        recentOrders: [
          {
            id: "ORD-001",
            customerName: "Sarah Johnson",
            items: ["Margherita Pizza", "Caesar Salad"],
            total: 28.5,
            status: "pending",
            orderDate: "2024-01-15T10:30:00Z",
            deliveryType: "delivery",
          },
          {
            id: "ORD-002",
            customerName: "Mike Chen",
            items: ["Smartphone Case", "Screen Protector"],
            total: 35.99,
            status: "confirmed",
            orderDate: "2024-01-15T09:15:00Z",
            deliveryType: "pickup",
          },
          {
            id: "ORD-003",
            customerName: "Emily Rodriguez",
            items: ["Hair Cut", "Hair Color"],
            total: 85.0,
            status: "completed",
            orderDate: "2024-01-14T14:20:00Z",
            deliveryType: "in-store",
          },
        ],
        topProducts: [
          {
            id: "P001",
            name: "Margherita Pizza",
            image:
              "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100",
            orders: 45,
            revenue: 675.0,
            rating: 4.8,
          },
          {
            id: "P002",
            name: "Smartphone Case",
            image:
              "https://images.unsplash.com/photo-1601593346740-925612772716?w=100",
            orders: 23,
            revenue: 459.0,
            rating: 4.5,
          },
          {
            id: "P003",
            name: "Hair Styling Service",
            image:
              "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100",
            orders: 19,
            revenue: 950.0,
            rating: 4.9,
          },
        ],
        performanceData: [
          { name: "Jan", sales: 4000, orders: 24 },
          { name: "Feb", sales: 3000, orders: 18 },
          { name: "Mar", sales: 5000, orders: 32 },
          { name: "Apr", sales: 4500, orders: 28 },
          { name: "May", sales: 6000, orders: 40 },
          { name: "Jun", sales: 5500, orders: 35 },
        ],
        notifications: [
          {
            id: "N001",
            type: "order",
            title: "New Order Received",
            message: "Order #ORD-001 from Sarah Johnson",
            timestamp: "2024-01-15T10:30:00Z",
            read: false,
          },
          {
            id: "N002",
            type: "review",
            title: "New Review",
            message: "Mike Chen left a 5-star review",
            timestamp: "2024-01-15T09:00:00Z",
            read: false,
          },
          {
            id: "N003",
            type: "inventory",
            title: "Low Stock Alert",
            message: "Pizza Dough is running low (3 items left)",
            timestamp: "2024-01-15T08:00:00Z",
            read: true,
          },
        ],
      };

      setDashboardData(mockDashboardData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    router.refresh();
  };

  useEffect(() => {
    setPathname(window.location.pathname);

    const fetchProfile = async () => {
      try {
        const res = await fetch("https://server.bizengo.com/api/user/profile", {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("vendorToken")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setVendorData(data);
      } catch (err) {
        console.error("Error fetching vendor profile:", err);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendorData || !dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary text-lg mb-4">
            Failed to load dashboard
          </p>
          <button
            onClick={() => handleRefresh}
            className="text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Vendor Dashboard - {vendorData?.first_name || "Business"}</title>
        <meta
          name="description"
          content="Manage your business, products, and orders"
        />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <main className="max-w-[85vw] mx-auto px-0 md:px-4 py-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">
              Welcome back, {vendorData?.business_name}! 👋
            </h1>
            <p className="text-text-muted">
              Here's what's happening with your business today
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-8">
              <DashboardStats stats={dashboardData.stats} />
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-4">
              <QuickActions />
            </div>

            {/* Performance Chart */}
            <div className="lg:col-span-8">
              <PerformanceChart data={dashboardData.performanceData} />
            </div>

            {/* Notifications */}
            <div className="lg:col-span-4">
              <NotificationPanel notifications={dashboardData.notifications} />
            </div>

            {/* Recent Orders */}
            <div className="lg:col-span-8">
              <RecentOrders orders={dashboardData.recentOrders} />
            </div>

            {/* Product Overview */}
            <div className="lg:col-span-4">
              <ProductOverview products={dashboardData.topProducts} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default VendorDashboard;
