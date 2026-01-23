import axios from "axios";
import api from "@/lib/api_client";
import publicApi from "@/lib/public_api_client";
import { APIResponse } from "@/types/products";
import { ApiProductFull } from "@/types/product-detail";
import { Product as SellerProfileProduct } from "@/types/seller-profile";
import {
  Product as VendorProduct,
  AddProductRequest,
  EditProductRequest,
} from "@/types/vendor/products";
import { getCatalogs } from "./api";

export const productService = {
  // 1. Marketplace Fetching
  getProducts: async (): Promise<any> => {
    const response = await api.get("/products/my-products");
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
  getMyProducts: async (limit?: number, offset?: number): Promise<any> => {
    // Matches your api.ts: /products/my-products
    // Supports optional pagination parameters
    let url = "/products/my-products";
    const params = new URLSearchParams();

    if (limit) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());

    if (params.toString()) {
      url += "?" + params.toString();
    }

    const response = await api.get(url);
    return response.data;
  },

  addProduct: async (payload: FormData) => {
    // Let the browser set the Content-Type with the correct boundary
    const response = await api.post("/products/add", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  editProduct: async (productId: number, data: any) => {
    const response = await api.patch(`/products/update/${productId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteProduct: async (productId: number) => {
    // Matches your endpoint: /products/delete/{id}
    const response = await api.delete(`/products/delete/${productId}`);
    return response.data;
  },

  // 3. Helpers for Forms
  getCategories: async () => {
    // This endpoint requires authentication
    const response = await api.get("/products/categories");
    return response.data;
  },
  getCatalogs: async () => {
    const response = await api.get("/products/catalogs");
    return response.data;
  },
  getPublicCatalogs: async () => {
    const response = await api.get("/marketplace/catalogs");
    return response.data;
  },
  createCatalog: async (catalogData: {
    name: string;
    description?: string;
    product_ids: number[];
    image?: File | null;
  }) => {
    const formData = new FormData();
    formData.append("name", catalogData.name);
    formData.append("description", catalogData.description || "");

    // Send product_ids as comma-separated text string (as form-data text field)
    if (catalogData.product_ids.length > 0) {
      formData.append("product_ids", catalogData.product_ids.join(","));
    }

    if (catalogData.image) {
      formData.append("image", catalogData.image);
    }

    const response = await api.post("/products/catalogs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateCatalog: async (
    catalogId: number,
    catalogData: {
      name?: string;
      description?: string;
      product_ids?: number[];
      image?: File | null;
    },
  ) => {
    const formData = new FormData();
    if (catalogData.name !== undefined)
      formData.append("name", catalogData.name);
    if (catalogData.description !== undefined)
      formData.append("description", catalogData.description);
    if (catalogData.product_ids && catalogData.product_ids.length > 0) {
      formData.append("product_ids", catalogData.product_ids.join(","));
    }
    if (catalogData.image) {
      formData.append("image", catalogData.image);
    }

    const response = await api.patch(
      `/products/catalogs/${catalogId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  deleteCatalog: async (catalogId: number | string) => {
    // DELETE /api/products/catalogs/:catalog_id
    const response = await api.delete(`/products/catalogs/${catalogId}`);
    return response.data;
  },
};
