export interface ApiProductFull {
  id: number | string;
  product_name: string;
  description: string;
  product_price: number;
  category: string;
  images: string[];
  status: string;
  visibility: boolean;
  discount?: number;
  condition?: string;
  rating?: number;
  review_count?: number;
  distance?: number;
  location?: {
    address: string;
    lat: number;
    lng: number;
  };
  seller?: {
    id: number | string;
    name: string;
    avatar?: string;
    rating?: number;
    review_count?: number;
    response_time?: string;
    member_since?: string;
    verified?: boolean;
  };
  availability?: string;
  last_updated?: string | Date;
  views?: number;
  watchers?: number;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discount?: number;
  condition: string;
  rating: number;
  reviewCount: number;
  distance: number;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  images: string[];
  description: string;
  specifications: { [key: string]: string };
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    responseTime: string;
    memberSince: string;
    verifiedSeller: boolean;
  };
  availability: string;
  lastUpdated: Date;
  views: number;
  watchers: number;
}

export interface PriceComparisonItem {
  id: string;
  seller: string;
  price: number;
  condition: string;
  distance: number;
  rating: number;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}
