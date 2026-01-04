"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Icon from "@/components/AppIcon";
import { LucidePanelLeftClose, LucidePanelRightClose, Menu, X, Loader2 } from "lucide-react";
import { vendorService } from "@/services/vendorService"; 

interface VendorData {
  business_name?: string;
  fullname?: string;
  email?: string;
  isVerified?: boolean;
  logo_url?: string | null;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [vendorData, setVendorData] = useState<VendorData | null>(propVendorData || null);
  const [loading, setLoading] = useState(!propVendorData);
  
  // New state for navigation/action loading
  const [isPageLoading, setIsPageLoading] = useState(false);

  const isAuthPage = () => {
    const authPatterns = ["/auth/", "/vendor/signup", "login", "signup"];
    return authPatterns.some((pattern) => pathname.includes(pattern));
  };

  useEffect(() => {
    const fetchLiveProfile = async () => {
      try {
        setLoading(true);
        const response = await vendorService.getVendorProfile();
        const apiData = response.data;
        
        setVendorData({
          fullname: apiData.personal_info?.fullname || "Vendor",
          email: apiData.personal_info?.email || "",
          business_name: apiData.store_settings?.business_name || "My Store",
          isVerified: apiData.store_settings?.initialized || false,
          logo_url: apiData.store_settings?.logo_url,
        });
      } catch (err) {
        console.error("Error fetching live vendor profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!propVendorData) {
      fetchLiveProfile();
    }
  }, [propVendorData]);

  // Turn off loader when the pathname changes (navigation finished)
  useEffect(() => {
    setIsPageLoading(false);
  }, [pathname]);

  if (isAuthPage()) return null;

  const handleNavigation = (path: string) => {
    if (pathname === path) return;
    setIsPageLoading(true); // Trigger blur and loader
    router.push(path);
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  const handleLogoutAction = () => {
    setIsPageLoading(true);
    onLogout();
  };

  // --- Shared Navigation Content ---
  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              disabled={isPageLoading}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === item.path
                  ? "bg-gray-500 text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface"
              } ${isCollapsed && !mobile ? "justify-center" : "space-x-3"} ${isPageLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              title={isCollapsed && !mobile ? item.label : ""}
            >
              <Icon name={item.icon as any} size={isCollapsed && !mobile ? 28 : 20} />
              {(!isCollapsed || mobile) && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      <div className="relative p-4 border-t border-border">
        {showUserMenu && <div className="fixed inset-0 z-[4000]" onClick={() => setShowUserMenu(false)}></div>}
        <div className="relative z-[5001]">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center w-full p-2 transition-colors rounded-lg hover:bg-surface ${isCollapsed && !mobile ? "justify-center" : "space-x-3"}`}
          >
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden rounded-full bg-primary">
              {vendorData?.logo_url ? (
                <img src={vendorData.logo_url} alt="Logo" className="object-cover w-full h-full" />
              ) : (
                <span className="text-sm font-medium text-white">{vendorData?.fullname?.charAt(0) || "V"}</span>
              )}
            </div>
            {(!isCollapsed || mobile) && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate text-text-primary">{vendorData?.fullname}</p>
                  <p className="text-xs truncate text-text-muted">{vendorData?.email}</p>
                </div>
                <Icon name="ChevronDown" size={16} className={`text-text-muted transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </>
            )}
          </button>

          {showUserMenu && (
            <div className={`absolute bottom-full mb-2 border rounded-lg bg-white border-border shadow-xl z-[5002] ${isCollapsed && !mobile ? "left-full ml-2 w-56" : "left-0 right-0"}`}>
              <div className="p-4 border-b border-border">
                <p className="font-medium text-text-primary">{vendorData?.fullname}</p>
                <div className="flex items-center mt-1">
                   <div className={`w-2 h-2 rounded-full mr-2 ${vendorData?.isVerified ? "bg-green-500" : "bg-yellow-500"}`}></div>
                   <span className="text-[10px] uppercase tracking-wider text-text-muted">{vendorData?.isVerified ? "Initialized" : "Pending"}</span>
                </div>
              </div>
              <div className="p-2">
                <button onClick={() => handleNavigation("/vendor/settings")} className="flex items-center w-full px-3 py-2 space-x-3 rounded-lg hover:bg-surface text-sm text-text-secondary"><Icon name="User" size={16} /><span>Profile</span></button>
                <button onClick={() => handleNavigation("/")} className="flex items-center w-full px-3 py-2 space-x-3 rounded-lg hover:bg-surface text-sm text-text-secondary"><Icon name="ExternalLink" size={16} /><span>Customer View</span></button>
                <hr className="my-2 border-border" />
                <button onClick={handleLogoutAction} className="flex items-center w-full px-3 py-2 space-x-3 rounded-lg hover:bg-surface text-sm text-red-500"><Icon name="LogOut" size={16} /><span>Sign Out</span></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ACTION LOADER & BLUR OVERLAY */}
      {isPageLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/40 backdrop-blur-md transition-all duration-300">
          <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-2xl border border-border">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-text-primary animate-pulse">Processing...</p>
          </div>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border z-[4999] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 rounded-md hover:bg-surface"><Menu size={24} /></button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary"><Icon name="Store" size={16} color="white" /></div>
            <h1 className="text-base font-semibold truncate max-w-[150px]">{vendorData?.business_name || "My Store"}</h1>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[6000] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute top-0 left-0 bottom-0 w-64 bg-white border-r border-border flex flex-col">
             <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Icon name="Store" size={16} color="white" /></div><span className="font-bold">Menu</span></div>
                <button onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
             </div>
             <NavContent mobile={true} />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-border flex-col z-[5000] transition-all duration-300 ${isCollapsed ? "w-18" : "w-60"}`}>
        <div className="absolute top-3 left-5 z-[5100]">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-surface">
            {isCollapsed ? <LucidePanelRightClose size={20} /> : <LucidePanelLeftClose size={20} />}
          </button>
        </div>
        <div className="p-4 border-b pt-14 border-border">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg bg-primary"><Icon name="Store" size={20} color="white" /></div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold truncate">{vendorData?.business_name || "My Store"}</h1>
                <p className="text-xs text-text-muted">Vendor Dashboard</p>
              </div>
            )}
          </div>
        </div>
        <NavContent />
      </aside>
    </>
  );
};

export default VendorHeader;