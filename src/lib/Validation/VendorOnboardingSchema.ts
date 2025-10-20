import { z } from "zod";

export const vendorOnboardingSchema = z.object({
    // Store Information
    store_name: z
        .string()
        .min(3, "Store name must be at least 3 characters long")
        .max(100, "Store name is too long"),

    store_description: z
        .string()
        .min(10, "Please describe your store in at least 10 characters")
        .max(500, "Description too long"),

    business_category: z
        .string()
        .min(1, "Please select your business category"),

    business_type: z
        .string()
        .min(1, "Please select your business type"),

    // Location
    address: z
        .string()
        .min(3, "Address is required"),

    country: z
        .string()
        .min(1, "Country is required"),

    state: z
        .string()
        .min(1, "State/Region is required"),

    // Business Details (Optional)
    cac_registration_number: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.length > 0,
            "CAC Registration Number is invalid"
        ),

    business_id: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.length > 0,
            "Business ID is invalid"
        ),

    website: z
        .string()
        .url("Enter a valid website URL")
        .optional()
        .or(z.literal("")),

    // Branding
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
