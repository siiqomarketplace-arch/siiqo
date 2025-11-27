export interface UserProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  joinDate: string;
  isVerified: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  stats: {
    itemsListed: number;
    purchasesMade: number;
    sellerRating: number;
    totalReviews: number;
  };
  bio: string;
}
export interface VendorData {
  business_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  isVerified?: boolean;
  phone?: string;
  created_at?: string;
  address?: string;
  bio?: string;
  profile_pic?: string;
  kyc_status?: string;
  state?: string;
  country?: string;
}

export interface SettingsState {
  location: {
    homeAddress: string;
    searchRadius: number;
    autoLocation: boolean;
    showExactLocation: boolean;
  };
  notifications: {
    newMessages: boolean;
    priceDrops: boolean;
    newListings: boolean;
    orderUpdates: boolean;
    marketingEmails: boolean;
    pushNotifications: boolean;
  };
  privacy: {
    profileVisibility: "public" | "buyers" | "private";
    showOnlineStatus: boolean;
    allowContactFromBuyers: boolean;
    showRatingsPublicly: boolean;
  };
  account: {
    twoFactorAuth: boolean;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    test?: any;
  };
}
