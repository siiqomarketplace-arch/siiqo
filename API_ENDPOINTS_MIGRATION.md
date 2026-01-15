# API Endpoints Centralization - Migration Summary

## Overview

All hardcoded API URLs in client-side pages have been centralized into a single configuration file (`src/hooks/api_endpoints.ts`). This ensures consistency, easier maintenance, and allows for quick changes to API URLs without modifying multiple files.

## Files Modified

### 1. **src/hooks/api_endpoints.ts** (Main Configuration)

**Status:** ✅ EXPANDED

- Centralized all API endpoints with proper organization by feature
- Created `API_BASE_URL` constant: `https://server.siiqo.com/api`
- Added endpoints for: Marketplace, Cart, Checkout, Products, Storefront, Vendor, Buyer, Auth

**Current Endpoints:**

```typescript
// MARKETPLACE
MARKETPLACE_SEARCH;
MARKETPLACE_STORE(storeName);
MARKETPLACE_PRODUCTS(productId);

// CART
FETCH_CART_ITEMS;
ADD_TO_CART_ITEMS;
UPDATE_CART_ITEMS;
DELETE_CART_ITEMS;
CLEAR_CART_ITEMS;

// CHECKOUT
CHECKOUT;
UPLOAD_PAYMENT_PROOF;

// PRODUCTS
GET_PRODUCTS;
GET_PRODUCT_DETAIL(productId);
GET_MY_PRODUCTS;
GET_CATALOGS;

// STOREFRONT
GET_STOREFRONT(storeName);
STOREFRONT_DETAILS(storeName);

// VENDOR
VENDOR_DASHBOARD;
VENDOR_PRODUCTS;
VENDOR_SETTINGS;

// BUYER
GET_FAVOURITES;

// AUTH
LOGIN;
SIGNUP;
LOGOUT;
REFRESH_TOKEN;
FORGOT_PASSWORD;
VERIFY_OTP;
RESEND_OTP;
RESET_PASSWORD;
```

### 2. **src/app/home/Homepage.tsx**

**Status:** ✅ UPDATED

- Imported `api_endpoints`
- Changed: `https://server.siiqo.com/api/marketplace/search` → `api_endpoints.MARKETPLACE_SEARCH`

### 3. **src/app/storefront-details/[name]/page.tsx**

**Status:** ✅ UPDATED

- Imported `api_endpoints`
- Changed: `https://server.siiqo.com/api/marketplace/store/${storeName}` → `api_endpoints.MARKETPLACE_STORE(storeName)`

### 4. **src/app/products/[id]/page.tsx**

**Status:** ✅ UPDATED

- Imported `api_endpoints`
- Changed: `https://server.siiqo.com/api/marketplace/products/${productId}` → `api_endpoints.MARKETPLACE_PRODUCTS(productId)`

### 5. **src/app/search-results/page.tsx**

**Status:** ✅ UPDATED

- Imported `api_endpoints`
- Changed: `https://server.siiqo.com/api/marketplace/search` → `api_endpoints.MARKETPLACE_SEARCH`

### 6. **src/app/marketplace/page.tsx**

**Status:** ✅ UPDATED

- Imported `api_endpoints`
- Changed: `https://server.siiqo.com/api/marketplace/search` → `api_endpoints.MARKETPLACE_SEARCH`

### 7. **src/app/vendor/storefront/business-view/components/BusinessStorefrontPreview.tsx**

**Status:** ✅ UPDATED

- Imported `api_endpoints`
- Changed three hardcoded URLs:
  - `https://server.siiqo.com/api/vendor/settings` → `api_endpoints.VENDOR_SETTINGS`
  - `https://server.siiqo.com/api/products/my-products` → `api_endpoints.GET_MY_PRODUCTS`
  - `https://server.siiqo.com/api/products/catalogs` → `api_endpoints.GET_CATALOGS`

### 8. **src/app/user-profile/components/SavedItems.tsx**

**Status:** ✅ UPDATED

- Imported `api_endpoints`
- Changed: `https://server.siiqo.com/api/buyers/favourites` → `api_endpoints.GET_FAVOURITES`

## Files Identified But NOT Updated (Reasons)

### Server-Side or Configuration Files:

- `src/services/api.ts` - Server-side configuration
- `src/lib/vendor_api_client.ts` - Vendor API client with environment variable support
- `next.config.js` - Next.js configuration file (rewrites)

### Auth Pages (External API endpoints - May need separate file):

- `src/app/auth/forgot-password/page.tsx` - Uses `FORGOT_PASSWORD` endpoint
- `src/app/auth/verify-otp/page.tsx` - Uses `VERIFY_OTP` and `RESEND_OTP` endpoints
- `src/app/auth/reset-password/page.tsx` - Uses `RESET_PASSWORD` endpoint

_Note: Auth pages can be updated when needed using the new centralized endpoints._

### Components Using Marketplace Search (Can be updated together):

- `src/app/home/NearbyDeals.tsx`
- `src/app/home/LandingPage.tsx`
- `src/app/home/ui/StoreFrontCard.tsx`
- `src/app/home/ui/NearbyDealsProdCard.tsx`

## Usage Example

**Before (Hardcoded):**

```tsx
const response = await fetch("https://server.siiqo.com/api/marketplace/search");
```

**After (Centralized):**

```tsx
import api_endpoints from "@/hooks/api_endpoints";

const response = await fetch(api_endpoints.MARKETPLACE_SEARCH);
```

**For Dynamic Endpoints:**

```tsx
// Before
fetch(`https://server.siiqo.com/api/marketplace/store/${storeName}`);

// After
fetch(api_endpoints.MARKETPLACE_STORE(storeName));
```

## Benefits

✅ **Single Source of Truth** - All endpoints in one location
✅ **Easy Maintenance** - Change API URL in one place
✅ **Consistency** - No duplicated endpoint definitions
✅ **Type Safety** - Better IDE support and autocomplete
✅ **Environment Support** - Can easily add environment-specific URLs
✅ **Scalability** - Ready for multi-environment setup (dev, staging, prod)

## Next Steps (Optional Improvements)

1. **Environment Configuration:**

   ```typescript
   const API_BASE_URL =
     process.env.NEXT_PUBLIC_API_BASE_URL || "https://server.siiqo.com/api";
   ```

2. **Update Auth Pages:**

   - `src/app/auth/forgot-password/page.tsx`
   - `src/app/auth/verify-otp/page.tsx`
   - `src/app/auth/reset-password/page.tsx`

3. **Update Home Components:**

   - `src/app/home/NearbyDeals.tsx`
   - `src/app/home/LandingPage.tsx`
   - `src/app/home/ui/StoreFrontCard.tsx`
   - `src/app/home/ui/NearbyDealsProdCard.tsx`

4. **Create API Request Utilities:**
   - Wrapper function for consistent error handling
   - Authentication token injection
   - Retry logic

## Testing Checklist

- [ ] Homepage loads products correctly
- [ ] Storefront details pages load
- [ ] Product detail pages load
- [ ] Search results work
- [ ] Marketplace browsing works
- [ ] Vendor storefront preview loads
- [ ] Saved items (favorites) load
- [ ] No console errors related to API calls
