//types/auth.ts
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

// --- DUMMY DATA FOR TESTING ---
export const MOCK_USER: UserData = {
  id: "999",
  account_id: "ACC-TEST-001",
  name: "Test User",
  email: "test@bizengo.com",
  role: "shopper",
  phone: "08012345678",
  country: "Nigeria",
  state: "Lagos",
  is_verified: false,
  created_at: new Date().toISOString()
};

export const DUMMY_SIGNUP_SUCCESS: SignupResponse = {
  status: "success",
  message: "Account created successfully. Mock OTP sent to your email.",
  user: MOCK_USER
};

export const DUMMY_SIGNUP_ERROR: SignupResponse = {
  status: "error",
  message: "This email is already registered.",
  error: "Conflict"
};