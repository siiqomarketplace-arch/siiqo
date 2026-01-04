"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Icon from "./AppIcon";
import Link from "next/link";
import { ShoppingCart, Store, X, LayoutDashboard, LogOut, User, ArrowLeft } from "lucide-react";
import JumiaCartSystem from "@/app/CartSystem/page";
import { useAuth } from "@/context/AuthContext";
import Skeleton from "../skeleton";
import Button from "../Button";
import { switchMode } from "@/services/api";

type OptionType = "shopping" | "vendor" | null;

interface ModalOption {
  id: "shopping" | "vendor";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  buttonText: string;
  gradient: string;
  hoverGradient: string;
  iconColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  ringColor: string;
  pulseColor: string;
  route: string;
}

const Header: React.FC = () => {
  // --- State Management ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OptionType>(null);

  // --- Refs & Hooks ---
  const desktopRef = useRef<HTMLDivElement | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { logout, user, isLoggedIn, isLoading } = useAuth();

  // --- Derived State (Logic from Code 1) ---
  const userData = (user as any)?.data;
  const isRegisteredVendor = userData?.store_settings?.initialized === true;
  // --- Configuration ---
  const appPages = [
    "/vendor/dashboard",
    "/map-view",
    "/search-results",
    "/product-detail",
    "/user-profile",
    "/create-listing",
    "/vendor",
    "/shopping"
  ];
  const isAppPage = appPages.some((page) => pathname.startsWith(page));
  const showBackButton = pathname === "/product-detail" || pathname === "/create-listing";

  const modalOptions: ModalOption[] = [
    {
      id: "shopping",
      title: "Start Shopping",
      description: "Browse our amazing collection of products and find exactly what you need.",
      icon: ShoppingCart,
      buttonText: "Start Shopping",
      gradient: "from-purple-50 to-purple-100",
      hoverGradient: "hover:border-purple-300",
      iconColor: "text-purple-600",
      buttonColor: "bg-purple-600",
      buttonHoverColor: "group-hover:bg-purple-700",
      ringColor: "ring-purple-500",
      pulseColor: "bg-purple-600",
      route: "/auth/login",
    },
    {
      id: "vendor",
      title: "Start Selling",
      description: "Join our marketplace and grow your business by connecting with thousands of eager buyers.",
      icon: Store,
      buttonText: "Start Selling",
      gradient: "from-blue-50 to-blue-100",
      hoverGradient: "hover:border-blue-300",
      iconColor: "text-blue-600",
      buttonColor: "bg-blue-600",
      buttonHoverColor: "group-hover:bg-blue-700",
      ringColor: "ring-blue-500",
      pulseColor: "bg-blue-600",
      route: "/auth/login",
    },
  ];

  // --- Handlers ---
  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleVendorAccess = async () => {
    try {
      setIsSwitching(true);
      if (!isRegisteredVendor) {
        router.push("/auth/vendor-onboarding");
      } else {
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

  const getFirstName = () => {
    const displayName = user?.fullname || user?.business_name || user?.email || "User";
    return displayName.split(" ")[0];
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOption(null);
  };

  const handleCartOpen = () => {
    setIsCartOpen(true);
    setIsOpen(false);
  };

  // --- Effects ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        (desktopRef.current && !desktopRef.current.contains(target)) &&
        (mobileRef.current && !mobileRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "unset";
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) closeModal();
    setIsOpen(false);
  }, [pathname]);

  // --- Sub-Renders ---
  const renderVendorButton = () => {
    if (isRegisteredVendor) {
      return (
        <button 
          onClick={handleVendorAccess} 
          disabled={isSwitching}
          className="flex items-center w-full gap-2 p-3 text-sm font-medium text-left hover:bg-surface-secondary rounded-md transition-colors"
        >
          <LayoutDashboard size={16} /> 
          {isSwitching ? "Switching..." : "Go to Dashboard"}
        </button>
      );
    }
    return (
      <button 
        onClick={() => { router.push("/auth/vendor-onboarding"); setIsOpen(false); }} 
        className="flex items-center w-full gap-2 p-3 text-sm font-medium text-left hover:bg-surface-secondary rounded-md transition-colors"
      >
        <Store size={16} /> Become a Vendor
      </button>
    );
  };

  const GetStartedModal = () => {
    if (!isModalOpen) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-4xl px-4 py-8 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="relative p-6 pb-0">
            <button onClick={closeModal} className="absolute p-2 transition-colors rounded-full top-4 right-4 hover:bg-gray-100">
              <X className="w-6 h-6 text-gray-500" />
            </button>
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-800">Choose Your Path</h2>
              <p className="text-gray-600">Select how you'd like to get started with our platform</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 p-6 mb-6 sm:grid-cols-2">
            {modalOptions.map((option) => {
              const IconComp = option.icon;
              return (
                <div key={option.id} className={`group relative bg-gradient-to-br ${option.gradient} border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${option.hoverGradient} hover:scale-105`}>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-4 bg-white rounded-full shadow-md w-14 h-14 sm:w-16 sm:h-16">
                      <IconComp className={`w-7 h-7 ${option.iconColor}`} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl">{option.title}</h3>
                    <p className="mb-4 text-sm text-gray-600">{option.description}</p>
                    <button
                      onClick={() => { setSelectedOption(option.id); router.push(option.route); }}
                      className={`inline-block ${option.buttonColor} text-white px-5 py-2 rounded-lg font-medium text-sm ${option.buttonHoverColor} transition-colors`}
                    >
                      {option.buttonText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---

  // 1) Public Header
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
              <Button variant="navy" onClick={() => router.push(user?.active_view === 'vendor' ? "/vendor/dashboard" : "/user-profile")}>
                Dashboard
              </Button>
            ) : (
              <Button variant="navy" onClick={openModal}>Get Started</Button>
            )}
          </div>
        </div>
        <GetStartedModal />
      </header>
    );
  }

  // 2) App/Dashboard Header
  return (
    <header className="sticky top-0 z-[200] bg-white border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl md:h-18 md:px-2">
        <div className="flex items-center space-x-4">
          {showBackButton ? (
            <button onClick={() => window.history.length > 1 ? router.back() : router.push("/")} className="p-2 -ml-2 transition-colors rounded-lg hover:bg-surface-secondary">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <Link href="/" className="block">
              <img src="/images/siiqo.png" alt="Logo" className="w-full h-14" />
            </Link>
          )}
        </div>

        {/* Desktop actions */}
        <div className="items-center hidden sm:flex gap-x-3">
          {isLoading ? (
            <Skeleton type="rect" width="150px" height="30px" />
          ) : isLoggedIn ? (
            <>
              <span className="hidden text-sm text-gray-600 lg:block">Welcome, {getFirstName()}</span>
              <button onClick={handleCartOpen} className="relative p-2 transition-colors rounded-lg hover:bg-surface-secondary">
                <ShoppingCart size={20} className="text-text-primary" />
                <div className="absolute w-2 h-2 bg-red-500 rounded-full -top-1 -right-1 border-1 border-surface" />
              </button>
              
              <div className="relative" ref={desktopRef}>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 transition-colors rounded-lg hover:bg-surface-secondary">
                  <Icon name="AlignJustify" size={20} />
                </button>
                {isOpen && (
                  <div className="absolute right-0 z-10 flex flex-col gap-3 p-4 mt-2 bg-white border rounded-lg shadow-xl w-60 border-surface-border">
                    <button onClick={() => { router.push("/user-profile"); setIsOpen(false); }} className="w-full text-left p-3 hover:bg-surface-secondary flex items-center gap-2 text-sm font-medium rounded-md">
                      <User size={16} /> My Profile
                    </button>
                    {renderVendorButton()}
                    <button onClick={handleLogout} className="w-full text-left p-3 text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 text-sm font-medium rounded-md">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Button variant="navy" onClick={() => router.push("/auth/login")}>Login</Button>
          )}
        </div>

        {/* Mobile actions */}
        <div className="sm:hidden flex items-center gap-2">
          {isLoggedIn ? (
            <div className="relative" ref={mobileRef}>
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-surface-secondary">
                <Icon name="AlignJustify" size={20} />
              </button>
              {isOpen && (
                <div className="absolute right-0 z-10 flex flex-col gap-2 p-4 mt-2 bg-white border rounded-lg shadow-xl w-60 border-surface-border">
                  <span className="pb-2 text-sm font-bold border-b">Hi, {getFirstName()}</span>
                  <button onClick={handleCartOpen} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg">
                    <ShoppingCart size={16} className="mr-2" /> Cart
                  </button>
                  {renderVendorButton()}
                  <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg text-left">
                    <LogOut size={16} className="inline mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button variant="navy" onClick={openModal}>Get Started</Button>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[300]">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
          <div className="fixed top-0 right-0 h-full bg-white shadow-lg w-full sm:w-96 animate-in slide-in-from-right duration-300">
            <div className="p-4 h-full overflow-y-auto">
              <button onClick={() => setIsCartOpen(false)} className="float-right p-2 rounded hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
              <JumiaCartSystem />
            </div>
          </div>
        </div>
      )}

      <GetStartedModal />
    </header>
  );
};

export default Header;