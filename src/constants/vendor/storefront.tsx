import { StorefrontData } from "@/types/vendor/storefront";

export const mockStorefrontData: StorefrontData = {
  businessName: "Bella Vista Restaurant",
  slug: "bella-vista-restaurant",
  description:
    "Authentic Italian cuisine in the heart of downtown. Family-owned restaurant serving traditional recipes.",
  bannerImage:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop",
  template_options: {
    theme: "light",
    font: "Arial",
  },
  contact: {
    phone: "+1 (555) 123-4567",
    email: "hello@bellavista.com",
    address: "123 Main Street, Downtown, NY 10001",
    website: "https://bellavista-restaurant.com",
  },



  gallery: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400",
  ],
  isPublished: true,
  publishedAt: "2024-01-10T00:00:00Z",
  lastUpdated: "2024-01-15T12:30:00Z",
  views: 1247,
  clicks: 89,
  orders: 23,
};
