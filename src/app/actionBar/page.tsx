// "use client";

// import React from "react";
// import { Heart, ShoppingCart } from "lucide-react";

// interface ActionBarProps {
//   product: any;
//   cartQuantity: number;
//   onAddToCart: () => void;
//   onBuyNow: () => void;
//   onWishlistToggle: () => void;
//   isWishlisted: boolean;
// }

// export default function ActionBar({
//   product,
//   cartQuantity,
//   onAddToCart,
//   onBuyNow,
//   onWishlistToggle,
//   isWishlisted,
// }: ActionBarProps) {
//   return (
//     <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
//       <div className="flex items-center space-x-3">
//         {/* Wishlist Button */}
//         <button
//           onClick={onWishlistToggle}
//           className={`p-3 rounded-lg border transition-colors duration-200 ${
//             isWishlisted
//               ? "bg-red-50 border-red-200 text-red-600"
//               : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
//           }`}
//           aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//         >
//           <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
//         </button>

//         {/* Add to Cart Button */}
//         <button
//           onClick={onAddToCart}
//           className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gray-100 border border-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
//         >
//           <ShoppingCart className="w-5 h-5" />
//           <span>Add to Cart {cartQuantity > 0 ? `(${cartQuantity})` : ""}</span>
//         </button>

//         {/* Buy Now Button */}
//         <button
//           onClick={onBuyNow}
//           className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
//         >
//           Buy Now - ${product?.price || 0}
//         </button>
//       </div>
//     </div>
//   );
// }

"use-client";
import React from "react";

export default function ActionBar() {
  return <div>{/* Your action bar content */}</div>;
}
