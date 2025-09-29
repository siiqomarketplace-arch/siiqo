'use client'

import React, { useState, useEffect } from 'react';
// import BusinessSidebar from '@/components/ui/BusinessSidebar';
import NotificationCenter from '@/components/ui/NotificationCenter';
// import LocationHeader from '@/components/ui/LocationHeader';
import MetricsCard from './components/MetricsCard';
import DateRangeSelector from './components/DateRangeSelector';
import SalesChart from './components/SalesChart';
import CategoryBreakdown from './components/CategoryBreakdown';
import TopProductsTable from './components/TopProductsTable';
import CustomerDemographics from './components/CustomerDemographics';
import PeakHoursHeatmap from './components/PeakHoursHeatmap';
import FilterPanel from './components/FilterPanel';
import Button from '@/components/ui/new/Button';
import Icon from '@/components/AppIcon';

// Type Definitions
interface DateRange {
    startDate: Date;
    endDate: Date;
    range: string;
}

interface Filters {
    category: string;
    customerType: string;
    promotionStatus: string;
    priceRange: string;
}

interface MetricData {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    icon: string;
    color: 'success' | 'primary' | 'accent' | 'warning';
}

interface SalesChartDataPoint {
    date: string;
    revenue: number;
    orders: number;
}

interface CategoryData {
    name: string;
    value: number;
}

interface TopProduct {
    id: number;
    name: string;
    category: string;
    image: string;
    revenue: number;
    unitsSold: number;
    rating: number;
    stock: number;
}

interface CustomerDemographic {
    ageGroup: string;
    customers: number;
}

interface ReportData {
    dateRange: string;
    metrics: MetricData[];
    topProducts: TopProduct[];
    totalRevenue: string;
    totalOrders: number;
}

