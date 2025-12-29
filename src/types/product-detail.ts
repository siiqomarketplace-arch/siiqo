// src/types/product-detail.ts
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

// Dummy Data for Product Detail
export const DUMMY_API_DETAIL_STORE: ApiProductFull[] = [
  {
    id: 1,
    product_name: "iPhone 13 Pro Max - 256GB Gold",
    description: "Premium iPhone 13 Pro Max in excellent condition. Battery health is at 98%. Includes original box and fast charger. No scratches or dents. This device is factory unlocked and supports 5G networks globally.",
    product_price: 75000000, // Becomes ₦750,000.00 after /100
    category: "Smartphones",
    images: [
      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512499617640-c74ae3a49dd5?auto=format&fit=crop&q=80&w=800"
    ],
    status: "active",
    visibility: true,
    discount: 15,
    condition: "Like New",
    rating: 4.8,
    review_count: 24,
    distance: 1.2,
    location: {
      address: "Ikeja City Mall, Ikeja, Lagos",
      lat: 6.6018,
      lng: 3.3515
    },
    seller: {
      id: "v_101",
      name: "Tech Haven Stores",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      rating: 4.9,
      review_count: 150,
      response_time: "Within 5 mins",
      member_since: "Oct 2021",
      verified: true
    },
    availability: "Available",
    last_updated: "2023-11-20T10:00:00Z",
    views: 1240,
    watchers: 45
  },
  {
    id: 2,
    product_name: "Sony WH-1000XM4 Wireless Headphones",
    description: "Industry-leading noise canceling with Dual Noise Sensor technology. Next-level music with Edge-AI. Up to 30-hour battery life with quick charging (10 min charge for 5 hours of playback). Touch sensor controls to pause play skip tracks, control volume, activate your voice assistant, and answer phone calls.",
    product_price: 22000000, // Becomes ₦220,000.00 after /100
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800"
    ],
    status: "active",
    visibility: true,
    discount: 10,
    condition: "New",
    rating: 4.9,
    review_count: 85,
    distance: 2.5,
    location: {
      address: "Adetokunbo Ademola St, Victoria Island, Lagos",
      lat: 6.4281,
      lng: 3.4219
    },
    seller: {
      id: "v_102",
      name: "Gadget Hub",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop",
      rating: 4.7,
      review_count: 320,
      response_time: "Within 1 hour",
      member_since: "Jan 2022",
      verified: true
    },
    availability: "Available",
    last_updated: "2023-11-25T14:30:00Z",
    views: 890,
    watchers: 12
  },
  {
    id: 3,
    product_name: "MacBook Air M2 Chip",
    description: "Strikingly thin design. M2 chip for incredible speed and power efficiency. 13.6-inch Liquid Retina display with 500 nits of brightness and P3 wide color. 1080p FaceTime HD camera. Four-speaker sound system with Spatial Audio.",
    product_price: 120000000, // Becomes ₦1,200,000.00 after /100
    category: "Computers",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800"
    ],
    status: "active",
    visibility: true,
    discount: 5,
    condition: "New",
    rating: 5.0,
    review_count: 12,
    distance: 0.8,
    location: {
      address: "Lekki Phase 1, Lagos",
      lat: 6.4478,
      lng: 3.4737
    },
    seller: {
      id: "v_103",
      name: "Apple Store NG",
      avatar: "", // Testing initial fallback logic
      rating: 5.0,
      review_count: 500,
      response_time: "Instant",
      member_since: "May 2020",
      verified: true
    },
    availability: "Available",
    last_updated: "2023-11-26T09:15:00Z",
    views: 3400,
    watchers: 120
  }
];

// Market Comparisons
export const DUMMY_PRICE_COMPARISONS: PriceComparisonItem[] = [
  {
    id: "comp_1",
    seller: "Mobile World",
    price: 720000,
    condition: "New",
    distance: 1.5,
    rating: 4.6
  },
  {
    id: "comp_2",
    seller: "Phone Paradise",
    price: 745000,
    condition: "New",
    distance: 2.3,
    rating: 4.4
  },
  {
    id: "comp_3",
    seller: "Second Life Tech",
    price: 680000,
    condition: "Open Box",
    distance: 3.1,
    rating: 4.7
  }
];

// Sample Notifications
export const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "notif_1",
    type: "success",
    message: "Item added to your wishlist successfully!"
  },
  {
    id: "notif_2",
    type: "error",
    message: "Unable to process payment. Please try again."
  },
  {
    id: "notif_3",
    type: "info",
    message: "The seller usually responds within 5 minutes."
  }
];