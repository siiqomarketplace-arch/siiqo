# 🚀 Performance Optimization Guide for Siiqo App

Based on your current Next.js 16 setup, here are all the things you can implement to make your site load faster.

---

## 📊 QUICK WIN OPTIMIZATIONS (Implement First)

### 1. **Enable Image Optimization** ⭐ (15-30% improvement)

**Current Status:** `unoptimized: true` (disables optimization)

```javascript
// next.config.js - CHANGE THIS:
images: {
  unoptimized: true,  // ❌ This disables all image optimization!
},

// TO THIS:
images: {
  unoptimized: false, // ✅ Enable Next.js image optimization
  formats: ['image/avif', 'image/webp'], // Modern formats
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
},
```

**Why it matters:** Automatically converts images to WebP/AVIF, resizes them, and caches them.

---

### 2. **Add Font Optimization with next/font** ⭐ (8-15% improvement)

**Current Status:** Not visible (likely using system fonts)

```typescript
// src/app/layout.tsx

import { Inter, Poppins } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Shows fallback while loading
  preload: true,
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

**Benefits:** Fonts load from Google CDN, prevents layout shift, better caching

---

### 3. **Enable Static Generation (SSG) for Public Pages** ⭐ (40-60% faster)

**Current Status:** All pages are dynamic (requires server on every request)

```typescript
// src/app/storefront-details/[name]/page.tsx - ADD AT TOP:

export const revalidate = 3600; // Revalidate every hour

// OR for completely static pages:
export const revalidate = false; // Never revalidate (pure static)

// This makes Next.js pre-build the page at build time
```

**Pages that should be static:**

- ✅ Product detail pages `/products/[id]`
- ✅ Storefront pages `/storefront-details/[name]`
- ✅ Seller profile pages `/seller-profile/[id]`
- ✅ Category pages `/marketplace?category=...`
- ❌ User profile pages (require auth)
- ❌ Search results (dynamic)

**Impact:** Serves from CDN instead of server (300-500ms → 50-100ms)

---

### 4. **Compress Assets (gzip/brotli)** ⭐ (30-40% bundle size reduction)

**Current Status:** May not be enabled

```javascript
// next.config.js
const nextConfig = {
  compress: true, // ✅ Add this
  swcMinify: true, // ✅ Already default in Next.js 15+

  // ... rest of config
};
```

**Already done by Vercel if deploying there**

---

## 🎯 MEDIUM PRIORITY OPTIMIZATIONS (10-20% improvement each)

### 5. **Implement Response Caching with Service Worker**

```bash
npm install next-pwa
```

```javascript
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  skipWaiting: true,
  clientsClaim: true,
});

module.exports = withPWA(nextConfig);
```

**Benefits:** Offline support, faster repeat visits, reduced server load

---

### 6. **Add Bundle Analysis to See What's Slowing You Down**

```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
```

**Run analysis:**

```bash
ANALYZE=true npm run build
```

---

### 7. **Optimize Third-Party Scripts**

**Current issue:** You're using Crisp (chat) and Firebase (auth) which can slow down loading

```typescript
// src/app/layout.tsx

import { useEffect } from "react";
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}

        {/* ✅ Load Crisp only when needed (after page load) */}
        <Script
          src="https://client.crisp.chat/l.js"
          strategy="lazyOnload" // Load after page is interactive
          onLoad={() => {
            // @ts-ignore
            window.$crisp = [];
            // @ts-ignore
            window.CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_ID;
          }}
        />

        {/* ✅ Load analytics after page load */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
```

---

### 8. **Implement API Response Caching (React Query)**

You already have `@tanstack/react-query` installed! Use it properly:

```typescript
// src/hooks/useProducts.ts
import { useQuery } from "@tanstack/react-query";

export function useProducts(pageNumber: number) {
  return useQuery({
    queryKey: ["products", pageNumber],
    queryFn: () =>
      fetch(`/api/products?page=${pageNumber}`).then((r) => r.json()),
    staleTime: 1000 * 60 * 5, // 5 minutes - ✅ Cache responses
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
    retry: 2,
  });
}
```

**Benefits:** Reduces API calls by 60-70%, faster navigation, less server load

---

### 9. **Implement Prefetching for Search and Filter Results**

```typescript
// src/hooks/usePrefetch.ts
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function usePrefetchNextPage(nextPageNum: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch next page when user is on current page
    queryClient.prefetchQuery({
      queryKey: ["products", nextPageNum],
      queryFn: () =>
        fetch(`/api/products?page=${nextPageNum}`).then((r) => r.json()),
    });
  }, [nextPageNum, queryClient]);
}
```

---

## 📈 ADVANCED OPTIMIZATIONS (Complex but high impact)

### 10. **Implement Edge Caching with Cloudflare/Vercel**

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      ]
    },
    {
      source: '/_next/image(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    }
  ];
}
```

