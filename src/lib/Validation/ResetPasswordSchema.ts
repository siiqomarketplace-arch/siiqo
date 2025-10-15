import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