const BusinessAnalytics: React.FC = () => {
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        range: '7d'
    });

    const [filters, setFilters] = useState<Filters>({
        category: 'all',
        customerType: 'all',
        promotionStatus: 'all',
        priceRange: 'all'
    });

    const [isExporting, setIsExporting] = useState<boolean>(false);

    // Mock analytics data
    const metricsData: MetricData[] = [
        {
            title: 'Total Revenue',
            value: '$12,847',
            change: '+12.5%',
            changeType: 'positive',
            icon: 'DollarSign',
            color: 'success'
        },
        {
            title: 'Total Orders',
            value: '342',
            change: '+8.2%',
            changeType: 'positive',
            icon: 'ShoppingBag',
            color: 'primary'
        },
        {
            title: 'New Customers',
            value: '89',
            change: '+15.3%',
            changeType: 'positive',
            icon: 'Users',
            color: 'primary'
        },
        {
            title: 'Average Order Value',
            value: '$37.56',
            change: '-2.1%',
            changeType: 'negative',
            icon: 'TrendingUp',
            color: 'warning'
        }
    ];

    const salesChartData: SalesChartDataPoint[] = [
        { date: '2025-01-20', revenue: 1200, orders: 32 },
        { date: '2025-01-21', revenue: 1450, orders: 38 },
        { date: '2025-01-22', revenue: 1100, orders: 29 },
        { date: '2025-01-23', revenue: 1680, orders: 45 },
        { date: '2025-01-24', revenue: 1920, orders: 51 },
        { date: '2025-01-25', revenue: 2100, orders: 56 },
        { date: '2025-01-26', revenue: 1850, orders: 49 },
        { date: '2025-01-27', revenue: 2250, orders: 60 }
    ];

    const categoryData: CategoryData[] = [
        { name: 'Coffee & Beverages', value: 4850 },
        { name: 'Food Items', value: 3200 },
        { name: 'Pastries & Desserts', value: 2400 },
        { name: 'Merchandise', value: 1200 },
        { name: 'Seasonal Items', value: 800 },
        { name: 'Gift Cards', value: 397 }
    ];

    const topProductsData: TopProduct[] = [
        {
            id: 1,
            name: 'Premium Espresso Blend',
            category: 'Coffee',
            image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop',
            revenue: 2450,
            unitsSold: 245,
            rating: 4.8,
            stock: 45
        },
        {
            id: 2,
            name: 'Artisan Croissant',
            category: 'Pastries',
            image: 'https://images.unsplash.com/photo-1555507036-ab794f4ade6a?w=100&h=100&fit=crop',
            revenue: 1890,
            unitsSold: 189,
            rating: 4.6,
            stock: 23
        },
        {
            id: 3,
            name: 'Signature Latte',
            category: 'Beverages',
            image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=100&h=100&fit=crop',
            revenue: 1650,
            unitsSold: 165,
            rating: 4.7,
            stock: 0
        },
        {
            id: 4,
            name: 'Avocado Toast',
            category: 'Food',
            image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=100&h=100&fit=crop',
            revenue: 1420,
            unitsSold: 142,
            rating: 4.5,
            stock: 12
        },
        {
            id: 5,
            name: 'Cold Brew Coffee',
            category: 'Beverages',
            image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=100&h=100&fit=crop',
            revenue: 1280,
            unitsSold: 128,
            rating: 4.4,
            stock: 67
        }
    ];

    const customerDemographicsData: CustomerDemographic[] = [
        { ageGroup: '18-25', customers: 45 },
        { ageGroup: '26-35', customers: 78 },
        { ageGroup: '36-45', customers: 62 },
        { ageGroup: '46-55', customers: 34 },
        { ageGroup: '56+', customers: 23 }
    ];

    const peakHoursData: number[][] = [
        // Monday to Sunday, 24 hours each
        [0, 0, 0, 0, 0, 0, 2, 5, 8, 12, 15, 18, 22, 20, 16, 14, 12, 18, 25, 22, 15, 8, 3, 1],
        [0, 0, 0, 0, 0, 1, 3, 6, 10, 14, 17, 20, 25, 23, 18, 16, 14, 20, 28, 25, 18, 10, 4, 1],
        [0, 0, 0, 0, 0, 1, 4, 7, 11, 15, 18, 22, 27, 25, 20, 18, 16, 22, 30, 27, 20, 12, 5, 2],
        [0, 0, 0, 0, 0, 2, 5, 8, 12, 16, 20, 24, 29, 27, 22, 20, 18, 24, 32, 29, 22, 14, 6, 2],
        [0, 0, 0, 0, 0, 2, 6, 9, 13, 17, 22, 26, 31, 29, 24, 22, 20, 26, 35, 32, 25, 16, 8, 3],
        [0, 0, 0, 0, 0, 1, 3, 5, 8, 12, 16, 20, 24, 28, 32, 35, 38, 42, 45, 40, 32, 22, 12, 5],
        [0, 0, 0, 0, 0, 0, 2, 4, 6, 10, 14, 18, 22, 26, 30, 33, 36, 40, 42, 38, 30, 20, 10, 3]
    ];

    const handleDateRangeChange = (newRange: DateRange): void => {
        setDateRange(newRange);
        // In a real app, this would trigger data refetch
        console.log('Date range changed:', newRange);
    };

    const handleFiltersChange = (newFilters: Filters): void => {
        setFilters(newFilters);
        // In a real app, this would trigger filtered data fetch
        console.log('Filters changed:', newFilters);
    };

    const handleExportReport = async (): Promise<void> => {
        setIsExporting(true);

        // Simulate export process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create mock PDF report
        const reportData: ReportData = {
            dateRange: `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`,
            metrics: metricsData,
            topProducts: topProductsData.slice(0, 3),
            totalRevenue: '$12,847',
            totalOrders: 342
        };

        console.log('Exporting report:', reportData);
        setIsExporting(false);
    };

    useEffect(() => {
        // Simulate real-time data updates
        const interval = setInterval(() => {
            // In a real app, this would fetch updated metrics
            console.log('Refreshing analytics data...');
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-surface">
            {/* <BusinessSidebar /> */}

            <div className="max-w-[85vw] mx-auto">
                {/* <LocationHeader context="business" /> */}

                {/* Header */}
                <div className="bg-white border-b border-border px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary">Business Analytics</h1>
                            <p className="text-text-secondary mt-1">
                                Track your performance and make data-driven decisions
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={handleExportReport}
                                loading={isExporting}
                                iconName="FileText"
                                iconPosition="left"
                            >
                                Export Report
                            </Button>
                            <NotificationCenter userContext="business" />
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Date Range Selector */}
                    <div className="relative">
                        <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {metricsData.map((metric, index) => (
                            <MetricsCard
                                key={index}
                                title={metric.title}
                                value={metric.value}
                                change={metric.change}
                                changeType={metric.changeType}
                                icon={metric.icon}
                                color={metric.color}
                            />
                        ))}
                    </div>

                    {/* Advanced Filters */}
                    <FilterPanel onFiltersChange={handleFiltersChange} />

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2">
                            <SalesChart data={salesChartData} dateRange={dateRange.range} />
                        </div>
                        <CategoryBreakdown data={categoryData} />
                        <CustomerDemographics data={customerDemographicsData} />
                    </div>

                    {/* Peak Hours Heatmap */}
                    <PeakHoursHeatmap data={peakHoursData} />

                    {/* Top Products Table */}
                    <TopProductsTable data={topProductsData} />

                    {/* Insights Panel */}
                    <div className="bg-white rounded-lg border border-border p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Icon name="Lightbulb" size={20} className="text-warning" />
                            <h3 className="text-lg font-semibold text-text-primary">AI-Powered Insights</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Icon name="TrendingUp" size={16} className="text-success" />
                                    <span className="text-sm font-medium text-success">Growth Opportunity</span>
                                </div>
                                <p className="text-sm text-text-secondary">
                                    Your weekend evening sales are 35% higher. Consider extending hours on Fri-Sun.
                                </p>
                            </div>

                            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Icon name="AlertTriangle" size={16} className="text-warning" />
                                    <span className="text-sm font-medium text-warning">Stock Alert</span>
                                </div>
                                <p className="text-sm text-text-secondary">
                                    Signature Latte is out of stock but has high demand. Restock to avoid lost sales.
                                </p>
                            </div>

                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Icon name="Target" size={16} className="text-primary" />
                                    <span className="text-sm font-medium text-primary">Marketing Tip</span>
                                </div>
                                <p className="text-sm text-text-secondary">
                                    26-35 age group is your largest customer segment. Target them with loyalty programs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessAnalytics;