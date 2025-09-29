import React, { useState, ChangeEvent, FormEvent, DragEvent } from "react";
import Icon from "@/components/AppIcon";
import Image from "@/components/ui/AppImage";
import Button from "@/components/ui/new/Button";
import Input from "@/components/ui/new/Input";
import Select from "@/components/ui/new/NewSelect";

// Type definitions
interface ProductDimensions {
  length: string;
  width: string;
  height: string;
}

interface ProductImage {
  id: number;
  file?: File;
  url: string;
  alt: string;
  serverId?: number; // Server-side image ID for deletion
  isUploaded?: boolean; // Track if image is uploaded to server
  isUploading?: boolean; // Track upload status
}

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
  dimensions: ProductDimensions;
  status: "active" | "draft" | "inactive";
  visibility: "visible" | "hidden";
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  images: ProductImage[];
}

interface EditingProduct {
  name?: string;
  description?: string;
  category?: string;
  price?: string;
  comparePrice?: string;
  cost?: string;
  sku?: string;
  barcode?: string;
  stock?: string;
  lowStockThreshold?: string;
  weight?: string;
  dimensions?: ProductDimensions;
  status?: "active" | "draft" | "inactive";
  visibility?: "visible" | "hidden";
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  images?: ProductImage[];
}

interface SelectOption {
  value: string;
  label: string;
}

interface Tab {
  id: string;
  label: string;
  icon: string;
}
interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ProductFormData) => Promise<void> | void; // ✅ allow both
  editingProduct?: EditingProduct | null | any;
  loading?: boolean;
  disabled?: boolean;
}

// API Functions
// API Functions
const getVendorToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("vendorToken");
  }
  return null;
};

