/* AddProductWizard.tsx */
"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  DragEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/AppIcon";
import Image from "@/components/ui/AppImage";
import Button from "@/components/ui/new/Button";
import Input from "@/components/ui/new/Input";
import Select from "@/components/ui/new/NewSelect";
import { vendorService } from "@/services/vendorService";
import { toast } from "sonner";
import { productService } from "@/services/productService";
/* ===========================
   Types
   =========================== */

export interface ProductDimensions {
  length: string;
  width: string;
  height: string;
}

export interface ManagedImage {
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
  location?: string;
  availableFrom?: string; // ISO date
  availableTo?: string; // ISO date
  publish?: boolean;
}

/* Step descriptor type */
type WizardStep =
  | "photos"
  | "details"
  | "pricing"
  | "inventory"
  | "seo"
  | "location"
  | "availability"
  | "preview";

/* Component props */
interface AddProductWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ProductFormData) => void;
  editingProduct?: any | null;
  // loading?: boolean;
}

/* Select option type */
interface SelectOption {
  value: string;
  label: string;
}

/* ===========================
   Constants / Helpers
   =========================== */

const MAX_IMAGES = 10;

// const uploadImageToServer = async (file: File): Promise<{ url: string }> => {
//   // kept your same vendorService upload usage; vendorService.uploadImage should return { urls: [string] } or similar
//   const response = await vendorService.uploadImage(file);
//   if (!response.urls || response.urls.length === 0) {
//     throw new Error("API did not return an image URL.");
//   }
//   return { url: response.urls[0] };
// };

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
  location: "",
  availableFrom: "",
  availableTo: "",
  publish: false,
};

/* ===========================
   Component
   =========================== */

