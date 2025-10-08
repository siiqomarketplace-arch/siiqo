"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "./ui/Header";
import VendorHeader from "@/app/vendor/dashboard/components/VendorHeader";

const ConditionalHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = (): void => {
    localStorage.removeItem("vendorAuth");
    localStorage.removeItem("isVendorLoggedIn");
    localStorage.removeItem("vendorToken");
    router.push("../auth");
  };

  // Routes where header should be hidden
  const hiddenHeaderRoutes = ["/Administration", "/auth", "/vendor/auth"];

  const shouldHideHeader = hiddenHeaderRoutes.some(
    pattern => pathname === pattern || pathname.startsWith(`${pattern}/`)
  );

  if (shouldHideHeader) {
    return null;
  }

  // Show vendor sidebar for all vendor pages (except auth, already handled above)
  if (pathname.startsWith("/vendor")) {
    return <VendorHeader onLogout={handleLogout} />;
  }

  // Show customer header for all other pages
  return <Header />;
};

export default ConditionalHeader;
