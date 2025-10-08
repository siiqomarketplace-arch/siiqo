export interface AddProductRequest {
    product_name: string;
    description: string;
    category: string;
    product_price: number;
    status: string;
    visibility: boolean;
    images: string[];
    quantity?: number;
    stock?: number;
    sku?: string;
    barcode?: string;
    weight?: number;
    compare_price?: number;
    cost?: number;
}

export interface EditProductRequest extends AddProductRequest { }

export interface ApiErrorResponse {
    message?: string;
    error?: string;
    status?: string;
}

export interface ProductImage {
    id: number; // must always exist
    url: string;
    alt: string;
    file?: File; // optional (only used during upload)
}

// Define specific string literal types for controlled vocabularies
export type ProductStatus = "active" | "draft" | "inactive" | "out-of-stock";


// The single source of truth for a product's data structure
export interface Product {
    id: number;
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
}

// Data type from the AddProductModal form
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