const AddProductWizard: React.FC<AddProductWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct = null,
  // loading = false,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>("details");
  const [formData, setFormData] =
    useState<ProductFormData>(initialFormData);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [saveAsDraft, setSaveAsDraft] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const categoryOptions: SelectOption[] = [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "home", label: "Home & Garden" },
    { value: "beauty", label: "Beauty" },
    { value: "sports", label: "Sports" },
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

  /* When modal opens — prefill if editing or reset */
  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          ...initialFormData,
          name: editingProduct.name || "",
          description: editingProduct.description || "",
          category: editingProduct.category || "electronics",
          price:
            typeof editingProduct.price === "number"
              ? (editingProduct.price / 100).toString()
              : editingProduct.price || "",
          comparePrice:
            typeof editingProduct.comparePrice === "number"
              ? (editingProduct.comparePrice / 100).toString()
              : editingProduct.comparePrice || "",
          cost:
            typeof editingProduct.cost === "number"
              ? (editingProduct.cost / 100).toString()
              : editingProduct.cost || "",
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
          images: (editingProduct.images || []).slice(0, MAX_IMAGES).map(
            (img: any, index: number) => ({
              id: Date.now() + index,
              url: typeof img === "string" ? img : img.url,
              alt: "Existing image",
              isUploaded: true,
              isUploading: false,
            })
          ),
          location: editingProduct.location || "",
          availableFrom: editingProduct.availableFrom || "",
          availableTo: editingProduct.availableTo || "",
          publish: !!editingProduct.publish,
        });
      } else {
        setFormData(initialFormData);
      }
      setCurrentStep("details");
      setUploadErrors([]);
    }
  }, [isOpen, editingProduct]);

  /* ---------- Input handlers ---------- */

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

  /* ---------- Image upload / drag & drop ---------- */

  // const handleImageUpload = (files: FileList | null) => {
  //   if (!files) return;
  //   setUploadErrors([]);
  //   const incoming = Array.from(files).slice(0, MAX_IMAGES - formData.images.length);

  //   incoming.forEach((file) => {
  //     const tempId = Date.now() + Math.random();
  //     const tempImage: ManagedImage = {
  //       id: tempId,
  //       file,
  //       url: URL.createObjectURL(file),
  //       alt: file.name,
  //       isUploading: true,
  //       isUploaded: false,
  //     };

  //     setFormData((prev) => ({ ...prev, images: [...prev.images, tempImage] }));

  //     uploadImageToServer(file)
  //       .then((result) => {
  //         setFormData((prev) => ({
  //           ...prev,
  //           images: prev.images.map((img) =>
  //             img.id === tempId
  //               ? {
  //                   ...img,
  //                   url: result.url,
  //                   isUploaded: true,
  //                   isUploading: false,
  //                   file: undefined,
  //                 }
  //               : img
  //           ),
  //         }));
  //       })
  //       .catch((error: any) => {
  //         console.error("Image upload failed:", error);
  //         setFormData((prev) => ({
  //           ...prev,
  //           images: prev.images.filter((img) => img.id !== tempId),
  //         }));
  //         setUploadErrors((prev) => [
  //           ...prev,
  //           `Failed to upload ${file.name}: ${error.message || "Upload error"}`,
  //         ]);
  //       });
  //   });

  //   if (incoming.length === 0 && formData.images.length >= MAX_IMAGES) {
  //     setUploadErrors((prev) => [
  //       ...prev,
  //       `Maximum of ${MAX_IMAGES} images allowed.`,
  //     ]);
  //   }
  // };

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

  // const handleDrop = (e: DragEvent<HTMLDivElement>) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setDragActive(false);
  //   if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
  //     handleImageUpload(e.dataTransfer.files);
  //     e.dataTransfer.clearData();
  //   }
  // };

  /* ---------- Step helpers ---------- */

  const steps: { id: WizardStep; label: string; icon?: string }[] = [
    { id: "photos", label: "Photos", icon: "Image" },
    { id: "details", label: "Details", icon: "Info" },
    { id: "pricing", label: "Pricing", icon: "DollarSign" },
    { id: "inventory", label: "Inventory", icon: "Package" },
    { id: "seo", label: "SEO", icon: "Search" },
    { id: "location", label: "Location", icon: "MapPin" },
    { id: "availability", label: "Availability", icon: "Calendar" },
    { id: "preview", label: "Preview", icon: "Eye" },
  ];

  const goNext = () => {
    const idx = steps.findIndex((s) => s.id === currentStep);
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].id);
  };
  const goBack = () => {
    const idx = steps.findIndex((s) => s.id === currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1].id);
  };

  /* ---------- Submit / Save ---------- */

  const hasUploadingImages = formData.images.some((img) => img.isUploading);

