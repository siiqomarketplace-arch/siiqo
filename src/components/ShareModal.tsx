"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, MessageCircle, Copy, X, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | number;
  productName?: string;
  productOwner?: string;
  isStore?: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName = "My Product",
  productOwner = "Siiqo",
  isStore = false,
}) => {
  const [copied, setCopied] = useState(false);

  // Construct the product URL
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://siiqo.com";
  const productUrl = isStore
    ? `${baseUrl}/storefront-details/${productId}`
    : `${baseUrl}/products/${productId}`;

  // SEO-optimized share messages
  const shareMessage = isStore
    ? `Check Out these amazing products from ${productOwner} on Siiqo!`
    : `Check out "${productName}" by ${productOwner} on Siiqo!`;

  const shareOptions = [
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      gradient: "from-blue-600 to-blue-700",
      hoverGradient: "hover:from-blue-700 hover:to-blue-800",
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          productUrl
        )}&quote=${encodeURIComponent(shareMessage)}`;
        window.open(url, "_blank", "width=600,height=400");
        toast.success("Opening Facebook...");
      },
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: MessageCircle,
      gradient: "from-green-500 to-green-600",
      hoverGradient: "hover:from-green-600 hover:to-green-700",
      action: () => {
        const text = `${shareMessage} ${productUrl}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
        toast.success("Opening WhatsApp...");
      },
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: () => (
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
        </svg>
      ),
      gradient: "from-sky-400 to-sky-500",
      hoverGradient: "hover:from-sky-500 hover:to-sky-600",
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `${shareMessage} ${productUrl}`
        )}`;
        window.open(url, "_blank", "width=600,height=400");
        toast.success("Opening Twitter...");
      },
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: () => (
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      ),
      gradient: "from-blue-700 to-blue-800",
      hoverGradient: "hover:from-blue-800 hover:to-blue-900",
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          productUrl
        )}`;
        window.open(url, "_blank", "width=600,height=400");
        toast.success("Opening LinkedIn...");
      },
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: () => (
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.5-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.365-1.337.185-.437-.148-1.33-.414-1.98-.742-.796-.34-1.428-.52-1.372-.82.03-.15.457-.464 1.159-.907 2.807-1.93 4.678-3.195 5.619-4.071.987-.88 1.783-1.33 2.191-1.358z" />
        </svg>
      ),
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "hover:from-blue-600 hover:to-blue-700",
      action: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(
          productUrl
        )}&text=${encodeURIComponent(shareMessage)}`;
        window.open(url, "_blank");
        toast.success("Opening Telegram...");
      },
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                {isStore ? "Share This Store" : "Check out this product"}
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {productName}
              </h2>
              <p className="text-sm text-gray-600">
                {isStore ? (
                  <>
                    Amazing products from{" "}
                    <span className="font-semibold text-gray-900">
                      {productOwner}
                    </span>
                  </>
                ) : (
                  <>
                    from{" "}
                    <span className="font-semibold text-gray-900">
                      {productOwner}
                    </span>{" "}
                    on Siiqo
                  </>
                )}
              </p>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 -mr-1 -mt-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </motion.button>
          </div>

          {/* Share buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-5 gap-2 mb-5"
          >
            {shareOptions.map((option, idx) => {
              const IconComp = option.icon;
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 + idx * 0.03 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={option.action}
                  className={`flex items-center justify-center py-3 rounded-lg text-white transition-all bg-gradient-to-br ${option.gradient} ${option.hoverGradient} shadow-sm hover:shadow-md`}
                  title={option.name}
                >
                  <IconComp className="w-5 h-5" />
                </motion.button>
              );
            })}
          </motion.div>

          {/* Copy link section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 10 }}
            transition={{ delay: 0.15 }}
          >
            <div className="relative">
              <input
                type="text"
                readOnly
                value={productUrl}
                className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-xs text-gray-700 focus:outline-none focus:border-gray-300 transition-all font-mono"
              />
              <motion.button
                onClick={handleCopyLink}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                className="absolute right-2.5 top-1 -translate-y-1/2 p-1.5 transition-all rounded hover:bg-gray-200"
                title="Copy link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </motion.button>
            </div>
            <motion.p
              animate={{ opacity: copied ? 1 : 0.6 }}
              className="text-xs text-gray-500 mt-2 text-center"
            >
              {copied ? "✓ Copied to clipboard" : "Click to copy link"}
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareModal;
