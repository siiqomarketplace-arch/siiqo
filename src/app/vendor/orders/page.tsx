"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCcw, ShoppingBag } from "lucide-react";
import {vendorService} from "@/services/vendorService";
// --- Types ---
import { 
  OrderStatus, ProductOrder, Filters, Statistics, Activity 
} from "@/types/orders";

import OrderFilters from "./components/OrderFilters";
import OrderStatistics from "./components/OrderStatistics";
import BulkActionsToolbar from "./components/BulkActionsToolbar";
import OrderTable from "./components/OrderTable";
import OrderDetailModal from "./components/OrderDetailModal";
import RecentActivityFeed from "./components/RecentActivityFeed";
import QuickActions from "./components/QuickActions";
import { getVendorOrders, updateShippingStatus } from "@/services/api";
import { toast } from "sonner";

const OrderManagement: React.FC = () => {
  const router = useRouter();
  
  // --- States ---
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ProductOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    sort: "newest",
    dateRange: { from: "", to: "" },
    amountRange: { min: "", max: "" },
  });

  // --- 1. Live Data Fetching ---
const fetchOrders = async () => {
  try {
    setLoading(true);
    const response = await vendorService.getVendorOrders();
    
    // Check if response is the array directly or contains a field (like 'orders')
    const rawOrders = Array.isArray(response) ? response : (response as any).orders || [];

    const formattedOrders = rawOrders.map((order: any) => ({
      ...order,
      createdAt: new Date(order.createdAt)
    }));

    setOrders(formattedOrders);
  } catch (error) {
    console.error("Failed to fetch orders", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- 2. Live Actions ---
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateShippingStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      await fetchOrders(); // Refresh data silently
      
      // Update selected order reference if modal is open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleBulkStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      setLoading(true);
      // Process updates concurrently
      await Promise.all(selectedOrders.map(id => updateShippingStatus(id, newStatus)));
      toast.success(`Updated ${selectedOrders.length} orders`);
      setSelectedOrders([]);
      await fetchOrders();
    } catch (error) {
      toast.error("Some bulk updates failed");
    }
  };

  // --- 3. Filter & Sort Logic (Computed) ---
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(o => 
        o.orderNumber?.toLowerCase().includes(searchLower) ||
        o.customer?.name?.toLowerCase().includes(searchLower) ||
        o.customer?.email?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== "all") {
      result = result.filter(o => o.status === filters.status);
    }

    if (filters.dateRange.from) {
      result = result.filter(o => o.createdAt >= new Date(filters.dateRange.from));
    }

    if (filters.amountRange.min) {
      result = result.filter(o => o.total >= parseFloat(filters.amountRange.min));
    }

    result.sort((a, b) => {
      if (filters.sort === "newest") return b.createdAt.getTime() - a.createdAt.getTime();
      if (filters.sort === "oldest") return a.createdAt.getTime() - b.createdAt.getTime();
      if (filters.sort === "amount_high") return b.total - a.total;
      if (filters.sort === "amount_low") return a.total - b.total;
      return 0;
    });

    return result;
  }, [orders, filters]);

  // --- 4. Dynamic Statistics ---
  const calculateStatistics = (): Statistics => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const today = new Date().toDateString();
    
    return {
      totalOrders: orders.length,
      ordersChange: 0, // In a real app, you'd compare with previous period data from API
      pendingOrders: orders.filter(o => o.status === "pending").length,
      pendingChange: 0,
      revenueToday: orders
        .filter(o => o.createdAt.toDateString() === today)
        .reduce((sum, o) => sum + (o.total || 0), 0),
      revenueChange: 0,
      avgOrderValue: orders.length ? totalRevenue / orders.length : 0,
      avgOrderChange: 0,
    };
  };

  const activities: Activity[] = orders.slice(0, 5).map((o, i) => ({
    id: i,
    type: "order_placed",
    title: "Status Update",
    description: `Order #${o.orderNumber} is ${o.status}`,
    orderNumber: o.orderNumber,
    status: o.status as any,
    timestamp: o.createdAt.toISOString(),
  }));

  if (loading && orders.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <RefreshCcw className="animate-spin text-slate-400" size={32} />
        <p className="text-slate-500 font-medium">Fetching live orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto py-8 px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 mt-14 md:mt-0 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Management</h1>
            <p className="text-sm font-medium text-slate-500">Live vendor dashboard synced with Siiqo servers.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchOrders()} 
              disabled={loading}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCcw size={18} className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
              <Plus size={18} /> Create Manual Order
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <OrderStatistics statistics={calculateStatistics()} />
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-[2rem] p-2 border border-slate-100 shadow-sm mb-6">
          <OrderFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={() => setFilters({
              search: "", status: "all", sort: "newest",
              dateRange: { from: "", to: "" },
              amountRange: { min: "", max: "" },
            })}
          />
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
            <BulkActionsToolbar
              selectedCount={selectedOrders.length}
              onBulkStatusUpdate={handleBulkStatusUpdate}
              onBulkExport={(f) => console.log("Exporting...", f)}
              onClearSelection={() => setSelectedOrders([])}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <ShoppingBag size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No matching orders</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Either you have no orders yet or your filters are too strict.</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <OrderTable
                  orders={filteredOrders}
                  selectedOrders={selectedOrders}
                  onOrderSelect={(id, checked) => setSelectedOrders(prev => checked ? [...prev, id] : prev.filter(x => x !== id))}
                  onSelectAll={(checked) => setSelectedOrders(checked ? filteredOrders.map(o => o.id) : [])}
                  onStatusUpdate={handleStatusUpdate}
onViewOrder={(order: ProductOrder) => { // Explicitly type as ProductOrder
    setSelectedOrder(order); 
    setIsModalOpen(true); 
  }}                />
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <QuickActions onAction={(id) => id === "refresh" && fetchOrders()} />
            </div> */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <RecentActivityFeed activities={activities} />
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        <OrderDetailModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusUpdate={handleStatusUpdate}
          onSendMessage={(id, msg) => toast.info(`Message feature coming soon for ${id}`)}
        />
      </div>
    </div>
  );
};

export default OrderManagement;