const processSubmission = async (isPublished: boolean) => {
  if (hasUploadingImages) {
    toast.error("Please wait for images to finish uploading");
    return;
  }
  if (loading) return;

  setLoading(true);
  try {
    // This object must strictly follow the AddProductRequest interface
    const payload = {
      name: formData.name,              // Matches 'product_name'
      description: formData.description, // Likely match for 'product_description'
      category: formData.category,              // Matches 'category'
      price: Number(formData.price),    // Matches 'product_price'
      compare_at_price: formData.comparePrice ? Number(formData.comparePrice) : undefined,
      cost_per_item: formData.cost ? Number(formData.cost) : undefined,
      sku: formData.sku,
      barcode: formData.barcode,
      quantity: Number(formData.stock) || 0,
      low_stock_threshold: Number(formData.lowStockThreshold) || 0,
      weight: Number(formData.weight) || 0,
      dimensions: JSON.stringify(formData.dimensions), // APIs often want dimensions as a string or specific object
      seo_title: formData.seoTitle,
      seo_description: formData.seoDescription,
      status: isPublished ? "active" : "draft", // Matches 'status'
      images: formData.images.map((img) => img.url),
      is_published: isPublished,
    };

    let response;
    if (editingProduct) {
      // For EditProductRequest, ensure keys match similarly
      response = await productService.editProduct(editingProduct.id, payload as any);
    } else {
      response = await productService.addProduct(payload as any);
    }

    toast.success(editingProduct ? "Product updated!" : "Product created!");
    onSave(response.data);
    onClose();
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "Failed to save product.";
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};
  if (!isOpen) return null;

  /* ===========================
     UI
     =========================== */

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[80vh] md:max-h-[90vh]  flex flex-col mb-10 mt-14 md:mt-0 md:ml-12"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Action Buttons */}
        <div className="flex justify-between items-center p-4">
<button
  type="button"
  onClick={() => processSubmission(false)} // Save as Draft
  className="text-xs px-3 py-2 rounded-md border border-border hover:bg-muted"
  disabled={loading || hasUploadingImages}
>
  {loading ? "Processing..." : "Save draft"}
</button>

<button
  type="button"
  onClick={() => processSubmission(true)} // Publish
  className="text-sm px-3 py-1 rounded-md bg-primary text-white hover:opacity-95"
  disabled={loading || hasUploadingImages}
>
  Publish
</button>
        </div>


        {/* Stepper nav */}
        <div className="hidden md:flex items-center gap-2 px-4 py-3 border-b border-border overflow-x-auto">
          {steps.map((s) => {
            const idx = steps.findIndex((x) => x.id === s.id) + 1;
            const active = s.id === currentStep;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-md transition ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span className="text-xs font-medium">{idx}.</span>
                <span className="text-sm">{s.label}</span>
              </button>
            );
          })}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (currentStep === "preview") processSubmission(true);
            else goNext();
          }}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* PHOTOS */}
              {/* {currentStep === "photos" && (
                <motion.div
                  key="photos"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-semibold">Add Photos</h4>
                        <p className="text-sm text-muted-foreground">
                          Add up to {MAX_IMAGES} photos. The first photo will
                          be your main image.
                        </p>
                      </div>
                      <div className="text-xs w-[30%] md:w-[10%] text-muted-foreground">
                        <span>{formData.images.length}</span> / {MAX_IMAGES}
                      </div>
                    </div>

                    {uploadErrors.length > 0 && (
                      <div className="p-3 text-sm border rounded-lg bg-error/10 border-error/20 text-error">
                        {uploadErrors.map((err, i) => (
                          <p key={i}>{err}</p>
                        ))}
                      </div>
                    )}

                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      // onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <Icon name="Upload" size={40} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Drag and drop images here, or click to select from device
                      </p>

                      <div className="flex gap-2 items-center justify-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          id="wizard-image-input"
                          className="hidden"
                          // onChange={(e) => handleImageUpload(e.target.files)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("wizard-image-input")?.click()}
                          disabled={hasUploadingImages || formData.images.length >= MAX_IMAGES}
                        >
                          {hasUploadingImages ? "Uploading..." : "Upload from gallery"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("wizard-image-input")?.click()}
                        >
                          Take Photo
                        </Button>
                      </div>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {formData.images.map((image) => (
                          <motion.div
                            key={image.id}
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="relative rounded-lg overflow-hidden bg-muted/5"
                          >
                            <Image
                              src={image.url}
                              alt={image.alt}
                              className="object-cover w-full h-32 sm:h-36"
                            />
                            {image.isUploading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <div className="w-8 h-8 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                              </div>
                            )}

                            <div className="absolute top-2 right-2 flex gap-2">
                              {!image.isUploading && (
                                <button
                                  type="button"
                                  onClick={() => removeImage(image.id)}
                                  className="p-1 text-white rounded-full bg-red-600/90 hover:bg-red-700 transition"
                                  aria-label="Remove image"
                                >
                                  <Icon name="X" size={14} />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )} */}

              {/* DETAILS */}
              {currentStep === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-base font-semibold">Basic Details</h4>
                      <p className="text-sm text-muted-foreground">
                        Title, description and category
                      </p>
                    </div>

                    <Input
                      label="Product Title"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product title"
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
                        placeholder="Add descriptive details about your product"
                        rows={6}
                        className="w-full px-3 py-2 border rounded-lg border-border bg-background"
                      />
                    </div>

                    <Select
                      label="Category"
                      options={categoryOptions}
                      value={formData.category}
                      onChange={(value) => handleSelectChange("category", value as string)}
                      placeholder="Select category"
                      required
                    />
                  </div>
                </motion.div>
              )}

              {/* PRICING */}
              {currentStep === "pricing" && (
                <motion.div
                  key="pricing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="space-y-6">
                    <h4 className="text-base font-semibold">Pricing</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Price (₦ / currency)"
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
                </motion.div>
              )}

              {/* INVENTORY */}
              {currentStep === "inventory" && (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="space-y-6">
                    <h4 className="text-base font-semibold">Inventory</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div>
                      <h5 className="font-medium text-foreground">Shipping</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <Input
                          label="Weight (kg)"
                          name="weight"
                          type="number"
                          value={formData.weight}
                          onChange={handleInputChange}
                          placeholder="0.0"
                          step="0.1"
                        />
                        <Input
                          label="Length (cm)"
                          name="length"
                          type="number"
                          value={formData.dimensions.length}
                          onChange={(e) => handleDimensionChange("length", e.target.value)}
                          placeholder="0"
                        />
                        <Input
                          label="Width (cm)"
                          name="width"
                          type="number"
                          value={formData.dimensions.width}
                          onChange={(e) => handleDimensionChange("width", e.target.value)}
                          placeholder="0"
                        />
                        <Input
                          label="Height (cm)"
                          name="height"
                          type="number"
                          value={formData.dimensions.height}
                          onChange={(e) => handleDimensionChange("height", e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SEO */}
              {currentStep === "seo" && (
                <motion.div
                  key="seo"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold">SEO</h4>

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
                </motion.div>
              )}

              {/* LOCATION */}
              {currentStep === "location" && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold">Location</h4>
                    <Input
                      label="Location (optional)"
                      name="location"
                      value={formData.location || ""}
                      onChange={handleInputChange}
                      placeholder="City, State, or Address"
                    />
                    <p className="text-sm text-muted-foreground">
                      If you want buyers to pick up locally or show location in
                      the listing, enter it here.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* AVAILABILITY */}
              {currentStep === "availability" && (
                <motion.div
                  key="availability"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold">Availability</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Available From</label>
                        <input
                          type="date"
                          name="availableFrom"
                          value={formData.availableFrom || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, availableFrom: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg border-border bg-background"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium">Available To</label>
                        <input
                          type="date"
                          name="availableTo"
                          value={formData.availableTo || ""}
                          onChange={(e) => setFormData((p) => ({ ...p, availableTo: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg border-border bg-background"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PREVIEW */}
              {currentStep === "preview" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold">Preview</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-4">
                        <div className="rounded-lg border border-border p-4">
                          <h5 className="font-semibold">{formData.name || "Product Title"}</h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formData.description || "Product description preview..."}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">Category: {formData.category}</p>
                          <p className="mt-1 text-lg font-bold">{formData.price ? `₦${formData.price}` : "$0.00"}</p>
                        </div>

                        <div>
                          <h6 className="font-medium">Images</h6>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {formData.images.slice(0, 6).map((img) => (
                              <Image key={img.id} src={img.url} alt={img.alt} className="object-cover w-full h-24 rounded" />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border p-4">
                        <p className="text-sm text-muted-foreground">Status: {formData.status}</p>
                        <p className="text-sm mt-1">Visibility: {formData.visibility}</p>
                        <p className="text-sm mt-1">Stock: {formData.stock || 0}</p>
                        <p className="text-sm mt-1">SKU: {formData.sku || "-"}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
{/* footer */}
          {currentStep === "preview" ? (
  <button
    type="button" // Change to button to control the click
    onClick={() => processSubmission(true)}
    className="px-4 py-2 w-full m-4 rounded-md bg-success text-white hover:opacity-95"
    disabled={loading || hasUploadingImages}
  >
    {loading ? "Saving..." : "Save & Publish"}
  </button>
) : (
  <button
    type="submit" // This triggers form onSubmit -> goNext()
    className="px-4 py-2 m-4 rounded-md bg-primary text-white hover:opacity-95"
  >
    Continue
  </button>
)}
        </form>
      </motion.div>
    </div>
  );
};

export default AddProductWizard;
