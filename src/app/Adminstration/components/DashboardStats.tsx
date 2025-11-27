import React, { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Package, Star } from "lucide-react";

interface DashboardStatsData {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  monthlyGrowth: number;
  newCustomers: number;
  pendingOrders: number;
  lowStockItems: number;
}

interface DashboardStatsProps {
  stats: DashboardStatsData;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "warning" | "neutral";
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

import { adminService } from "@/services/adminService";

// ... (imports)

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminService.getMyProducts();

        // Handle different response structures
        if (response && Array.isArray(response.products)) {
          setProducts(response.products);
        } else if (response && Array.isArray(response)) {
          setProducts(response);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const statCards: StatCard[] = [
    {
      title: "Total Sales",
      value: `$${stats?.totalSales?.toLocaleString() || "0"}`,
      change: `+${stats?.monthlyGrowth || 0}%`,
      changeType: "positive",
      icon: DollarSign,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders?.toString() || "0",
      change: `+${stats?.newCustomers || 0} new`,
      changeType: "positive",
      icon: ShoppingCart,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      title: "Products Listed",
      value: stats?.totalProducts?.toString() || "0",
      change: `${stats?.lowStockItems || 0} low stock`,
      changeType: stats?.lowStockItems > 0 ? "warning" : "neutral",
      icon: Package,
      iconColor: "text-green-600",
      iconBg: "bg-purple-50",
    },
    {
      title: "Average Rating",
      value: stats?.averageRating?.toFixed(1) || "0.0",
      change: "Based on reviews",
      changeType: "neutral",
      icon: Star,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-50",
    },
  ];

  const getChangeColorClass = (type: StatCard["changeType"]): string => {
    switch (type) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="font-semibold text-lg text-gray-900 mb-6">
        Business Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div key={index} className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-lg ${card.iconBg} flex items-center justify-center`}
              >
                <IconComponent size={24} className={card.iconColor} />
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p
                  className={`text-sm ${getChangeColorClass(card.changeType)}`}
                >
                  {card.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {stats?.pendingOrders || 0}
            </p>
            <p className="text-sm text-gray-500">Pending Orders</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {stats?.newCustomers || 0}
            </p>
            <p className="text-sm text-gray-500">New Customers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {loading ? "..." : products.length}
            </p>
            <p className="text-sm text-gray-500">
              Active Products
              {error && (
                <span className="text-red-500 block text-xs">({error})</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {stats?.lowStockItems || 0}
            </p>
            <p className="text-sm text-gray-500">Low Stock Items</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
