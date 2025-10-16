"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Icon from "./AppIcon";
import Link from "next/link";
import { ShoppingCart, Store, X } from "lucide-react";
import "./custom.css";
import CartSystem from "../../app/CartSystem/page";
import { useAuth } from "@/context/AuthContext";
import Skeleton from "../skeleton";
import Button from "../Button";

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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { logout, user, isLoggedIn, isLoading } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<OptionType>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOption(null);
  };

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      closeModal();
    }
  }, [pathname]);

  const handleOptionSelect = (option: "shopping" | "vendor") => {
    setSelectedOption(option);
  };

const modalOptions: ModalOption[] = [
  {
    id: "shopping",
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
    route: "/auth/login",
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
    route: "/vendor/auth",
  },
];



  const getPageTitle = (): string => {
    switch (pathname) {
      case "/home-dashboard":
        return "Discover";
      case "/map-view":
        return "Map View";
      case "/search-results":
        return "Search Results";
      case "/product-detail":
        return "Product Details";
      case "/user-profile":
        return "Profile";
      case "/create-listing":
        return "Create Listing";
      case "/vendor":
        return "Vendor Dashboard";
      default:
        return "LocalMarket";
    }
  };

  // const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (searchQuery.trim()) {
  //     router.push(
  //       `/search-results?q=${encodeURIComponent(searchQuery.trim())}`
  //     );
  //   }
  // };

  const handleBackNavigation = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCartOpen = () => {
    setIsCartOpen(true);
    setIsOpen(false);
  };

  const showBackButton =
    pathname === "/product-detail" || pathname === "/create-listing";

  const getFirstName = () => {
    const fullName = user?.name;
    return fullName ? fullName.split(" ")[0] : "User";
  };

  const renderAuthenticatedButtons = () => (
    <>
      <span className="hidden text-sm text-gray-600 lg:block">
        {`Welcome, ${getFirstName()}`}
      </span>

      <button
        onClick={handleCartOpen}
        className="relative p-2 transition-colors duration-200 rounded-lg hover:bg-surface-secondary"
        aria-label="User Shopping Cart"
        title="Shopping Cart"
      >
        <Icon name="ShoppingCart" size={20} className="text-text-primary" />
        <div className="absolute w-2 h-2 bg-red-500 rounded-full -top-1 -right-1 border-1 border-surface"></div>
      </button>

      <Button
        type="button"
        onClick={handleLogout}
        className="flex items-center px-4 py-2 font-medium text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700"
        title="Logout"
      >
        <Icon name="LogOut" size={16} className="mr-2" />
        Logout
      </Button>
    </>
  );

  const renderUnauthenticatedButtons = () => (
    <Button
      type="button"
      variant="navy"
      onClick={openModal}
      className="flex items-center text-sm transition-all duration-200"
      aria-label="Get Started"
    >
      Get Started
    </Button>
  );

  const renderLoadingSkeleton = () => (
    <Skeleton type="rect" width="150px" height="30px" />
  );

  return (
    <header className="sticky top-0 z-[200] bg-white border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl md:h-18 md:px-2">
        <div className="flex items-center space-x-4">
          {showBackButton ? (
            <button
              onClick={handleBackNavigation}
              className="p-2 -ml-2 transition-colors duration-200 rounded-lg hover:bg-surface-secondary"
              aria-label="Go back"
            >
              <Icon name="ArrowLeft" size={20} className="text-text-primary" />
            </button>
          ) : (
            <Link href="/" className="block">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                  <Icon name="MapPin" size={18} className="text-white" />
                </div>
                <h1 className="text-lg font-semibold text-black md:text-xl font-heading">
                  {getPageTitle()}
                </h1>
              </div>
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="items-center hidden gap-2 sm:flex gap-x-3">
            {isLoading
              ? renderLoadingSkeleton()
              : isLoggedIn
              ? renderAuthenticatedButtons()
              : renderUnauthenticatedButtons()}

            {/* modal */}
            {isModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in"
                onClick={closeModal}
              >
                <div
                  className="bg-white rounded-2xl shadow-2xl max-w-4xl px-4 py-8 w-full max-h-[90vh] overflow-hidden animate-scale-up"
                  onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                    e.stopPropagation()
                  }
                >
                  <div className="relative p-6 pb-0">
                    <button
                      onClick={closeModal}
                      className="absolute p-2 transition-colors duration-200 rounded-full top-4 right-4 hover:bg-gray-100"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                    <div className="text-center">
                      <h2 className="mb-2 text-2xl font-bold text-gray-800">
                        Choose Your Path
                      </h2>
                      <p className="text-gray-600">
                        Select how you&apos;d like to get started with our platform
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="relative mb-8">
                      <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-200 to-blue-200 transform -translate-y-1/2"></div>
                      <div className="absolute w-3 h-3 transform -translate-x-1/2 -translate-y-1/2 bg-purple-400 rounded-full top-1/2 left-1/2"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                      {modalOptions.map(option => {
                        const IconComp = option.icon;
                        const isSelected = selectedOption === option.id;

                        return (
                          <div
                            key={option.id}
                            className={`group relative bg-gradient-to-br ${
                              option.gradient
                            }
                              border-2 border-${
                                option.id === "shopping" ? "purple" : "blue"
                              }-200 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                              option.hoverGradient
                            } hover:scale-105
                              ${
                                isSelected ? `ring-2 ${option.ringColor}` : ""
                              }`}
                          >
                            <div className="text-center">
                              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white rounded-full shadow-md">
                                <IconComp
                                  className={`w-8 h-8 ${option.iconColor}`}
                                />
                              </div>
                              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                                {option.title}
                              </h3>
                              <p className="mb-4 text-sm text-gray-600">
                                {option.description}
                              </p>
                              <button
                                onClick={() => {
                                  handleOptionSelect(option.id);
                                  router.push(option.route);
                                }}
                                className={`inline-block ${option.buttonColor} text-white px-6 py-2 rounded-lg font-medium text-sm ${option.buttonHoverColor} transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                                disabled={selectedOption === option.id}
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
              </div>
            )}
          </div>

          {/* mobile dropdown */}
          <div className="relative block sm:hidden" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 transition-colors duration-200 rounded-lg hover:bg-surface-secondary"
              aria-label="Open menu"
            >
              <Icon
                name="AlignJustify"
                size={20}
                className="text-text-primary"
              />
            </button>

            {isOpen && (
              <div className="absolute right-0 z-10 mt-2 overflow-hidden bg-white border rounded-lg shadow-xl top-full w-60 border-surface-border">
                {isLoading ? (
                  <div className="p-3 text-sm text-gray-500">Loading...</div>
                ) : isLoggedIn ? (
                  <>
                    {user && (
                      <div className="p-3 text-sm font-medium text-gray-700 border-b">
                        Welcome, {getFirstName()}
                      </div>
                    )}
                    <button
                      onClick={handleCartOpen}
                      className="flex items-center w-full p-3 text-sm font-medium text-left hover:bg-surface-secondary"
                    >
                      <Icon name="ShoppingCart" size={16} className="mr-3" />
                      Shopping Cart
                    </button>
                    <Button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center w-full p-3 text-sm text-left text-red-600 hover:bg-red-50"
                    >
                      <Icon name="LogOut" size={16} className="mr-3" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="block w-full p-3 text-sm font-medium text-left hover:bg-surface-secondary"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Button
                      type="button"
                      onClick={() => {
                        openModal();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full gap-2 p-3 text-sm font-medium text-left hover:bg-surface-secondary"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* cart drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 w-full">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full bg-white shadow-lg w-96">
            <div className="p-4">
              <button
                onClick={() => setIsCartOpen(false)}
                className="float-right p-2 rounded hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
              <CartSystem />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
