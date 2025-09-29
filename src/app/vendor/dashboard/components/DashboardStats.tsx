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

class ProductApiService {
  private static baseUrl = "https://server.bizengo.com/api/vendor";

  private static async getAuthToken(): Promise<string> {
    if (typeof window === "undefined") {
      return ""; // Return empty string on server-side
    }

    // Check localStorage first
    const storedToken = window.localStorage.getItem("vendorToken");

    if (storedToken && storedToken !== "null") {
      try {
        const tokenPayload = JSON.parse(atob(storedToken.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (tokenPayload.exp && tokenPayload.exp > currentTime) {
          console.log("Using stored token");
          return storedToken;
        }
      } catch (e) {
        console.log("Invalid stored token");
      }
    }

    // Use your NEW token as fallback (but this will also expire)
    const newToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1NTg0OTUwMCwianRpIjoiYWNkZmYzNjUtNGVhZC00NDgzLWE3ZjgtZTlkYzk1NTIzNzRhIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJpZCI6Miwicm9sZSI6InZlbmRvciJ9LCJuYmYiOjE3NTU4NDk1MDAsImNzcmYiOiJlZmNjNjczZS1mMTdkLTQ5NmMtOWY5Yi1hYjg1NjExYTE4YjEiLCJleHAiOjE3NTU5MzU5MDB9.kBBHDyU8cLXc-A-XJR3CJoi7t9-Bs4YDdaBwuInJFjg";

    // Store it for future use
    if (typeof window !== "undefined") {
      window.localStorage.setItem("authToken", newToken);
    }
    return newToken;
  }

  // Updated request method with better error handling
  private static async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  static async getMyProducts(): Promise<any> {
    console.log("Fetching vendor products...");
    try {
      const response = await this.request("/my-products", {
        method: "GET",
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      return { products: [] }; // Return empty array as fallback
    }
  }

  // Helper method to convert File to base64
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  // Method to manually login and get a fresh token
  static async login(email: string, password: string): Promise<string> {
    try {
      const response = await fetch(
        "https://server.bizengo.com/api/vendor/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      if (data.access_token) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("authToken", data.access_token);
        }
        return data.access_token;
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }
}

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
        const response = await ProductApiService.getMyProducts();

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
