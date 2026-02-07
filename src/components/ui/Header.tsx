"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Icon from "./AppIcon";
import Link from "next/link";
import {
  ShoppingCart,
  Store,
  X,
  LayoutDashboard,
  LogOut,
  User,
  UserPlus,
  LogIn,
  MapPin,
  Search,
  ArrowLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@/context/AuthContext";
import { useCartTotals } from "@/context/CartContext";
import { cartService } from "@/services/cartService";
import SearchSuggestions from "@/app/search-results/components/SearchSuggestions";
import Skeleton from "../skeleton";
import Button from "../Button";
import { switchMode } from "@/services/api";
import { toast } from "sonner";

type OptionType = "buyer" | "vendor" | null;
type ToastType = "success" | "error" | "loading";

interface ModalOption {
  id: "buyer" | "vendor";
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

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const Header: React.FC = () => {
  // --- State Management ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [whatQuery, setWhatQuery] = useState("");
  const [whereQuery, setWhereQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<"what" | "where" | null>(null);
  const popularSearches = [
    "Electronics",
    "Fashion",
    "Home",
    "Books",
    "Services",
  ];

  // --- Refs & Hooks ---
  const desktopRef = useRef<HTMLDivElement | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { logout, user, isLoggedIn, isLoading } = useAuth();
  const { totalItems } = useCartTotals();

  // --- Derived State ---
  const userData = (user as any)?.data;
  const isRegisteredVendor = userData?.store_settings?.initialized === true;

  // --- Configuration ---
  const appPages = [
    "/vendor/dashboard",
    "/map-view",
    "/search-results",
    "/products",
    "/user-profile",
    "/create-listing",
    "/vendor",
    "/shopping",
    "/vendor-public-view",
  ];

  const isSearchPage =
    pathname.startsWith("/search") || pathname.startsWith("/search-results");
  const isAppPage =
    !isSearchPage && appPages.some((page) => pathname.startsWith(page));
  const showBackButton = pathname === "/create-listing";
  const isHomePage = pathname === "/";

  const modalOptions: ModalOption[] = [
    {
      id: "buyer",
      title: "Start Shopping",
      description:
        "Browse our amazing collection of products and find exactly what you need.",
      icon: ShoppingCart,
      buttonText: "Start Shopping",
      gradient: "from-purple-50 to-purple-100",
      hoverGradient: "hover:border-purple-300",
      iconColor: "text-purple-600",
      buttonColor: "bg-purple-600",
      buttonHoverColor: "group-hover:bg-purple-700",
      ringColor: "ring-purple-500",
      pulseColor: "bg-purple-600",
      route: "/auth/signup",
    },
    {
      id: "vendor",
      title: "Start Selling",
      description:
        "Join our marketplace and grow your business by connecting with thousands of eager buyers.",
      icon: Store,
      buttonText: "Start Selling",
      gradient: "from-blue-50 to-blue-100",
      hoverGradient: "hover:border-blue-300",
      iconColor: "text-blue-600",
      buttonColor: "bg-blue-600",
      buttonHoverColor: "group-hover:bg-blue-700",
      ringColor: "ring-blue-500",
      pulseColor: "bg-blue-600",
      route: "/auth/signup",
    },
  ];

  // --- Toast Management ---
  const addToast = (message: string, type: ToastType = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (type !== "loading") {
      setTimeout(() => removeToast(id), 3000);
    }
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // --- Handlers ---
  const handleLogout = async () => {
    const toastId = addToast("Logging out...", "loading");
    try {
      await logout();
      removeToast(toastId);
      addToast("Logged out successfully", "success");
      setIsOpen(false);
    } catch (error) {
      removeToast(toastId);
      addToast(
        "Failed to logout... Not your problem, it's ours... Try again later.",
        "error",
      );
      console.error("Logout error:", error);
    }
  };

  const handleSwitchMode = async (mode: "vendor" | "buyer") => {
    setIsSwitching(true);
    const toastId = addToast("Switching mode...", "loading");
    try {
      const response = await switchMode(mode);
      const data = response.data;
      removeToast(toastId);
      addToast(data.message || "Mode switched successfully", "success");
      return data;
    } catch (error) {
      removeToast(toastId);
      addToast(
        "Failed to switch mode... Not your problem, it's ours... Try again later.",
        "error",
      );
      console.error("Error switching mode:", error);
      throw error;
    } finally {
      setIsSwitching(false);
    }
  };

  const handleVendorAccess = async () => {
    try {
      if (!isRegisteredVendor) {
        addToast("Redirecting to vendor onboarding...", "loading");
        router.push("/auth/vendor-onboarding");
        return;
      }

      const data = await switchMode("vendor");
      if (data.status === 200) {
        router.push("/vendor/dashboard");
      }
    } catch (error) {
      console.error("Switch mode failed", error);
    } finally {
      setIsOpen(false);
    }
  };

  const getFirstName = () => {
    const displayName =
      user?.fullname || user?.business_name || user?.email || "User";
    return displayName.split(" ")[0];
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCartOpen = () => {
    setIsCartOpen(true);
    setIsOpen(false);
  };

  const executeHeaderSearch = (
    queryValue: string = whatQuery,
    whereValue: string = whereQuery,
  ) => {
    const query = queryValue.trim();
    const where = whereValue.trim();
    if (!query && !where) return;

    if (query) {
      setRecentSearches((prev) => {
        const updated = [query, ...prev.filter((s) => s !== query)].slice(0, 5);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "headerRecentSearches",
            JSON.stringify(updated),
          );
        }
        return updated;
      });
    }

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (where) params.set("where", where);
    router.push(`/search-results?${params.toString()}`);
  };

  const handleHeaderSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuggestions(false);
    executeHeaderSearch();
  };

  const handleSuggestionSelect = (value: string) => {
    if (activeInput === "where") {
      setWhereQuery(value);
      executeHeaderSearch(whatQuery, value);
    } else {
      setWhatQuery(value);
      executeHeaderSearch(value, whereQuery);
    }
    setShowSuggestions(false);
  };

  // --- Effects ---
  // Auto-switch to buyer mode when on app pages with cart header
  useEffect(() => {
    if (isAppPage && isLoggedIn && user?.active_view === "vendor") {
      handleSwitchMode("buyer").catch((error) => {
        console.error("Failed to auto-switch to buyer mode:", error);
      });
    }
  }, [isAppPage, isLoggedIn, user?.active_view]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        desktopRef.current &&
        !desktopRef.current.contains(target) &&
        mobileRef.current &&
        !mobileRef.current.contains(target)
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("headerRecentSearches");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentSearches(parsed);
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // --- Toast Component ---
  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-in slide-in-from-bottom duration-300 ${
            toast.type === "success"
              ? "bg-green-500"
              : toast.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
          }`}
        >
          {toast.type === "loading" && (
            <div className="animate-spin">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            </div>
          )}
          {toast.type === "success" && <Check size={18} />}
          {toast.type === "error" && <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );

  // --- Sub-Renders ---
  // const renderVendorButton = () => {
  //   if (isRegisteredVendor) {
  //     return (
  //       <button
  //         onClick={handleVendorAccess}
  //         disabled={isSwitching}
  //         className="flex items-center w-full gap-2 p-3 text-sm font-medium text-left hover:bg-surface-secondary rounded-md transition-colors disabled:opacity-50"
  //       >
  //         <LayoutDashboard size={16} />
  //         {isSwitching ? "Switching..." : "Go to Dashboard"}
  //       </button>
  //     );
  //   }
  //   return (
  //     <button
  //       onClick={() => {
  //         addToast("Redirecting to vendor onboarding...", "loading");
  //         router.push("/auth/vendor-onboarding");
  //         setIsOpen(false);
  //       }}
  //       className="flex items-center w-full gap-2 p-3 text-sm font-medium text-left hover:bg-surface-secondary rounded-md transition-colors"
  //     >
  //       <Store size={16} /> Become a Vendor
  //     </button>
  //   );
  // };

  const GetStartedModal = () => {
    if (!isModalOpen) return null;
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-4xl px-4 py-8 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative p-6 pb-0">
            <button
              onClick={closeModal}
              className="absolute p-2 transition-colors rounded-full top-4 right-4 hover:bg-gray-100"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Choose Your Path
              </h2>
              <p className="text-gray-600">
                Select how you'd like to get started with our platform
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 p-6 mb-6 sm:grid-cols-2">
            {modalOptions.map((option) => {
              const IconComp = option.icon;
              return (
                <div
                  key={option.id}
                  className={`group relative bg-gradient-to-br ${option.gradient} border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${option.hoverGradient} hover:scale-105`}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-4 bg-white rounded-full shadow-md w-14 h-14 sm:w-16 sm:h-16">
                      <IconComp className={`w-7 h-7 ${option.iconColor}`} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl">
                      {option.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      {option.description}
                    </p>
                    <button
                      onClick={() => {
                        addToast("Redirecting...", "loading");
                        router.push(option.route);
                        closeModal();
                      }}
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
  if (!isAppPage) {
    return (
      <>
        <header className="sticky  top-0 z-[200] bg-white border-b border-gray-100">
          <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl md:px-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <img src="/images/siiqo.png" alt="Logo" className="w-full h-14" />
              <span className="hidden text-[1.5em] font-bold text-gray-800 group-hover:text-gray-900 md:inline-block">
                Siiqo
              </span>
            </Link>
            {isHomePage && (
              <form
                onSubmit={handleHeaderSearch}
                className="hidden sm:flex items-center  max-w-md lg:max-w-lg mx-4"
              >
                <div className="relative w-full">
                  <div className="flex items-center w-full gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 shadow-sm">
                    <div className="flex items-center flex-1 gap-2">
                      <Search size={16} className="text-gray-400" />
                      <input
                        type="text"
                        value={whatQuery}
                        onChange={(e) => {
                          setWhatQuery(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => {
                          setActiveInput("what");
                          setShowSuggestions(true);
                        }}
                        placeholder="What"
                        className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                      />
                    </div>
                    <div className="h-5 w-px bg-gray-200" />
                    <div className="flex items-center  gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <input
                        type="text"
                        value={whereQuery}
                        onChange={(e) => {
                          setWhereQuery(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => {
                          setActiveInput("where");
                          setShowSuggestions(true);
                        }}
                        placeholder="Where"
                        className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="ml-1 p-2 rounded-md  bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                      aria-label="Search"
                      title="Search"
                    >
                      <Search size={16} className='md:hidden' /><span className='md:block'>Search</span>
                    </button>
                  </div>
                  {showSuggestions &&
                    (activeInput
                      ? activeInput === "where"
                        ? whereQuery
                        : whatQuery
                      : whatQuery || whereQuery) && (
                      <SearchSuggestions
                        query={activeInput === "where" ? whereQuery : whatQuery}
                        recentSearches={recentSearches}
                        popularSearches={popularSearches}
                        onSelect={handleSuggestionSelect}
                        onClose={() => setShowSuggestions(false)}
                      />
                    )}
                </div>
              </form>
            )}
            <div className="flex items-center gap-4">
              {isLoading ? (
                <Skeleton type="rect" width="100px" height="36px" />
              ) : isLoggedIn ? (
                <Button
                  variant="navy"
                  onClick={() =>
                    router.push(
                      user?.active_view === "vendor"
                        ? "/vendor/dashboard"
                        : "/user-profile",
                    )
                  }
                  title={
                    user?.active_view === "vendor"
                      ? "Vendor Dashboard"
                      : "User Profile"
                  }
                  ariaLabel="buton"
                  className="p-2"
                >
                  {user?.active_view === "vendor" ? (
                    <LayoutDashboard size={18} />
                  ) : (
                    <User size={18} />
                  )}
                </Button>
              ) : (
                <Button
                  variant="navy"
                  onClick={() => router.push("/auth/signup")}
                  title="Get Started"
                  ariaLabel="buton"
                  className="p-2"
                >
                  <UserPlus size={18} />
                </Button>
              )}
            </div>
          </div>
          {isHomePage && (
            <div className="sm:hidden px-4 pb-3">
              <form onSubmit={handleHeaderSearch} className="w-full">
                <div className="relative w-full">
                  <div className="flex items-center w-full gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm">
                    <div className="flex items-center flex-1 gap-2">
                      <Search size={16} className="text-gray-400" />
                      <input
                        type="text"
                        value={whatQuery}
                        onChange={(e) => {
                          setWhatQuery(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => {
                          setActiveInput("what");
                          setShowSuggestions(true);
                        }}
                        placeholder="What"
                        className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                      />
                    </div>
                    <div className="h-5 w-px bg-gray-200" />
                    <div className="flex items-center flex-1 gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <input
                        type="text"
                        value={whereQuery}
                        onChange={(e) => {
                          setWhereQuery(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => {
                          setActiveInput("where");
                          setShowSuggestions(true);
                        }}
                        placeholder="Where"
                        className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="ml-1 p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                      aria-label="Search"
                      title="Search"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                  {showSuggestions &&
                    (activeInput
                      ? activeInput === "where"
                        ? whereQuery
                        : whatQuery
                      : whatQuery || whereQuery) && (
                      <SearchSuggestions
                        query={activeInput === "where" ? whereQuery : whatQuery}
                        recentSearches={recentSearches}
                        popularSearches={popularSearches}
                        onSelect={handleSuggestionSelect}
                        onClose={() => setShowSuggestions(false)}
                      />
                    )}
                </div>
              </form>
            </div>
          )}
          <GetStartedModal />
        </header>
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-[200] bg-white border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl md:h-18 md:px-2">
          <div className="flex items-center space-x-4">
            {showBackButton ? (
              <button
                onClick={() => {
                  addToast("Going back...", "loading");
                  window.history.length > 1 ? router.back() : router.push("/");
                }}
                disabled={isSwitching}
                className="p-2 -ml-2 transition-colors rounded-lg hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <Link href="/" className="block">
                <img
                  src="/images/siiqo.png"
                  alt="Logo"
                  className="w-full h-14"
                />
              </Link>
            )}
          </div>

          {isHomePage && (
            <form
              onSubmit={handleHeaderSearch}
              className="hidden sm:flex items-center w-full max-w-md lg:max-w-lg mx-4"
            >
              <div className="relative w-full">
                <div className="flex items-center w-full gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 shadow-sm">
                  <div className="flex items-center flex-1 gap-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                      type="text"
                      value={whatQuery}
                      onChange={(e) => {
                        setWhatQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => {
                        setActiveInput("what");
                        setShowSuggestions(true);
                      }}
                      placeholder="What"
                      className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                  <div className="h-5 w-px bg-gray-200" />
                  <div className="flex items-center flex-1 gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <input
                      type="text"
                      value={whereQuery}
                      onChange={(e) => {
                        setWhereQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => {
                        setActiveInput("where");
                        setShowSuggestions(true);
                      }}
                      placeholder="Where"
                      className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="ml-1 p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    aria-label="Search"
                    title="Search"
                  >
                    <Search size={16} />
                  </button>
                </div>
                {showSuggestions &&
                  (activeInput
                    ? activeInput === "where"
                      ? whereQuery
                      : whatQuery
                    : whatQuery || whereQuery) && (
                    <SearchSuggestions
                      query={activeInput === "where" ? whereQuery : whatQuery}
                      recentSearches={recentSearches}
                      popularSearches={popularSearches}
                      onSelect={handleSuggestionSelect}
                      onClose={() => setShowSuggestions(false)}
                    />
                  )}
              </div>
            </form>
          )}

          {/* Desktop actions */}
          <div className="items-center hidden sm:flex gap-x-3">
            {isLoading ? (
              <Skeleton type="rect" width="150px" height="30px" />
            ) : isLoggedIn ? (
              <>
                <span className="hidden text-sm text-gray-600 lg:block">
                  Welcome, {userData?.personal_info?.fullname || user?.fullname}
                </span>
                <button
                  onClick={() => addToast("Cart coming soon!", "loading")}
                  disabled
                  className="relative p-2 transition-colors rounded-lg hover:bg-surface-secondary opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  <ShoppingCart size={20} className="text-text-primary" />
                  {totalItems > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </button>

                <div className="relative" ref={desktopRef}>
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 transition-colors rounded-lg hover:bg-surface-secondary"
                  >
                    <Icon name="AlignJustify" size={20} />
                  </button>
                  {isOpen && (
                    <div className="absolute right-0 z-10 flex flex-col gap-3 p-4 mt-2 bg-white border rounded-lg shadow-xl w-60 border-surface-border">
                      <button
                        onClick={() => {
                          router.push("/user-profile");
                          setIsOpen(false);
                        }}
                        className={`w-full text-left p-3 hover:bg-surface-secondary flex items-center gap-2 text-sm font-medium rounded-md ${
                          pathname === "/user-profile" ? "hidden" : "flex"
                        }`}
                      >
                        <User size={16} />{" "}
                        {pathname === "/user-profile" ? "" : `My Profile `}
                      </button>
                      {/* {renderVendorButton()} */}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left p-3 text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 text-sm font-medium rounded-md"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Button
                variant="navy"
                onClick={() => router.push("/auth/login")}
                title="Login"
                ariaLabel="buton"
                className="p-2"
              >
                <LogIn size={18} />
              </Button>
            )}
          </div>

          {/* Mobile actions */}
          <div className="sm:hidden flex items-center gap-2">
            {isLoggedIn ? (
              <div className="relative" ref={mobileRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 rounded-lg hover:bg-surface-secondary"
                >
                  <Icon name="AlignJustify" size={20} />
                </button>
                {isOpen && (
                  <div className="absolute right-0 z-10 flex flex-col gap-2 p-4 mt-2 bg-white border rounded-lg shadow-xl w-60 border-surface-border">
                    <span className="pb-2 text-sm font-bold border-b">
                      Hi,{" "}
                      {userData?.personal_info?.fullname ||
                        user?.fullname ||
                        "User"}
                    </span>
                    <button
                      onClick={() => addToast("Cart coming soon!", "loading")}
                      disabled
                      className="relative flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg opacity-60 cursor-not-allowed"
                      title="Coming soon"
                    >
                      <ShoppingCart size={16} className="mr-2" /> Cart
                      {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {totalItems > 99 ? "99+" : totalItems}
                        </span>
                      )}
                    </button>
                    {/* {renderVendorButton()} */}
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg text-left"
                    >
                      <LogOut size={16} className="inline mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="navy"
                onClick={() => router.push("/auth/signup")}
                title="Get Started"
                ariaLabel="buton"
                className="p-2"
              >
                <UserPlus size={18} />
              </Button>
            )}
          </div>
        </div>

        {isHomePage && (
          <div className="sm:hidden px-4 pb-3">
            <form onSubmit={handleHeaderSearch} className="w-full">
              <div className="relative w-full">
                <div className="flex items-center w-full gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm">
                  <div className="flex items-center flex-1 gap-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                      type="text"
                      value={whatQuery}
                      onChange={(e) => {
                        setWhatQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => {
                        setActiveInput("what");
                        setShowSuggestions(true);
                      }}
                      placeholder="What"
                      className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                  <div className="h-5 w-px bg-gray-200" />
                  <div className="flex items-center flex-1 gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <input
                      type="text"
                      value={whereQuery}
                      onChange={(e) => {
                        setWhereQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => {
                        setActiveInput("where");
                        setShowSuggestions(true);
                      }}
                      placeholder="Where"
                      className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="ml-1 p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    aria-label="Search"
                    title="Search"
                  >
                    <Search size={16} />
                  </button>
                </div>
                {showSuggestions &&
                  (activeInput
                    ? activeInput === "where"
                      ? whereQuery
                      : whatQuery
                    : whatQuery || whereQuery) && (
                    <SearchSuggestions
                      query={activeInput === "where" ? whereQuery : whatQuery}
                      recentSearches={recentSearches}
                      popularSearches={popularSearches}
                      onSelect={handleSuggestionSelect}
                      onClose={() => setShowSuggestions(false)}
                    />
                  )}
              </div>
            </form>
          </div>
        )}

        {/* Cart Drawer */}
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        <GetStartedModal />
      </header>
      <ToastContainer />
    </>
  );
};

export default Header;
