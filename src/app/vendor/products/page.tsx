"use client";

import React, { useState, useEffect } from "react";
// import AddProductModal from "./components/AddProductModal";
import { useRouter } from "next/navigation";
import { RoleProvider } from "@/components/ui/RoleContextNavigation";
import RoleContextNavigation from "@/components/ui/RoleContextNavigation";
// Try to parse the error response

import Icon from "@/components/AppIcon";
import Button from "@/components/ui/new/Button";
import CategoryTree from "@/app/vendor/products/components/CategoryTree";
import ProductToolbar from "@/app/vendor/products/components/ProductToolbar";
import ProductTable from "@/app/vendor/products/components/ProductTable";
import ProductGrid from "@/app/vendor/products/components/ProductGrid";
import AddProductModal from "@/app/vendor/products/components/AddProductModal";
import StockAlerts from "@/app/vendor/products/components/StockAlerts";

// Toast Notification Component
interface Toast {
  id: string;
  type: "success" | "error" | "info" | "loading";
  title: string;
  message?: string;
  duration?: number;
}

const ToastNotification: React.FC<{
  toast: Toast;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  useEffect(() => {
    if (toast.type !== "loading" && toast.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, toast.type, onRemove]);

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-success/10 mt-[3rem] border-success/20 text-success";
      case "error":
        return "bg-error/10 mt-[3rem] border-error/20 text-error";
      case "loading":
        return "bg-primary/10 mt-[3rem] border-primary/20 text-primary";
      default:
        return "bg-muted mt-[3rem] border-border text-foreground";
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "CheckCircle";
      case "error":
        return "XCircle";
      case "loading":
        return "Loader2";
      default:
        return "Info";
    }
  };

  return (
    <div
      className={`${getToastStyles()} border rounded-lg p-4 mb-3 shadow-lg transition-all duration-300 transform translate-x-0`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`mt-0.5 ${toast.type === "loading" ? "animate-spin" : ""}`}
        >
          <Icon name={getIcon()} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm mt-1 opacity-80">{toast.message}</p>
          )}
        </div>
        {toast.type !== "loading" && (
          <button
            onClick={() => onRemove(toast.id)}
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <Icon name="X" size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Toast Container Component
const ToastContainer: React.FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// --- START OF TYPESCRIPT CONVERSION ---

// Define specific string literal types for controlled vocabularies
type ProductStatus = "active" | "draft" | "inactive" | "out-of-stock";
type ViewMode = "table" | "grid";
type BulkAction = "activate" | "deactivate" | "duplicate" | "delete" | "export";

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

interface AddProductRequest {
  product_name: string;
  description: string;
  category: string;
  product_price: number;
  status: string;
  visibility: boolean;
  images: string[]; // ✅ backend only needs URLs
}

interface EditProductRequest extends AddProductRequest {}

interface ApiErrorResponse {
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

// Data type from the AddProductModal form
interface ProductFormData {
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
  images: ProductImage[]; // ✅ unified
}

interface VendorData {
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
  isVerified: boolean;
}

// API Service class for product operations

// Updated ProductApiService class with the new token and proper error handling

class ProductApiService {
  private static baseUrl = "https://server.bizengo.com/api/vendor";

  // Your NEW token (but you'll need to get an even newer one since this expires Jan 23, 2025)
  private static async getAuthToken(): Promise<string> {
    if (typeof window === "undefined") {
      return ""; // Return empty string on server-side
    }

    // Check localStorage first
    const storedToken = window.localStorage.getItem("vendorToken");

    if (storedToken && storedToken !== "null") {
      try {
        const tokenPayload = JSON.parse(atob(storedToken.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (tokenPayload.exp && tokenPayload.exp > currentTime) {
          console.log("Using stored token");
          return storedToken;
        }
      } catch (e) {
        console.log("Invalid stored token");
      }
    }

    // Use your NEW token as fallback (but this will also expire)
    const newToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1NTg0OTUwMCwianRpIjoiYWNkZmYzNjUtNGVhZC00NDgzLWE3ZjgtZTlkYzk1NTIzNzRhIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJpZCI6Miwicm9sZSI6InZlbmRvciJ9LCJuYmYiOjE3NTU4NDk1MDAsImNzcmYiOiJlZmNjNjczZS1mMTdkLTQ5NmMtOWY5Yi1hYjg1NjExYTE4YjEiLCJleHAiOjE3NTU5MzU5MDB9.kBBHDyU8cLXc-A-XJR3CJoi7t9-Bs4YDdaBwuInJFjg";

    // Store it for future use
    if (typeof window !== "undefined") {
      window.localStorage.setItem("authToken", newToken);
    }
    return newToken;
  }

  // Updated request method with better error handling
  private static async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    try {
      const token = await this.getAuthToken();

      const config: RequestInit = {
        ...options,
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      };

      console.log(`Making request to: ${this.baseUrl}${endpoint}`);
      console.log("Headers:", config.headers);

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      console.log(`Response status: ${response.status}`);

      if (response.status === 401) {
        console.error("Authentication failed - token might be expired");
        localStorage.removeItem("authToken");
        throw new Error(
          "Authentication failed. Your session has expired. Please log in again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Access denied. You do not have permission for this action."
        );
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse error response, use the status message
        }
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      console.error("API Request failed:", error);

      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Network error. Please check your internet connection and try again."
        );
      }

      throw error;
    }
  }

  static async addProduct(productData: AddProductRequest): Promise<any> {
    console.log("Adding product:", productData);
    const response = await this.request("/add-product", {
      method: "POST",
      body: JSON.stringify(productData),
    });
    return response.json();
  }

  static async editProduct(
    productId: number,
    productData: EditProductRequest
  ): Promise<any> {
    console.log(`Editing product ${productId}:`, productData);
    const response = await this.request(`/edit-product/${productId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
    return response.json();
  }

  static async getMyProducts(): Promise<any> {
    console.log("Fetching vendor products...");
    const response = await this.request("/my-products", {
      method: "GET",
    });
    return response.json();
  }

  // Helper method to convert File to base64
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  // Method to manually login and get a fresh token
  static async login(email: string, password: string): Promise<string> {
    try {
      const response = await fetch(
        "https://server.bizengo.com/api/vendor/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      if (data.access_token) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("authToken", data.access_token);
        }
        return data.access_token;
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }
}

const ProductManagement: React.FC = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // No redirection here, we'll handle auth in the API calls
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showStockAlerts, setShowStockAlerts] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [vendorData, setVendorData] = useState<VendorData | null>(null);

  // Toast management functions
  const addToast = (toast: Omit<Toast, "id">): string => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const updateToast = (
    id: string,
    updates: Partial<Omit<Toast, "id">>
  ): void => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, ...updates } : toast))
    );
  };

  useEffect(() => {
    const fetchVendorProducts = async () => {
      setLoading(true);
      try {
        const data = await ProductApiService.getMyProducts();
        console.log("Parsed JSON:", data);

        if (data.products) {
          const formattedProducts: Product[] = data.products.map(
            (product: any) => ({
              id: product.id || product._id,
              name: product.product_name,
              image: product.images?.[0] || "https://via.placeholder.com/150",
              category: product.category,
              sku: product.sku || `SKU-${product.id}`,
              price: product.product_price,
              stock: product.stock || 0,
              status: product.status || "active",
              createdAt: product.createdAt || new Date().toISOString(),
              views: product.views || 0,
              description: product.description,
            })
          );
          setProducts(formattedProducts);
        } else {
          throw new Error(data.message || "Unexpected response format");
        }
      } catch (err) {
        console.error("Error fetching vendor products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) =>
          product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(lowercasedQuery) ||
          product.sku.toLowerCase().includes(lowercasedQuery)
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const handleCategorySelect = (category: string | null): void => {
    setSelectedCategory(category);
  };

  const handleProductSelect = (
    productId: number | string,
    isSelected: boolean
  ): void => {
    setSelectedProducts((prev) =>
      isSelected
        ? [...prev, Number(productId)]
        : prev.filter((id) => id !== Number(productId))
    );
  };

  const handleSelectAll = (isSelected: boolean): void => {
    setSelectedProducts(isSelected ? filteredProducts.map((p) => p.id) : []);
  };

  const handleBulkAction = (action: BulkAction, productIds: number[]): void => {
    console.log(`Performing ${action} on products:`, productIds);
    setSelectedProducts([]);
  };

  const handleAddProduct = (): void => {
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleEditProduct = (productId: number | string): void => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setShowAddModal(true);
    }
  };

  const handleDuplicateProduct = (productId: number | string): void => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      // Show loading toast for duplicate action
      const loadingToastId = addToast({
        type: "loading",
        title: "Duplicating product...",
        message: "Creating a copy of your product.",
        duration: 0,
      });

      // Simulate duplicate operation
      setTimeout(() => {
        const duplicatedProduct: Product = {
          ...product,
          id: Date.now(),
          name: `${product.name} (Copy)`,
          sku: `${product.sku}-COPY`,
          createdAt: new Date().toISOString(),
        };
        setProducts((prev) => [duplicatedProduct, ...prev]);

        // Remove loading toast and show success
        removeToast(loadingToastId);
        addToast({
          type: "success",
          title: "Product duplicated successfully!",
          message: `${duplicatedProduct.name} has been added to your catalog.`,
          duration: 4000,
        });
      }, 800);
    }
  };

  const handleDeleteProduct = (productId: number | string): void => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Are you sure you want to delete this product?")
    ) {
      // Show loading toast for delete action
      const loadingToastId = addToast({
        type: "loading",
        title: "Deleting product...",
        message: "Please wait while we remove this product.",
        duration: 0,
      });

      // Simulate delete operation (replace with actual API call)
      setTimeout(() => {
        const deletedProduct = products.find((p) => p.id === productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setSelectedProducts((prev) => prev.filter((id) => id !== productId));

        // Remove loading toast and show success
        removeToast(loadingToastId);
        addToast({
          type: "success",
          title: "Product deleted successfully!",
          message: deletedProduct
            ? `${deletedProduct.name} has been removed from your catalog.`
            : "Product has been removed.",
          duration: 4000,
        });
      }, 1000);
    }
  };

  const handleQuickEdit = (
    productId: string,
    field: string,
    value: string | number
  ): void => {
    setProducts((prev) =>
      prev.map((product) => {
        if (String(product.id) === productId) {
          const isNumericField = [
            "price",
            "stock",
            "views",
            "comparePrice",
            "cost",
            "weight",
          ].includes(field);

          const finalValue = isNumericField ? Number(value) : value;
          return { ...product, [field]: finalValue };
        }
        return product;
      })
    );
  };

  // Transform form data to API format
  const transformFormDataToApiRequest = async (
    formData: ProductFormData
  ): Promise<AddProductRequest> => {
    console.log("Original Form Data:", formData);

    // Convert image files to base64
    const imagePromises = formData.images.map(async (img) => {
      if (img.file) {
        const base64 = await ProductApiService.fileToBase64(img.file);
        return base64; // Remove the data URL prefix as the API might not expect it
      }
      return img.url; // If it's already a URL, use it as is
    });

    const images = await Promise.all(imagePromises);
    console.log("Processed Images:", images.length);

    // Format the data according to API expectations
    const apiData: AddProductRequest = {
      product_name: formData.name,
      description: (formData.description || "").trim(),
      category: (formData.category || "Uncategorized").trim(),
      product_price: parseFloat(formData.price) || 0,
      status: formData.status || "active",
      visibility: formData.visibility === "visible",
      images: images,
    };

    console.log("Transformed API Data:", apiData);
    return apiData;
  };

  const handleSaveProduct = async (
    formData: ProductFormData
  ): Promise<void> => {
    const isEditing = !!editingProduct;
    const actionText = isEditing ? "Updating" : "Adding";
    const successText = isEditing ? "updated" : "added";

    // Show loading toast
    const loadingToastId = addToast({
      type: "loading",
      title: `${actionText} product...`,
      message: "Please wait while we save your product.",
      duration: 0, // Don't auto-remove loading toast
    });

    setLoading(true);
    setError(null);

    try {
      const apiData = await transformFormDataToApiRequest(formData);

      if (editingProduct) {
        // Edit existing product
        const response = await ProductApiService.editProduct(
          editingProduct.id,
          apiData
        );

        // Update local state with the response
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: apiData.product_name,
                  description: apiData.description,
                  category: apiData.category,
                  price: apiData.product_price,
                  status: apiData.status as ProductStatus,
                  image: apiData.images[0] || p.image,
                  // Add other fields as needed
                }
              : p
          )
        );

        console.log("Product updated successfully:", response);
      } else {
        // Add new product
        const response = await ProductApiService.addProduct(apiData);

        // Create new product from response and add to local state
        const newProduct: Product = {
          id: response.id || Date.now(), // Use API response ID if available
          name: apiData.product_name,
          description: apiData.description,
          category: apiData.category,
          price: apiData.product_price,
          status: apiData.status as ProductStatus,
          image:
            apiData.images[0] ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
          sku: `SKU-${Date.now()}`, // Generate SKU or get from response
          stock: parseInt(formData.stock, 10) || 0,
          createdAt: new Date().toISOString(),
          views: 0,
          // Add other fields as needed
        };

        setProducts((prev) => [newProduct, ...prev]);
        console.log("Product added successfully:", response);
      }

      // Remove loading toast and show success
      removeToast(loadingToastId);
      addToast({
        type: "success",
        title: `Product ${successText} successfully!`,
        message: `${apiData.product_name} has been ${successText} to your catalog.`,
        duration: 4000,
      });

      setShowAddModal(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Error saving product:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save product";

      // Remove loading toast and show error
      removeToast(loadingToastId);
      addToast({
        type: "error",
        title: `Failed to ${actionText.toLowerCase()} product`,
        message: errorMessage,
        duration: 6000,
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= 10
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const activeProductsCount = products.filter(
    (p) => p.status === "active"
  ).length;

  return (
    <>
      <RoleProvider>
        <RoleContextNavigation>
          {/* Toast Container */}
          <ToastContainer toasts={toasts} onRemove={removeToast} />

          <div className="min-h-screen bg-background">
            <div className="max-w-[85vw] mx-auto py-6 px-0 md:px-4">
              {/* Error Display */}
              {error && (
                <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertCircle" size={20} className="text-error" />
                    <p className="text-error font-medium">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-error hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] font-bold text-foreground">
                    Product Management
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your product catalog and inventory
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {(lowStockCount > 0 || outOfStockCount > 0) && (
                    <Button
                      variant="outline"
                      onClick={() => setShowStockAlerts(true)}
                      iconName="AlertTriangle"
                      iconPosition="left"
                    >
                      Stock Alerts ({lowStockCount + outOfStockCount})
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    iconName="Download"
                    iconPosition="left"
                  >
                    Export
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Products
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {products.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Package" size={24} className="text-primary" />
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Active Products
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {activeProductsCount}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <Icon
                        name="CheckCircle"
                        size={24}
                        className="text-success"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Low Stock</p>
                      <p className="text-2xl font-bold text-warning">
                        {lowStockCount}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                      <Icon
                        name="AlertTriangle"
                        size={24}
                        className="text-warning"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Out of Stock
                      </p>
                      <p className="text-2xl font-bold text-error">
                        {outOfStockCount}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
                      <Icon
                        name="AlertCircle"
                        size={24}
                        className="text-error"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3">
                  <CategoryTree
                    onCategorySelect={handleCategorySelect}
                    selectedCategory={selectedCategory}
                  />
                </div>

                <div className="lg:col-span-9">
                  <ProductToolbar
                    onAddProduct={handleAddProduct}
                    onBulkAction={handleBulkAction}
                    onViewToggle={setViewMode}
                    viewMode={viewMode}
                    selectedProducts={selectedProducts}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />

                  {loading ? (
                    <div className="w-full h-64 flex items-center justify-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin">
                          <Icon
                            name="Loader2"
                            size={40}
                            className="text-primary"
                          />
                        </div>
                        <p className="text-muted-foreground">
                          Loading products...
                        </p>
                      </div>
                    </div>
                  ) : viewMode === "table" ? (
                    <ProductTable
                      products={filteredProducts}
                      selectedProducts={selectedProducts}
                      onProductSelect={handleProductSelect}
                      onSelectAll={handleSelectAll}
                      onEditProduct={handleEditProduct}
                      onDuplicateProduct={handleDuplicateProduct}
                      onDeleteProduct={handleDeleteProduct}
                      onQuickEdit={handleQuickEdit}
                    />
                  ) : (
                    <ProductGrid
                      products={filteredProducts}
                      selectedProducts={selectedProducts}
                      onProductSelect={handleProductSelect}
                      onEditProduct={handleEditProduct}
                      onDuplicateProduct={handleDuplicateProduct}
                      onDeleteProduct={handleDeleteProduct}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Modals */}
            <AddProductModal
              isOpen={showAddModal}
              onClose={() => {
                if (!loading) {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }
              }}
              onSave={handleSaveProduct}
              editingProduct={editingProduct}
            />

            {showStockAlerts && (
              <StockAlerts onClose={() => setShowStockAlerts(false)} />
            )}
          </div>
        </RoleContextNavigation>
      </RoleProvider>
    </>
  );
};

export default ProductManagement;
