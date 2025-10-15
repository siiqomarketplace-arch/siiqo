import { z } from "zod";

export const vendorOnboardingSchema = z.object({
    store_name: z
        .string()
        .min(3, "Store name must be at least 3 characters long")
        .max(100, "Store name is too long"),

    store_description: z
        .string()
        .min(10, "Please describe your store in at least 10 characters")
        .max(500, "Description too long"),

    address: z.string().min(3, "Address is required"),

    business_category: z
        .string()
        .min(2, "Please select or enter your business category"),

    logo_url: z
        .string()
        .url("Enter a valid logo URL")
        .min(1, "Logo URL is required"),

    banner_url: z
        .string()
        .url("Enter a valid banner URL")
        .min(1, "Banner URL is required"),
});

export type VendorOnboardingData = z.infer<typeof vendorOnboardingSchema>;
