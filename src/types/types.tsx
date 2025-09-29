// src/types.ts

export interface ProductLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  memberSince: string;
  verifiedSeller: boolean;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discount: number;
  condition: string;
  rating: number;
  reviewCount: number;
  distance: number;
  location: ProductLocation;
  images: string[];
  description: string;
  specifications: { [key: string]: string };
  seller: Seller;
  availability: string;
  lastUpdated: Date;
  views: number;
  watchers: number;
}
