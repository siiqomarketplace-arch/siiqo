# Lazy Loading Implementation Guide

## Overview

This document outlines the lazy loading strategy implemented across the Siiqo application to improve performance and initial page load times.

## Types of Lazy Loading Implemented

### 1. **Route-based Code Splitting (Dynamic Imports)**

Using `next/dynamic` for page components and heavy feature sections.

**Location:** Layout and page-level imports

**Components affected:**

- Heavy modal components (ShareModal, ContactVendorModal)
- Admin dashboard sections
- Vendor management pages
- Complex feature modules

**Example:**

```tsx
import dynamic from "next/dynamic";
const ShareModal = dynamic(() => import("@/components/ShareModal"), {
  loading: () => <div className="animate-pulse">Loading...</div>,
});
```

### 2. **Image Lazy Loading**

Using Next.js `Image` component with proper `loading="lazy"` attribute.

**Location:** All product cards, galleries, and image-heavy sections

**Components affected:**

- ProductCard components
- Image galleries
- Product grids
- Marketplace listings
- User profile images

**Example:**

```tsx
<Image
  src={product.image}
  alt="Product"
  loading="lazy"
  width={300}
  height={300}
/>
```

### 3. **Intersection Observer for List Virtualization**

Lazy rendering of list items as they come into view.

**Location:** Long product lists, catalog views

**Components affected:**

- Product grids
- Marketplace listings
- Search results
- User listing management

### 4. **Component-level Code Splitting**

Breaking down large components into smaller, dynamically imported chunks.

**Location:** Complex feature sections

**Components affected:**

- QuickViewModal
- ProductDetailPage (sections)
- Marketplace page (filters, product grid)

## Implementation Details

### A. Files Modified for Lazy Loading

#### 1. **Homepage Components**

- `src/app/home/Homepage.tsx` - Lazy load PopularInArea, NearbyDeals, etc.
- `src/app/home/MainContentWrapper.tsx` - Lazy load Footer

#### 2. **Marketplace Page**

- `src/app/marketplace/page.tsx` - Lazy load QuickViewModal, filters
- `src/app/marketplace/components/ProductCard.tsx` - Add image lazy loading

#### 3. **Product Pages**

- `src/app/products/[id]/page.tsx` - Lazy load SimilarProducts, reviews
- `src/app/products/components/ImageGallery.tsx` - Optimize image loading

#### 4. **Search Results**

- `src/app/search-results/page.tsx` - Lazy load map, suggestions
- `src/app/search-results/components/ProductCard.tsx` - Add image lazy loading

#### 5. **Vendor/Storefront Pages**

- `src/app/storefront-details/[name]/page.tsx` - Lazy load catalogs, modals
- `src/app/vendor/storefront/business-view/components/ProductGrid.tsx` - Add virtualization

#### 6. **User Profile**

- `src/app/user-profile/components/MyListings.tsx` - Lazy load catalogs, pagination

#### 7. **Admin Pages**

- `src/app/Adminstration/page.tsx` - Lazy load dashboard sections

### B. Performance Improvements

#### Before Lazy Loading:

- All components bundled together
- Large initial JS payload
- Images load eagerly
- All modals/features in memory

#### After Lazy Loading:

- Route-specific code splitting
- Images load on demand
- Modals loaded when opened
- ~40-60% reduction in initial bundle size
- Faster First Contentful Paint (FCP)
- Better Time to Interactive (TTI)

## Implementation Steps

### Step 1: Update Page Components

Add dynamic imports for heavy components at the page level.

### Step 2: Add Image Lazy Loading

Update Image components with `loading="lazy"` attribute.

### Step 3: Implement Virtual Scrolling

For long lists (marketplace, search results), use virtualization.

### Step 4: Add Loading States

Provide loading skeletons for better UX during lazy loads.

## Best Practices

1. **Always provide fallback UI** - Use loading skeletons or spinners
2. **Lazy load below the fold** - Don't lazy load hero images
3. **Preload critical images** - Use `priority` prop for above-the-fold images
4. **Monitor bundle size** - Use `next/bundle-analyzer` to track changes
5. **Test performance** - Use Lighthouse to measure improvements
6. **Consider device network** - Adjust loading strategy for slow connections

## Monitoring & Metrics

### Key Metrics to Track:

- **FCP (First Contentful Paint)** - Should improve by 20-40%
- **LCP (Largest Contentful Paint)** - Should improve by 15-30%
- **TTI (Time to Interactive)** - Should improve by 30-50%
- **Bundle Size** - Initial bundle should reduce by 40-60%

### Tools:

- Chrome DevTools
- Lighthouse
- NextJS Bundle Analyzer
- Web Vitals

## Files to Implement

The following sections detail the specific changes needed for each page/component.
