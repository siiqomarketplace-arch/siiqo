"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import { toast } from "sonner";
import api from "@/services/api";

interface Product {
  id: number;
  name: string;
  final_price: number;
  original_price: number;
  images: string[];
  status: string;
  category: string;
  condition: string;
  quantity: number;
}

interface CatalogProduct {
  id: number;
  image: string;
  name: string;
  price: number;
}

interface Catalog {
  id: number;
  name: string;
  description?: string;
  product_count?: number;
  products?: CatalogProduct[];
}

const MyListings = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"products" | "catalogs">("products");
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.get("/products/my-products"),
          api.get("/products/catalogs"),
        ]);

        if (prodRes.data.status === "success") {
          // Flatten the nested structure from your API response
          const allProducts = prodRes.data.data.flatMap(
            (item: any) => item.products,
          );
          setProducts(allProducts);
        }

        if (catRes.data.status === "success") {
          setCatalogs(catRes.data.catalogs);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast.error("Failed to load your listings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCatalogClick = async (catalog: Catalog) => {
    try {
      setLoading(true);
      setSelectedCatalog(catalog);
      setViewMode("products"); // Switch to product view to show that catalog's items
    } catch (err) {
      toast.error("Could not load catalog products");
    } finally {
      setLoading(false);
    }
  };

  // Get products to display based on selected catalog or all products
  const displayedProducts = selectedCatalog
    ? (selectedCatalog as any).products || []
    : products;

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="space-y-6  ">
      {/* Top Navigation & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => {
              setViewMode("products");
              setSelectedCatalog(null);
            }}
            className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === "products" && !selectedCatalog
                ? "bg-white shadow-sm text-black"
                : "text-text-secondary"
            }`}
          >
            View By Products
          </button>
          <button
            onClick={() => setViewMode("catalogs")}
            className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === "catalogs"
                ? "bg-white shadow-sm text-black"
                : "text-text-secondary"
            }`}
          >
            View By Catalogs
          </button>
        </div>

        {selectedCatalog && (
          <button
            onClick={() => {
              setSelectedCatalog(null);
              setViewMode("catalogs");
            }}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Icon name="ArrowLeft" size={16} /> Back to Catalogs
          </button>
        )}
      </div>

      {/* Header Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          {selectedCatalog
            ? `Catalog: ${selectedCatalog.name}`
            : viewMode === "products"
              ? "All Products"
              : "My Catalogs"}
        </h2>
        <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded-full text-text-secondary">
          {viewMode === "products" ? displayedProducts.length : catalogs.length}{" "}
          items
        </span>
      </div>

      {/* Content Grid */}
      {viewMode === "products" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map((product: Product | CatalogProduct) => (
            <div
              key={product.id}
              onClick={() => router.push(`/products/${product.id}`)}
              className="bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={
                    ("images" in product ? product.images[0] : product.image) ||
                    "/placeholder-product.png"
                  }
                  fill
                  alt={product.name}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {"status" in product && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm border shadow-sm">
                      {product.status}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                {"category" in product && (
                  <p className="text-[10px] font-bold text-primary uppercase mb-1">
                    {product.category}
                  </p>
                )}
                <h3 className="font-bold text-text-primary text-base line-clamp-1 mb-2">
                  {product.name}
                </h3>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-lg font-black text-text-primary">
                    ₦
                    {("final_price" in product
                      ? product.final_price
                      : product.price
                    ).toLocaleString()}
                  </span>
                  {"original_price" in product &&
                    product.original_price > product.final_price && (
                      <span className="text-xs text-text-tertiary line-through">
                        ₦{product.original_price.toLocaleString()}
                      </span>
                    )}
                </div>

                {"quantity" in product && (
                  <div className="mt-auto pt-4 border-t border-dashed flex items-center justify-between">
                    <div className="flex items-center gap-3 text-text-secondary">
                      <span className="flex items-center gap-1 text-xs">
                        <Icon name="Package" size={12} /> {product.quantity}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Catalogs Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map((catalog) => (
            <div
              key={catalog.id}
              onClick={() => handleCatalogClick(catalog)}
              className="cursor-pointer group relative bg-black rounded-2xl overflow-hidden h-48 flex items-end p-6"
            >
              {/* Decorative background overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />

              <div className="relative z-20 w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-white font-bold text-xl mb-1">
                      {catalog.name}
                    </h3>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-widest">
                      {catalog.products?.length || 0} Products
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-primary group-hover:scale-110 transition-all">
                    <Icon name="ArrowRight" size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {((viewMode === "products" && displayedProducts.length === 0) ||
        (viewMode === "catalogs" && catalogs.length === 0)) && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Icon name="Inbox" size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">
            No items found
          </h3>
          <p className="text-text-secondary text-sm max-w-xs mx-auto mt-2">
            You haven't added anything here yet. Start by creating a new product
            or catalog.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyListings;
