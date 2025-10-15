import { z } from "zod";

export const signupSchema = z
    .object({
        fullname: z.string().min(2, "Full name is required"),
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Please confirm your password"),
        phone_number: z
            .string()
            .regex(/^\+\d{10,15}$/, "Phone number must include country code (e.g. +234...)"),
        address: z.object({
            country: z.string().nonempty("Country is required"),
            state: z.string().nonempty("State is required"),
            // street: z.string().nonempty("Street is required"),
        }),
        referral_code: z.string().optional(),
        userType: z.enum(["buyer", "vendor"]),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SignupFormData = z.infer<typeof signupSchema>;
