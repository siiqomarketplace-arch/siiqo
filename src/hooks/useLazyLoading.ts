/**
 * Custom hook for lazy loading images with Intersection Observer
 * Provides automatic blur-up effect and proper error handling
 */

import { useEffect, useRef, useState } from "react";
import { lazyLoadingConfig } from "@/utils/lazyLoadingConfig";

interface UseLazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Hook to lazy load an image using Intersection Observer
 * Returns the image source to use (placeholder or actual)
 */
export const useLazyImage = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3C/svg%3E',
  onLoad,
  onError,
}: UseLazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = elementRef.current;
    if (!img) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is in viewport, load it
            const actualImage = new Image();

            actualImage.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
              onLoad?.();
            };

            actualImage.onerror = () => {
              setError(true);
              onError?.();
            };

            actualImage.src = src;

            // Stop observing after loading starts
            if (observerRef.current) {
              observerRef.current.unobserve(img);
            }
          }
        });
      },
      {
        ...lazyLoadingConfig.intersectionObserver,
      }
    );

    observerRef.current.observe(img);

    return () => {
      if (observerRef.current && img) {
        observerRef.current.unobserve(img);
      }
    };
  }, [src, onLoad, onError]);

  return {
    imageSrc,
    isLoaded,
    error,
    ref: elementRef,
  };
};

/**
 * Hook to lazy load multiple images
 * Useful for image galleries or grids
 */
export const useLazyImages = (srcs: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imgRefs = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;

          if (src) {
            const actualImage = new Image();
            actualImage.onload = () => {
              img.src = src;
              setLoadedImages((prev) => new Set([...prev, src]));
            };
            actualImage.src = src;
          }

          if (observerRef.current) {
            observerRef.current.unobserve(img);
          }
        }
      });
    }, lazyLoadingConfig.intersectionObserver);

    return () => {
      imgRefs.current.forEach((img) => {
        if (observerRef.current) {
          observerRef.current.unobserve(img);
        }
      });
    };
  }, []);

  const registerImage = (src: string, element: HTMLImageElement) => {
    if (element) {
      imgRefs.current.set(src, element);
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    }
  };

  const isLoaded = (src: string) => loadedImages.has(src);

  return { registerImage, isLoaded, loadedImages };
};

/**
 * Hook to detect when an element comes into view
 * Useful for triggering animations or loading
 */
export const useInView = (
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isInView;
};
