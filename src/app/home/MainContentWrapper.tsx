"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface MainContentWrapperProps {
  children: React.ReactNode;
}

const MainContentWrapper: React.FC<MainContentWrapperProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const [sidebarWidth, setSidebarWidth] = useState("256px");

  // Check if we're on a vendor page to apply sidebar padding
  const isVendorPage =
    pathname.startsWith("/vendor") && !pathname.startsWith("/vendor/auth");

  useEffect(() => {
    if (!isVendorPage) return;

    // Listen for sidebar width changes
    const checkSidebarWidth = () => {
      const sidebar = document.querySelector("aside");
      if (sidebar) {
        const width = sidebar.offsetWidth;
        setSidebarWidth(`${width}px`);
      }
    };

    // Check initially and on resize
    checkSidebarWidth();
    const observer = new ResizeObserver(checkSidebarWidth);
    const sidebar = document.querySelector("aside");

    if (sidebar) {
      observer.observe(sidebar);
    }

    return () => {
      observer.disconnect();
    };
  }, [isVendorPage]);

  return (
    <main
      className="overflow-hidden transition-all duration-300"
      style={isVendorPage ? { paddingLeft: sidebarWidth } : {}}
    >
      {children}
    </main>
  );
};

export default MainContentWrapper;
