import React from "react";
import { DollarSign, ShoppingCart, Package, Star } from "lucide-react";
import { DashboardStatsData } from "@/types/dashboard";

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

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
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
      iconColor: "text-purple-600",
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
    </div>
  );
};

export default DashboardStats;
