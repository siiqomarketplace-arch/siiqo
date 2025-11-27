export interface Customer {
  name: string;
  email: string;
  phone?: string;
}

export interface ProductOrderItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface ProductOrder {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: ProductOrderItem[] | any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  shippingAddress: ShippingAddress;
  customerNotes?: string | null;
  trackingNumber?: string | null;
}

export interface ApiOrderItem {
  price: number;
  product_name: string;
  quantity: number;
  status?: string;
}

export interface ApiOrder {
  buyer_email: string;
  buyer_id: number;
  buyer_name: string;
  created_at: string;
  items: ApiOrderItem[];
  order_id: number;
  status: string;
}

export interface ApiOrdersResponse {
  orders: ApiOrder[];
}

export interface ApiOrderDetailsResponse {
  buyer_email: string;
  buyer_id: number;
  buyer_name: string;
  created_at: string;
  items: ApiOrderItem[];
  order_id: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface AmountRange {
  min: string;
  max: string;
}

export type SortOption = "newest" | "oldest" | "amount_high" | "amount_low" | string;

export interface Filters {
  search: string;
  status: string;
  sort: SortOption;
  dateRange: DateRange;
  amountRange: AmountRange;
}

export interface Statistics {
  totalOrders: number;
  ordersChange: number;
  pendingOrders: number;
  pendingChange: number;
  revenueToday: number;
  revenueChange: number;
  avgOrderValue: number;
  avgOrderChange: number;
}

export type ActivityType =
  | "order_placed"
  | "status_updated"
  | "payment_received"
  | "message_received";

export interface Activity {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  orderNumber: string;
  status?: OrderStatus;
  timestamp: string;
}

export type ExportFormat = "csv" | "xlsx" | "pdf";

export interface VendorData {
  businessName?: string;
  [key: string]: any;
}
