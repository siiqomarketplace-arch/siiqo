"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { productService } from "@/services/productService";
import { vendorService } from "@/services/vendorService";
import { toast } from "sonner";
import Icon from "@/components/AppIcon";
import Button from "@/components/ui/new/Button";
import CategoryTree from "@/app/vendor/products/components/CategoryTree";
import ProductToolbar from "@/app/vendor/products/components/ProductToolbar";
import ProductTable from "@/app/vendor/products/components/ProductTable";
import ProductGrid from "@/app/vendor/products/components/ProductGrid";
import AddProductModal from "@/app/vendor/products/components/AddProductModal";
import StockAlerts from "@/app/vendor/products/components/StockAlerts";
import {
  ProductStatus,
  ViewMode,
  BulkAction,
  Product,
  AddProductRequest,
  VendorData,
  ProductFormData,
} from "@/types/vendor/products";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getServerErrorMessage } from "@/lib/errorHandler";

// --- Toast Component ---
export interface Toast {
  id: string;
  type: "success" | "error" | "loading" | "info";
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
        return "bg-black mt-[3rem] border-black/20 text-white";
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
            <p className="mt-1 text-sm opacity-80">{toast.message}</p>
          )}
        </div>
        {toast.type !== "loading" && (
          <button
            onClick={() => onRemove(toast.id)}
            className="transition-opacity opacity-60 hover:opacity-100"
          >
            <Icon name="X" size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed z-50 max-w-sm top-4 right-4 w-96">
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// --- Main Component ---
const ProductManagement: React.FC = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Mobile Collapse States
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(true);
  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("created-desc");
  const [showInStockOnly, setShowInStockOnly] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showStockAlerts, setShowStockAlerts] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const addToast = (toast: Omit<Toast, "id">): string => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // --- Fetch Data ---
  useEffect(() => {
    const fetchVendorProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getMyProducts();

        // Expected shape: { status, data: [ { catalog_id, catalog_name, products: [...] }, ... ] }
        const catalogs = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];

        // Flatten all products across catalogs, keeping catalog metadata if needed later
        const productsArray = catalogs.flatMap((catalog: any) => {
          if (!Array.isArray(catalog?.products)) return [];
          return catalog.products.map((p: any) => ({
            ...p,
            catalog_id: catalog.catalog_id,
            catalog_name: catalog.catalog_name,
          }));
        });

        if (productsArray.length > 0) {
          const formattedProducts: Product[] = productsArray.map(
            (product: any) => ({
              id: product.id || product._id,
              name: product.product_name || product.name,
              image: product.images?.[0] || "https://via.placeholder.com/150",
              images: product.images || [],
              category: product.category || "Uncategorized",
              sku: product.sku || `SKU-${product.id}`,
              final_price:
                product.final_price ??
                product.product_price ??
                product.price ??
                0,
              stock: product.quantity ?? 0,
              status: product.status || "active",
              createdAt: product.createdAt || new Date().toISOString(),
              views: product.views || 0,
              description: product.description,
            }),
          );
          setProducts(formattedProducts);
        } else {
          console.warn("No products found in response:", response);
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching vendor products:", err);
        const errorMessage = getServerErrorMessage(err, "Fetch Products");
        setError(errorMessage.message);
        if (errorMessage.isServerError) {
          toast.error(errorMessage.title, {
            description: errorMessage.message,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories();
        if (response.categories && Array.isArray(response.categories)) {
          setCategories(response.categories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        const errorMessage = getServerErrorMessage(err, "Fetch Categories");
        // Don't break UI for categories - log only
        if (errorMessage.isServerError) {
          console.warn(
            "Server issue loading categories:",
            errorMessage.message,
          );
        }
      }
    };

    fetchVendorProducts();
    fetchCategories();
  }, []);

  // --- Filtering & Sorting ---
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) =>
          product.category.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(lowercasedQuery) ||
          product.sku?.toLowerCase().includes(lowercasedQuery) ||
          product.category?.toLowerCase().includes(lowercasedQuery) ||
          product.description?.toLowerCase().includes(lowercasedQuery) ||
          String(product.id).includes(lowercasedQuery),
      );
    }

    if (showInStockOnly) {
      filtered = filtered.filter(
        (product) => product.stock && product.stock > 0,
      );
    }

    // --- Apply Sorting ---
    filtered = filtered.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return (a.final_price || 0) - (b.final_price || 0);
        case "price-desc":
          return (b.final_price || 0) - (a.final_price || 0);
        case "stock-asc":
          return (a.stock || 0) - (b.stock || 0);
        case "stock-desc":
          return (b.stock || 0) - (a.stock || 0);
        case "created-desc":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "created-asc":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, sortOption, showInStockOnly]);

  // --- Handlers ---
  const handleCategorySelect = (category: string | null): void => {
    setSelectedCategory(category);
    // On mobile, automatically collapse after selection for better UX
    if (window.innerWidth < 1024) {
      setIsCategoryCollapsed(true);
    }
  };

  const handleProductSelect = (
    productId: number,
    isSelected: boolean,
  ): void => {
    setSelectedProducts((prev) =>
      isSelected
        ? [...prev, Number(productId)]
        : prev.filter((id) => id !== Number(productId)),
    );
  };

  const handleSelectAll = (isSelected: boolean): void => {
    setSelectedProducts(
      isSelected ? filteredProducts.map((p) => Number(p.id)) : [],
    );
  };

  const handleBulkAction = (action: BulkAction, productIds: number[]): void => {
    console.log(`Performing ${action} on products:`, productIds);
    setSelectedProducts([]);
  };

  const handleAddProduct = (): void => {
    setEditingProduct(null);
    setShowAddModal(true);
  };
  const handleEditProduct = (productId: number) => {
    const productToEdit = products.find((p) => p.id === productId);
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setShowAddModal(true);
    }
  };
  const handleDuplicateProduct = (productId: number): void => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const loadingToastId = addToast({
        type: "loading",
        title: "Duplicating product...",
        message: "Creating a copy of your product.",
        duration: 0,
      });

      setTimeout(() => {
        const duplicatedProduct: Product = {
          ...product,
          id: Date.now(),
          name: `${product.name} (Copy)`,
          sku: `${product.sku}-COPY`,
          createdAt: new Date().toISOString(),
        };
        setProducts((prev) => [duplicatedProduct, ...prev]);

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

  const handleDeleteProduct = (productId: number): void => {
    const product = products.find((p) => p.id === productId);
    setConfirmDeleteId(productId);
    setConfirmDeleteName(product?.name || "this product");
  };

  const confirmDeleteProduct = (): void => {
    if (confirmDeleteId == null) return;
    const productId = confirmDeleteId;
    const loadingToastId = addToast({
      type: "loading",
      title: "Deleting product...",
      message: "Please wait while we remove this product.",
      duration: 0,
    });
    setIsDeleting(true);

    productService
      .deleteProduct(productId)
      .then(() => {
        const deletedProduct = products.find((p) => p.id === productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setSelectedProducts((prev) => prev.filter((id) => id !== productId));

        removeToast(loadingToastId);
        addToast({
          type: "success",
          title: "Product deleted successfully!",
          message: deletedProduct
            ? `${deletedProduct.name} has been removed from your catalog.`
            : "Product has been removed.",
          duration: 4000,
        });
      })
      .catch((error) => {
        removeToast(loadingToastId);
        addToast({
          type: "error",
          title: "Failed to delete product",
          message:
            error?.response?.data?.message ||
            "An error occurred while deleting the product.",
          duration: 4000,
        });
      })
      .finally(() => {
        setIsDeleting(false);
        setConfirmDeleteId(null);
        setConfirmDeleteName(null);
      });
  };

  const cancelDeleteProduct = () => {
    if (isDeleting) return;
    setConfirmDeleteId(null);
    setConfirmDeleteName(null);
  };

  // 1. Full Edit (Opens the Wizard)

  // 2. Quick Edit (Updates price directly from table)
  const handleQuickEdit = async (
    productId: number,
    field: string,
    value: string | number,
  ) => {
    try {
      // Call API to update only the specific field
      await productService.editProduct(productId, { [field]: value });

      // Update local state so UI reflects the new price immediately
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p)),
      );

      toast.success("Price updated successfully");
    } catch (error: any) {
      console.error(error);
      const errorMessage = getServerErrorMessage(error, "Update Product Price");
      toast.error(errorMessage.title, { description: errorMessage.message });
    }
  };

  // const handleQuickEdit = (
  //   productId:  number,
  //   field: string,
  //   value: string | number
  // ): void => {
  //   setProducts((prev) =>
  //     prev.map((product) => {
  //       if (Number(product.id) === productId) {
  //         const isNumericField = [
  //           "price",
  //           "stock",
  //           "views",
  //           "comparePrice",
  //           "cost",
  //           "weight",
  //         ].includes(field);

  //         const finalValue = isNumericField ? Number(value) : value;
  //         return { ...product, [field]: finalValue };
  //       }
  //       return product;
  //     })
  //   );
  // };

  const transformFormDataToApiRequest = (
    formData: ProductFormData,
  ): AddProductRequest => {
    // 1. Safety check: If formData is missing, throw a descriptive error or return default
    if (!formData) {
      throw new Error(
        "Please fill in all required product information before saving.",
      );
    }

    // 2. Safely extract image URLs (fallback to empty array if not present/uploaded)
    const imageUrls = Array.isArray(formData.images)
      ? formData.images
          .filter((img: any) => img && img.url)
          .map((img: any) => img.url)
      : [];

    // 3. Construct apiData with safety fallbacks for every field
    const apiData: AddProductRequest = {
      product_name: (formData.name || "").trim(),
      description: (formData.description || "").trim(),
      category: (formData.category || "Uncategorized").trim(),
      // Ensure price is a string before parsing, fallback to 0
      product_price: Math.round(
        (parseFloat(String(formData.price)) || 0) * 100,
      ),
      quantity: parseInt(String(formData.stock), 10) || 0,
      status: formData.status || "active",
      visibility: formData.visibility === "visible",
      images: imageUrls,
    };

    return apiData;
  };

  const handleSaveProduct = async (
    formData: ProductFormData,
  ): Promise<void> => {
    // Immediate check before starting the process
    if (!formData || !formData.name) {
      toast.error("Product name is required");
      return;
    }

    const isEditing = !!editingProduct;
    const actionText = isEditing ? "Updating" : "Adding";
    const successText = isEditing ? "updated" : "added";

    const loadingToastId = addToast({
      type: "loading",
      title: `${actionText} product...`,
      message: "Please wait while we save your product.",
      duration: 0,
    });

    setLoading(true);
    setError(null);

    try {
      const apiData = transformFormDataToApiRequest(formData);

      if (editingProduct) {
        // Use the link: https://server.siiqo.com/api/products/update/{id}
        const formDataPayload = new FormData();
        Object.entries(apiData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => formDataPayload.append(key, item));
          } else {
            formDataPayload.append(key, String(value));
          }
        });
        await productService.editProduct(editingProduct.id, formDataPayload);

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: apiData.product_name,
                  description: apiData.description,
                  category: apiData.category,
                  final_price: apiData.product_price / 100,
                  stock: apiData.quantity,
                  status: apiData.status as ProductStatus,
                  image: apiData.images[0] || p.image,
                }
              : p,
          ),
        );
      } else {
        const formDataPayload = new FormData();
        Object.entries(apiData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => formDataPayload.append(key, item));
          } else {
            formDataPayload.append(key, String(value));
          }
        });
        const response = await productService.addProduct(formDataPayload);
        const newProduct: Product = {
          id: response.data?.id || Date.now(),
          name: apiData.product_name,
          description: apiData.description,
          category: apiData.category,
          final_price: apiData.product_price / 100,
          status: apiData.status as ProductStatus,
          image: apiData.images[0] || "https://via.placeholder.com/150",
          sku: `SKU-${Date.now()}`,
          stock: apiData.quantity,
          createdAt: new Date().toISOString(),
          views: 0,
        };
        setProducts((prev) => [newProduct, ...prev]);
      }

      removeToast(loadingToastId);
      toast.success(`Product ${successText} successfully!`);
      setShowAddModal(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error("Error saving product:", err);
      removeToast(loadingToastId);
      const errorMessage = getServerErrorMessage(err, "Save Product");
      const msg = errorMessage.message;
      toast.error(errorMessage.title, { description: msg });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const exportData = filteredProducts.map((product) => ({
        "Product ID": product.id,
        "Product Name": product.name,
        Category: product.category,
        SKU: product.sku,
        Price: `₦${product.final_price}`,
        Stock: product.stock,
        Status: product.status,
        Description: product.description || "",
        "Created Date": new Date(product.createdAt).toLocaleDateString(),
        Views: product.views,
      }));

      // Create CSV content
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row];
              // Escape quotes and wrap in quotes if contains comma
              return typeof value === "string" && value.includes(",")
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(","),
        ),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `products-${new Date().getTime()}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Products exported to Excel successfully!");
      setShowExportMenu(false);
    } catch (error) {
      console.error("Export error:", error);
      const errorMessage = getServerErrorMessage(error, "Export Products");
      toast.error(errorMessage.title, {
        description: "Failed to export to Excel. " + errorMessage.message,
      });
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    try {
      const exportData = filteredProducts.map((product) => ({
        "Product ID": product.id,
        "Product Name": product.name,
        Category: product.category,
        SKU: product.sku,
        Price: `₦${product.final_price}`,
        Stock: product.stock,
        Status: product.status,
        Description: product.description || "",
        "Created Date": new Date(product.createdAt).toLocaleDateString(),
        Views: product.views,
      }));

      // Create HTML table for PDF
      let htmlContent = `
        <html>
          <head>
            <title>Product Export</title>
            <style>
              body { font-family: Arial, sans-serif; }
              h1 { text-align: center; color: #333; }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
              }
              th { 
                background-color: #075E54; 
                color: white; 
                padding: 10px; 
                text-align: left; 
                font-size: 12px;
              }
              td { 
                padding: 8px; 
                border-bottom: 1px solid #ddd; 
                font-size: 11px;
              }
              tr:nth-child(even) { background-color: #f2f2f2; }
              .footer { 
                text-align: center; 
                margin-top: 30px; 
                font-size: 10px; 
                color: #666;
              }
            </style>
          </head>
          <body>
            <h1>Product Catalog Export</h1>
            <p>Exported on: ${new Date().toLocaleString()}</p>
            <p>Total Products: ${exportData.length}</p>
            <table>
              <thead>
                <tr>
                  ${Object.keys(exportData[0])
                    .map((key) => `<th>${key}</th>`)
                    .join("")}
                </tr>
              </thead>
              <tbody>
                ${exportData
                  .map(
                    (row) => `
                  <tr>
                    ${Object.values(row)
                      .map((value) => `<td>${value}</td>`)
                      .join("")}
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="footer">
              <p>This is an auto-generated report from Siiqo Product Management System</p>
            </div>
          </body>
        </html>
      `;

      // Open print dialog
      const printWindow = window.open("", "", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }

      toast.success("PDF export dialog opened!");
      setShowExportMenu(false);
    } catch (error) {
      console.error("Export error:", error);
      const errorMessage = getServerErrorMessage(error, "Export PDF");
      toast.error(errorMessage.title, {
        description: "Failed to export to PDF. " + errorMessage.message,
      });
    }
  };

  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= 10,
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const activeProductsCount = products.filter(
    (p) => p.status === "active",
  ).length;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="min-h-screen bg-background">
        <div className="max-w-[85vw] mx-auto py-6 px-0 md:px-4">
          {error && (
            <div className="p-4 mb-4 border rounded-lg bg-error/10 border-error/20 mx-4 md:mx-0">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} className="text-error" />
                <p className="font-medium text-error">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-error hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* --- Header --- */}
          <div className="flex flex-col mt-14 md:mt-0 sm:flex-row px-4 items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-[18px] sm:text-[14px] md:text-[16px] lg:text-[18px] font-bold text-foreground">
                Product Management
              </h1>
              <p className="mt-1 text-muted-foreground">
                Manage your product catalog and inventory
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(lowStockCount > 0 || outOfStockCount > 0) && (
                <Button
                  variant="outline"
                  onClick={() => setShowStockAlerts(true)}
                  iconName="AlertTriangle"
                  iconPosition="left"
                >
                  Alerts ({lowStockCount + outOfStockCount})
                </Button>
              )}
              <div className="relative">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  Export
                </Button>

                {showExportMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={handleExportExcel}
                      className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-2"
                    >
                      <Icon name="FileText" size={16} />
                      Export as Excel (CSV)
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all border-t border-border flex items-center gap-2"
                    >
                      <Icon name="File" size={16} />
                      Export as PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- Collapsible Stats Section --- */}
          <div className="px-4 mb-8">
            <div className="flex items-center justify-between mb-2 lg:hidden">
              <h3 className="font-semibold text-sm text-foreground">
                Overview
              </h3>
              <button
                onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
                className="text-primary text-sm flex items-center gap-1 hover:underline"
              >
                {isStatsCollapsed ? "Show Stats" : "Hide Stats"}
                {isStatsCollapsed ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
                )}
              </button>
            </div>

            <div
              className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300 ease-in-out ${
                isStatsCollapsed ? "hidden lg:grid" : "grid"
              }`}
            >
              {/* Stat Cards */}
              <div className="p-4 sm:p-6 border rounded-lg bg-card border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Total
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {products.length}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 self-start sm:self-center">
                    <Icon name="Package" size={20} className="text-primary" />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border rounded-lg bg-card border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Active
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {activeProductsCount}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-success/10 self-start sm:self-center">
                    <Icon
                      name="CheckCircle"
                      size={20}
                      className="text-success"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border rounded-lg bg-card border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Low Stock
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-warning">
                      {lowStockCount}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-warning/10 self-start sm:self-center">
                    <Icon
                      name="AlertTriangle"
                      size={20}
                      className="text-warning"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border rounded-lg bg-card border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Out of Stock
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-error">
                      {outOfStockCount}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-error/10 self-start sm:self-center">
                    <Icon name="AlertCircle" size={20} className="text-error" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- Main Content --- */}
          <div className="grid grid-cols-1 px-4 gap-6 lg:grid-cols-12">
            {/* Sidebar / Category Tree (Collapsible on Mobile) */}
            <div className="lg:col-span-3">
              <div
                className="lg:hidden mb-4 border rounded-lg p-3 bg-card"
                onClick={() => setIsCategoryCollapsed(!isCategoryCollapsed)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">
                    Categories & Filters
                  </span>
                  {isCategoryCollapsed ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronUp size={16} />
                  )}
                </div>
              </div>

              <div
                className={`${isCategoryCollapsed ? "hidden lg:block" : "block"}`}
              >
                <CategoryTree
                  onCategorySelect={handleCategorySelect}
                  selectedCategory={selectedCategory}
                  categories={categories}
                  products={products}
                />
              </div>
            </div>

            {/* Product List */}
            <div className="lg:col-span-9">
              <ProductToolbar
                onAddProduct={handleAddProduct}
                onBulkAction={handleBulkAction}
                onViewToggle={setViewMode}
                viewMode={viewMode}
                selectedProducts={selectedProducts}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortOption={sortOption}
                onSortChange={setSortOption}
                showInStockOnly={showInStockOnly}
                onStockFilterChange={setShowInStockOnly}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />

              {loading ? (
                <div className="flex items-center justify-center w-full h-64">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin">
                      <Icon name="Loader2" size={40} className="text-primary" />
                    </div>
                    <p className="text-muted-foreground">Loading products...</p>
                  </div>
                </div>
              ) : viewMode === "table" ? (
                // Wrapper to allow table scrolling on mobile
                <div className="w-full overflow-x-auto">
                  <ProductTable
                    products={filteredProducts.map((p) => ({
                      ...p,
                      images: p.images || [],
                    }))}
                    selectedProducts={selectedProducts}
                    onProductSelect={handleProductSelect}
                    onSelectAll={handleSelectAll}
                    onEditProduct={handleEditProduct}
                    onDuplicateProduct={handleDuplicateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onAddProduct={() => {
                      /* Add product handler */
                    }}
                    onQuickEdit={handleQuickEdit}
                  />
                </div>
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

        {/* Delete confirmation modal */}
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-border p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center">
                  <Icon name="Trash2" size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Delete product?</h3>
                  <p className="text-sm text-muted-foreground">
                    This will remove {confirmDeleteName || "this product"} from
                    your catalog.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={cancelDeleteProduct}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteProduct}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showStockAlerts && (
          <StockAlerts onClose={() => setShowStockAlerts(false)} />
        )}
      </div>
    </>
  );
};

export default ProductManagement;
