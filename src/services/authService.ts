import api from "@/lib/api_client";
import { LoginResponse } from "@/types/auth";

export const authService = {
  // Login remains the same structure
  login: async (data: {
    email: string;
    password: string;
    remember?: boolean;
  }): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  // Updated path from /auth/signup to /auth/register
  signup: async (userData: any) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );
    return response.data;
  },

  // Updated path to /auth/forgot-password
  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Standardized Reset Password
  resetPassword: async (passwordData: any) => {
    const response = await api.post("/auth/reset-password", passwordData);
    return response.data;
  },

  // Updated to match /auth/verify-email
  verifyEmail: async (email: string, otp: string) => {
    const response = await api.post("/auth/verify-email", { email, otp });
    return response.data;
  },

  // Updated to match /auth/verify-reset-otp or /auth/resend-verification
  resendOtp: async (email: string) => {
    const response = await api.post("/auth/verify-reset-otp", { email });
    return response.data;
  },

  // Added a specific method for resending email verification
  resendVerificationOtp: async (email: string) => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  },
};
