import api from "@/lib/api_client";
import { APIResponse } from "@/types/products";
import { ApiProductFull } from "@/types/product-detail";
import { Product as SellerProfileProduct } from "@/types/seller-profile";
import { Product as VendorProduct, AddProductRequest, EditProductRequest } from "@/types/vendor/products";

export const productService = {
  getProducts: async (): Promise<APIResponse> => {
    const response = await api.get("/marketplace/products");
    return response.data;
  },
  getProductById: async (id: string): Promise<ApiProductFull> => {
    const response = await api.get(`/marketplace/products/${id}`);
    return response.data;
  },
  getProductsByVendorEmail: async (email: string): Promise<{ products: SellerProfileProduct[] }> => {
    const response = await api.get(`/vendor-products/${email}`);
    return response.data;
  },
  getMyProducts: async (): Promise<{ data: { products: VendorProduct[] } }> => {
    const response = await api.get("/vendor/my-products");
    return response.data;
  },
  addProduct: async (productData: AddProductRequest): Promise<any> => {
    const response = await api.post("/vendor/add-product", productData);
    return response.data;
  },
  editProduct: async (id: number | string, productData: EditProductRequest): Promise<any> => {
    const response = await api.put(`/vendor/edit-product/${id}`, productData);
    return response.data;
  },
};