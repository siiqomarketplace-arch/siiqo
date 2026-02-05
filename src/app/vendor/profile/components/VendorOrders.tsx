"use client";

import React, { useState, useEffect } from "react";
import { vendorService } from "@/services/vendorService";
import { toast } from "sonner";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";

interface Order {
  id: string;
  orderId?: string;
  customer_name?: string;
  customer?: { name: string };
  total: number;
  status: string;
  createdAt: string | Date;
  items?: any[];
  products?: any[];
  product_image?: string;
}

const VendorOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getVendorOrders();

      const rawOrders = Array.isArray(response)
        ? response
        : (response as any).orders || [];
      const formattedOrders = rawOrders.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt || order.created_at),
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error(
        "Failed to load orders...Not your problem, it's ours... Try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "delivered":
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "shipped":
      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "cancelled":
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500 font-medium">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon name="ShoppingBag" size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          No Recent Orders
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          You haven't received any orders yet. Your orders will appear here once
          customers start purchasing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-500">
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh orders"
        >
          <Icon name="RefreshCcw" size={18} className="text-gray-600" />
        </button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const customerName =
            order.customer_name || order.customer?.name || "Unknown Customer";
          const firstProduct = order.items?.[0] || order.products?.[0];
          const itemCount = order.items?.length || order.products?.length || 1;

          return (
            <div
              key={order.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all bg-white"
            >
              <div className="flex items-start gap-4">
                {/* Product Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {firstProduct?.image ||
                  firstProduct?.product_image ||
                  order.product_image ? (
                    <Image
                      src={
                        firstProduct?.image ||
                        firstProduct?.product_image ||
                        order.product_image
                      }
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon
                        name="Package"
                        size={24}
                        className="text-gray-400"
                      />
                    </div>
                  )}
                </div>

                {/* Order Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        Order #{order.orderId || order.id?.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-500">{customerName}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Icon name="Package" size={14} />
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900">
                      ₦{(order.total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VendorOrders;
