export interface DashboardStatsData {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  monthlyGrowth: number;
  newCustomers: number;
  pendingOrders: number;
  lowStockItems: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: string[];
  total: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  orderDate: string;
  deliveryType: "delivery" | "pickup" | "in-store";
}

export interface Product {
  id: string | number;
  name: string;
  image: string;
  images?: { url: string }[];
  category: string;
  sku: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  stock: number;
  lowStockThreshold?: number;
  status: "active" | "draft" | "inactive" | "out-of-stock";
  createdAt: string;
  views: number;
  description?: string;
  barcode?: string;
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  orders?: number;
  revenue?: number;
  rating?: number;
}

export interface PerformanceData {
  name: string;
  sales: number;
  orders: number;
}

export interface Notification {
  id: string;
  type: "order" | "review" | "inventory" | "payment" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface DashboardData {
  stats: DashboardStatsData | null;
  recentOrders: Order[];
  topProducts: Product[];
  performanceData: PerformanceData[];
  notifications: Notification[];
}
