"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import ProductInfo from "./components/ProductInfo";
import SellerCard from "./components/SellerCard";
import ImageGallery from "./components/ImageGallery";
import ActionBar from "./components/ActionBar";
import LocationMap from "./components/LocationMap";

const ProductDetailPage = ({ params }: { params: { id: string } }) => {
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // The ID is passed from the URL or defaults to 3 as per your request
  const productId = params?.id || "3";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://server.siiqo.com/api/marketplace/products/${productId}`);
        const data = await response.json();
        if (data.status === "success") {
          setProductData(data.product);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!productData) return <div>Product not found.</div>;

  // Mapping API data to match your Component Interfaces
  const mappedProduct = {
    title: productData.name,
    price: productData.price,
    originalPrice: productData.price, // API doesn't provide original, using current
    rating: 4.5, // Default fallback
    reviewCount: 0,
    distance: 0.5,
    availability: productData.quantity > 0 ? "In Stock" : "Out of Stock",
    views: 120,
    watchers: 15,
    condition: "New",
    lastUpdated: new Date(),
    description: productData.description,
    specifications: {
      "Quantity Available": productData.quantity.toString(),
      "Vendor": productData.vendor_name
    }
  };

  const mappedSeller = {
    name: productData.vendor_name,
    avatar: "", // Empty as per API
    rating: 4.8,
    reviewCount: 24,
    responseTime: "Usually responds within 1 hour",
    memberSince: "2023",
    verifiedSeller: true,
    phoneNumber: productData.whatsapp_chat || "" 
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Images */}
          <ImageGallery 
            images={productData.images.length > 0 ? productData.images : ["/placeholder-product.png"]} 
            activeIndex={activeImageIndex}
            onImageChange={setActiveImageIndex}
          />

          {/* Right Column: Info */}
          <div className="space-y-8">
            <ProductInfo 
              product={mappedProduct}
              isWishlisted={isWishlisted}
              onWishlistToggle={() => setIsWishlisted(!isWishlisted)}
              showFullDescription={true}
              onToggleDescription={() => {}}
            />
            
            <SellerCard 
              seller={mappedSeller} 
              onNavigateToVendorProfile={() => {}} 
            />

            <LocationMap 
              location={{ address: "Lagos, Nigeria", lat: 6.5244, lng: 3.3792 }}
              onGetDirections={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <ActionBar 
        product={mappedProduct}
        cartQuantity={0}
        onAddToCart={() => alert("Added to cart")}
        onBuyNow={() => alert("Proceeding to checkout")}
        onWishlistToggle={() => setIsWishlisted(!isWishlisted)}
        isWishlisted={isWishlisted}
      />
    </div>
  );
};

export default ProductDetailPage;