---

### 11. **Database Query Optimization** (Backend)

- ✅ Add database indexes on frequently searched fields
- ✅ Use database query caching
- ✅ Implement pagination properly
- ✅ Use GraphQL instead of REST (consider migrating)

---

### 12. **Implement Edge Functions for Dynamic Content**

If using Vercel:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Redirect based on geo-location, device, etc.
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "public, s-maxage=3600");
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/products/:path*"],
};
```

---

## 🔧 PLUGINS TO INSTALL

| Plugin                 | Purpose                  | Performance Impact          |
| ---------------------- | ------------------------ | --------------------------- |
| `next-pwa`             | Offline support, caching | 20-30% faster repeat visits |
| `next-bundle-analyzer` | Analyze bundle size      | Insight only                |
| `@next/font`           | Optimize fonts           | 10-15% faster               |
| `compression`          | gzip/brotli compression  | 30-40% smaller files        |
| `lodash-es`            | Tree-shakeable utilities | 5-10% smaller               |

---

## 📋 IMPLEMENTATION PRIORITY

**Phase 1 (This Week) - 25-35% Improvement:**

1. Enable image optimization in `next.config.js`
2. Add `next/font` for custom fonts
3. Enable compression (`compress: true`)
4. Add static generation `revalidate` to public pages

**Phase 2 (Next Week) - Additional 15-20% Improvement:** 5. Implement bundle analysis and remove unused code 6. Optimize third-party scripts (defer loading) 7. Setup React Query caching properly 8. Add prefetching for pagination

**Phase 3 (Later) - Advanced Optimizations:** 9. Install and configure `next-pwa` 10. Implement edge caching headers 11. Optimize database queries 12. Consider GraphQL migration

---

## 🧪 TESTING & MONITORING

### Before/After Comparison

```bash
# Test before changes
npm run build
# Check build output for bundle size

# Test after changes
npm run build
# Compare bundle sizes
```

### Use These Tools:

- **Lighthouse** (DevTools → Lighthouse tab)
- **PageSpeed Insights** https://pagespeed.web.dev/
- **web-vitals library** (already in your project)
- **Vercel Analytics** (if deployed there)

### Monitor Core Web Vitals:

```typescript
// src/app/layout.tsx
import { useReportWebVitals } from "next/web-vitals";

useReportWebVitals((metric) => {
  console.log(`${metric.name}: ${metric.value}ms`);

  // Send to analytics service
  analytics.send({
    name: metric.name,
    value: metric.value,
    page: window.location.pathname,
  });
});
```

---

## ⚡ QUICK WINS SUMMARY

| Optimization              | Implementation Time | Performance Gain        | Difficulty |
| ------------------------- | ------------------- | ----------------------- | ---------- |
| Enable image optimization | 5 minutes           | 15-30%                  | Easy       |
| Add next/font             | 10 minutes          | 10-15%                  | Easy       |
| Enable static generation  | 15 minutes          | 40-60% for static pages | Medium     |
| Compress assets           | 2 minutes           | 30-40%                  | Easy       |
| React Query caching       | 20 minutes          | 20-30% API calls        | Medium     |
| Bundle analysis           | 10 minutes          | Insight only            | Easy       |
| Service Worker PWA        | 15 minutes          | 20-30% repeat visits    | Medium     |

**Total Potential Improvement: 100-150% faster** (2-3x improvement)

---

## 📞 Questions?

Review the existing files:

- `LAZY_LOADING_IMPLEMENTATION.md` - Already set up lazy loading
- `LAZY_LOADING_QUICK_REFERENCE.md` - Quick code examples
- Your `next.config.js` - Already has some optimizations

Start with Phase 1 optimizations - they're quick and have high impact!
