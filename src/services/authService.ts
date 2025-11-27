import api from "@/lib/api_client";
import { LoginResponse } from "@/types/auth";

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  signup: async (userData: any) => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await api.post("/auth/request-password-reset", { email });
    return response.data;
  },

  resetPassword: async (passwordData: any) => {
    const response = await api.post("/auth/reset-password", passwordData);
    return response.data;
  },

  forgotPassword: (email: string): Promise<void> => {
    return api.post("/auth/request-password-reset", { email });
  },

  resendVerificationOtp: async (email: string) => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  },

  verifyEmail: (email: string, otp: string): Promise<any> => {
    return api.post("/auth/verify-email", { email, otp });
  },

  resendOtp: (email: string): Promise<any> => {
    return api.post("/auth/resend-verification", { email });
  },
};
