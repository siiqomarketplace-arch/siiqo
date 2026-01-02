export interface Product {
  id: number | string;
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
    id: number | string;
  };
}

export interface APIResponse {
  count: number;
  products: Product[];
}