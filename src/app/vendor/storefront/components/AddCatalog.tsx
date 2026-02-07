"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Camera,
  Package,
  Check,
  Search,
  Loader2,
  Plus,
  Info,
  ShoppingBag,
  FolderPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productService } from "@/services/productService";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  category: string;
  final_price: number;
  images: string[];
}

interface Catalog {
  id: number;
  name: string;
  description?: string;
  product_count?: number;
  image?: string | null;
}

const AddCatalog = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [fetchingCatalogs, setFetchingCatalogs] = useState(true);

  // Mode: 'new' or 'existing'
  const [mode, setMode] = useState<"new" | "existing">("new");

  // Form State
  const [catalogName, setCatalogName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCatalogId, setSelectedCatalogId] = useState<number | null>(
    null,
  );
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [existingCatalogs, setExistingCatalogs] = useState<Catalog[]>([]);
  const [catalogImage, setCatalogImage] = useState<File | null>(null);
  const [catalogImagePreview, setCatalogImagePreview] = useState<string | null>(
    null,
  );

  // 1. Fetch products and catalogs on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getMyProducts();
        if (res.status === "success") {
          // Collect ALL products from all catalogs and standalone products
          const allProducts: any[] = [];
          const seenProductIds = new Set<number>();

          res.data.forEach((item: any) => {
            if (item.products && Array.isArray(item.products)) {
              item.products.forEach((product: any) => {
                if (!seenProductIds.has(product.id)) {
                  allProducts.push(product);
                  seenProductIds.add(product.id);
                }
              });
            }
          });

          setAvailableProducts(allProducts);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setFetchingProducts(false);
      }
    };

    const fetchCatalogs = async () => {
      try {
        const res = await productService.getCatalogs();
        if (res.status === "success" && res.catalogs) {
          const catalogs = res.catalogs.filter(
            (cat: any) => cat.name !== "Standalone Products",
          );
          setExistingCatalogs(
            catalogs.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              description: cat.description,
              product_count: cat.products?.length || 0,
              image: cat.image || null,
            })),
          );
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load catalogs",
          variant: "destructive",
        });
      } finally {
        setFetchingCatalogs(false);
      }
    };

    fetchProducts();
    fetchCatalogs();
  }, [toast]);

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setCatalogImage(null);
      setCatalogImagePreview(null);
      return;
    }
    setCatalogImage(file);
    setCatalogImagePreview(URL.createObjectURL(file));
  };

  const toggleProduct = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSelectCatalog = async (catalog: Catalog) => {
    setSelectedCatalogId(catalog.id);
    setMode("existing");
    setCatalogName(catalog.name || "");
    setDescription(catalog.description || "");
    setCatalogImage(null);
    setCatalogImagePreview(catalog.image || null);

    // Fetch existing products in this catalog so we can append to them
    try {
      const res = await productService.getCatalogs();
      if (res.status === "success" && res.catalogs) {
        const selectedCat = res.catalogs.find(
          (cat: any) => cat.id === catalog.id,
        );
        if (selectedCat && selectedCat.products) {
          // Pre-select products already in this catalog
          const existingProductIds = selectedCat.products.map((p: any) => p.id);
          setSelectedProductIds(existingProductIds);
        }
      }
    } catch (error) {
      console.error("Failed to load catalog products:", error);
    }
  };

  // 2. Submit Catalog
  const handleCreateCatalog = async () => {
    if (mode === "new" && !catalogName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a catalog name",
      });
      return;
    }

    if (mode === "existing" && !selectedCatalogId) {
      toast({
        title: "Selection Required",
        description: "Please select a catalog",
      });
      return;
    }

    if (selectedProductIds.length === 0) {
      toast({
        title: "No Products",
        description: "Please select at least one product",
      });
      return;
    }

    setLoading(true);
    try {
      let data;
      if (mode === "new") {
        data = await productService.createCatalog({
          name: catalogName,
          description: description,
          product_ids: selectedProductIds,
          image: catalogImage,
        });
      } else {
        const targetCatalog = existingCatalogs.find(
          (c) => c.id === selectedCatalogId,
        );
        data = await productService.updateCatalog(selectedCatalogId!, {
          name: catalogName || targetCatalog?.name,
          description: description,
          product_ids: selectedProductIds,
          image: catalogImage || undefined,
        });
      }

      if (data.status === "success") {
        toast({
          title: "Success",
          description:
            data.message ||
            `Catalog ${mode === "new" ? "created" : "updated"} successfully!`,
        });

        // Trigger catalog refresh in BusinessStorefrontView
        localStorage.setItem("catalogsUpdated", Date.now().toString());

        setCatalogName("");
        setDescription("");
        setSelectedProductIds([]);
        setSelectedCatalogId(null);
        setCatalogImage(null);
        setCatalogImagePreview(null);
        setMode("existing");
        setFetchingCatalogs(true);
        productService
          .getCatalogs()
          .then((res) => {
            if (res.status === "success" && res.catalogs) {
              const catalogs = res.catalogs.filter(
                (cat: any) => cat.name !== "Standalone Products",
              );
              setExistingCatalogs(
                catalogs.map((cat: any) => ({
                  id: cat.id,
                  name: cat.name,
                  description: cat.description,
                  product_count: cat.products?.length || 0,
                  image: cat.image || null,
                })),
              );
            }
          })
          .finally(() => setFetchingCatalogs(false));
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.msg || "Connection failed";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans pb-24">
      {/* WHATSAPP STYLE HEADER */}
      <div className="bg-[#008069] text-white px-4 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          {/* <ChevronLeft className="cursor-pointer" /> */}
          <div>
            <h1 className="text-lg font-medium">New catalog</h1>
            <p className="text-[11px] opacity-80 uppercase tracking-wider font-bold">
              Storefront Catalog
            </p>
          </div>
        </div>
        {/* <button 
          onClick={handleCreateCatalog}
          disabled={loading}
          className="text-sm font-bold uppercase tracking-tight hover:bg-white/10 px-3 py-1 rounded"
        >
          {loading ? "Saving..." : "Done"}
        </button> */}
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* MODE SELECTOR */}
        <div className="bg-white rounded-lg shadow-sm p-2 flex gap-2">
          <button
            onClick={() => setMode("new")}
            className={`flex-1 py-3 rounded-md text-xs font-black uppercase tracking-wider transition-all ${
              mode === "new"
                ? "bg-[#008069] text-white shadow-md"
                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            }`}
          >
            <Plus size={16} className="inline mr-1 mb-0.5" />
            New catalog
          </button>
          <button
            onClick={() => setMode("existing")}
            className={`flex-1 py-3 rounded-md text-xs font-black uppercase tracking-wider transition-all ${
              mode === "existing"
                ? "bg-[#008069] text-white shadow-md"
                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            }`}
          >
            <FolderPlus size={16} className="inline mr-1 mb-0.5" />
            Add to Existing
          </button>
        </div>

        {/* CATALOG DETAILS CARD - BOTH MODES */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex flex-col items-center py-4 border-b border-slate-100">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-[#008069] mb-2 border-2 border-dashed border-slate-300 overflow-hidden">
              {catalogImagePreview ? (
                <img
                  src={catalogImagePreview}
                  alt="Catalog"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera size={32} />
              )}
            </div>
            <label
              className="text-xs font-bold text-[#008069] uppercase cursor-pointer"
              htmlFor="catalog-image-input"
            >
              {catalogImagePreview ? "Change Image" : "Add Image (Optional)"}
            </label>
            <input
              id="catalog-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-4">
            <div className="border-b-2 border-slate-100 focus-within:border-[#008069] transition-all">
              <label className="text-[10px] font-bold text-[#008069] uppercase">
                catalog Name
              </label>
              <input
                type="text"
                placeholder="e.g. Summer catalog"
                className="w-full py-2 outline-none text-base placeholder:text-slate-300"
                value={catalogName}
                onChange={(e) => setCatalogName(e.target.value)}
              />
            </div>

            <div className="border-b-2 border-slate-100 focus-within:border-[#008069] transition-all">
              <label className="text-[10px] font-bold text-[#008069] uppercase">
                Description (Optional)
              </label>
              <textarea
                placeholder="Tell customers about this catalog..."
                className="w-full py-2 outline-none text-sm resize-none placeholder:text-slate-300"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* EXISTING CATALOGS LIST - EXISTING MODE */}
        {mode === "existing" && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Select catalog
              </h3>
            </div>

            {fetchingCatalogs ? (
              <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-2" />
                <p className="text-xs font-bold uppercase">
                  Loading catalogs...
                </p>
              </div>
            ) : existingCatalogs.length > 0 ? (
              <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
                {existingCatalogs.map((catalog) => (
                  <div
                    key={catalog.id}
                    onClick={() => handleSelectCatalog(catalog)}
                    className="flex items-center p-4 gap-4 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedCatalogId === catalog.id
                          ? "bg-[#008069] border-[#008069]"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedCatalogId === catalog.id && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>

                    <div className="w-12 h-12 bg-gradient-to-br from-[#008069] to-[#00A884] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {catalog.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {catalog.product_count} product
                        {catalog.product_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                <Package size={32} className="mb-2" />
                <p className="text-xs font-bold uppercase">No catalogs yet</p>
                <button
                  onClick={() => setMode("new")}
                  className="text-sm font-bold text-[#008069] mt-2"
                >
                  Create your first catalog
                </button>
              </div>
            )}
          </div>
        )}

        {/* PRODUCT SELECTION SECTION */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Select Products
            </h3>
            <span className="bg-[#008069]/10 text-[#008069] text-[10px] font-black px-2 py-0.5 rounded-full">
              {selectedProductIds.length} Selected
            </span>
          </div>

          {fetchingProducts ? (
            <div className="p-10 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-2" />
              <p className="text-xs font-bold uppercase">
                Loading your store...
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto no-scrollbar">
              {availableProducts.length > 0 ? (
                availableProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className="flex items-center p-4 gap-4 cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    {/* Selection Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedProductIds.includes(product.id)
                          ? "bg-[#008069] border-[#008069]"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedProductIds.includes(product.id) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <ShoppingBag
                          size={20}
                          className="m-auto mt-3 text-slate-300"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {product.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">
                        ₦{product.final_price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                  <Package size={32} className="mb-2" />
                  <p className="text-xs font-bold uppercase">
                    No products found in your store.{" "}
                  </p>
                  <Link
                    href="/vendor/products"
                    className="text-sm font-bold text-[#008069] mt-2"
                  >
                    {" "}
                    Add Products{" "}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* INFO TIP */}
        <div className="flex items-start gap-3 p-4 bg-[#D1E9FF] rounded-lg text-[#004E96]">
          <Info size={18} className="mt-0.5" />
          <p className="text-[11px] font-medium leading-relaxed">
            Creating a catalog helps customers find your products faster by
            grouping related items together.
          </p>
        </div>
      </div>

      {/* FIXED BOTTOM ACTION (MOBILE STYLE) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex justify-center">
        <button
          onClick={handleCreateCatalog}
          disabled={
            loading ||
            selectedProductIds.length === 0 ||
            (mode === "existing" && !selectedCatalogId)
          }
          className={`w-full max-w-md py-4 rounded-full text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
            selectedProductIds.length > 0 &&
            (mode === "new" || selectedCatalogId)
              ? "bg-[#1E293B]"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          {loading
            ? "Processing..."
            : mode === "new"
              ? `Create catalog (${selectedProductIds.length} Items)`
              : `Add to catalog (${selectedProductIds.length} Items)`}
        </button>
      </div>
    </div>
  );
};

export default AddCatalog;
