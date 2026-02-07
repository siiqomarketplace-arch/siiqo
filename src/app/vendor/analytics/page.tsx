"use client";

import React, { useState, useEffect, useCallback } from "react";
import NotificationCenter from "@/components/ui/NotificationCenter";
import MetricsCard from "./components/MetricsCard";
import DateRangeSelector from "./components/DateRangeSelector";
import SalesChart from "./components/SalesChart";
import CategoryBreakdown from "./components/CategoryBreakdown";
import TopProductsTable from "./components/TopProductsTable";
import FilterPanel from "./components/FilterPanel";
import Button from "@/components/ui/new/Button";
import Icon from "@/components/AppIcon";

// API Services
import {
  revenueAnalytics,
  getVendorOrders,
  getMyProducts,
} from "@/services/api";
import { toast } from "sonner";

const BusinessAnalytics: React.FC = () => {
  // --- States ---
  const [loading, setLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // API Data States
  const [metrics, setMetrics] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]); // Store all products
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<any>({
    category: "all",
    priceRange: "all",
  });

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    range: "7d",
  });

  // --- Data Fetching Logic ---
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const startStr = dateRange.startDate.toISOString().split("T")[0];
      const endStr = dateRange.endDate.toISOString().split("T")[0];

      // 1. Fetch Revenue Analytics
      const revRes = await revenueAnalytics({
        start_date: startStr,
        end_date: endStr,
      });
      const summary = revRes.data.summary;

      // 2. Map API Summary to Metrics Cards
      const liveMetrics = [
        {
          title: "Total Revenue",
          value: `${summary.currency} ${summary.total_revenue.toLocaleString()}`,
          change: "Live", // You can calculate % change if API provides prev_period
          changeType: "positive",
          icon: "DollarSign",
          color: "success",
        },
        {
          title: "Total Orders",
          value: summary.orders_count.toString(),
          change: "Settled",
          changeType: "positive",
          icon: "ShoppingBag",
          color: "primary",
        },
        {
          title: "Pending Revenue",
          value: `${summary.currency} ${summary.pending_revenue.toLocaleString()}`,
          change: "In Escrow",
          changeType: "neutral",
          icon: "Clock",
          color: "warning",
        },
        {
          title: "Pending Orders",
          value: summary.pending_count.toString(),
          change: "Action Required",
          changeType: "negative",
          icon: "Package",
          color: "accent",
        },
      ];
      setMetrics(liveMetrics);

      // 3. Fetch Top Products (Derived from your products API)
      const prodRes = await getMyProducts();
      const allProductsData = prodRes.data.data || prodRes.data || [];
      setAllProducts(allProductsData);

      // Apply filters to products
      const filteredProducts = applyFilters(allProductsData, activeFilters);
      setTopProducts(filteredProducts.slice(0, 10));

      // 4. Chart Data (Note: Use revRes.data.daily_breakdown if available in your API)
      setChartData(revRes.data.breakdown || []);
    } catch (error) {
      toast.error("Failed to sync with live servers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, activeFilters]);

  // Apply filters to products
  const applyFilters = (products: any[], filters: any) => {
    let filtered = [...products];

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(
        (p) => p.category?.toLowerCase() === filters.category.toLowerCase(),
      );
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      filtered = filtered.filter((p) => {
        const price = p.final_price || p.price || 0;
        switch (filters.priceRange) {
          case "under1000":
            return price < 1000;
          case "1000to5000":
            return price >= 1000 && price <= 5000;
          case "5000to10000":
            return price >= 5000 && price <= 10000;
          case "over10000":
            return price > 10000;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  // Handle filter changes
  const handleFiltersChange = (filters: any) => {
    setActiveFilters(filters);
    // Apply filters to current products immediately
    const filteredProducts = applyFilters(allProducts, filters);
    setTopProducts(filteredProducts.slice(0, 10));
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      // Generate comprehensive CSV report with all analytics data
      const startStr = dateRange.startDate.toISOString().split("T")[0];
      const endStr = dateRange.endDate.toISOString().split("T")[0];

      // Create comprehensive report
      const reportLines: string[] = [];

      // Add header
      reportLines.push("Siiqo Business Analytics Report");
      reportLines.push(`Period: ${startStr} to ${endStr}`);
      reportLines.push(`Generated: ${new Date().toLocaleString()}`);
      reportLines.push("");

      // Add Summary Metrics
      reportLines.push("SUMMARY METRICS");
      reportLines.push("Metric,Value,Status");
      metrics.forEach((metric) => {
        reportLines.push(
          `"${metric.title}","${metric.value}","${metric.change}"`,
        );
      });
      reportLines.push("");

      // Add Top Products
      reportLines.push("TOP PRODUCTS");
      reportLines.push("Product Name,Category,Price,Stock,SKU,Status");
      topProducts.forEach((product) => {
        const name = `"${(product.name || "Unknown").replace(/"/g, '""')}"`;
        const category = product.category || "Uncategorized";
        const price = product.final_price || product.price || 0;
        const stock = product.quantity || product.stock || 0;
        const sku = product.sku || "N/A";
        const status = product.status || "active";
        reportLines.push(
          `${name},${category},${price},${stock},${sku},${status}`,
        );
      });
      reportLines.push("");

      // Add Daily Revenue Breakdown if available
      if (chartData && chartData.length > 0) {
        reportLines.push("DAILY REVENUE BREAKDOWN");
        reportLines.push("Date,Revenue,Orders");
        chartData.forEach((day: any) => {
          reportLines.push(
            `${day.date || day.day},${day.revenue || 0},${day.orders || day.orders_count || 0}`,
          );
        });
      }

      // Create and download the report
      const csvContent = reportLines.join("\\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-report-${startStr}-to-${endStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-8 mt-14 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Business Insights
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Live data from your Siiqo storefront.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExportReport}
              loading={isExporting}
              iconName="Download"
            >
              Export Report (CSV)
            </Button>
            {/* <NotificationCenter userContext="business" /> */}
          </div>
        </div>

        <div className="space-y-6 pb-12">
          {/* Date Selector triggers re-fetch via useEffect */}
          <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm inline-block">
            <DateRangeSelector
              onDateRangeChange={(range) => setDateRange(range as any)}
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <MetricsCard key={index} {...metric} isLoading={loading} />
            ))}
          </div>

          <FilterPanel onFiltersChange={handleFiltersChange} />

          {/* Main Analytics Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="font-bold mb-4">Revenue Trend</h3>
                <SalesChart data={chartData} isLoading={loading} />
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="font-bold mb-4">Category Performance</h3>
                <CategoryBreakdown isLoading={loading} />
              </div>
            </div>
          </div>

          {/* Tables */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg">Top Performing Products</h3>
              {/* <button className="text-sm font-bold text-blue-600">View Catalog</button> */}
            </div>
            <TopProductsTable data={topProducts} isLoading={loading} />
          </div>

          {/* AI Insights (Static logic based on Live Data) */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <div className="flex items-center gap-2 mb-6">
              <Icon name="Lightbulb" className="text-yellow-400" />
              <h3 className="text-xl font-bold">Smart Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InsightCard
                title="Inventory Alert"
                text={
                  topProducts.find((p) => p.stock < 5)
                    ? `Low stock on ${topProducts.find((p) => p.stock < 5).name}.`
                    : "All top products are well stocked."
                }
                type="warning"
              />
              <InsightCard
                title="Sales Peak"
                text="Your orders typically peak between 12 PM and 2 PM."
                type="info"
              />
              <InsightCard
                title="Revenue Goal"
                text={`You are at ${metrics[0]?.value || 0} this period. Keep it up!`}
                type="success"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightCard = ({
  title,
  text,
  type,
}: {
  title: string;
  text: string;
  type: string;
}) => (
  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
    <h4 className="font-bold mb-2 text-white/90">{title}</h4>
    <p className="text-sm text-white/60">{text}</p>
  </div>
);

export default BusinessAnalytics;
