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
}

export interface ApiResponse {
  count: number;
  products: ApiProduct[];
}

export interface PopularItem {
  id: number;
  title: string;
  price: number;
  image: string;
  distance: string;
  seller: string;
  rating: number;
  reviews: number;
  popularity: number;
  category: string;
  description: string;
}