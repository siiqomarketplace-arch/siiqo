"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Icon from "@/components/AppIcon";
import { LucidePanelLeftClose, LucidePanelRightClose } from "lucide-react";

interface VendorData {
  business_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  isVerified?: boolean;
}

interface VendorHeaderProps {
  onLogout: () => void;
  vendorData?: VendorData;
}

const navigationItems = [
  { label: "Dashboard", path: "/vendor/dashboard", icon: "LayoutDashboard" },
  { label: "Products", path: "/vendor/products", icon: "Package" },
  { label: "Orders", path: "/vendor/orders", icon: "ShoppingCart" },
  { label: "Storefront", path: "/vendor/storefront", icon: "Store" },
  { label: "Analytics", path: "/vendor/analytics", icon: "BarChart3" },
  { label: "Settings", path: "/vendor/settings", icon: "Settings" },
];

const VendorHeader: React.FC<VendorHeaderProps> = ({
  onLogout,
  vendorData: propVendorData,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [vendorData, setVendorData] = useState<VendorData | null>(
    propVendorData || null
  );

  const isAuthPage = () => {
    const authPatterns = [
      "/auth/",
      "/vendor/auth",
      "/vendor/signup",
      "/vendor/verify-otp",
      "/vendor/forgot-password",
      "/vendor/reset-password",
      "verify-otp",
      "login",
      "signup",
      "forgot-password",
      "reset-password",
    ];

    return authPatterns.some(
      pattern => pathname.includes(pattern) || pathname.endsWith(pattern)
    );
  };

  if (isAuthPage()) return null;

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    if (!propVendorData) {
      const fetchProfile = async () => {
        try {
          const res = await fetch(
            "https://server.bizengo.com/api/user/profile",
            {
              headers: {
                accept: "application/json",
                Authorization: `Bearer ${localStorage.getItem("vendorToken")}`,
              },
            }
          );
          if (!res.ok) throw new Error("Failed to fetch profile");
          const data = await res.json();
          setVendorData(data);
        } catch (err) {
          console.error("Error fetching vendor profile:", err);
        }
      };
      fetchProfile();
    }
  }, [propVendorData]);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-border flex flex-col z-[5000] transition-all duration-300 ${
        isCollapsed ? "w-18" : "w-60"
      }`}
    >
      {/* Expand/Collapse Button at the Top */}
      <div className="absolute top-3 left-5 z-[5100]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-8 h-8 transition-colors rounded-md hover:bg-surface"
        >
          {isCollapsed ? (
            <LucidePanelRightClose
              size={20}
              className="text-text-muted"
              strokeWidth={1.8}
            />
          ) : (
            <LucidePanelLeftClose
              size={20}
              className="text-text-muted"
              strokeWidth={1.8}
            />
          )}
        </button>
      </div>

      {/* Logo & Business Name */}
      <div className="p-4 border-b pt-14 border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg bg-primary">
            <Icon name="Store" size={20} color="white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate font-heading text-text-primary">
                {vendorData?.business_name || "My Store"}
              </h1>
              <p className="text-sm truncate text-text-muted">
                Vendor Dashboard
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map(item => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                pathname === item.path
                  ? "bg-gray-500 text-primary-foreground"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface"
              } ${isCollapsed ? "justify-center" : "space-x-3"}`}
              title={isCollapsed ? item.label : ""}
            >
              <Icon name={item.icon as any} size={isCollapsed ? 28 : 20} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* User Menu Section */}
      <div className="relative p-4 border-t border-border">
        {showUserMenu && (
          <div
            className="fixed inset-0 z-[4000]"
            onClick={() => setShowUserMenu(false)}
          ></div>
        )}

        <div className="relative z-[5001]">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center w-full p-2 transition-colors rounded-lg hover:bg-surface ${
              isCollapsed ? "justify-center" : "space-x-3"
            }`}
          >
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-primary">
              <span className="text-sm font-medium text-white">
                {vendorData?.first_name?.charAt(0) || "V"}
              </span>
            </div>

            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate text-text-primary">
                    {vendorData?.first_name} {vendorData?.last_name}
                  </p>
                  <p className="text-xs truncate text-text-muted">
                    {vendorData?.email}
                  </p>
                </div>
                {/* Restored Dropdown Icon */}
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`text-text-muted transition-transform flex-shrink-0 ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </button>

          {showUserMenu && (
            <div
              className={`absolute bottom-full mb-2 border rounded-lg bg-card border-border shadow-elevated z-[5002] ${
                isCollapsed ? "left-full ml-2 w-56" : "left-0 right-0"
              }`}
            >
              <div className="p-4 border-b border-border">
                <p className="font-medium text-text-primary">
                  {vendorData?.first_name} {vendorData?.last_name}
                </p>
                <p className="text-sm truncate text-text-muted">
                  {vendorData?.email}
                </p>
                <div className="flex items-center mt-2">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      vendorData?.isVerified ? "bg-success" : "bg-warning"
                    }`}
                  ></div>
                  <span className="text-xs text-text-muted">
                    {vendorData?.isVerified
                      ? "Verified"
                      : "Pending Verification"}
                  </span>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    handleNavigation("/vendor/profile");
                    setShowUserMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 space-x-3 text-left transition-colors rounded-lg hover:bg-surface"
                >
                  <Icon name="User" size={16} className="text-text-muted" />
                  <span className="text-sm text-text-secondary">Profile</span>
                </button>

                <button
                  onClick={() => {
                    handleNavigation("/vendor/settings");
                    setShowUserMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 space-x-3 text-left transition-colors rounded-lg hover:bg-surface"
                >
                  <Icon name="Settings" size={16} className="text-text-muted" />
                  <span className="text-sm text-text-secondary">Settings</span>
                </button>

                <button
                  onClick={() => {
                    router.push("/");
                    setShowUserMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 space-x-3 text-left transition-colors rounded-lg hover:bg-surface"
                >
                  <Icon
                    name="ExternalLink"
                    size={16}
                    className="text-text-muted"
                  />
                  <span className="text-sm text-text-secondary">
                    View Customer App
                  </span>
                </button>

                <hr className="my-2 border-border" />

                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 space-x-3 text-left transition-colors rounded-lg hover:bg-surface"
                >
                  <Icon name="LogOut" size={16} />
                  <span className="text-sm text-error">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default VendorHeader;
