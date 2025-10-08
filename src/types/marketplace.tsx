export interface Product {
  id: any;
  name: string;
  vendor: string;
  price: number;
  salePrice?: number;
  originalPrice?: any;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  stock: number;
  category: string;
  isWishlisted?: boolean;
  description: string;
}

export interface PriceRange {
  min: string;
  max: string;
}

export interface AvailabilityFilters {
  inStock: boolean;
  onSale: boolean;
  freeShipping: boolean;
}

export interface Filters {
  categories: string[];
  vendors: string[];
  priceRange: PriceRange;
  minRating: number;
  availability: AvailabilityFilters;
}

export type SortOption =
  | "relevance"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest"
  | "popular"
  | "category";

export interface ApiVendor {
  business_name: string;
  email: string;
  id: number;
}

export interface ApiProduct {
  category: string;
  id: number;
  images: string[];
  product_name: string;
  product_price: number;
  vendor: ApiVendor;
  description?: string;
  status?: string;
  visibility?: boolean;
}

export interface ApiResponse {
  count: number;
  products: ApiProduct[];
}

export interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}
