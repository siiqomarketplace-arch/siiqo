export interface Review {
  id: number;
  reviewername: string;
  revieweremail: string;
  feedback: string;
  rating: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  images?: string[];
  rating: number;
}

export interface VendorInfo {
  name: string;
  address: string;
  phone_number: string;
  banner?: string;
  is_verified: string;
  average_rating: number;
  open_hours?: string;
  profile_pic?: string | null;
  reviews?: Review[];
}
