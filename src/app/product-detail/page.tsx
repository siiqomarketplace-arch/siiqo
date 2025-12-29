"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ImageGallery from "./components/ImageGallery";
import ProductInfo from "./components/ProductInfo";
import LocationMap from "./components/LocationMap";
import SellerCard from "./components/SellerCard";
import SimilarProducts from "./components/SimilarProducts";
import PriceComparison from "./components/PriceComparison";
import {
  CheckCircle,
  AlertCircle,
  X,
  ChevronRight,
  MapPin,
  ShoppingBag
} from "lucide-react";
import Button from "@/components/Button";
import { useCartModal } from "@/context/cartModalContext";
import { productService } from "@/services/productService";
import { cartService } from "@/services/cartService";
import {
  ApiProductFull,
  Product,
  PriceComparisonItem,
  Notification,
} from "@/types/product-detail";

// --- Components ---

const NotificationToast: React.FC<{
  notification: Notification;
  onClose: (id: string) => void;
}> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(notification.id), 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <AlertCircle className="w-5 h-5 text-blue-600" />,
  };

  return (
    <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 p-4 rounded-xl border shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${styles[notification.type]}`}>
      {icons[notification.type]}
      <p className="text-sm font-medium">{notification.message}</p>
      <button onClick={() => onClose(notification.id)} className="opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const Breadcrumbs = ({ category, title }: { category: string; title: string }) => (
  <nav className="flex items-center text-sm text-gray-500 mb-6 flex-wrap">
    <span className="hover:text-[#E0921C] cursor-pointer transition-colors">Home</span>
    <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
    <span className="hover:text-[#E0921C] cursor-pointer transition-colors">{category || "Product"}</span>
    <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
    <span className="font-medium text-[#212830] line-clamp-1">{title}</span>
  </nav>
);

// --- Fixed Dummy Data Store ---
const DUMMY_PRODUCT_STORE: ApiProductFull[] = [
  {
    id: 1,
    product_name: "iPhone 13 Pro Max - 256GB Gold",
    product_price: 75000000, 
    discount: 15,
    condition: "Like New",
    rating: 4.8,
    review_count: 24,
    distance: 1.2,
    location: { address: "Ikeja, Lagos", lat: 6.5244, lng: 3.3792 },
    images: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800"],
    description: "Premium iPhone 13 Pro Max. Battery health 98%.",
    category: "Smartphones", 
    status: "active",
    visibility: true,
    seller: { id: 101, name: "Tech Haven", avatar: "", rating: 4.9, review_count: 150, response_time: "5 mins", member_since: "Oct 2021", verified: true },
    availability: "Available",
    last_updated: "2023-10-25",
  },
  {
    id: 2,
    product_name: "Sony WH-1000XM4 Wireless Headphones",
    product_price: 22000000,
    discount: 10,
    condition: "New",
    rating: 4.9,
    review_count: 85,
    distance: 2.5,
    location: { address: "Victoria Island, Lagos", lat: 6.4281, lng: 3.4219 },
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"],
    description: "Industry leading noise canceling headphones.",
    category: "Electronics",
    status: "active",
    visibility: true,
    seller: { id: 102, name: "Gadget Hub", avatar: "", rating: 4.7, review_count: 320, response_time: "1 hour", member_since: "Jan 2022", verified: true },
    availability: "Available",
    last_updated: "2023-11-01",
  },
  {
    id: 3,
    product_name: "MacBook Air M2 Chip",
    product_price: 120000000,
    discount: 5,
    condition: "New",
    rating: 5.0,
    review_count: 12,
    distance: 0.8,
    location: { address: "Lekki Phase 1, Lagos", lat: 6.4478, lng: 3.4737 },
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800"],
    description: "The new MacBook Air with M2 chip. Supercharged for work.",
    category: "Computers",
    status: "active",
    visibility: true,
    seller: { id: 103, name: "Apple Store NG", avatar: "", rating: 5.0, review_count: 500, response_time: "Instant", member_since: "May 2020", verified: true },
    availability: "Available",
    last_updated: "2023-11-05",
  },
  {
    id: 5,
    product_name: "MacBook Pro 14-inch M3 Chip",
    product_price: 245000000,
    discount: 0,
    condition: "New",
    rating: 4.9,
    review_count: 128,
    distance: 0.8,
    location: { address: "Victoria Island, Lagos", lat: 6.4281, lng: 3.4219 },
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600"],
    description: "The latest M3 chip MacBook Pro with stunning Liquid Retina XDR display.",
    category: "Laptops",
    status: "active",
    visibility: true,
    seller: { id: 103, name: "Apple Store NG", avatar: "", rating: 5.0, review_count: 500, response_time: "Instant", member_since: "May 2020", verified: true },
    availability: "Available",
    last_updated: "2023-11-20",
  },
  {
    id: 6,
    product_name: "Sony Alpha a7 IV Mirrorless Camera",
    product_price: 185000000,
    discount: 5,
    condition: "New",
    rating: 4.8,
    review_count: 56,
    distance: 2.4,
    location: { address: "Ikeja, Lagos", lat: 6.5244, lng: 3.3792 },
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600"],
    description: "Full-frame mirrorless camera with 33MP sensor and 4K 60p video.",
    category: "Photography",
    status: "active",
    visibility: true,
    seller: { id: 105, name: "Digital Hub", avatar: "", rating: 4.8, review_count: 56, response_time: "2 hours", member_since: "Mar 2021", verified: true },
    availability: "Available",
    last_updated: "2023-11-21",
  }
];

const ProductDetail = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const { openCart } = useCartModal();
  const router = useRouter();
  const searchParams = useSearchParams();

  const addNotification = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const transformApiProduct = (apiProduct: ApiProductFull): Product => {
    return {
      id: apiProduct.id.toString(),
      title: apiProduct.product_name || "Unknown Product",
      price: apiProduct.product_price / 100 || 0,
      originalPrice: (apiProduct.product_price / 100) * 1.2 || 0,
      discount: apiProduct.discount ?? 0,
      condition: apiProduct.condition ?? "Like New",
      rating: apiProduct.rating ?? 4.7,
      reviewCount: apiProduct.review_count ?? 0,
      distance: apiProduct.distance ?? 0,
      location: apiProduct.location ?? { address: "Unknown", lat: 0, lng: 0 },
      images: apiProduct.images.length > 0 ? apiProduct.images : ["https://via.placeholder.com/800"],
      description: apiProduct.description || "No description available",
      specifications: {
        Category: apiProduct.category || "General",
        Status: apiProduct.status || "unknown",
        "Product ID": apiProduct.id.toString(),
        Seller: apiProduct.seller?.name || "Unknown",
      },
      seller: {
        id: apiProduct.seller?.id.toString() || "0",
        name: apiProduct.seller?.name || "Unknown Seller",
        avatar: apiProduct.seller?.avatar || "",
        rating: apiProduct.seller?.rating ?? 0,
        reviewCount: apiProduct.seller?.review_count ?? 0,
        responseTime: apiProduct.seller?.response_time || "N/A",
        memberSince: apiProduct.seller?.member_since || "N/A",
        verifiedSeller: apiProduct.seller?.verified ?? false,
      },
      availability: apiProduct.availability ?? "Available",
      lastUpdated: apiProduct.last_updated ? new Date(apiProduct.last_updated) : new Date(),
      views: apiProduct.views ?? 0,
      watchers: apiProduct.watchers ?? 0,
    };
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productName = searchParams.get("name");
        
        if (!productName) {
          setError("Product not found.");
          return;
        }

        const decodedName = decodeURIComponent(productName);
        const foundApiProduct = DUMMY_PRODUCT_STORE.find(
          (p) => p.product_name === decodedName
        ) || DUMMY_PRODUCT_STORE[0];

        const transformedProduct = transformApiProduct(foundApiProduct);
        setProduct(transformedProduct);

        const similarProducts = DUMMY_PRODUCT_STORE
          .filter((p) => p.product_name !== decodedName)
          .map(transformApiProduct);
        setAllProducts(similarProducts);

        if (typeof window !== "undefined") {
          const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
          setIsWishlisted(wishlist.includes(transformedProduct.id));
        }

      } catch (err: any) {
        console.error("Error loading product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [searchParams]);

  const handleWishlistToggle = () => {
    if (!product || typeof window === "undefined") return;
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    let updatedWishlist;
    if (isWishlisted) {
      updatedWishlist = wishlist.filter((id: string) => id !== product.id);
      addNotification("info", "Removed from wishlist");
    } else {
      updatedWishlist = [...wishlist, product.id];
      addNotification("success", "Added to wishlist");
    }
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = async (quantity: number = 1) => {
    if (!product) return;
    try {
      setIsAddingToCart(true);
      await cartService.addToCart(parseInt(product.id), quantity);
      setCartQuantity((prev) => prev + quantity);
      addNotification("success", `Added to cart!`);
    } catch (error) {
      addNotification("error", "Failed to add to cart");
    } finally { setIsAddingToCart(false); }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      setIsBuyingNow(true);
      await cartService.addToCart(parseInt(product.id), 1);
      openCart(1);
    } catch (error) {
      addNotification("error", "Failed to process Buy Now");
    } finally { setIsBuyingNow(false); }
  };

  const handleShare = async () => {
    if (!product) return;
    if (navigator.share) {
        try { await navigator.share({ title: product.title, url: window.location.href }); } catch {}
    } else {
        navigator.clipboard.writeText(window.location.href);
        addNotification("success", "Link copied!");
    }
  };

  const priceComparisons: PriceComparisonItem[] = [
    { id: "comp_001", seller: "Mobile World", price: (product?.price || 0) * 1.05, condition: "New", distance: 1.5, rating: 4.6 },
    { id: "comp_002", seller: "Phone Paradise", price: (product?.price || 0) * 0.98, condition: "New", distance: 2.3, rating: 4.4 },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-12 h-12 border-4 border-[#E0921C] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !product) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold">Product Not Available</h2>
        <Button onClick={() => router.back()} className="mt-6 bg-[#212830] text-white px-6">Go Back</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {notifications.map((n) => (
        <NotificationToast key={n.id} notification={n} onClose={removeNotification} />
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs category={product.specifications.Category} title={product.title} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-8">
            <div className="bg-white rounded-3xl p-1 overflow-hidden border border-gray-100 shadow-sm">
                <ImageGallery 
                    images={product.images} 
                    activeIndex={activeImageIndex} 
                    onImageChange={setActiveImageIndex} 
                    isMobile={false} 
                />
            </div>
            
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <SellerCard 
                    seller={product.seller} 
                    onContact={() => addNotification("info", "Opening chat...")} 
                    onNavigateToVendorProfile={() => router.push(`/seller/${product.seller.id}`)} 
                />
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h4 className="font-bold text-[#212830] mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <ShoppingBag className="w-4 h-4 text-[#E0921C]" /> Market Comparison
                </h4>
                <PriceComparison comparisons={priceComparisons} currentPrice={product.price} />
            </div>

            <div className="mt-12">
                <h3 className="text-xl font-bold text-[#212830] mb-6">Similar Items</h3>
                <SimilarProducts 
                    products={allProducts} 
                    onProductClick={(title) => router.push(`/product-detail?name=${encodeURIComponent(title)}`)} 
                />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-8">
                <ProductInfo 
                    product={product} 
                    isWishlisted={isWishlisted}
                    onWishlistToggle={handleWishlistToggle}
                    onShare={handleShare}
                    showFullDescription={showFullDescription} 
                    onToggleDescription={() => setShowFullDescription(!showFullDescription)} 
                    isMobile={false}
                />
                
                <hr className="border-gray-100" />
                
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg sticky top-6 z-10">
                    <div className="mb-6">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-extrabold text-[#E0921C]">₦{product.price.toLocaleString()}</span>
                            {product.originalPrice > product.price && (
                                <span className="text-sm text-gray-400 line-through">₦{product.originalPrice.toLocaleString()}</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button 
                            onClick={handleBuyNow} 
                            disabled={isBuyingNow}
                            className="w-full py-4 bg-[#212830] text-white rounded-xl font-bold"
                        >
                            {isBuyingNow ? "Processing..." : "Buy Now"}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => handleAddToCart(1)}
                            disabled={isAddingToCart}
                            className="w-full py-4 border-2 rounded-xl font-semibold"
                        >
                            {isAddingToCart ? "Adding..." : "Add to Cart"}
                        </Button>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-[#212830] mb-4 flex items-center gap-2">
                       <MapPin className="w-5 h-5 text-[#E0921C]" /> Item Location
                    </h3>
                    <div className="rounded-xl overflow-hidden border border-gray-200">
                        <LocationMap location={product.location} onGetDirections={() => window.open(`https://maps.google.com?q=${product.location.lat},${product.location.lng}`)} />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetailPage = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#E0921C] border-t-transparent rounded-full animate-spin"></div></div>}>
    <ProductDetail />
  </Suspense>
);

export default ProductDetailPage;