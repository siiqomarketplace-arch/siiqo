export interface UserData {
  id?: string | number;
  account_id?: string;
  name?: string;
  email: string;
  role: string;
  phone?: string;
  business_name?: string;
  business_type?: string;
  country?: string;
  state?: string;
  kyc_status?: string;
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
  user: UserData;
  message?: string;
}

export interface AuthContextType {
  isLoggedIn: boolean;
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface SignupResponse {
    message: string;
    status: string;
    user?: UserData;
    error?: string;
    errors?: string[];
}