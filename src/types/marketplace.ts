export interface ApiVendor {
  business_name: string;
  email: string;
  id: number;
}

export interface ApiProduct {
  id: number;
  product_name: string;
  product_price: number;
  description: string;
  category: string;
  images: string[];
  status: string;
  visibility: boolean;
  vendor: ApiVendor;
    products: ApiProduct[];

}

export interface ApiResponse {
  count: number;
  products: ApiProduct[];
}

export interface Product {
  id: number;
  name: string;
  vendor: string;
  price: number;
  salePrice?: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  stock: number;
  category: string;
  isWishlisted: boolean;
  description: string;
  seller: string;
  distance: number;
  condition: string;
  isVerified: boolean;
  availability: string;
  location: string;
  postedDate: string;
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
    value: any;
  type: string;
  id: string;
  label: string;

}

export type SortOption =
  | "relevance"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest"
  | "popular"
  | "category";

export interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}
// Define this in your service file or types file
export interface MarketplaceSearchResponse {
  products: ApiProduct[];
  total?: number;
  
  // add other fields your API returns (e.g., categories, stores)
}