"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCcw, Search, Filter, Package, ShoppingBag, DollarSign, BarChart3 } from "lucide-react";

// --- Types (Simplified for LocalStorage Logic) ---
import { 
  OrderStatus, ProductOrder, Filters, Statistics, Activity, ExportFormat 
} from "@/types/orders";

import OrderFilters from "./components/OrderFilters";
import OrderStatistics from "./components/OrderStatistics";
import BulkActionsToolbar from "./components/BulkActionsToolbar";
import OrderTable from "./components/OrderTable";
import OrderDetailModal from "./components/OrderDetailModal";
import RecentActivityFeed from "./components/RecentActivityFeed";
import QuickActions from "./components/QuickActions";

const STORAGE_KEY = "vendor_orders_mock";

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

  // --- 1. Initial Load Logic (LocalStorage) ---
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      const savedData = localStorage.getItem(STORAGE_KEY);
      
      if (savedData) {
        // Parse dates back to Date objects
        const parsed: ProductOrder[] = JSON.parse(savedData).map((o: any) => ({
          ...o,
          createdAt: new Date(o.createdAt)
        }));
        setOrders(parsed);
      } else {
        // Seed initial data if empty
        const initialMock: ProductOrder[] = [
          {
            id: "1",
            orderNumber: "ORD-000452",
            customer: { name: "Sarah Connor", email: "sarah@sky.net" },
            items: [{ id: 1, name: "Premium Headphones", quantity: 1, price: 299, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" }],
            subtotal: 299, shipping: 10, tax: 22, total: 331,
            status: "pending",
            createdAt: new Date(),
            shippingAddress: { name: "Sarah Connor", street: "123 Resistance Way", city: "LA", state: "CA", zipCode: "90001", country: "USA" },
            customerNotes: "Please leave at the back door.",
            trackingNumber: null
          },
          {
            id: "2",
            orderNumber: "ORD-000453",
            customer: { name: "James Holden", email: "holden@rocinante.com" },
            items: [{ id: 2, name: "Coffee Machine", quantity: 1, price: 150, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" }],
            subtotal: 150, shipping: 0, tax: 11, total: 161,
            status: "processing",
            createdAt: new Date(Date.now() - 86400000), // Yesterday
            shippingAddress: { name: "James Holden", street: "Ceres Station", city: "Belt", state: "Asteroid", zipCode: "00001", country: "Sol" },
            customerNotes: null,
            trackingNumber: "TRK12345678"
          }
        ];
        saveToStorage(initialMock);
        setOrders(initialMock);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const saveToStorage = (data: ProductOrder[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  // --- 2. Filter & Sort Logic ---
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(o => 
        o.orderNumber.toLowerCase().includes(searchLower) ||
        o.customer.name.toLowerCase().includes(searchLower) ||
        o.customer.email.toLowerCase().includes(searchLower)
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

    // Sort
    result.sort((a, b) => {
      if (filters.sort === "newest") return b.createdAt.getTime() - a.createdAt.getTime();
      if (filters.sort === "oldest") return a.createdAt.getTime() - b.createdAt.getTime();
      if (filters.sort === "amount_high") return b.total - a.total;
      if (filters.sort === "amount_low") return a.total - b.total;
      return 0;
    });

    return result;
  }, [orders, filters]);

  // --- 3. Handlers ---
  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    saveToStorage(updated);
  };

  const handleBulkStatusUpdate = (newStatus: OrderStatus) => {
    const updated = orders.map(o => selectedOrders.includes(o.id) ? { ...o, status: newStatus } : o);
    setOrders(updated);
    saveToStorage(updated);
    setSelectedOrders([]);
  };

  const calculateStatistics = (): Statistics => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    return {
      totalOrders: orders.length,
      ordersChange: 12,
      pendingOrders: orders.filter(o => o.status === "pending").length,
      pendingChange: -5,
      revenueToday: orders.filter(o => o.createdAt.toDateString() === new Date().toDateString()).reduce((sum, o) => sum + o.total, 0),
      revenueChange: 8.4,
      avgOrderValue: orders.length ? totalRevenue / orders.length : 0,
      avgOrderChange: 2.1,
    };
  };

  const activities: Activity[] = orders.slice(0, 5).map((o, i) => ({
    id: i,
    type: "order_placed",
    title: "Order Update",
    description: `${o.customer.name}'s order is ${o.status}`,
    orderNumber: o.orderNumber,
    status: o.status,
    timestamp: o.createdAt.toISOString(),
  }));

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto py-8 px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 mt-14 md:mt-0 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Management</h1>
            <p className="text-sm font-medium text-slate-500">Manage your sales, fulfillments and customer interactions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <RefreshCcw size={18} className="text-slate-600" />
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
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <OrderTable
                  orders={filteredOrders}
                  selectedOrders={selectedOrders}
                  onOrderSelect={(id, checked) => setSelectedOrders(prev => checked ? [...prev, id] : prev.filter(x => x !== id))}
                  onSelectAll={(checked) => setSelectedOrders(checked ? filteredOrders.map(o => o.id) : [])}
                  onStatusUpdate={handleStatusUpdate}
                  onViewOrder={(o) => { setSelectedOrder(o); setIsModalOpen(true); }}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
               <QuickActions onAction={(id) => id === "refresh" && window.location.reload()} />
            </div>
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
          onSendMessage={(id, msg) => alert(`Message sent for ${id}`)}
        />
      </div>
    </div>
  );
};

export default OrderManagement;