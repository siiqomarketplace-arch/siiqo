export interface AdminStats {
  products: {
    active: number;
    inactive_or_hidden: number;
    total: number;
  };
  storefronts: number;
  users: {
    buyers: number;
    total_accounts: number;
    vendors: number;
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  account_type: string;
  referral_code: string;
  referred_by: string | null;
  business_name?: string;
  business_type?: string;
  kyc_status?: string;
}

export interface Vendor {
  business_name: string;
  email: string;
  firstname: string;
  id: number;
  lastname: string;
  phone: string;
  profile_pic: string | null;
}

export interface Storefront {
  id: number;
  business_name: string;
  description: string;
  established_at: string;
  ratings: number;
  business_banner: string | null;
  vendor: Vendor | null;
}

export interface StorefrontResponse {
  count: number;
  storefronts: Storefront[];
}

export interface UserDetails extends User {
  created_at: string;
  last_login?: string;
  total_orders?: number;
  total_spent?: number;
  total_products?: number;
  total_sales?: number;
  status: string;
}