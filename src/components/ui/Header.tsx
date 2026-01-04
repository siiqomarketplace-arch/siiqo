"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Icon from "./AppIcon";
import Link from "next/link";
import { ShoppingCart, Store, X, LayoutDashboard } from "lucide-react";
import CartSystem from "../../app/CartSystem/page";
import { useAuth } from "@/context/AuthContext";
import Skeleton from "../skeleton";
import Button from "../Button";
import { switchMode } from "@/services/api";
type OptionType = "shopping" | "vendor" | null;

const Header: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const desktopRef = useRef<HTMLDivElement | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname() || "/";

  const { logout, user, isLoggedIn, isLoading } = useAuth();

  
  const appPages = ["/home-dashboard", "/map-view", "/search-results", "/product-detail", "/user-profile", "/create-listing", "/vendor", "/shopping"];
  const isAppPage = appPages.some((page) => pathname.startsWith(page));

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  // --- STRICT SWITCH MODE LOGIC ---
  const handleVendorAccess = async () => {
    try {
      setIsSwitching(true);
      if (!isRegisteredVendor) {
        // If not a vendor at all, send them to onboarding
        router.push("/auth/vendor-onboarding");
      } else {
        // If already a vendor, call the switch-mode API
        const response = await switchMode("vendor");
        if (response.data.status === "success") {
          router.push("/vendor/dashboard");
        }
      }
    } catch (error) {
      console.error("Switch mode failed", error);
    } finally {
      setIsSwitching(false);
      setIsOpen(false);
    }
  };
// Accessing the nested data from the log you provided
const userData = (user as any)?.data;
const isRegisteredVendor = userData?.store_settings?.initialized === true;
  const getFirstName = () => {
    const displayName = user?.fullname || user?.business_name || user?.email || "User";
    return displayName.split(" ")[0];
  };

  // ... (Keep existing useEffects for ClickOutside and Modal scroll)
useEffect(() => {
  console.log("Header detected user:", user);
}, [user]);
  // --- RENDER VENDOR BUTTON LOGIC ---
  const renderVendorButton = () => {
    if (isRegisteredVendor) {
      return (
        <button onClick={handleVendorAccess} className="flex items-center w-full gap-2 p-3 text-sm font-medium text-left hover:bg-surface-secondary rounded-md">
          <LayoutDashboard size={16} /> {isSwitching ? "Switching..." : "Go to Dashboard"}
        </button>
      );
    }
    return (
      <button onClick={() => { router.push("/auth/vendor-onboarding"); setIsOpen(false); }} className="flex items-center w-full gap-2 p-3 text-sm font-medium text-left hover:bg-surface-secondary rounded-md">
        <Store size={16} /> Become a Vendor
      </button>
    );
  };

  // 1) Public Header (Keep your styles)
  if (!isAppPage) {
    return (
      <header className="sticky top-0 z-[200] bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl md:px-6">
          <Link href="/" className="flex items-center space-x-2 group">
            <img src="/images/siiqo.png" alt="Logo" className="w-full h-14" />
          </Link>
          <div className="flex items-center gap-4">
            {isLoading ? <Skeleton type="rect" width="100px" height="36px" /> : 
             isLoggedIn ? (
              <Button variant="navy" onClick={() => router.push(user?.active_view === 'vendor' ? "/vendor/dashboard" : "/home-dashboard")}>
                Dashboard
              </Button>
            ) : (
              <Button variant="navy" onClick={() => setIsModalOpen(true)}>Get Started</Button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // 2) Dashboard Header (Integrated Logic)
  return (
    <header className="sticky top-0 z-[200] bg-white border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl md:h-18 md:px-2">
        <Link href="/" className="block">
            <img src="/images/siiqo.png" alt="Logo" className="w-full h-14" />
        </Link>

        <div className="items-center hidden sm:flex gap-x-3">
          {isLoggedIn && (
            <>
              <span className="hidden text-sm text-gray-600 lg:block">Welcome, {getFirstName()}</span>
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-lg hover:bg-surface-secondary">
                <Icon name="ShoppingCart" size={20} />
                <div className="absolute w-2 h-2 bg-red-500 rounded-full -top-1 -right-1 border-1 border-surface" />
              </button>
              
              <div className="relative" ref={desktopRef}>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-surface-secondary">
                  <Icon name="AlignJustify" size={20} />
                </button>
                {isOpen && (
                  <div className="absolute right-0 z-10 flex flex-col gap-3 p-4 mt-2 bg-white border rounded-lg shadow-xl w-60 border-surface-border">
                    <button onClick={() => { router.push("/user-profile"); setIsOpen(false); }} className="w-full text-left p-3 hover:bg-surface-secondary flex items-center gap-2 text-sm font-medium rounded-md">
                        <Icon name="User" size={16} /> My Profile
                    </button>

                    {renderVendorButton()}
                    
                    <button onClick={handleLogout} className="w-full text-left p-3 text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 text-sm font-medium rounded-md">
                      <Icon name="LogOut" size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Mobile menu logic follows same pattern as Desktop */}
        <div className="sm:hidden flex items-center gap-2">
          {isLoggedIn && (
            <div className="relative" ref={mobileRef}>
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-surface-secondary">
                <Icon name="AlignJustify" size={20} />
              </button>
              {isOpen && (
                <div className="absolute right-0 z-10 flex flex-col gap-2 p-4 mt-2 bg-white border rounded-lg shadow-xl w-60 border-surface-border">
                  <span className="pb-2 text-sm font-bold border-b">Hi, {getFirstName()}</span>
                  {renderVendorButton()}
                  <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg text-left">Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Modal & GetStartedModal (Keep your existing implementations) */}
    </header>
  );
};

export default Header;