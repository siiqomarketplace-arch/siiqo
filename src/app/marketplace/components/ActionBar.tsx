"use client";

import { Heart, ShoppingCart } from "lucide-react";

interface Product {
  id: any;
  name: string;
  price: number;
}

const ActionBar = ({
  product,
  cartQuantity,
  onAddToCart,
  onBuyNow,
  onWishlistToggle,
  isWishlisted,
}: {
  product: Product;
  cartQuantity: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onWishlistToggle: () => void;
  isWishlisted: boolean;
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center space-x-3">
        {/* Wishlist Button */}
        <button
          onClick={onWishlistToggle}
          className={`p-3 rounded-lg border transition-colors duration-200 ${
            isWishlisted
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          className="flex items-center justify-center flex-1 px-4 py-3 space-x-2 font-semibold text-gray-800 transition-colors duration-200 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Cart {cartQuantity > 0 ? `(${cartQuantity})` : ""}</span>
        </button>

        {/* Buy Now Button */}
        <button
          onClick={onBuyNow}
          className="flex-1 px-4 py-3 font-semibold text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Buy Now - ₦{product?.price?.toLocaleString() || 0}
        </button>
      </div>
    </div>
  );
};

export default ActionBar;