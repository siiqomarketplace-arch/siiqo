"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapPin,
  Search,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  ShoppingBag,
  User,
  Zap,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LandingPage from "./LandingPage";
import NearbyDealCard, { DealData } from "./ui/NearbyDealsProdCard";
import CategoryGrid from "./components/CategoryGrid";
import FeaturesSection from "./components/FeaturesSection";
import { Product } from "@/types/products";
import { useLocation } from "@/context/LocationContext";
import BrowserMockup from "@/components/BrowserMockup";
import TutorialGuide from "@/components/TutorialGuide";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import api_endpoints from "@/hooks/api_endpoints";
import Image from "next/image";
const ITEMS_PER_PAGE = 4;
const CATEGORIES_PER_PAGE = 4;

const Homepage: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [category, setCategory] = useState<string>("All Items");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<{
    [key: string]: any[];
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);
  const [typedPlaceholder, setTypedPlaceholder] = useState<string>("");
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const { coords } = useLocation();

  const placeholderText = "What are you looking for?";

  // Typing animation effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < placeholderText.length) {
        setTypedPlaceholder(placeholderText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Fetching logic for categories with products
  const fetchProducts = async () => {
    try {
      // Fetch categories with their products included
      const categoriesRes = await fetch(api_endpoints.GET_CATEGORIES);
      const categoriesJson = await categoriesRes.json();

      if (
        categoriesJson?.categories &&
        Array.isArray(categoriesJson.categories)
      ) {
        // Organize categories with their products
        const grouped: { [key: string]: any[] } = {};
        const allProducts: any[] = [];

        categoriesJson.categories.forEach((category: any) => {
          if (category.products && Array.isArray(category.products)) {
            grouped[category.name] = category.products;
            allProducts.push(...category.products);
          }
        });

        setProducts(allProducts);
        setCategoryProducts(grouped);
      }
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [coords]);

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return results.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [results, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      const filtered = products.filter((item) => {
        const matchesWhat = item.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchesWhat;
      });
      setResults(filtered);
      setHasSearched(true);
      setIsSearching(false);
      document
        .getElementById("results-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 600);
  };

  const generateDealData = (product: any): DealData => ({
    price: product.price,
    distance_km: product.distance_km || null,
    id: product.id || null,
    image: product.image?.[0] || null,
    name: product.name || null,
    vendor_name: product.vendor?.vendor_name || null,
    crypto_price: product.crypto_price || null,
    discount: 0,
    rating: 0,
    condition: "",
  });

  return (
    <div className="min-h-screen pb-0 bg-white relative overflow-x-hidden">
      {/* REPLICATED PROMO BAR FROM hero.txt */}
      {/* <section className="bg-slate-100 py-2">
        <div className="max-w-7xl mx-auto px-4 xl:px-0 flex items-center justify-between gap-x-2">
          <div className="flex w-full grow items-center gap-x-2 justify-self-center md:justify-center">
            <div className="items-center justify-center rounded-full text-sm font-medium whitespace-nowrap shadow-[0_2px_10px_0px_rgba(0,0,0,0.15)] inline-flex bg-slate-900 text-white px-2 py-0.5">
              <Zap size={12} className="mr-1.5 text-slate-50" />
              PH10
            </div>
            <div className="text-sm font-medium text-neutral-700">
              Enjoy exclusive discounts
            </div>
          </div>
          <button
            className="flex h-6 w-6 items-center justify-center rounded-3xl bg-neutral-200 p-1 transition hover:bg-neutral-300"
            aria-label="Close bar"
          >
            <X size={16} className="text-neutral-500" />
          </button>
        </div>
      </section> */}

      {/* REPLICATED HERO & HEADER FROM hero.txt */}
      <div
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url(/images/mainbg.png)" }}
      >
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <section className="relative py-16 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 xl:px-0 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="items-center justify-center rounded-full text-sm font-medium whitespace-nowrap shadow-[0_2px_10px_0px_rgba(0,0,0,0.3)] inline-flex bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 mt-8 md:mt-12 xl:mt-16"
            >
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              Introducing Siiqo Marketplace
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-transparent mt-6 sm:mx-auto sm:w-full lg:mt-8 lg:leading-tight leading-snug"
            >
              Build a Brand. Sell Anywhere. Get Found Locally & Beyond.{" "}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 font-medium text-blue-100/80 sm:mx-auto sm:w-full md:w-2/3 lg:mx-0 lg:mt-8 lg:w-2/3 text-sm sm:text-base md:text-lg leading-relaxed"
            >
              A storefront-first marketplace that helps businesses create
              professional online brands — and helps buyers discover trusted
              brands near and beyond their neighborhood.
            </motion.p>

            <motion.form
              onSubmit={handleSearch}
              className="mt-10 sm:mt-12 md:mt-14 w-full max-w-5xl z-10 px-2 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative flex items-center justify-center rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-3 sm:p-4">
                <motion.button
                  type="button"
                  onClick={() => setIsTutorialOpen(true)}
                  whileHover={{
                    scale: 1.08,
                    boxShadow: "0 0 30px rgba(168, 85, 247, 0.8)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(168, 85, 247, 0.4)",
                      "0 0 40px rgba(168, 85, 247, 0.8)",
                      "0 0 20px rgba(168, 85, 247, 0.4)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative w-auto sm:w-auto flex items-center gap-3 sm:gap-4 px-4 sm:px-8 py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 transition cursor-pointer group shadow-lg"
                >
                  <motion.div
                    className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/30 via-white/10 to-transparent opacity-0"
                    animate={{
                      opacity: [0, 1, 0],
                      x: ["-100%", "100%"],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  <BookOpen
                    size={20}
                    className="text-white flex-shrink-0 group-hover:text-yellow-200 transition relative z-10 animate-bounce"
                    style={{ animationDelay: "0s" }}
                  />
                  <div className="flex flex-col relative z-10">
                    <label className="text-[10px] sm:text-[11px] uppercase font-bold text-white/90 tracking-wider">
                      🎓 Getting Started
                    </label>
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      View Guide
                    </span>
                  </div>
                </motion.button>
              </div>
            </motion.form>
          </div>

          {/* --- DASHBOARD HERO IMAGE (Contained) --- */}
          <div className="relative max-w-6xl mx-auto px-4 mt-12 md:mt-16 lg:mt-20 z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/90 backdrop-blur p-2 md:p-3 rounded-2xl md:rounded-3xl shadow-3xl border border-white"
            >
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden aspect-[16/10] bg-gray-100 shadow-inner">
                <Image
                  src="/images/heroimg.png"
                  alt="Siiqo Dashboard Preview"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <FeaturesSection />

      {/* Results Section */}
      <AnimatePresence>
        {hasSearched && (
          <motion.section
            id="results-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
              Found {results.length} {results.length === 1 ? "Item" : "Items"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {paginatedResults.map((product) => (
                <NearbyDealCard
                  key={product.id}
                  product={product}
                  dealData={generateDealData(product)}
                  onClick={(id) => router.push(`/products/${id}`)}
                />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Category Sections */}
      {!hasSearched && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Shop by Category
            </h2>
            <p className="text-gray-600">
              Explore our curated selection of products across different
              categories
            </p>
          </div>

          <CategoryGrid
            categoryProducts={categoryProducts}
            isLoading={products.length === 0}
            currentPage={currentCategoryPage}
            onPageChange={setCurrentCategoryPage}
            categoriesPerPage={CATEGORIES_PER_PAGE}
          />
        </section>
      )}

      <LandingPage />

      <TutorialGuide
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <FloatingWhatsAppButton />
    </div>
  );
};

export default Homepage;