const uploadImageToServer = async (
  file: File
): Promise<{ id: number; url: string }> => {
  const token = getVendorToken();
  const formData = new FormData();

  // Try different field names - test one at a time
  formData.append("files", file); // Most common alternative
  // formData.append("image", file);  // Your current one
  // formData.append("upload", file);  // Another common one
  // formData.append("files", file);   // Another possibility

  // Add debugging
  console.log("File details:", {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  });

  console.log("FormData contents:");
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const response = await fetch(
    "https://server.bizengo.com/api/vendor/upload-file",
    {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't manually set Content-Type for FormData
      },
      body: formData,
    }
  );

  console.log("Response status:", response.status);
  console.log(
    "Response headers:",
    Object.fromEntries(response.headers.entries())
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Upload failed" }));
    console.error("Upload response:", errorData);
    throw new Error(errorData.message || `Upload failed: ${response.status}`);
  }

  const result = await response.json();
  console.log("Success response:", result);

  return {
    id: result.id || result.data?.id,
    url: result.url || result.data?.url || result.file_url,
  };
};
const deleteImageFromServer = async (imageId: number): Promise<void> => {
  const token = getVendorToken();
  const response = await fetch(
    `https://server.bizengo.com/api/vendor/delete-image/${imageId}`,
    {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Delete failed" }));
    throw new Error(errorData.message || `Delete failed: ${response.status}`);
  }
};

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct = null,
  loading = false,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [formData, setFormData] = useState<ProductFormData>({
    name: editingProduct?.name || "",
    description: editingProduct?.description || "",
    category: editingProduct?.category || "",
    price: editingProduct?.price || "",
    comparePrice: editingProduct?.comparePrice || "",
    cost: editingProduct?.cost || "",
    sku: editingProduct?.sku || "",
    barcode: editingProduct?.barcode || "",
    stock: editingProduct?.stock || "",
    lowStockThreshold: editingProduct?.lowStockThreshold || "10",
    weight: editingProduct?.weight || "",
    dimensions: editingProduct?.dimensions || {
      length: "",
      width: "",
      height: "",
    },
    status: editingProduct?.status || "draft",
    visibility: editingProduct?.visibility || "visible",
    seoTitle: editingProduct?.seoTitle || "",
    seoDescription: editingProduct?.seoDescription || "",
    tags: editingProduct?.tags || [],
    images: (editingProduct?.images || []).map((img: any) =>
      typeof img === "string"
        ? { url: img, isUploaded: true } // normalize backend strings
        : img
    ),
  });

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const categoryOptions: SelectOption[] = [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "home", label: "Home & Garden" },
    { value: "books", label: "Books" },
    { value: "sports", label: "Sports & Outdoors" },
  ];

  const statusOptions: SelectOption[] = [
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "inactive", label: "Inactive" },
  ];

  const visibilityOptions: SelectOption[] = [
    { value: "visible", label: "Visible" },
    { value: "hidden", label: "Hidden" },
  ];

  const tabs: Tab[] = [
    { id: "basic", label: "Basic Info", icon: "Info" },
    { id: "images", label: "Images", icon: "Image" },
    { id: "pricing", label: "Pricing", icon: "DollarSign" },
    { id: "inventory", label: "Inventory", icon: "Package" },
    { id: "seo", label: "SEO", icon: "Search" },
  ];

  const handleInputChange = (
    field: keyof ProductFormData,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDimensionChange = (
    dimension: keyof ProductDimensions,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value,
      },
    }));
  };

  const handleImageUpload = async (files: FileList | null): Promise<void> => {
    if (!files) return;

    setUploadErrors([]); // Clear previous errors

    // Create temporary images with local URLs
    const tempImages: ProductImage[] = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      alt: file.name,
      isUploaded: false,
      isUploading: true,
    }));

    // Add temporary images to state immediately for UI feedback
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...tempImages],
    }));

    // Upload each image
    const uploadPromises = tempImages.map(async (tempImage) => {
      try {
        const uploadResult = await uploadImageToServer(tempImage.file!);

        // Update the image with server data
        setFormData((prev) => ({
          ...prev,
          images: prev.images.map((img) =>
            img.id === tempImage.id
              ? {
                  ...img,
                  serverId: uploadResult.id,
                  url: uploadResult.url,
                  isUploaded: true,
                  isUploading: false,
                }
              : img
          ),
        }));

        return { success: true, imageId: tempImage.id };
      } catch (error) {
        console.error("Image upload failed:", error);

        // Remove failed image from state
        setFormData((prev) => ({
          ...prev,
          images: prev.images.filter((img) => img.id !== tempImage.id),
        }));

        // Add error message
        setUploadErrors((prev) => [
          ...prev,
          `Failed to upload ${tempImage.alt}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ]);

        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    await Promise.all(uploadPromises);
  };

  const removeImage = async (imageId: number): Promise<void> => {
    const imageToRemove = formData.images.find((img) => img.id === imageId);

    if (!imageToRemove) return;

    // If image is uploaded to server, delete it from server first
    if (imageToRemove.isUploaded && imageToRemove.serverId) {
      try {
        await deleteImageFromServer(imageToRemove.serverId);
      } catch (error) {
        console.error("Failed to delete image from server:", error);
        setUploadErrors((prev) => [
          ...prev,
          `Failed to delete image: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ]);
        return; // Don't remove from UI if server deletion failed
      }
    }

    // Remove image from state
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));

    // Revoke object URL to free memory
    if (imageToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url);
    }
  };

  const uploadAllImages = async (): Promise<boolean> => {
    const unuploadedImages = formData.images.filter(
      (img) => !img.isUploaded && img.file
    );

    if (unuploadedImages.length === 0) return true;

    setUploadErrors([]);

    const uploadPromises = unuploadedImages.map(async (image) => {
      try {
        const uploadResult = await uploadImageToServer(image.file!);

        setFormData((prev) => ({
          ...prev,
          images: prev.images.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  serverId: uploadResult.id,
                  url: uploadResult.url,
                  isUploaded: true,
                  isUploading: false,
                }
              : img
          ),
        }));

        return { success: true };
      } catch (error) {
        setUploadErrors((prev) => [
          ...prev,
          `Failed to upload ${image.alt}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ]);
        return { success: false };
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.every((result) => result.success);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Check if all images are uploaded
    const hasUnuploadedImages = formData.images.some(
      (img: ProductImage) => !img.isUploaded
    );

    if (hasUnuploadedImages) {
      alert("Please wait for all images to upload before saving the product.");
      return;
    }

    // ✅ Map frontend -> backend structure
    const payload = {
      product_name: formData.name,
      description: formData.description,
      category: formData.category,
      product_price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.stock, 10) || 0,
      status: formData.status || "active",
      visibility: formData.visibility === "visible",
      images: formData.images
        .filter((img) => img.isUploaded)
        .map((img) => img.url),
    };

    console.log("📦 Final Payload:", payload);

    onSave(payload as any);
  };

  if (!isOpen) return null;

  const hasUploadingImages = formData.images.some((img) => img.isUploading);
  const hasUnuploadedImages = formData.images.some(
    (img) => !img.isUploaded && img.file
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1300 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[75vh] overflow-y-scroll">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-smooth"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-smooth ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className={`flex flex-col h-full ${
            loading || disabled ? "opacity-70 pointer-events-none" : ""
          }`}
        >
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "basic" && (
              <div className="space-y-6">
                <Input
                  label="Product Name"
                  type="text"
                  value={formData.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("name", e.target.value)
                  }
                  placeholder="Enter product name"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter product description"
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <Select
                  label="Category"
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(value: string) =>
                    handleInputChange("category", value)
                  }
                  placeholder="Select category"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={formData.status}
                    onChange={(value: string) =>
                      handleInputChange(
                        "status",
                        value as ProductFormData["status"]
                      )
                    }
                  />

                  <Select
                    label="Visibility"
                    options={visibilityOptions}
                    value={formData.visibility}
                    onChange={(value: string) =>
                      handleInputChange(
                        "visibility",
                        value as ProductFormData["visibility"]
                      )
                    }
                  />
                </div>
              </div>
            )}

            {activeTab === "images" && (
              <div className="space-y-6">
                {/* Upload Errors */}
                {uploadErrors.length > 0 && (
                  <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
                    <h4 className="text-sm font-medium text-error mb-2">
                      Upload Errors:
                    </h4>
                    <ul className="text-sm text-error space-y-1">
                      {uploadErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setUploadErrors([])}
                    >
                      Clear Errors
                    </Button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Product Images
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-smooth ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Icon
                      name="Upload"
                      size={48}
                      className="text-muted-foreground mx-auto mb-4"
                    />
                    <p className="text-muted-foreground mb-2">
                      Drag and drop images here, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Images will be uploaded automatically
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleImageUpload(e.target.files)
                      }
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                      disabled={hasUploadingImages}
                    >
                      {hasUploadingImages ? "Uploading..." : "Choose Files"}
                    </Button>
                  </div>
                </div>

                {/* Upload All Button */}
                {hasUnuploadedImages && (
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="default"
                      onClick={uploadAllImages}
                      disabled={hasUploadingImages}
                    >
                      Upload All Images
                    </Button>
                  </div>
                )}

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <Image
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                          />
                          {image.isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          disabled={image.isUploading}
                          className="absolute top-2 right-2 p-1 bg-error text-error-foreground rounded-full opacity-0 group-hover:opacity-100 transition-smooth disabled:opacity-50"
                        >
                          <Icon name="X" size={14} />
                        </button>

                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                            Main
                          </span>
                        )}

                        {/* Upload Status */}
                        <div className="absolute bottom-2 right-2">
                          {image.isUploading && (
                            <span className="px-2 py-1 bg-warning text-warning-foreground text-xs rounded">
                              Uploading...
                            </span>
                          )}
                          {image.isUploaded && (
                            <span className="px-2 py-1 bg-success text-success-foreground text-xs rounded">
                              ✓
                            </span>
                          )}
                          {!image.isUploaded &&
                            !image.isUploading &&
                            image.file && (
                              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                                Pending
                              </span>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    value={formData.price}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("price", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                    required
                  />

                  <Input
                    label="Compare at Price"
                    type="number"
                    value={formData.comparePrice}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("comparePrice", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                    description="Show a higher price for comparison"
                  />

                  <Input
                    label="Cost per Item"
                    type="number"
                    value={formData.cost}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("cost", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                    description="For profit calculations"
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">
                    Profit Calculation
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="text-foreground">
                        ${formData.price || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="text-foreground">
                        -${formData.cost || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1">
                      <span className="font-medium text-foreground">
                        Profit:
                      </span>
                      <span className="font-medium text-success">
                        $
                        {(
                          (parseFloat(formData.price) || 0) -
                          (parseFloat(formData.cost) || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="SKU"
                    type="text"
                    value={formData.sku}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("sku", e.target.value)
                    }
                    placeholder="Enter SKU"
                  />

                  <Input
                    label="Barcode"
                    type="text"
                    value={formData.barcode}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("barcode", e.target.value)
                    }
                    placeholder="Enter barcode"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Stock Quantity"
                    type="number"
                    value={formData.stock}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("stock", e.target.value)
                    }
                    placeholder="0"
                    min="0"
                    required
                  />

                  <Input
                    label="Low Stock Threshold"
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("lowStockThreshold", e.target.value)
                    }
                    placeholder="10"
                    min="0"
                    description="Alert when stock falls below this number"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">
                    Shipping Information
                  </h4>

                  <Input
                    label="Weight (kg)"
                    type="number"
                    value={formData.weight}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("weight", e.target.value)
                    }
                    placeholder="0.0"
                    step="0.1"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Length (cm)"
                      type="number"
                      value={formData.dimensions.length}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleDimensionChange("length", e.target.value)
                      }
                      placeholder="0"
                    />

                    <Input
                      label="Width (cm)"
                      type="number"
                      value={formData.dimensions.width}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleDimensionChange("width", e.target.value)
                      }
                      placeholder="0"
                    />

                    <Input
                      label="Height (cm)"
                      type="number"
                      value={formData.dimensions.height}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleDimensionChange("height", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "seo" && (
              <div className="space-y-6">
                <Input
                  label="SEO Title"
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("seoTitle", e.target.value)
                  }
                  placeholder="Enter SEO title"
                  description="Recommended: 50-60 characters"
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("seoDescription", e.target.value)
                    }
                    placeholder="Enter SEO description"
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 150-160 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Product Tags
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter tags separated by commas"
                    description="Help customers find your product"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading || disabled || hasUploadingImages}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={
                loading || disabled || hasUploadingImages || hasUnuploadedImages
              }
            >
              {loading
                ? "Saving..."
                : hasUploadingImages
                ? "Uploading images..."
                : hasUnuploadedImages
                ? "Upload images first"
                : editingProduct
                ? "Update Product"
                : "Save Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
