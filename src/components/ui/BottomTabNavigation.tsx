"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Icon, { LucideIconName } from "./AppIcon";

interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIconName;
  activeIcon: LucideIconName;
  tooltip: string;
  isSpecial?: boolean;
}

interface CreateMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateMenu: React.FC<CreateMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const router = useRouter();

  const createOptions = [
    {
      label: "Create Storefront",
      description: "Set up your business presence",
      icon: "Store" as LucideIconName,
      color: "bg-blue-100 text-blue-600",
      link: "/vendor/dashboard",
    },
    {
      label: "List Product",
      description: "Add a new product to sell",
      icon: "Package" as LucideIconName,
      color: "bg-green-100 text-green-600",
      link: "/marketplace",
    },
    // {
    //     label: 'Offer Service',
    //     description: 'Provide services to customers',
    //     icon: 'Wrench' as LucideIconName,
    //     color: 'bg-orange-100 text-orange-600',
    //     link: '/vendor/dashboard'
    // }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[150]"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl z-[160] w-80 p-6 md:bottom-24">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Create</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-secondary rounded-full transition-colors"
          >
            <Icon name="X" size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="space-y-3">
          {createOptions.map((option, index) => (
            <button
              key={index}
              className="flex items-center space-x-4 w-full p-3 hover:bg-surface-secondary rounded-xl transition-colors"
              onClick={() => router.push(`${option.link}`)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${option.color}`}
              >
                <Icon name={option.icon} size={20} />
              </div>
              <div className="text-left">
                <div className="font-medium text-text-primary">
                  {option.label}
                </div>
                <div className="text-sm text-text-secondary">
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

const BottomTabNavigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<string>("Home");
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState<boolean>(false);
  const isAuthPage = () => {
    const authPatterns = ["/Adminstration"];

    const shouldHide = authPatterns.some(
      (pattern) => pathname.includes(pattern) || pathname.endsWith(pattern)
    );

    // Debug log to see what's happening
    console.log("VendorHeader - isAuthPage:", shouldHide);

    return shouldHide;
  };
  if (isAuthPage()) {
    console.log("VendorHeader - Hiding header for auth page");
    return null;
  }

  const navigationItems: NavigationItem[] = [
    {
      label: "Home",
      path: "/",
      icon: "Home",
      activeIcon: "Home",
      tooltip: "Discover nearby products",
    },
    {
      label: "Explore",
      path: "/marketplace",
      icon: "Compass",
      activeIcon: "Compass",
      tooltip: "Explore the hyperlocal marketplace",
    },
    {
      label: "Create",
      path: "#",
      icon: "Plus",
      activeIcon: "Plus",
      tooltip: "Create",
      isSpecial: true,
    },
    {
      label: "Search",
      path: "/search-results",
      icon: "Search",
      activeIcon: "Search",
      tooltip: "Query-driven discovery",
    },
    {
      label: "Profile",
      path: "/user-profile",
      icon: "User",
      activeIcon: "User",
      tooltip: "Account management",
    },
  ];

  const handleTabPress = (path: string, label: string): void => {
    if (label === "Create") {
      setIsCreateMenuOpen(true);
    } else {
      setActiveTab(label);
      setIsCreateMenuOpen(false);
      router.push(path);
    }
  };

  const handleCloseCreateMenu = () => {
    setIsCreateMenuOpen(false);
  };

  const isActiveTab = (path: string): boolean => {
    return pathname === path;
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-100 bg-white border-t border-border md:hidden">
        <div className="flex items-center justify-around px-4 py-2 safe-area-inset-bottom">
          {navigationItems.map((item) => {
            const isActive = isActiveTab(item.path);
            const isCreateButton = item.isSpecial;

            return (
              <button
                key={item.path}
                onClick={() => handleTabPress(item.path, item.label)}
                className={`flex flex-col items-center justify-center min-h-[48px] px-3 py-2 rounded-lg transition-all duration-200 ${
                  isCreateButton
                    ? "transform hover:scale-105"
                    : isActive
                    ? "text-primary bg-primary-50"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                }`}
                aria-label={item.tooltip}
                title={item.tooltip}
              >
                {isCreateButton ? (
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Icon
                      name={item.icon}
                      size={24}
                      strokeWidth={2.5}
                      className="text-white"
                    />
                  </div>
                ) : (
                  <>
                    <Icon
                      name={isActive ? item.activeIcon : item.icon}
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`mb-1 transition-colors duration-200 ${
                        isActive ? "text-primary" : "text-current"
                      }`}
                    />
                    <span
                      className={`text-xs font-caption transition-all duration-200 ${
                        isActive ? "font-medium text-primary" : "text-current"
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="hidden md:block fixed bottom-0 left-0 right-0 z-100 bg-white border-t border-border w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center space-x-8 py-4">
            {navigationItems.map((item) => {
              const isActive = isActiveTab(item.path);
              const isCreateButton = item.isSpecial;
              return (
                <button
                  key={item.path}
                  onClick={() => handleTabPress(item.path, item.label)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isCreateButton
                      ? "bg-[#001d3b] text-white hover:bg-primary/90 font-medium"
                      : isActive
                      ? "text-primary bg-primary-50 font-medium"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                  }`}
                  aria-label={item.tooltip}
                  title={item.tooltip}
                >
                  <Icon
                    name={isActive ? item.activeIcon : item.icon}
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-200 ${
                      isCreateButton
                        ? "text-white"
                        : isActive
                        ? "text-primary"
                        : "text-current"
                    }`}
                  />
                  <span
                    className={`text-sm font-caption transition-all duration-200 ${
                      isCreateButton
                        ? "text-white font-medium"
                        : isActive
                        ? "font-medium text-primary"
                        : "text-current"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Create Menu */}
      <CreateMenu isOpen={isCreateMenuOpen} onClose={handleCloseCreateMenu} />
    </>
  );
};

export default BottomTabNavigation;
