"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BottomTabNavigation from "./ui/BottomTabNavigation";

const ConditionalBottomNav: React.FC = () => {
  const pathname = usePathname();

  // Routes where bottom nav should be hidden
  const hiddenRoutes = ["/Administration", "/auth", "/vendor/auth"];

  const shouldHide =
    pathname.startsWith("/vendor") ||
    hiddenRoutes.some(
      pattern => pathname.includes(pattern) || pathname.endsWith(pattern)
    );

  if (shouldHide) return null;

  return <BottomTabNavigation />;
};

export default ConditionalBottomNav;
