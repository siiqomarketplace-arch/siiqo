"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";
// import LandingPage from "./LandingPage";
import Icon from "@/components/AppIcon";
import {
  Search,
  MapPin,
  ShoppingBag,
  Star,
  Filter,
  ChevronDown,
  Car,
  Wrench,
  GraduationCap,
  Users,
  Heart,
  Monitor,
  Home,
  Shirt,
  Package,
  Truck,
} from "lucide-react";
import LandingPage from "./LandingPage";

interface Storefront {
  id: number;
  name: string;
  description: string;
  distance: string;
  category: string;
  image: string;
  isOpen: boolean;
  isVerified: boolean;
}

interface Category {
  name: string;
  icon: React.ReactNode;
}

const Homepage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [distance, setDistance] = useState<string>("2 km");
  const [sortBy, setSortBy] = useState<string>("Popularity");
  const [openOnly, setOpenOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Popular Categories");

  const router = useRouter();

  const [location, setLocation] = useState<string>("San Francisco, CA");
  const [category, setCategory] = useState<string>("Any Category");
  const [openNow, setOpenNow] = useState<boolean>(false);
  const [anyCategory, setAnyCategory] = useState<boolean>(false);
  const [userDistance, setUserDistance] = useState<boolean>(false);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState<boolean>(true);

  const categories: Category[] = [
    { name: "Food", icon: <Package className="w-5 h-5" /> },
    { name: "Fashion", icon: <Shirt className="w-5 h-5" /> },
    { name: "Home", icon: <Home className="w-5 h-5" /> },
    { name: "Electronics", icon: <Monitor className="w-5 h-5" /> },
    { name: "Beauty", icon: <Heart className="w-5 h-5" /> },
    { name: "Maintenance", icon: <Wrench className="w-5 h-5" /> },
    { name: "Transportation", icon: <Car className="w-5 h-5" /> },
    { name: "Health", icon: <Heart className="w-5 h-5" /> },
    { name: "Trainings", icon: <GraduationCap className="w-5 h-5" /> },
    { name: "Local Artisans", icon: <Users className="w-5 h-5" /> },
  ] as const;

  const storefronts: Storefront[] = [
    {
      id: 1,
      name: "Green Leaf Market",
      description: "Grocery store",
      distance: "1,2 km away",
      category: "Food",
      image:
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop",
      isOpen: true,
      isVerified: true,
    },
    {
      id: 2,
      name: "Trendy Threads",
      description: "Clothing boutique",
      distance: "0,8 km away",
      category: "Fashion",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop",
      isOpen: true,
      isVerified: true,
    },
    {
      id: 3,
      name: "Fix-It Fast",
      description: "Repair service",
      distance: "3,1 km away",
      category: "Maintenance",
      image:
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=250&fit=crop",
      isOpen: true,
      isVerified: true,
    },
  ];

  const tabs = [
    "Popular Categories",
    "Featured Storefronts",
    "Shop by Distance",
    "Service Tags",
    "Buyer Intent",
  ];

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/search-results?q=${encodeURIComponent(searchQuery.trim())}`
      ); // Use router.push
    }
  };

  return (
    <div className="min-h-screen bg-[#001d3b]">
      {/* Hero Section */}
      <section className="px-4 mx-auto max-w-7xl py-28">
        <div className="flex items-center justify-between">
          <div className="max-w-full md:max-w-2xl">
            <h1 className="mb-6 text-5xl font-bold text-white">
              Buy. Sell.
              <br />
              Connect.
            </h1>
            <p className="mb-8 text-lg text-blue-100 whitespace-normal text-wrap">
              Discover a smarter way to trade locally. Instantly connect with
              buyers and sellers near you in real-time—fast, simple, and
              reliable.
            </p>
            
            {/* filter which hides on mobile view. */}
            <div className="hidden max-w-full md:block hero-search-filters">
              <div className="flex items-center p-1 mb-6 bg-white rounded-lg shadow-lg">
                <div className="flex items-center flex-1 px-4 space-x-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLocation(e.target.value)
                    }
                    className="flex-1 text-gray-800 outline-none"
                    placeholder="Enter location"
                  />
                </div>

                <div className="w-px h-6 bg-gray-300"></div>

                <div className="flex items-center flex-1 px-4 space-x-3">
                  <select
                    value={category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setCategory(e.target.value)
                    }
                    className="flex-1 text-gray-800 bg-transparent outline-none appearance-none cursor-pointer"
                  >
                    <option value="Any Category">Any Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Services">Services</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-600 pointer-events-none" />
                </div>

                <div className="w-px h-6 bg-gray-300"></div>

                <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Advanced
                </button>

                <button className="px-8 py-3 font-medium text-white transition-colors bg-orange-500 rounded-md hover:bg-orange-600">
                  Search
                </button>
              </div>

              {/* Filter Checkboxes */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center space-x-3 text-white cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={openNow}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setOpenNow(e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 border-white flex items-center justify-center ${
                        openNow ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      {openNow && (
                        <div className="w-2 h-2 rounded-sm bg-slate-800"></div>
                      )}
                    </div>
                  </div>
                  <span>Open Now</span>
                </label>

                <label className="flex items-center space-x-3 text-white cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={anyCategory}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAnyCategory(e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 border-white flex items-center justify-center ${
                        anyCategory ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      {anyCategory && (
                        <div className="w-2 h-2 rounded-sm bg-slate-800"></div>
                      )}
                    </div>
                  </div>
                  <span>Any Category</span>
                </label>

                <label className="flex items-center space-x-3 text-white cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={userDistance}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setUserDistance(e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 border-white flex items-center justify-center ${
                        userDistance ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      {userDistance && (
                        <div className="w-2 h-2 rounded-sm bg-slate-800"></div>
                      )}
                    </div>
                  </div>
                  <span>Any 20 km</span>
                </label>

                <label className="flex items-center space-x-3 text-white cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isVerifiedOnly}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setIsVerifiedOnly(e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 border-white flex items-center justify-center ${
                        isVerifiedOnly ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      {isVerifiedOnly && (
                        <div className="w-3 h-2 border-l-2 border-b-2 border-slate-800 transform rotate-[-45deg] translate-y-[-1px]"></div>
                      )}
                    </div>
                  </div>
                  <span>Verified Only</span>
                </label>
              </div>
              {/* <div className="flex mt-10 space-x-4">
                                <button onClick={() => router.push("/vendor/dashboard")}
                                    className="px-6 py-3 font-semibold text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600">
                                    Create Storefront
                                </button>
                                <button onClick={() => router.push("/marketplace")}
                                    className="px-6 py-3 font-semibold text-white transition-colors border rounded-lg border-white/30 hover:bg-orange-500/20 hover:border-orange-500">
                                    Explore Marketplace
                                </button>
                            </div> */}
            </div>

            {/* filter which hides on desktop view. */}
            <div className="flex-1 max-w-md md:hidden">
              <form onSubmit={handleSearch} className="relative">
                <div
                  className={`relative transition-all duration-200 ${
                    isSearchFocused ? "ring-2 ring-orange-500 rounded-lg" : ""
                  }`}
                >
                  <Icon
                    name="Search"
                    size={18}
                    className="absolute transform -translate-y-1/2 left-3 top-1/2 text-text-secondary"
                  />
                  {/* the X button to clear the input field. */}
                  <input
                    type="text"
                    placeholder="Search products, stores..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full py-2 pl-10 pr-4 text-sm transition-all duration-200 border rounded-lg bg-surface-secondary border-border placeholder-text-secondary focus:outline-none focus:bg-surface focus:border-primary-500"
                  />

                  {/* the X button to clear the input field. */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute p-1 transition-colors duration-200 transform -translate-y-1/2 rounded-full right-3 top-1/2 hover:bg-border-light"
                    >
                      <Icon
                        name="X"
                        size={14}
                        className="text-text-secondary"
                      />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative hidden md:block">
            <div className="relative w-80 h-80">
              <Image
                src="/images/ChatGPT Image Aug 23, 2025, 03_23_55 PM.png"
                alt="Business illustration"
                width={320}
                height={320}
                className="object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-orange-500 backdrop-blur-sm">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex py-4 space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] font-medium transition-colors border-b-2 pb-2 ${
                  activeTab === tab
                    ? "text-white border-[#001d3b]"
                    : "text-white border-transparent hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 lg:grid-cols-10">
            {categories.map(category => (
              <button
                key={category.name}
                className="flex flex-col items-center p-4 space-y-2 transition-shadow bg-white rounded-lg shadow-sm hover:shadow-md group"
              >
                <div className="text-gray-600 transition-colors group-hover:text-orange-500">
                  {category.icon}
                </div>
                <span className="text-xs font-medium text-center text-gray-700">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
      <LandingPage />
      {/* <LandingPage /> */}
    </div>
  );
};

export default Homepage;
