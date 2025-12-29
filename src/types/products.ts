
// src/types/products.ts
export interface Product {
  id: number;
  product_name: string;
  product_price: number;
  description: string;
  category: string;
  images: string[];
  status: string;
  visibility: boolean;
  isWishlisted?: boolean;
  rating?: number;
  reviewCount?: number;
  salePrice?: number;
  originalPrice?: number;
  stock?: number;
  condition: string;
  vendor: {
    business_name: string;
    email: string;
    id: number;
  };
}

export interface APIResponse {
  count: number;
  products: Product[];
}

const DUMMY_PRODUCTS: Product[] = [
  {
    id: 1,
    product_name: "iPhone 13 Pro Max - 256GB Gold",
    product_price: 750000,
    originalPrice: 820000,
    salePrice: 750000,
    description: "Premium iPhone 13 Pro Max in excellent condition. Battery health is at 98%. Includes original box and fast charger. No scratches or dents.",
    category: "Smartphones",
    images: [
      "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=800"
    ],
    status: "active",
    visibility: true,
    isWishlisted: false,
    rating: 4.8,
    reviewCount: 24,
    stock: 5,
    vendor: {
      business_name: "Tech Haven Stores",
      email: "sales@techhaven.ng",
      id: 101,
    },
   condition: "New",

  },
  {
    id: 2,
    product_name: "Sony WH-1000XM4 Wireless Headphones",
    product_price: 220000,
    originalPrice: 250000,
    salePrice: 220000,
    description: "Industry-leading noise canceling with Dual Noise Sensor technology. Up to 30-hour battery life with quick charging.",
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800"
    ],
    status: "active",
    visibility: true,
    isWishlisted: true,
    rating: 4.9,
    reviewCount: 156,
    stock: 12,
       condition: "New",

    vendor: {
      business_name: "Gadget Hub",
      email: "contact@gadgethub.ng",
      id: 102,

    },
  },
  {
    id: 3,
    product_name: "Luxury Velvet 3-Seater Sofa",
    product_price: 450000,
    originalPrice: 500000,
    description: "Add a touch of elegance to your living room with this handcrafted velvet sofa. Deep cushions for maximum comfort.",
    category: "Home & Furniture",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800"
    ],
    status: "active",
    visibility: true,
    isWishlisted: false,
    rating: 4.5,
    reviewCount: 8,
    stock: 2,
   condition: "Like New",

    vendor: {
      business_name: "Interiors by siiqo",
      email: "info@siiqointeriors.com",
      id: 103,
    },
  },
  {
    id: 4,
    product_name: "Nike Air Jordan 1 Retro High",
    product_price: 125000,
    originalPrice: 125000,
    description: "The classic silhouette that started it all. Premium leather upper and iconic Air cushioning for all-day wear.",
    category: "Fashion",
    images: [
      "https://images.unsplash.com/photo-1584908197066-394ffac0a7b7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800"
    ],
    status: "active",
    visibility: true,
    isWishlisted: false,
    rating: 4.7,
    reviewCount: 42,
    stock: 8,
   condition: "Open Box",

    vendor: {
      business_name: "Sneaker Head",
      email: "support@sneakerhead.ng",
      id: 104,
    },
  },
  {
    id: 5,
    product_name: "MacBook Air M2 Chip - 512GB",
    product_price: 1100000,
    originalPrice: 1250000,
    salePrice: 1100000,
    description: "Strikingly thin design with the powerful M2 chip. Up to 18 hours of battery life and a stunning 13.6-inch Liquid Retina display.",
    category: "Computers",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800"
    ],
    status: "active",
    visibility: true,
    isWishlisted: false,
    rating: 5.0,
    reviewCount: 15,
    stock: 4,
   condition: "Like New",

    vendor: {
      business_name: "Apple Store NG",
      email: "orders@appleng.com",
      id: 105,
    },
  }
];
export const DUMMY_API_RESPONSE: APIResponse = {
  count: DUMMY_PRODUCTS.length,
  products: DUMMY_PRODUCTS,
};