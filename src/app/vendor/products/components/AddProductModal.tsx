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
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services/productService";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import ShareModal from "@/components/ShareModal";
import MapboxAutocomplete from "@/components/MapboxAutocomplete";
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
  latitude?: string;
  longitude?: string;
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
  // | "seo"
  | "location"
  // | "availability"
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
  latitude: "",
  longitude: "",
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
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>("photos");
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [saveAsDraft, setSaveAsDraft] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [createdProductId, setCreatedProductId] = useState<
    string | number | null
  >(null);
  const [nameError, setNameError] = useState<string>("");

  // Location detection hook
  const {
    location: autoDetectedLocation,
    loading: isLocationLoading,
    refresh: detectLocation,
  } = useLocationDetection();

  // Handle auto-detect location
  const handleAutoDetectLocation = async () => {
    try {
      await detectLocation();
      if (autoDetectedLocation.state && autoDetectedLocation.country) {
        const locationString = `${autoDetectedLocation.state}, ${autoDetectedLocation.country}`;
        setFormData((prev) => ({
          ...prev,
          location: locationString,
          latitude: autoDetectedLocation.latitude || "",
          longitude: autoDetectedLocation.longitude || "",
        }));
        toast({
          title: "Success",
          description: "Location detected successfully!",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to detect location. Please enter manually.",
        variant: "destructive",
      });
    }
  };

  const statusOptions: SelectOption[] = [
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "inactive", label: "Inactive" },
  ];

  const visibilityOptions: SelectOption[] = [
    { value: "visible", label: "Visible" },
    { value: "hidden", label: "Hidden" },
  ];

  /* Fetch categories on component mount */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await productService.getCategories();
        if (
          response &&
          response.categories &&
          Array.isArray(response.categories)
        ) {
          const options = response.categories.map((cat: any) => ({
            value: cat.name,
            label: cat.name,
          }));
          setCategoryOptions(options);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to default categories if API fails
        setCategoryOptions([
          { value: "electronics", label: "Electronics" },
          { value: "clothing", label: "Clothing" },
          { value: "home", label: "Home & Garden" },
          { value: "beauty", label: "Beauty" },
          { value: "sports", label: "Sports" },
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
          images: (editingProduct.images || [])
            .slice(0, MAX_IMAGES)
            .map((img: any, index: number) => ({
              id: Date.now() + index,
              url: typeof img === "string" ? img : img.url,
              alt: "Existing image",
              isUploaded: true,
              isUploading: false,
            })),
          location: editingProduct.location || "",
          latitude: editingProduct.latitude?.toString() || "",
          longitude: editingProduct.longitude?.toString() || "",
          availableFrom: editingProduct.availableFrom || "",
          availableTo: editingProduct.availableTo || "",
          publish: !!editingProduct.publish,
        });
      } else {
        setFormData(initialFormData);
      }
      setCurrentStep("photos");
      setUploadErrors([]);
    }
  }, [isOpen, editingProduct]);

  /* ---------- Input handlers ---------- */

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle name input with validation - only allow letters, spaces, and basic punctuation
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow letters (any language), spaces, hyphens, apostrophes, ampersands, and periods
    const stringOnlyPattern = /^[\p{L}\s\-'&.,()]*$/u;

    if (value === "" || stringOnlyPattern.test(value)) {
      setFormData((prev) => ({ ...prev, name: value }));
      setNameError("");
    } else {
      setNameError(
        "Product name can only contain letters, spaces, and basic punctuation",
      );
    }
  };

  // Handle price input with comma formatting for display
  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Remove all non-digit and non-decimal characters
    const cleanValue = value.replace(/[^\d.]/g, "");
    // Store only the clean number in formData
    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
  };

  // Format price for display with comma separators
  const formatPriceDisplay = (value: string): string => {
    if (!value) return "";
    const numValue = parseFloat(value) || 0;
    return numValue.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const handleSelectChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDimensionChange = (
    dimension: keyof ProductDimensions,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [dimension]: value },
    }));
  };

  /* ---------- Image upload / drag & drop ---------- */

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    setUploadErrors([]);
    const incoming = Array.from(files).slice(
      0,
      MAX_IMAGES - formData.images.length,
    );

    incoming.forEach((file) => {
      // Validate file type - only allow PNG, JPG, JPEG
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setUploadErrors((prev) => [
          ...prev,
          `${file.name} is not a valid format. Only PNG, JPG, and JPEG are allowed.`,
        ]);
        return;
      }

      const tempId = Date.now() + Math.random();
      const tempImage: ManagedImage = {
        id: tempId,
        file, // Keep the file for submission
        url: URL.createObjectURL(file), // Preview URL
        alt: file.name,
        isUploading: false, // No longer uploading individually
        isUploaded: false,
      };

      setFormData((prev) => ({ ...prev, images: [...prev.images, tempImage] }));
    });

    if (incoming.length === 0 && formData.images.length >= MAX_IMAGES) {
      setUploadErrors((prev) => [
        ...prev,
        `Maximum of ${MAX_IMAGES} images allowed.`,
      ]);
    }
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
      e.dataTransfer.clearData();
    }
  };

  /* ---------- Step helpers ---------- */

  const steps: { id: WizardStep; label: string; icon?: string }[] = [
    { id: "photos", label: "Photos", icon: "Image" },
    { id: "details", label: "Details", icon: "Info" },
    { id: "pricing", label: "Pricing", icon: "DollarSign" },
    { id: "inventory", label: "Inventory", icon: "Package" },
    // { id: "seo", label: "SEO", icon: "Search" },
    { id: "location", label: "Location", icon: "MapPin" },
    // { id: "availability", label: "Availability", icon: "Calendar" },
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

  const hasUploadingImages = false; // No longer uploading images individually

  const processSubmission = async (isPublished: boolean) => {
    if (loading) return;

    // Validate required fields with detailed error messages
    const errors: string[] = [];

    // if (!formData.name || formData.name.trim() === "") {
    //   errors.push("Product name is required");
    // }

    // if (!formData.category || formData.category.trim() === "") {
    //   errors.push("Product category is required");
    // }

    // if (!formData.price || parseFloat(formData.price) <= 0) {
    //   errors.push("Product price is required and must be greater than 0");
    // }

    // if (!formData.description || formData.description.trim() === "") {
    //   errors.push("Product description is required");
    // }

    if (!formData.name || formData.name.trim() === "") {
      errors.push("• Product name is required.");
    }
    if (!formData.category || formData.category.trim() === "") {
      errors.push("• Product category is required.");
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.push("• Product price is required and must be greater than 0.");
    }
    if (!formData.description || formData.description.trim() === "") {
      errors.push("• Product description is required.");
    }

    if (errors.length > 0) {
      const errorMessage = errors.join("\n");
      toast({
        title: "Missing required fields",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create FormData object for multipart/form-data submission
      const formDataPayload = new FormData();

      // Add text fields
      formDataPayload.append("name", formData.name);
      formDataPayload.append("description", formData.description);
      formDataPayload.append("category", formData.category);
      formDataPayload.append("price", String(Number(formData.price)));

      if (formData.comparePrice) {
        formDataPayload.append(
          "compare_at_price",
          String(Number(formData.comparePrice)),
        );
      }
      if (formData.cost) {
        formDataPayload.append("cost_per_item", String(Number(formData.cost)));
      }

      formDataPayload.append("sku", formData.sku);
      formDataPayload.append("barcode", formData.barcode);
      formDataPayload.append("quantity", String(Number(formData.stock) || 0));
      formDataPayload.append(
        "low_stock_threshold",
        String(Number(formData.lowStockThreshold) || 0),
      );
      formDataPayload.append("weight", String(Number(formData.weight) || 0));
      formDataPayload.append("dimensions", JSON.stringify(formData.dimensions));
      formDataPayload.append("seo_title", formData.seoTitle);
      formDataPayload.append("seo_description", formData.seoDescription);
      formDataPayload.append("status", !saveAsDraft ? "active" : "draft");
      formDataPayload.append("is_published", String(!saveAsDraft));
      formDataPayload.append("location", formData.location || "");

      // Add latitude and longitude if available
      if (formData.latitude) {
        formDataPayload.append("latitude", String(Number(formData.latitude)));
      }
      if (formData.longitude) {
        formDataPayload.append("longitude", String(Number(formData.longitude)));
      }

      formDataPayload.append("availableFrom", formData.availableFrom || "");
      formDataPayload.append("availableTo", formData.availableTo || "");

      // Add image files directly (not URLs)
      formData.images.forEach((img) => {
        if (img.file) {
          // Append actual File objects
          formDataPayload.append(`images`, img.file);
        }
      });

      // Add tags as array
      formData.tags.forEach((tag, index) => {
        formDataPayload.append(`tags[${index}]`, tag);
      });

      let response;
      if (editingProduct) {
        // For editing, use patch endpoint
        response = await productService.editProduct(
          editingProduct.id,
          formDataPayload as any,
        );
      } else {
        // For new products, use addProduct with FormData
        response = await productService.addProduct(formDataPayload);
      }
      console.log("CREATE PRODUCT RESPONSE:", response);
      console.log("RESPONSE.DATA:", response?.data);

      // 🔍 DEBUG: inspect API response shape
      console.log("Full response:", response);
      console.log("Response.data:", response?.data);
      console.log("Possible product id locations:", {
        id: response?.data?.id,
        productId: response?.data?.product?.id,
        altId: response?.data?.product_id,
      });

      toast({
        title: editingProduct
          ? "✓ Product updated successfully!"
          : "✓ Product added successfully!",
        description: editingProduct
          ? "Your product changes have been saved."
          : "Your product is now live in the marketplace!",
        variant: "default",
      });
      onSave(response.data || response);

      // For new products, show share modal; for edits, just close
      if (!editingProduct) {
        // Extract product ID from response
        const productId =
          response?.data?.id ??
          response?.data?.product?.id ??
          response?.data?.data?.id ??
          response?.id ??
          null;

        console.log("FINAL PRODUCT ID:", productId);

        if (productId != null) {
          setCreatedProductId(productId);
          setShowShareModal(true);
        }
        if (productId) {
          setCreatedProductId(productId);
          setShowShareModal(true);
        } else {
          // Fallback: reload page if no product ID
          setTimeout(() => {
            onClose();
            // Reload to refresh product list
            window.location.reload();
          }, 1500);
        }
      } else {
        // For edits, just close without refresh
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to save product... Please try again.";
      toast({
        title: errorMsg,
        description: "Please check your input and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     UI
     =========================== */

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 z-50 md:ml-28 flex items-start md:items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[80vh] md:max-h-[90vh]  flex flex-col mb-10 mt-14 md:mt-0 md:ml-12"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Action Buttons */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>

          <div className="flex gap-2">
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
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50"
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
              {currentStep === "photos" && (
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
                          Add up to {MAX_IMAGES} photos. The first photo will be
                          your main image.
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
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <Icon
                        name="Upload"
                        size={40}
                        className="mx-auto mb-2 text-muted-foreground"
                      />
                      <p className="text-sm text-muted-foreground mb-3">
                        Drag and drop images here, or click to select from
                        device
                      </p>

                      <div className="flex gap-2 items-center justify-center">
                        <input
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,image/jpg"
                          id="wizard-image-input"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e.target.files)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document
                              .getElementById("wizard-image-input")
                              ?.click()
                          }
                          disabled={
                            hasUploadingImages ||
                            formData.images.length >= MAX_IMAGES
                          }
                        >
                          {hasUploadingImages
                            ? "Uploading..."
                            : "Upload from gallery"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document
                              .getElementById("wizard-image-input")
                              ?.click()
                          }
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
              )}

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

                    <div>
                      <Input
                        label="Product Title "
                        name="name"
                        value={formData.name}
                        onChange={handleNameChange}
                        placeholder="Enter product title"
                        required
                      />
                      {nameError && (
                        <p className="text-xs text-red-500 mt-1">{nameError}</p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-foreground">
                        Description *
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

                    <div>
                      <label className="block mb-2 text-sm font-medium text-foreground">
                        Category *
                      </label>
                      {categoriesLoading ? (
                        <div className="w-full px-3 py-2 border rounded-lg border-border bg-background flex items-center gap-2 text-muted-foreground">
                          <Icon
                            name="Loader2"
                            size={16}
                            className="animate-spin"
                          />
                          Loading categories...
                        </div>
                      ) : (
                        <Select
                          options={categoryOptions}
                          value={formData.category}
                          onChange={(value: any) =>
                            handleSelectChange("category", value)
                          }
                          placeholder="Select a category..."
                        />
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Choose from available product categories
                      </p>
                    </div>
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
                        label="Price (₦ / currency) *"
                        name="price"
                        type="text"
                        value={formatPriceDisplay(formData.price)}
                        onChange={handlePriceChange}
                        placeholder="0.00"
                        required
                      />
                      {/* <Input
                        label="Compare at Price"
                        name="comparePrice"
                        type="text"
                        value={formatPriceDisplay(formData.comparePrice)}
                        onChange={handlePriceChange}
                        placeholder="0.00"
                      />
                      <Input
                        label="Cost per Item"
                        name="cost"
                        type="text"
                        value={formatPriceDisplay(formData.cost)}
                        onChange={handlePriceChange}
                        placeholder="0.00"
                      /> */}
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
                    {/* 
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
                    </div> */}

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
                      {/* <Input
                        label="Low Stock Threshold"
                        name="lowStockThreshold"
                        type="number"
                        value={formData.lowStockThreshold}
                        onChange={handleInputChange}
                        placeholder="10"
                        min="0"
                      /> */}
                    </div>

                    {/* <div>
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
                          onChange={(e) =>
                            handleDimensionChange("length", e.target.value)
                          }
                          placeholder="0"
                        />
                        <Input
                          label="Width (cm)"
                          name="width"
                          type="number"
                          value={formData.dimensions.width}
                          onChange={(e) =>
                            handleDimensionChange("width", e.target.value)
                          }
                          placeholder="0"
                        />
                        <Input
                          label="Height (cm)"
                          name="height"
                          type="number"
                          value={formData.dimensions.height}
                          onChange={(e) =>
                            handleDimensionChange("height", e.target.value)
                          }
                          placeholder="0"
                        />
                      </div>
                    </div> */}
                  </div>
                </motion.div>
              )}

              {/* SEO */}
              {/* {currentStep === "seo" && (
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
              )} */}

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

                    {/* Mapbox Autocomplete location */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Location (optional)
                      </label>
                      <MapboxAutocomplete
                        value={formData.location || ""}
                        onChange={(value, coordinates, details) => {
                          setFormData((prev) => ({
                            ...prev,
                            location: value,
                            latitude: coordinates?.lat
                              ? String(coordinates.lat)
                              : "",
                            longitude: coordinates?.lng
                              ? String(coordinates.lng)
                              : "",
                          }));
                        }}
                        onDetectLocation={handleAutoDetectLocation}
                        isDetecting={isLocationLoading}
                        placeholder="Type to search (e.g., Nelocap estate, Lokogoma, Abuja)"
                        showDetectButton={true}
                      />
                    </div>

                    {(formData.latitude || formData.longitude) && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-800">
                          <span className="font-semibold">Coordinates:</span>{" "}
                          Lat: {formData.latitude || "N/A"}, Lng:{" "}
                          {formData.longitude || "N/A"}
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      If you want buyers to pick up locally or show location in
                      the listing, enter it here or use auto-detect.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* AVAILABILITY */}
              {/* {currentStep === "availability" && (
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
                        <label className="block mb-1 text-sm font-medium">
                          Available From
                        </label>
                        <input
                          type="date"
                          name="availableFrom"
                          value={formData.availableFrom || ""}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              availableFrom: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border rounded-lg border-border bg-background"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Available To
                        </label>
                        <input
                          type="date"
                          name="availableTo"
                          value={formData.availableTo || ""}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              availableTo: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border rounded-lg border-border bg-background"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )} */}

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
                          <h5 className="font-semibold">
                            {formData.name || "Product Title"}
                          </h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formData.description ||
                              "Product description preview..."}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Category: {formData.category}
                          </p>
                          <p className="mt-1 text-lg font-bold">
                            {formData.price
                              ? `₦${formatPriceDisplay(formData.price)}`
                              : "₦0"}
                          </p>
                        </div>

                        <div>
                          <h6 className="font-medium">Images</h6>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {formData.images.slice(0, 6).map((img) => (
                              <Image
                                key={img.id}
                                src={img.url}
                                alt={img.alt}
                                className="object-cover w-full h-24 rounded"
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border p-4">
                        <p className="text-sm text-muted-foreground">
                          Status: {formData.status}
                        </p>
                        <p className="text-sm mt-1">
                          Visibility: {formData.visibility}
                        </p>
                        <p className="text-sm mt-1">
                          Stock: {formData.stock || 0}
                        </p>
                        {/* <p className="text-sm mt-1">
                          SKU: {formData.sku || "-"}
                        </p> */}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* footer */}
          <div className="flex gap-3 px-4 py-4 border-t border-border">
            <button
              type="button"
              onClick={goBack}
              disabled={currentStep === "photos"}
              className="flex-1 px-4 py-2 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            {currentStep === "preview" ? (
              <button
                type="button"
                onClick={() => processSubmission(true)}
                className="flex-1 px-4 py-2 rounded-md bg-success text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
                disabled={loading || hasUploadingImages}
              >
                {loading ? "Saving..." : "Save & Publish"}
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-md bg-primary text-white hover:opacity-95 transition"
              >
                Next
              </button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setTimeout(() => {
            onClose();
            // Reload to refresh product list
            // window.location.reload();
          }, 300);
        }}
        productId={createdProductId || ""}
        productName={formData.name}
      />
    </div>
  );
};

export default AddProductWizard;
