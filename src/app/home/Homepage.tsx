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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LandingPage from "./LandingPage";
import NearbyDealCard, { DealData } from "./ui/NearbyDealsProdCard";
import { Product } from "@/types/products";
import { useLocation } from "@/context/LocationContext";
import BrowserMockup from "@/components/BrowserMockup";
import api_endpoints from "@/hooks/api_endpoints";

const CATEGORIES = ["All Items", "Smartphones", "Electronics", "Fashion"];
const ITEMS_PER_PAGE = 4;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [typedPlaceholder, setTypedPlaceholder] = useState<string>("");
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

  // Fetching logic remains same
  const fetchProducts = async () => {
    try {
      const res = await fetch(api_endpoints.MARKETPLACE_SEARCH);
      const json = await res.json();
      const merged = json?.data?.products || json?.data?.nearby_products || [];
      setProducts(merged);
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
      <div className="relative    bg-[#001d3b]">
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
Build a Brand. Sell Anywhere. Get Found Locally & Beyond.            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 font-medium text-blue-100/80 sm:mx-auto sm:w-full md:w-2/3 lg:mx-0 lg:mt-8 lg:w-2/3 text-sm sm:text-base md:text-lg leading-relaxed"
            >
           A storefront-first marketplace that helps businesses create professional online brands — and helps buyers discover trusted brands near and beyond their neighborhood.
            </motion.p>

            <motion.form
              onSubmit={handleSearch}
              className="mt-10 sm:mt-12 md:mt-14 w-full max-w-5xl z-10 px-2 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-2">
                {/* Soft glow */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-orange-500/10 via-transparent to-blue-500/10 blur-xl" />

                <div className="relative grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_auto] gap-2 items-center">
                  {/* WHAT */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 transition">
                    <Search
                      size={18}
                      className="text-orange-400 flex-shrink-0"
                    />
                    <div className="flex flex-col w-full">
                      <label className="text-[10px] sm:text-[11px] self-start uppercase font-semibold text-orange-300 tracking-wider">
                        What
                      </label>
                      <input
                        type="text"
                        placeholder={typedPlaceholder}
                        className="bg-transparent outline-none text-white text-xs sm:text-sm placeholder-blue-200/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* WHERE */}
                  <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 transition">
                    <MapPin
                      size={18}
                      className="text-orange-400 flex-shrink-0"
                    />
                    <div className="flex flex-col w-full">
                      <label className="text-[10px] sm:text-[11px] self-start uppercase font-semibold text-orange-300 tracking-wider">
                        Where
                      </label>
                      <input
                        type="text"
                        placeholder="City or Zip"
                        className="bg-transparent outline-none text-white text-xs sm:text-sm placeholder-blue-200/50"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* CATEGORY */}
                  <div
                    ref={dropdownRef}
                    className="relative flex items-center gap-3 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <ShoppingBag
                      size={18}
                      className="text-orange-400 flex-shrink-0"
                    />
                    <div className="flex flex-col w-full">
                      <label className="text-[10px] sm:text-[11px] self-start uppercase font-semibold text-orange-300 tracking-wider">
                        Category
                      </label>
                      <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                        <span>{category}</span>
                        <ChevronDown
                          size={16}
                          className={`text-orange-400 transition-transform flex-shrink-0 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 right-0 top-full mt-3 rounded-2xl bg-slate-900 border border-orange-500/30 shadow-2xl overflow-hidden z-50"
                        >
                          {CATEGORIES.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setCategory(item);
                                setIsOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-6 py-3 text-xs sm:text-sm text-blue-100 hover:bg-orange-500/20 hover:text-orange-300 transition"
                            >
                              {item}
                              {category === item && (
                                <Check size={16} className="text-orange-400" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* SEARCH CTA */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    className="h-full w-full rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 md:px-8 md:py-4 px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg hover:shadow-orange-500/50 transition"
                  >
                    {isSearching ? (
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Searching
                      </div>
                    ) : (
                      "Search"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.form>
          </div>
          {/* THE BROWSER FRAME FROM hero.txt */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16"
          >
            <BrowserMockup />
          </motion.div>
        </section>
      </div>

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

      <LandingPage />
    </div>
  );
};

export default Homepage;
