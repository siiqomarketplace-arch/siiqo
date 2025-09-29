"use client";
import { useEffect } from "react";
import { usePathname } from 'next/navigation'; // Import usePathname specifically

const ScrollToTop = () => {
    // Use usePathname to get the current URL path
    const pathname = usePathname();

    useEffect(() => {
        // Scroll to top whenever the pathname changes
        window.scrollTo(0, 0);
    }, [pathname]); // Depend on the pathname from usePathname()

    return null;
};

export default ScrollToTop;