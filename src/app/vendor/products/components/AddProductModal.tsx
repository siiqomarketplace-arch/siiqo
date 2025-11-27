import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  DragEvent,
} from "react";
import Icon from "@/components/AppIcon";
import Image from "@/components/ui/AppImage";
import Button from "@/components/ui/new/Button";
import Input from "@/components/ui/new/Input";
import Select from "@/components/ui/new/NewSelect";
import { vendorService } from "@/services/vendorService";

// --- Type Definitions ---
interface ProductDimensions {
  length: string;
  width: string;
  height: string;
}

interface ManagedImage {
  id: number;
  file?: File;
  url: string;
  alt: string;
  serverId?: number;
  isUploaded?: boolean;
  isUploading?: boolean;
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
  dimensions: ProductDimensions;
  status: "active" | "draft" | "inactive";
  visibility: "visible" | "hidden";
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  images: ManagedImage[];
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ProductFormData) => void;
  editingProduct?: any | null;
  loading?: boolean;
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

// --- Helper Functions ---

const uploadImageToServer = async (file: File): Promise<{ url: string }> => {
  try {
    const response = await vendorService.uploadImage(file);
    if (!response.urls || response.urls.length === 0) {
      throw new Error("API did not return an image URL.");
    }
    return { url: response.urls[0] };
  } catch (error: any) {
    throw new Error(error.message || "Upload failed");
  }
};

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  category: "electronics",
  price: "",
  comparePrice: "",
  cost: "",
  sku: "",
  barcode: "",
  stock: "",
  lowStockThreshold: "10",
  weight: "",
  dimensions: { length: "", width: "", height: "" },
  status: "active",
  visibility: "visible",
  seoTitle: "",
  seoDescription: "",
  tags: [],
  images: [],
};

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct = null,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const categoryOptions: SelectOption[] = [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "home", label: "Home & Garden" },
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

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          name: editingProduct.name || "",
          description: editingProduct.description || "",
          category: editingProduct.category || "electronics",
          price: (editingProduct.price / 100).toString() || "",
          comparePrice: (editingProduct.comparePrice / 100)?.toString() || "",
          cost: (editingProduct.cost / 100)?.toString() || "",
          sku: editingProduct.sku || "",
          barcode: editingProduct.barcode || "",
          stock: editingProduct.stock?.toString() || "",
          lowStockThreshold:
            editingProduct.lowStockThreshold?.toString() || "10",
          weight: editingProduct.weight?.toString() || "",
          dimensions: editingProduct.dimensions || {
            length: "",
            width: "",
            height: "",
          },
          status: editingProduct.status || "active",
          visibility:
            editingProduct.visibility === false ? "hidden" : "visible",
          seoTitle: editingProduct.seoTitle || "",
          seoDescription: editingProduct.seoDescription || "",
          tags: editingProduct.tags || [],
          images: (editingProduct.images || []).map(
            (img: any, index: number) => ({
              id: Date.now() + index,
              url: typeof img === "string" ? img : img.url,
              alt: "Existing image",
              isUploaded: true,
            })
          ),
        });
      } else {
        setFormData(initialFormData);
      }
      setActiveTab("basic");
      setUploadErrors([]);
    }
  }, [isOpen, editingProduct]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDimensionChange = (
    dimension: keyof ProductDimensions,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [dimension]: value },
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    setUploadErrors([]);
    Array.from(files).forEach((file) => {
      const tempId = Date.now() + Math.random();
      const tempImage: ManagedImage = {
        id: tempId,
        file,
        url: URL.createObjectURL(file),
        alt: file.name,
        isUploading: true,
        isUploaded: false,
      };
      setFormData((prev) => ({ ...prev, images: [...prev.images, tempImage] }));
      uploadImageToServer(file)
        .then((result) => {
          setFormData((prev) => ({
            ...prev,
            images: prev.images.map((img) =>
              img.id === tempId
                ? {
                    ...img,
                    url: result.url,
                    isUploaded: true,
                    isUploading: false,
                    file: undefined,
                  }
                : img
            ),
          }));
        })
        .catch((error) => {
          console.error("Image upload failed:", error);
          setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((img) => img.id !== tempId),
          }));
          setUploadErrors((prev) => [
            ...prev,
            `Failed to upload ${file.name}: ${error.message}`,
          ]);
        });
    });
  };

  const removeImage = (imageId: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.images.some((img) => img.isUploading)) {
      alert("Please wait for all images to finish uploading.");
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  const hasUploadingImages = formData.images.some((img) => img.isUploading);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-md hover:bg-muted"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="border-b border-border">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
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
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "basic" && (
              <div className="space-y-6">
                <Input
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg border-border bg-background"
                  />
                </div>
                <Select
                  label="Category"
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(value) =>
                    handleSelectChange("category", value as string)
                  }
                  placeholder="Select category"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={formData.status}
                    onChange={(value) =>
                      handleSelectChange(
                        "status",
                        value as ProductFormData["status"]
                      )
                    }
                  />
                  <Select
                    label="Visibility"
                    options={visibilityOptions}
                    value={formData.visibility}
                    onChange={(value) =>
                      handleSelectChange(
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
                {uploadErrors.length > 0 && (
                  <div className="p-3 text-sm border rounded-lg bg-error/10 border-error/20 text-error">
                    {uploadErrors.map((err, i) => (
                      <p key={i}>{err}</p>
                    ))}
                  </div>
                )}
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    Product Images
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
                      className="mx-auto mb-4 text-muted-foreground"
                    />
                    <p className="mb-2 text-muted-foreground">
                      Drag and drop images here, or click to select
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("image-upload-input")?.click()
                      }
                      disabled={hasUploadingImages}
                    >
                      {hasUploadingImages ? "Uploading..." : "Choose Files"}
                    </Button>
                  </div>
                </div>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {formData.images.map((image) => (
                      <div
                        key={image.id}
                        className="relative group aspect-square"
                      >
                        <Image
                          src={image.url}
                          alt={image.alt}
                          className="object-cover w-full h-full rounded-lg"
                        />
                        {image.isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60">
                            <div className="w-8 h-8 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                          </div>
                        )}
                        {!image.isUploading && (
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute p-1 text-white transition-opacity bg-red-600 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                          >
                            <Icon name="X" size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Input
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                  <Input
                    label="Compare at Price"
                    name="comparePrice"
                    type="number"
                    value={formData.comparePrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                  <Input
                    label="Cost per Item"
                    name="cost"
                    type="number"
                    value={formData.cost}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="SKU"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Enter SKU"
                  />
                  <Input
                    label="Barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    placeholder="Enter barcode"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Stock Quantity"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                  <Input
                    label="Low Stock Threshold"
                    name="lowStockThreshold"
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={handleInputChange}
                    placeholder="10"
                    min="0"
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">
                    Shipping Information
                  </h4>
                  <Input
                    label="Weight (kg)"
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    step="0.1"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Length (cm)"
                      type="number"
                      value={formData.dimensions.length}
                      onChange={(e) =>
                        handleDimensionChange("length", e.target.value)
                      }
                      placeholder="0"
                    />
                    <Input
                      label="Width (cm)"
                      type="number"
                      value={formData.dimensions.width}
                      onChange={(e) =>
                        handleDimensionChange("width", e.target.value)
                      }
                      placeholder="0"
                    />
                    <Input
                      label="Height (cm)"
                      type="number"
                      value={formData.dimensions.height}
                      onChange={(e) =>
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
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  placeholder="Enter SEO title"
                />
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    SEO Description
                  </label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    placeholder="Enter SEO description"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg border-border bg-background"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end p-6 space-x-3 border-t border-border bg-card">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={loading || hasUploadingImages}
            >
              {loading
                ? "Saving..."
                : hasUploadingImages
                ? "Uploading..."
                : "Save Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
