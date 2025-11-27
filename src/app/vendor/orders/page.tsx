"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { vendorService } from "@/services/vendorService";
import {
  Customer,
  ProductOrderItem,
  ShippingAddress,
  OrderStatus,
  ProductOrder,
  ApiOrderItem,
  ApiOrder,
  ApiOrdersResponse,
  ApiOrderDetailsResponse,
  DateRange,
  AmountRange,
  SortOption,
  Filters,
  Statistics,
  ActivityType,
  Activity,
  ExportFormat,
  VendorData,
} from "@/types/orders";
import OrderFilters from "./components/OrderFilters";
import OrderStatistics from "./components/OrderStatistics";
import BulkActionsToolbar from "./components/BulkActionsToolbar";
import OrderTable from "./components/OrderTable";
import OrderDetailModal from "./components/OrderDetailModal";
import RecentActivityFeed from "./components/RecentActivityFeed";
import QuickActions from "./components/QuickActions";

const OrderManagement: React.FC = () => {
  const router = useRouter();
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ProductOrder[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ProductOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    sort: "newest",
    dateRange: {
      from: "",
      to: "",
    },
    amountRange: {
      min: "",
      max: "",
    },
  });

  const transformApiOrderToProductOrder = (
    apiOrder: ApiOrder | ApiOrderDetailsResponse
  ): ProductOrder => {
    const subtotal = apiOrder.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 5000 ? 0 : 1000;
    const tax = subtotal * 0.075;
    const total = subtotal + shipping + tax;

    const transformedItems: ProductOrderItem[] = apiOrder.items.map(
      (item, index) => ({
        id: index + 1,
        name: item.product_name,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        quantity: item.quantity,
        price: item.price / 100,
      })
    );

    let orderStatus: OrderStatus = "pending";
    if ("status" in apiOrder && apiOrder.status) {
      orderStatus = apiOrder.status as OrderStatus;
    } else if (apiOrder.items.length > 0 && apiOrder.items[0].status) {
      orderStatus = apiOrder.items[0].status as OrderStatus;
    }

    return {
      id: apiOrder.order_id.toString(),
      orderNumber: `ORD-${apiOrder.order_id.toString().padStart(6, "0")}`,
      customer: {
        name: apiOrder.buyer_name,
        email: apiOrder.buyer_email,
        phone: undefined,
      },
      items: transformedItems,
      subtotal: subtotal / 100,
      shipping: shipping / 100,
      tax: tax / 100,
      total: total / 100,
      status: orderStatus,
      createdAt: new Date(apiOrder.created_at),
      shippingAddress: {
        name: apiOrder.buyer_name,
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Nigeria",
        phone: undefined,
      },
      customerNotes: null,
      trackingNumber: null,
    };
  };

  const fetchOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response: ApiOrdersResponse = await vendorService.getVendorOrders();

      const transformedOrders = response.orders.map(
        transformApiOrderToProductOrder
      );

      setOrders(transformedOrders);
      setFilteredOrders(transformedOrders);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch orders";
      setError(errorMessage);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (orders: ProductOrder[]): Statistics => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const pendingOrders = orders.filter((order) => order.status === "pending");
    const revenueToday = todayOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      totalOrders: orders.length,
      ordersChange: 0,
      pendingOrders: pendingOrders.length,
      pendingChange: 0,
      revenueToday: revenueToday,
      revenueChange: 0,
      avgOrderValue: avgOrderValue,
      avgOrderChange: 0,
    };
  };

  const generateActivities = (orders: ProductOrder[]): Activity[] => {
    const activities: Activity[] = [];

    orders.slice(0, 4).forEach((order, index) => {
      activities.push({
        id: index + 1,
        type: "order_placed",
        title: "New Order Received",
        description: `${order.customer.name} placed a new order`,
        orderNumber: order.orderNumber,
        status: order.status,
        timestamp: order.createdAt.toISOString(),
      });
    });

    return activities;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = [...orders];

    if (filters.search) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          order.customer.name
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          order.customer.email
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((order) => order.status === filters.status);
    }

    if (filters.dateRange.from) {
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= new Date(filters.dateRange.from)
      );
    }
    if (filters.dateRange.to) {
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) <= new Date(filters.dateRange.to)
      );
    }

    if (filters.amountRange.min) {
      filtered = filtered.filter(
        (order) => order.total >= parseFloat(filters.amountRange.min)
      );
    }
    if (filters.amountRange.max) {
      filtered = filtered.filter(
        (order) => order.total <= parseFloat(filters.amountRange.max)
      );
    }

    filtered.sort((a, b) => {
      switch (filters.sort) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "amount_high":
          return b.total - a.total;
        case "amount_low":
          return a.total - b.total;
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    setFilteredOrders(filtered);
  }, [orders, filters]);

  const handleFiltersChange = (newFilters: Filters): void => {
    setFilters(newFilters);
  };

  const handleClearFilters = (): void => {
    setFilters({
      search: "",
      status: "all",
      sort: "newest",
      dateRange: { from: "", to: "" },
      amountRange: { min: "", max: "" },
    });
  };

  const handleOrderSelect = (orderId: string, isSelected: boolean): void => {
    if (isSelected) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    }
  };

  const handleSelectAll = (isSelected: boolean): void => {
    if (isSelected) {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ): Promise<void> => {
    try {
      await vendorService.updateOrderStatus(orderId, newStatus);
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      fetchOrders();
    }
  };

  const handleBulkStatusUpdate = (newStatus: OrderStatus): void => {
    setOrders(
      orders.map((order) =>
        selectedOrders.includes(order.id)
          ? { ...order, status: newStatus }
          : order
      )
    );
    setSelectedOrders([]);
  };

  const handleBulkExport = (format: ExportFormat): void => {
    console.log(`Exporting ${selectedOrders.length} orders as ${format}`);
  };

  const handleViewOrder = (order: ProductOrder): void => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleSendMessage = (orderId: string, message: string): void => {
    console.log(`Sending message to order ${orderId}: ${message}`);
  };

  const handleQuickAction = (actionId: string): void => {
    if (actionId === "refresh") {
      fetchOrders();
    }
    else {
      console.log(`Quick action: ${actionId}`);
    }
  };

  const handleRetry = (): void => {
    fetchOrders();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Loading Orders...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we fetch your orders
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold mb-2">Error Loading Orders</h2>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statistics = calculateStatistics(orders);
  const activities = generateActivities(orders);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[85vw] mx-auto py-6 px-0 md:px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Order Management
            </h1>
            <p className="text-muted-foreground">
              Track, process, and fulfill customer orders efficiently
            </p>
          </div>
          <button
            onClick={() => fetchOrders()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        <OrderStatistics statistics={statistics} />

        <OrderFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        <BulkActionsToolbar
          selectedCount={selectedOrders.length}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onBulkExport={handleBulkExport}
          onClearSelection={() => setSelectedOrders([])}
        />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            {orders.length === 0 ? (
              <div className="bg-card rounded-lg border p-8 text-center">
                <div className="text-muted-foreground mb-4">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Orders Found
                  </h3>
                  <p>
                    You don't have any orders yet. Orders will appear here once
                    customers start purchasing your products.
                  </p>
                </div>
              </div>
            ) : (
              <OrderTable
                orders={filteredOrders}
                selectedOrders={selectedOrders}
                onOrderSelect={handleOrderSelect}
                onSelectAll={handleSelectAll}
                onStatusUpdate={handleStatusUpdate}
                onViewOrder={handleViewOrder}
              />
            )}
          </div>

          <div className="space-y-6">
            <QuickActions onAction={handleQuickAction} />
            <RecentActivityFeed activities={activities} />
          </div>
        </div>

        <OrderDetailModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusUpdate={handleStatusUpdate}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default OrderManagement;
