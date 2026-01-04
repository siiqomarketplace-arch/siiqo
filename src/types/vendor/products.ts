// types/vendor/products.ts

export type ProductStatus = "active" | "draft" | "inactive" | "out-of-stock";
export type ViewMode = "table" | "grid";
export type BulkAction = "activate" | "deactivate" | "duplicate" | "delete" | "export";

export interface Product {
  id:  number;
  name: string;
  image: string;
  images?: ProductImage[];
  category: string;
  sku: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  stock: number;
  lowStockThreshold?: number;
  status: ProductStatus;
  createdAt: string;
  views: number;
  description?: string;
  barcode?: string;
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  orders?: number;
  revenue?: number;
  rating?: number;
}

export interface AddProductRequest {
  product_name: string;
  description: string;
  category: string;
  product_price: number;
  status: string;
  visibility: boolean;
  images: string[];
  quantity: number;
}

export interface EditProductRequest extends Partial<AddProductRequest> {}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: string;
}
export interface ProductImage {
  id: number;
  url: string;
  alt: string;
  file?: File;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  comparePrice: string;
  cost: string;
  sku: string;
  barcode: string;
  stock: string;
  lowStockThreshold: string;
  weight: string;
  dimensions: { length: string; width: string; height: string };
  status: ProductStatus;
  visibility: "visible" | "hidden";
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  images: ProductImage[];
}

export interface VendorData {
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
  isVerified: boolean;
}
