# Lazy Loading Quick Reference

## Quick Copy-Paste Solutions

### 1. Lazy Load a Modal Component

```tsx
import dynamic from "next/dynamic";

const MyModal = dynamic(() => import("./MyModal"), {
  loading: () => <div className="animate-pulse">Loading...</div>,
});

// Usage:
export default function Page() {
  const [open, setOpen] = useState(false);
  return <>{open && <MyModal onClose={() => setOpen(false)} />}</>;
}
```

### 2. Lazy Load an Image

```tsx
<Image
  src={imageUrl}
  alt="Description"
  loading="lazy"
  width={300}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/webp;base64,UklGRiYAAABXRUJQVlA4IBIAAAAwAQCdASoBAAEAAkA4JaACdLoA/gAA"
/>
```

### 3. Detect When Element is in View

```tsx
import { useInView } from "@/hooks/useLazyLoading";

export function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useInView(ref);

  return <div ref={ref}>{isVisible && <HeavyComponent />}</div>;
}
```

### 4. Lazy Load Multiple Images

```tsx
import { useLazyImages } from "@/hooks/useLazyLoading";

export function ImageGallery({ imageUrls }: { imageUrls: string[] }) {
  const { registerImage, isLoaded } = useLazyImages(imageUrls);

  return (
    <div className="grid">
      {imageUrls.map((url) => (
        <Image
          key={url}
          ref={(el) => el && registerImage(url, el)}
          src={isLoaded(url) ? url : "/placeholder.png"}
          alt="Gallery item"
          loading="lazy"
        />
      ))}
    </div>
  );
}
```

### 5. Load Section When User Scrolls To It

```tsx
import { useInView } from "@/hooks/useLazyLoading";

export function LateSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView && !data) {
      // Fetch data only when section comes into view
      fetchData().then(setData);
    }
  }, [isInView]);

  return <div ref={ref}>{data && <DataDisplay data={data} />}</div>;
}
```

### 6. Dynamic Page Component

```tsx
import dynamic from "next/dynamic";

const ProductList = dynamic(() => import("./ProductList"), {
  loading: () => <ProductListSkeleton />,
  ssr: true, // Set to false for client-only components
});

export default function MarketplacePage() {
  return <ProductList />;
}
```

## Common Pages to Update

| Page               | Priority | Component to Lazy Load        | Expected Gain |
| ------------------ | -------- | ----------------------------- | ------------- |
| marketplace        | HIGH     | QuickViewModal, ProductGrid   | 40% faster    |
| products/[id]      | HIGH     | SimilarProducts, Reviews      | 35% faster    |
| search-results     | HIGH     | Map, ProductGrid, Suggestions | 50% faster    |
| storefront-details | MEDIUM   | Catalogs, Modals              | 30% faster    |
| user-profile       | MEDIUM   | MyListings grid               | 25% faster    |
| admin dashboard    | LOW      | Analytics, Charts             | 20% faster    |

## Environment Detection

```tsx
import { isSlowConnection } from "@/utils/lazyLoadingConfig";

export function OptimizedImage({ src }: { src: string }) {
  const slow = isSlowConnection();

  return (
    <Image
      src={src}
      alt="Optimized"
      quality={slow ? 50 : 75} // Lower quality on slow networks
      loading={slow ? "lazy" : "eager"} // More aggressive lazy loading
    />
  );
}
```

## Loading States

```tsx
import { createLoadingSkeleton } from "@/utils/lazyLoadingConfig";

// In your dynamic component
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => createLoadingSkeleton("card"), // or 'grid', 'modal', 'image'
});
```

## Accessibility Considerations

```tsx
// Always include alt text
<Image src={url} alt="Descriptive text" loading="lazy" />

// Loading state for screen readers
<div role="status" aria-live="polite">
  {isLoading && <p>Loading content...</p>}
</div>

// Skip lazy loading for critical images
<Image
  src={criticalImage}
  alt="Hero image"
  priority // High-priority images should NOT be lazy loaded
/>
```

## Performance Monitoring

```tsx
// Add to your component
useEffect(() => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log("Performance:", entry);
    }
  });

  observer.observe({ entryTypes: ["largest-contentful-paint"] });

  return () => observer.disconnect();
}, []);
```

## Debugging

### Check if Images Are Lazy Loaded

```tsx
// In DevTools Console
document.querySelectorAll('img[loading="lazy"]').length;
```

### Monitor Network Requests

```tsx
// DevTools → Network tab
// Filter by "Img" to see image loading
// Images should load on scroll, not on page load
```

### Check Bundle Size

```bash
npm run build
# Look for .next/static/chunks/
# Route-specific bundles should be under 200KB each
```

## Common Issues & Solutions

### Issue: Images not loading on slow networks

**Solution:** Check `isSlowConnection()` and adjust quality

```tsx
const quality = isSlowConnection() ? 40 : 75;
```

### Issue: Flickering when image loads

**Solution:** Use `placeholder="blur"` with blurDataURL

```tsx
<Image src={url} placeholder="blur" blurDataURL={blurredVersion} />
```

### Issue: Layout shift when lazy loading

**Solution:** Set fixed width/height

```tsx
<Image src={url} width={300} height={300} />
```

### Issue: Modal not opening immediately

**Solution:** Preload critical modals

```tsx
// Load modal on user hover instead of click
onMouseEnter={() => preloadComponent('Modal')}
```

## Best Practices Checklist

- ✅ Add `loading="lazy"` to all non-critical images
- ✅ Use `priority` for above-the-fold images only
- ✅ Add `placeholder="blur"` for better UX
- ✅ Include `sizes` attribute for responsive images
- ✅ Lazy load modals and below-the-fold components
- ✅ Test on slow 3G network
- ✅ Monitor Core Web Vitals
- ✅ Provide loading states/skeletons
- ✅ Don't lazy load critical hero images
- ✅ Use appropriate rootMargin in Intersection Observer

## Quick Test

Add this to your page to verify lazy loading works:

```tsx
useEffect(() => {
  console.log(
    "Images with lazy loading:",
    document.querySelectorAll('img[loading="lazy"]').length
  );
}, []);
```

---

**Need more help?** Check `LAZY_LOADING_IMPLEMENTATION.md` for detailed guide
