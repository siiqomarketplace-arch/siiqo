"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";
import Icon from "@/components/AppIcon";
import {
  MapPin,
  ChevronDown,
} from "lucide-react";
import LandingPage from "./LandingPage";

const Homepage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  const router = useRouter();

  const [location, setLocation] = useState<string>("San Francisco, CA");
  const [category, setCategory] = useState<string>("Any Category");
  const [openNow, setOpenNow] = useState<boolean>(false);
  const [anyCategory, setAnyCategory] = useState<boolean>(false);
  const [userDistance, setUserDistance] = useState<boolean>(false);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState<boolean>(true);



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
            <div className="hidden max-w-lg md:block hero-search-filters">
              {/* filter which hides on mobile view. */}
              <div className="hidden md:block hero-search-filters">
                <div className="flex items-center p-1 mb-6 bg-white rounded-lg shadow-lg">
                  {/* Location */}
                  <div className="flex items-center flex-1 min-w-0 px-4 space-x-3">
                    <MapPin className="w-5 h-5 text-gray-600 shrink-0" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLocation(e.target.value)
                      }
                      className="w-full text-gray-800 outline-none"
                      placeholder="Enter location"
                    />
                  </div>

                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* Category */}
                  <div className="flex items-center flex-1 min-w-0 px-4 space-x-3">
                    <select
                      value={category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setCategory(e.target.value)
                      }
                      className="w-full text-gray-800 bg-transparent outline-none appearance-none cursor-pointer"
                    >
                      <option value="Any Category">Any Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Home & Garden">Home & Garden</option>
                      <option value="Services">Services</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-600 pointer-events-none shrink-0" />
                  </div>

                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* Advanced */}
                  <div className="flex items-center justify-center flex-1 min-w-0 px-4">
                    <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
                      Advanced
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Checkboxes */}
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center flex-1 space-x-2 text-sm text-white cursor-pointer">
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
                      className={`w-4 h-4 rounded border-2 border-white flex items-center justify-center ${
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

                <label className="flex items-center flex-1 space-x-2 text-sm text-white cursor-pointer">
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
                      className={`w-4 h-4 rounded border-2 border-white flex items-center justify-center ${
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

                <label className="flex items-center flex-1 space-x-2 text-sm text-white cursor-pointer">
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
                      className={`w-4 h-4 rounded border-2 border-white flex items-center justify-center ${
                        isVerifiedOnly ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      {isVerifiedOnly && (
                        <div className="w-2 h-1 border-l-2 border-b-2 border-slate-800 transform rotate-[-45deg] translate-y-[-1px]"></div>
                      )}
                    </div>
                  </div>
                  <span>Verified Only</span>
                </label>

                {/* Search button (kept at end) */}
                <div className="flex justify-end flex-1">
                  <button className="w-full py-3 font-medium text-white transition-colors bg-orange-500 rounded-md hover:bg-orange-600">
                    Search
                  </button>
                </div>
              </div>
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
      <LandingPage />
    </div>
  );
};

export default Homepage;
