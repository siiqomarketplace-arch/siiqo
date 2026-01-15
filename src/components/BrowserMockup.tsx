"use client";

import { motion, useScroll, useTransform, easeOut } from "framer-motion";
import { useRef } from "react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";

import {
  UserPlus,
  Store,
  Package,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface OperationStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const operations: OperationStep[] = [
  {
    icon: <UserPlus size={24} />,
    title: "Create Account",
    description: "Sign up and verify your identity",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: <Store size={24} />,
    title: "Setup Vendor Store",
    description: "Create your vendor account",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: <Package size={24} />,
    title: "List Products",
    description: "Add products to your store",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Start Selling",
    description: "Connect with buyers and close deals",
    color: "from-green-500 to-green-600",
  },
  {
    icon: <CheckCircle2 size={24} />,
    title: "Get Verified",
    description: "Build trust and grow your business",
    color: "from-emerald-500 to-emerald-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0 },
  },
};

const arrowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

const browserFrameVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: easeOut },
  },
};

export default function BrowserMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"vendor" | "buyer">("vendor");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax layers
  const bgY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const titleY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <div
      ref={containerRef}
      className="w-full py-12 md:py-20 flex items-center justify-center px-2 sm:px-4"
    >
      {/* Browser frame */}
      <motion.div
        variants={browserFrameVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border border-neutral-800"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between bg-neutral-100 px-3 sm:px-4 py-2">
          {/* Dots */}
          <div className="flex gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400" />
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400" />
          </div>

          {/* URL bar */}
          <div className="px-3 sm:px-6 py-1 text-xs sm:text-sm rounded-full bg-neutral-200 text-neutral-600">
            www.siiqo.com
          </div>

          {/* Spacer */}
          <div className="w-6 sm:w-10" />
        </div>

        {/* Content area */}
        <div className="relative bg-gradient-to-br from-[#f0f1ff] via-white to-[#e6fbff] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 overflow-visible">
          {/* Decorative glow */}
          <motion.div
            style={{ y: bgY }}
            className="absolute -top-24 -right-24 w-48 sm:w-72 h-48 sm:h-72 bg-purple-400/20 rounded-full blur-3xl pointer-events-none"
          />

          <motion.div
            style={{ y: bgY }}
            className="absolute -bottom-24 -left-24 w-48 sm:w-72 h-48 sm:h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"
          />

          <motion.div
            className="relative w-full max-w-5xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Title */}
            <motion.div
              style={{ y: titleY }}
              variants={itemVariants}
              className="text-center mb-6 sm:mb-8"
            >
              <h3 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight">
                Siiqo For Neighbourhood Commerce
              </h3>
              <p className="text-neutral-600 text-sm sm:text-base mt-2 sm:mt-3">
                Let's reimagine local commerce
              </p>
            </motion.div>
            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-white/70 backdrop-blur-xl rounded-full p-1 shadow-lg border border-white/40">
                <button
                  onClick={() => setActiveTab("vendor")}
                  className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                    activeTab === "vendor"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                      : "text-slate-600"
                  }`}
                >
                  For Businesses
                </button>

                <button
                  onClick={() => setActiveTab("buyer")}
                  className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                    activeTab === "buyer"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                      : "text-slate-600"
                  }`}
                >
                  For Buyers
                </button>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {activeTab === "vendor" && (
                <motion.div
                  key="vendor"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-3xl mx-auto text-start px-2 sm:px-6"
                >
                  <h4 className="text-xl sm:text-2xl md:text-3xl text-center font-bold text-slate-900 mb-4 leading-snug">
                    Turn Your Business Into a Recognisable Online Brand
                  </h4>

                  <p className="text-neutral-600 text-center text-xs sm:text-sm md:text-base mb-6 leading-relaxed">
                    Move beyond basic product listings. Create a professional
                    online storefront that reflects your brand identity, builds
                    trust, and attracts customers searching within and beyond
                    your location.
                  </p>

                  <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base text-slate-700">
                    <li>• Create a branded online storefront</li>
                    <li>
                      • Customise layout, visuals, and product presentation
                    </li>
                    <li>
                      • Get discovered through location-based and brand search
                    </li>
                    <li>• Sell products and manage orders with ease</li>
                    <li>
                      • Grow visibility without building a separate website
                    </li>
                  </ul>

                  <p className="mt-6 text-xs sm:text-sm md:text-base font-medium text-slate-800 leading-relaxed">
                    This platform helps businesses look professional, get
                    discovered, and scale their brand presence — all in one
                    place.
                  </p>
                </motion.div>
              )}

              {activeTab === "buyer" && (
                <motion.div
                  key="buyer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-3xl mx-auto text-start px-2 sm:px-6"
                >
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center leading-snug">
                    Discover Trusted Brands — Near You and Beyond
                  </h4>

                  <p className="text-neutral-600 text-xs sm:text-sm md:text-base mb-6 text-center leading-relaxed">
                    Shop from real, verified brands with professional
                    storefronts. Search by location, explore stores beyond your
                    neighborhood, and buy with confidence.
                  </p>

                  <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-base text-slate-700">
                    <li>• Discover real brands, not random sellers</li>
                    <li>• Shop locally or explore beyond your area</li>
                    <li>
                      • View authentic storefronts with clear brand identity
                    </li>
                    <li>
                      • Buy from reliable sellers with transparent listings
                    </li>
                  </ul>

                  <p className="mt-6 text-xs sm:text-sm md:text-base font-medium text-slate-800 leading-relaxed">
                    Every purchase begins with a brand you can trust.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            <motion.div
              variants={itemVariants}
              className="text-center mt-8 sm:mt-12"
            >
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold shadow-xl cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Start Your Journey
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
