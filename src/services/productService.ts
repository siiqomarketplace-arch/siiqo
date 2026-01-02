import api from "@/lib/api_client";
import { APIResponse } from "@/types/products";
import { ApiProductFull } from "@/types/product-detail";
import { Product as SellerProfileProduct } from "@/types/seller-profile";
import { Product as VendorProduct, AddProductRequest, EditProductRequest } from "@/types/vendor/products";

export const productService = {
  // 1. Marketplace Fetching
  getProducts: async (): Promise<APIResponse> => {
    const response = await api.get("/marketplace/products");
    return response.data;
  },

  getProductById: async (id: string | number): Promise<ApiProductFull> => {
    // Matches your api.ts: /marketplace/products/${product_id}
    const response = await api.get(`/marketplace/products/${id}`);
    return response.data;
  },

  getStorefrontDetails: async (slug: string) => {
    // Matches your api.ts: /marketplace/store/${storeSlug}
    const response = await api.get(`/marketplace/store/${slug}`);
    return response.data;
  },

  // 2. Vendor Management (Updated Paths)
  getMyProducts: async (): Promise<{ data: { products: VendorProduct[] } }> => {
    // Matches your api.ts: /products/my-products
    const response = await api.get("/products/my-products");
    return response.data;
  },

  addProduct: async (productData: FormData | AddProductRequest): Promise<any> => {
    // Matches your api.ts: /products/add
    const headers = productData instanceof FormData 
      ? { "Content-Type": "multipart/form-data" } 
      : {};
    
    const response = await api.post("/products/add", productData, { headers });
    return response.data;
  },

  editProduct: async (id: number | string, productData: FormData | EditProductRequest): Promise<any> => {
    // Matches your api.ts: /products/update/${product_id} using PATCH
    const headers = productData instanceof FormData 
      ? { "Content-Type": "multipart/form-data" } 
      : {};

    const response = await api.patch(`/products/update/${id}`, productData, { headers });
    return response.data;
  },

  deleteProduct: async (id: number | string) => {
    const response = await api.delete(`/products/delete/${id}`);
    return response.data;
  },

  // 3. Helpers for Forms
  getCategories: async () => {
    const response = await api.get("/products/categories");
    return response.data;
  },

  getCatalogs: async () => {
    const response = await api.get("/products/catalogs");
    return response.data;
  }
};