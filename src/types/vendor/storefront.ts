export interface ApiStorefrontResponse {
  storefront: { 
    business_name: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    state: string;
    country: string;
    is_published: boolean;
    published_at: string | null;
    template_options: { 
      theme: string;
      font: string;
    };
    extended?: { 
      hour?: string[];
      phone?: string;
    };
  };
  products: { 
    images: string[];
  }[];
}

export interface StorefrontContact {
  email: string;
  phone: string;
  address: string;
  website: string;
}

export interface StorefrontData {
  businessName: string;
  description: string;
  contact: StorefrontContact;
  slug: string;
  gallery: string[];
  bannerImage: string;
  logo?: string;
  bannerFile?: File | null;
  logoFile?: File | null;
  isPublished: boolean;
  showCallButton?: boolean;
  teamSize?: string;
  businessHours?: string;
  established?: string;
  about?: string;
  products?: any[];
  publishedAt: string | null;
  views: number;
  clicks: number;
  orders: number;
  lastUpdated: string;
  template_options: {
    theme: string;
    font: string;
  };
  extended?: { 
    hour?: string[];
    phone?: string;
  };
}

export interface VendorData {
  businessName?: string;
  [key: string]: any;
}