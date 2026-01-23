# Server Error Handling Implementation Guide

## Overview

This guide explains how to implement user-friendly server error messages across the application. Instead of showing technical error messages, users now see friendly, reassuring messages when servers experience issues.

## Features

✅ **User-Friendly Messages** - Converts technical errors to understandable messages
✅ **Server Error Detection** - Automatically identifies 5xx errors  
✅ **Automatic Toast Notifications** - Shows error messages in toast UI
✅ **Error Logging** - Logs errors for debugging purposes
✅ **Offline Detection** - Detects and handles network disconnections

## User-Facing Error Messages

### Server Errors (5xx)

**Example Messages:**

- "Our Apologies, We're Having Issues - It's not your fault—our servers are experiencing some issues. We're working on it right now."
- "Service Temporarily Unavailable - We're currently performing maintenance to improve your experience."
- "Connection Issue - We're experiencing temporary connection issues. Our team is working on this."

### Client Errors (4xx)

**401 Unauthorized**

- "Session Expired - Your session has expired. Please log in again."

**403 Forbidden**

- "Access Denied - You don't have permission to perform this action."

**404 Not Found**

- "Not Found - The resource you're looking for couldn't be found."

**400 Bad Request**

- "Invalid Request - There was an issue with your request."

## Implementation Methods

### Method 1: Using `getServerErrorMessage` (Manual)

```tsx
import { getServerErrorMessage } from "@/lib/errorHandler";
import { toast } from "sonner";

try {
  const response = await fetch("/api/endpoint");
  if (!response.ok) throw new Error("Failed to fetch");
} catch (error) {
  const errorMessage = getServerErrorMessage(error, "Fetch Data");

  // Show toast notification
  toast.error(errorMessage.title, {
    description: errorMessage.message,
  });

  // Optional: Check if it's a server error
  if (errorMessage.isServerError) {
    // Do something specific for server errors
  }
}
```

### Method 2: Using Custom Hook (Recommended)

```tsx
import { useServerErrorHandler } from "@/hooks/useServerErrorHandler";

export default function MyComponent() {
  const { handleError } = useServerErrorHandler();

  const handleAction = async () => {
    try {
      await someApiCall();
    } catch (error) {
      // Automatically handles logging and toast notification
      handleError(error, "Action Context");
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

### Method 3: Using Wrapper Function

```tsx
import { withErrorHandling } from "@/hooks/useServerErrorHandler";

const result = await withErrorHandling(
  async () => {
    const response = await api.get("/endpoint");
    return response.data;
  },
  "My Operation", // context for logging
  true, // showToast
);
```

## API Error Handling in Services

All API calls are automatically wrapped with error handling at the interceptor level. The API clients log server errors automatically:

```typescript
// src/lib/api_client.ts - Error Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Log all server errors
    if (status && status >= 500) {
      logError(error, `API Error (${status})`);
    }

    return Promise.reject(error);
  },
);
```

## Utility Functions

### `getServerErrorMessage(error, context?)`

Returns an `ErrorResponse` object:

```typescript
{
  message: string;        // User-friendly message
  title: string;          // Error title
  isServerError: boolean; // true if 5xx
  status?: number;        // HTTP status code
  originalError?: any;    // Original error object
}
```

### `isServerError(error)`

Check if error is a 5xx server error:

```typescript
if (isServerError(error)) {
  // Handle server error
}
```

### `isClientError(error)`

Check if error is a 4xx client error:

```typescript
if (isClientError(error)) {
  // Handle client error
}
```

### `isNetworkError(error)`

Check if error is a network/connectivity issue:

```typescript
if (isNetworkError(error)) {
  // Handle offline
}
```

### `logError(error, context?)`

Manually log an error for debugging:

```typescript
logError(error, "My Component - Fetch Data");
```

## Best Practices

1. **Always catch errors** in API calls
2. **Use context string** for better logging (`"Fetch Products"`, `"Add to Cart"`)
3. **Show toast notifications** for server errors to inform users
4. **Log errors** for debugging and monitoring
5. **Don't show technical messages** to users - always use `getServerErrorMessage()`
6. **Handle 5xx vs 4xx differently**:
   - 5xx: Always show to user (server issue, not their fault)
   - 4xx: Show only for important operations (auth, validation, etc.)

## Integration Checklist

- [x] Error handler utility created (`src/lib/errorHandler.ts`)
- [x] Custom hook created (`src/hooks/useServerErrorHandler.ts`)
- [x] API client updated with logging
- [x] Sample pages updated:
  - [x] Storefront Details (`src/app/[name]/page.tsx`)
  - [x] Search Results (`src/app/search-results/page.tsx`)
  - [x] StoreFront Card (`src/app/home/ui/StoreFrontCard.tsx`)
  - [x] Vendor Products (`src/app/vendor/products/page.tsx`)

## Future Enhancements

1. **Error Tracking Service Integration** - Sentry, LogRocket, or Rollbar
2. **Error Analytics** - Track which errors occur most frequently
3. **Retry Logic** - Automatic retry for failed requests
4. **Fallback UI** - Show cached data when APIs fail
5. **Error Recovery** - Suggest actions users can take

## Examples

### Example 1: Fetch Store Details

```tsx
const fetchStoreDetails = async () => {
  try {
    const response = await fetch("/api/marketplace/store/" + name);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    setStore(data);
  } catch (error) {
    const errorMsg = getServerErrorMessage(error, "Fetch Store");
    setError(errorMsg.message);
    toast.error(errorMsg.title, { description: errorMsg.message });
  }
};
```

### Example 2: Add Product

```tsx
const addProduct = async (productData) => {
  try {
    const response = await api.post("/products/add", productData);
    toast.success("Product added successfully!");
  } catch (error) {
    const errorMsg = getServerErrorMessage(error, "Add Product");
    toast.error(errorMsg.title, { description: errorMsg.message });
  }
};
```

### Example 3: Search Products

```tsx
const searchProducts = async (query) => {
  try {
    setLoading(true);
    const response = await fetch(`/api/marketplace/search?q=${query}`);
    if (!response.ok) throw new Error("Search failed");

    const data = await response.json();
    setResults(data);
  } catch (error) {
    const errorMsg = getServerErrorMessage(error, "Search");
    if (errorMsg.isServerError) {
      toast.error(errorMsg.title, { description: errorMsg.message });
    }
  } finally {
    setLoading(false);
  }
};
```

## Support

For questions or issues with error handling, refer to:

- `src/lib/errorHandler.ts` - Core error handling logic
- `src/hooks/useServerErrorHandler.ts` - React hook implementation
- This guide for usage examples
