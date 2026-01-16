/**
 * Lazy Loading Configuration and Utilities
 * Centralized lazy loading settings for the application
 */

export const lazyLoadingConfig = {
  // Image optimization settings
  images: {
    maxWidth: 1200,
    quality: 75,
    formats: ["image/webp", "image/avif"], // Modern formats for better compression
  },

  // Dynamic import loading options
  dynamicImport: {
    ssr: true, // Enable server-side rendering for critical components
  },

  // Virtualization settings for large lists
  virtualization: {
    overscanCount: 5, // Number of items to render outside visible area
    itemHeight: 300, // Average height of items (product cards)
  },

  // Intersection Observer settings
  intersectionObserver: {
    rootMargin: "50px", // Start loading 50px before coming into view
    threshold: 0.1, // Trigger at 10% visibility
  },

  // Preloading strategies
  preload: {
    // Preload next page when user is on page with this index or higher
    pageThreshold: 1,
    // Preload images that are within this distance from viewport
    imageDistance: 3,
  },
};

/**
 * Utility to get skeleton styling for different component types
 */
export const getSkeletonClassName = (
  type: "card" | "grid" | "modal" | "image"
): string => {
  switch (type) {
    case "card":
      return "animate-pulse bg-gray-200 rounded-lg h-96 w-full";
    case "grid":
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
    case "modal":
      return "animate-pulse space-y-4";
    case "image":
      return "animate-pulse bg-gray-200 rounded aspect-square w-full";
    default:
      return "animate-pulse bg-gray-200 rounded h-12 w-full";
  }
};

/**
 * Utility to create a loading skeleton for different component types (returns className)
 * Use in your React components like: <div className={createLoadingSkeleton("card")} />
 */
export const createLoadingSkeleton = (
  type: "card" | "grid" | "modal" | "image"
): string => {
  return getSkeletonClassName(type);
};

/**
 * Check if a user is on a slow network connection
 * Useful for adjusting lazy loading strategy
 */
export const isSlowConnection = (): boolean => {
  if (typeof window === "undefined") return false;

  const connection = (navigator as any).connection;
  if (!connection) return false;

  // Slow 3G or slower
  return (
    connection.effectiveType === "slow-2g" ||
    connection.effectiveType === "2g" ||
    connection.effectiveType === "3g"
  );
};

/**
 * Get optimal image dimensions based on device
 */
export const getOptimalImageDimensions = (
  baseWidth: number,
  baseHeight: number
): { width: number; height: number; srcSet?: string } => {
  if (typeof window === "undefined") {
    return { width: baseWidth, height: baseHeight };
  }

  const dpr = window.devicePixelRatio || 1;
  const width = Math.ceil(baseWidth * dpr);
  const height = Math.ceil(baseHeight * dpr);

  return {
    width,
    height,
    srcSet: `
      ${baseWidth}w 1x,
      ${Math.ceil(baseWidth * 1.5)}w 1.5x,
      ${Math.ceil(baseWidth * 2)}w 2x
    `,
  };
};

/**
 * Debounce function for handling scroll and resize events
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for high-frequency events
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
