/**
 * Centralized Error Handler for Server-Related Errors
 * Converts technical errors into user-friendly messages
 */

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  code?: string;
  isServerError?: boolean;
}

export type ErrorResponse = {
  message: string;
  title: string;
  isServerError: boolean;
  status?: number;
  originalError?: any;
};

/**
 * Get user-friendly error messages based on error type and status
 */
export const getServerErrorMessage = (
  error: any,
  context?: string,
): ErrorResponse => {
  // Network errors (no internet)
  if (!window?.navigator?.onLine) {
    return {
      title: "No Connection",
      message:
        "You're currently offline. Please check your internet connection.",
      isServerError: false,
    };
  }

  const status = error?.response?.status || error?.status;
  const errorData = error?.response?.data || error?.data;
  const errorMessage =
    errorData?.message ||
    errorData?.error ||
    error?.message ||
    "An unexpected error occurred";

  // 5xx Server Errors
  if (status && status >= 500) {
    return {
      title: "Our Apologies, We're Having Issues",
      message:
        "It's not your fault—our servers are experiencing some issues. We're working on it right now. Please try again in a few moments.",
      isServerError: true,
      status,
      originalError: error,
    };
  }

  // 429 Rate Limiting
  if (status === 429) {
    return {
      title: "Too Many Requests",
      message:
        "You're doing great! But slow down a bit. We've received too many requests. Please wait a moment and try again.",
      isServerError: true,
      status,
      originalError: error,
    };
  }

  // 503 Service Unavailable
  if (status === 503) {
    return {
      title: "Service Temporarily Unavailable",
      message:
        "We're currently performing maintenance to improve your experience. We'll be back online shortly. Thanks for your patience!",
      isServerError: true,
      status,
      originalError: error,
    };
  }

  // 502 Bad Gateway
  if (status === 502) {
    return {
      title: "Connection Issue",
      message:
        "We're experiencing temporary connection issues. Our team is working on this. Please try again shortly.",
      isServerError: true,
      status,
      originalError: error,
    };
  }

  // 504 Gateway Timeout
  if (status === 504) {
    return {
      title: "Request Timeout",
      message:
        "The request took too long to complete. Our servers might be busy. Please try again.",
      isServerError: true,
      status,
      originalError: error,
    };
  }

  // 401 Unauthorized
  if (status === 401) {
    return {
      title: "Session Expired",
      message: "Your session has expired. Please log in again to continue.",
      isServerError: false,
      status,
      originalError: error,
    };
  }

  // 403 Forbidden
  if (status === 403) {
    return {
      title: "Access Denied",
      message: "You don't have permission to perform this action.",
      isServerError: false,
      status,
      originalError: error,
    };
  }

  // 404 Not Found
  if (status === 404) {
    return {
      title: "Not Found",
      message: "The resource you're looking for couldn't be found.",
      isServerError: false,
      status,
      originalError: error,
    };
  }

  // 400 Bad Request
  if (status === 400) {
    return {
      title: "Invalid Request",
      message:
        errorMessage ||
        "There was an issue with your request. Please check and try again.",
      isServerError: false,
      status,
      originalError: error,
    };
  }

  // 4xx Client Errors (general)
  if (status && status >= 400 && status < 500) {
    return {
      title: "Request Error",
      message:
        errorMessage ||
        "There was an issue with your request. Please try again.",
      isServerError: false,
      status,
      originalError: error,
    };
  }

  // Timeout errors
  if (
    error?.code === "ECONNABORTED" ||
    errorMessage?.toLowerCase().includes("timeout")
  ) {
    return {
      title: "Request Timeout",
      message:
        "The request took too long. Our servers might be busy. Please try again.",
      isServerError: true,
      originalError: error,
    };
  }

  // Network/Connection errors
  if (
    error?.code === "ERR_NETWORK" ||
    error?.message?.toLowerCase().includes("network")
  ) {
    return {
      title: "Network Error",
      message:
        "We're having trouble reaching our servers. Please check your connection and try again.",
      isServerError: true,
      originalError: error,
    };
  }

  // Default server error
  if (status && status >= 500) {
    return {
      title: "Server Error",
      message:
        "It's not your fault—we're experiencing technical difficulties. Our team is on it!",
      isServerError: true,
      status,
      originalError: error,
    };
  }

  // Fallback for unknown errors
  return {
    title: "Something Went Wrong",
    message:
      "An unexpected error occurred. It's not your fault. Please try again, or contact support if the problem persists.",
    isServerError: false,
    originalError: error,
  };
};

/**
 * Check if an error is a server-side error (5xx)
 */
export const isServerError = (error: any): boolean => {
  const status = error?.response?.status || error?.status;
  return status ? status >= 500 : false;
};

/**
 * Check if an error is a client-side error (4xx)
 */
export const isClientError = (error: any): boolean => {
  const status = error?.response?.status || error?.status;
  return status ? status >= 400 && status < 500 : false;
};

/**
 * Check if an error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error?.code === "ERR_NETWORK" ||
    error?.message?.toLowerCase().includes("network") ||
    !window?.navigator?.onLine
  );
};

/**
 * Log error for debugging (server-side or client-side)
 */
export const logError = (error: any, context?: string): void => {
  if (typeof window !== "undefined") {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      context,
      status: error?.response?.status,
      code: error?.code,
      message: error?.message,
      url: error?.config?.url,
      method: error?.config?.method,
    };
    console.error("[Error Log]", errorInfo);

    // Optional: Send to error tracking service (Sentry, LogRocket, etc.)
    // if (window.__errorTracker) {
    //   window.__errorTracker.captureException(error, { extra: errorInfo });
    // }
  }
};
