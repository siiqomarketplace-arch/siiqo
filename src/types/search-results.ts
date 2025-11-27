export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  seller: string;
  rating: number;
  reviewCount: number;
  distance: number;
  condition: string;
  category: string;
  isVerified: boolean;
  availability: string;
  location: string;
  postedDate: string;
}

export interface Filter {
  type: string;
  label: string;
  value: any;
  id: string;
}

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
