"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import { LucideIconName } from "@/components/ui/AppIcon";
import NearbyDeals from "./home/NearbyDeals";
import RecentlyViewed from "./home/RecentlyViewed";
import PopularInArea from "./home/PopularInArea";
import QuickActions from "./home/QuickActions";
import LocationIndicator from "./home/LocationIndicator";
import LandingPage from "./home/LandingPage";
import Homepage from "./home/Homepage";

import Footer from "./home/Footer";

// interface QuickFilter {
// 	label: string;
// 	icon: LucideIconName;
// }

// export const metadata = {
// 	title: "siiqo",
// 	description: "Welcome to siiqo.",
// 	icons: {
// 		icon: "/images/logo.png",
// 	},
// };

export default function ProductFinder() {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<string>(
    "Downtown Seattle, WA"
  );
  const router = useRouter();

  const handlePullToRefresh = async () => {
    setIsRefreshing(true);

    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const handleLocationChange = () => {
    const locations: string[] = [
      "Downtown Seattle, WA",
      "Capitol Hill, Seattle, WA",
      "Fremont, Seattle, WA",
      "Ballard, Seattle, WA",
    ];
    const currentIndex = locations.indexOf(currentLocation);
    const nextIndex = (currentIndex + 1) % locations.length;
    setCurrentLocation(locations[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-background">
        {isRefreshing && (
          <div className="fixed z-50 px-4 py-2 transform -translate-x-1/2 bg-white rounded-full top-20 left-1/2 shadow-elevation-2">
            <div className="flex items-center space-x-2">
              <div className="animate-spin">
                <Icon name="RefreshCw" size={16} className="text-primary" />
              </div>
              <span className="text-sm text-text-primary">Refreshing...</span>
            </div>
          </div>
        )}

        <div className="w-full">
          {/* <LandingPage /> */}
          <Homepage />

          <div className="px-4 py-6 mx-auto max-w-7xl md:px-6">
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold font-heading text-text-primary">
                  Nearby Deals
                </h2>
                <button
                  onClick={() => router.push("/marketplace")}
                  className="text-sm font-medium transition-colors duration-200 text-primary hover:text-primary-700"
                >
                  View All
                </button>
              </div>
              <NearbyDeals onRefresh={handlePullToRefresh} />
            </section>

            {/* <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold font-heading text-text-primary">
                  Recently Viewed
                </h2>
                <button
                  onClick={() => router.push("/marketplace")}
                  className="text-sm font-medium transition-colors duration-200 text-primary hover:text-primary-700"
                >
                  View All
                </button>
              </div>
              <RecentlyViewed />
            </section> */}
{/* 
            <section className="mb-8">
              <PopularInArea />
            </section> */}

          </div>


        </div>
            <Footer />

      </div>
    </div>
  );
}
