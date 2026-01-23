/**
 * Custom hook for handling API errors with user-friendly messages
 * Automatically shows toast notifications for server errors
 */

import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getServerErrorMessage,
  isServerError,
  logError,
} from "@/lib/errorHandler";

export const useServerErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback(
    (
      error: any,
      context?: string,
      showToast: boolean = true,
      customTitle?: string,
    ) => {
      // Log the error
      logError(error, context);

      // Get user-friendly message
      const errorResponse = getServerErrorMessage(error, context);

      // Show toast notification for server errors
      if (showToast) {
        toast({
          title: customTitle || errorResponse.title,
          description: errorResponse.message,
          variant: errorResponse.isServerError ? "destructive" : "default",
        });
      }

      return errorResponse;
    },
    [toast],
  );

  return {
    handleError,
    getServerErrorMessage,
    isServerError,
  };
};

/**
 * Wrap an async function with error handling
 * Usage: const result = await withErrorHandling(apiCall, context, showToast)
 */
export const withErrorHandling = async <T>(
  asyncFn: () => Promise<T>,
  context?: string,
  showToast?: boolean,
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    logError(error, context);

    if (showToast && typeof window !== "undefined") {
      // Import toast dynamically to avoid circular dependencies
      const { useToast } = await import("@/hooks/use-toast");
      const { toast } = useToast();
      const errorResponse = getServerErrorMessage(error, context);

      toast({
        title: errorResponse.title,
        description: errorResponse.message,
        variant: errorResponse.isServerError ? "destructive" : "default",
      });
    }

    return null;
  }
};
