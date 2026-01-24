export interface UserData {
  id?: string | number;
  account_id?: string;
  fullname?: string;
  role?: string; // 'shopper', 'vendor', or 'admin'

  name?: string;
  email: string;
  active_view?: string;
  target_view: string; // 'shopper', 'vendor', or 'admin'
  phone?: string;
  business_name?: string;
  business_type?: string;
  country?: string;
  state?: string;
  kyc_status?: string; // 'pending', 'verified', 'rejected'
  profile_pic?: string | null;
  referral_code?: string;
  referred_by?: string | null;
  address?: string;
  description?: string;
  zip?: string;
  created_at?: string;
  bio?: string;
  is_verified?: boolean;
  auth_provider?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: UserData;
  message?: string;
}

export interface SignupResponse {
  message: string;
  status: string;
  user?: UserData;
  error?: string;
  errors?: string[];
}

export interface AuthContextType {
  isLoggedIn: boolean;
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  refreshUserProfile?: () => Promise<void>;
  // Note: You might want to add a register function here too
  register?: (userData: any) => Promise<void>;
}
