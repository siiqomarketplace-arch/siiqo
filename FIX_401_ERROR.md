# 🔧 Fix for 401 Unauthorized Error on Product Categories

## Problem

The marketplace filter panel was getting a **401 Unauthorized** error when trying to fetch product categories:

```
GET /_next/image?url=... 400 (Bad Request)
Request failed with status code 401 at productService.ts:68
```

## Root Cause

The endpoint `/products/categories` is a **public endpoint** that doesn't require authentication, but your `api_client.ts` was adding the `Authorization` header to ALL requests automatically. When the user wasn't logged in, no token existed, and the backend was rejecting the request with 401.

## Solution Implemented

### 1. **Created a Public API Client** (`src/lib/public_api_client.ts`)

- For unauthenticated requests to public endpoints
- No Authorization header is added
- Used for endpoints that don't require authentication

### 2. **Updated productService.ts**

- Changed `getCategories()` to use `publicApi` instead of `api`
- Added error handling to gracefully handle failures
- Other public endpoints can also be moved to use this client

### 3. **Improved Error Handling in FilterPanel**

- Added try/catch/finally blocks
- UI won't break if categories fail to load
- Shows empty categories list as fallback

## Which Endpoints Should Use Public API Client?

| Endpoint                | Auth Required? | Client to Use  |
| ----------------------- | -------------- | -------------- |
| `/products/categories`  | ❌ No          | `publicApi` ✅ |
| `/products/catalogs`    | ❌ No          | `publicApi` ✅ |
| `/marketplace/catalogs` | ❌ No          | `publicApi` ✅ |
| `/products` (list)      | ❌ No          | `publicApi` ✅ |
| `/user/profile`         | ✅ Yes         | `api` ✅       |
| `/products/create`      | ✅ Yes         | `api` ✅       |
| `/auth/login`           | ❌ No          | `publicApi` ✅ |

## How to Apply This Pattern

**For any public endpoint that's currently failing with 401:**

```typescript
// OLD (causes 401 for unauthenticated users)
getCategories: async () => {
  const response = await api.get("/products/categories");
  return response.data;
},

// NEW (works without authentication)
getCategories: async () => {
  const response = await publicApi.get("/products/categories");
  return response.data;
},
```

## Testing

1. Clear your browser cache and sessionStorage
2. Restart the dev server: `npm run dev`
3. Go to the marketplace page without logging in
4. The categories filter should now load without errors

## Additional Notes

- The `api_client.ts` still automatically adds tokens for authenticated requests
- The `public_api_client.ts` intentionally omits the Authorization header
- This approach is a best practice for separating public and private API calls

---

**Status:** ✅ Fixed  
**Files Modified:** `productService.ts`, `FilterPanel.tsx`  
**Files Created:** `public_api_client.ts`
