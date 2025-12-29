// types/storeFront.ts
export interface Vendor {
    business_name: string;
    email: string;
    firstname: string;
    lastname: string;
    phone: string;
    profile_pic: string | null;
}

interface BusinessHours {
    day: string;
    hours: string;
    isToday: boolean;
}

interface StorefrontExtension {
    country: string;
    description: string;
    phone: string;
    hour: BusinessHours[];
}

export interface Storefront {
    id: number;
    business_name: string;
    description: string;
    address: string;
    established_at: string;
    business_banner: string | null;
    ratings: number;
    vendor: Vendor | null;
    vendor_info?: {
        member_since: string;
    };
    extended: StorefrontExtension | null;
}

export interface APIResponse {
    count: number;
    storefronts: Storefront[];
}

export const DUMMY_STOREFRONTS: Storefront[] = [
  {
    id: 101,
    business_name: "TechHaven Nigeria",
    description: "Your premier destination for high-end smartphones, laptops, and home automation gadgets. We pride ourselves on authentic products and nationwide delivery.",
    address: "12B Admiralty Way, Lekki Phase 1, Lagos",
    established_at: "2019-05-20",
    business_banner: "https://images.unsplash.com/photo-1531297461136-82lwDe43qR?auto=format&fit=crop&q=80&w=1200",
    ratings: 4.8,
    vendor: {
      business_name: "TechHaven Nigeria",
      email: "chidi.tech@techhaven.ng",
      firstname: "Chidi",
      lastname: "Okonkwo",
      phone: "+234 801 234 5678",
      profile_pic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
    },
    vendor_info: {
      member_since: "2018-11-12"
    },
    extended: {
      country: "Nigeria",
      description: "Dedicated tech retail space with certified maintenance personnel and customer support desk available on-site.",
      phone: "+234 1 234 9000",
      hour: [
        { day: "Monday", hours: "09:00 - 18:00", isToday: false },
        { day: "Tuesday", hours: "09:00 - 18:00", isToday: false },
        { day: "Wednesday", hours: "09:00 - 18:00", isToday: false },
        { day: "Thursday", hours: "09:00 - 18:00", isToday: false },
        { day: "Friday", hours: "09:00 - 18:00", isToday: true },
        { day: "Saturday", hours: "10:00 - 16:00", isToday: false },
        { day: "Sunday", hours: "Closed", isToday: false }
      ]
    }
  },
  {
    id: 102,
    business_name: "Urban Threads Boutique",
    description: "Contemporary African fashion meets street style. We specialize in custom-tailored Ankara pieces and modern ready-to-wear outfits.",
    address: "Shop 42, Jabi Lake Mall, Abuja",
    established_at: "2021-02-14",
    business_banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200",
    ratings: 4.5,
    vendor: {
      business_name: "Urban Threads",
      email: "hello@urbanthreads.ng",
      firstname: "Sarah",
      lastname: "Bello",
      phone: "+234 703 444 5555",
      profile_pic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
    },
    vendor_info: {
      member_since: "2021-01-20"
    },
    extended: {
      country: "Nigeria",
      description: "A boutique experience focusing on sustainable fabrics and unique patterns designed locally.",
      phone: "+234 9 444 5555",
      hour: [
        { day: "Monday", hours: "10:00 - 20:00", isToday: false },
        { day: "Tuesday", hours: "10:00 - 20:00", isToday: false },
        { day: "Wednesday", hours: "10:00 - 20:00", isToday: false },
        { day: "Thursday", hours: "10:00 - 20:00", isToday: false },
        { day: "Friday", hours: "10:00 - 20:00", isToday: true },
        { day: "Saturday", hours: "10:00 - 21:00", isToday: false },
        { day: "Sunday", hours: "12:00 - 18:00", isToday: false }
      ]
    }
  },
  {
    id: 103,
    business_name: "Glow & Flow Skincare",
    description: "Organic skincare solutions curated for African skin tones. All our products are dermatologist-tested and cruelty-free.",
    address: "15 GRA Road, Port Harcourt",
    established_at: "2022-08-30",
    business_banner: null, // Test case for fallback/placeholder image
    ratings: 4.9,
    vendor: {
      business_name: "Glow & Flow",
      email: "info@glowandflow.com",
      firstname: "Amina",
      lastname: "Zubairu",
      phone: "+234 902 111 2222",
      profile_pic: null // Test case for avatar initial fallback
    },
    vendor_info: {
      member_since: "2022-08-01"
    },
    extended: {
      country: "Nigeria",
      description: "Premium holistic beauty store offering consultations and personalized skincare routines.",
      phone: "+234 84 111 2222",
      hour: [
        { day: "Monday", hours: "08:00 - 17:00", isToday: false },
        { day: "Tuesday", hours: "08:00 - 17:00", isToday: false },
        { day: "Wednesday", hours: "08:00 - 17:00", isToday: false },
        { day: "Thursday", hours: "08:00 - 17:00", isToday: false },
        { day: "Friday", hours: "08:00 - 17:00", isToday: true },
        { day: "Saturday", hours: "09:00 - 14:00", isToday: false },
        { day: "Sunday", hours: "Closed", isToday: false }
      ]
    }
  }
];

export const DUMMY_STOREFRONTS_RESPONSE: APIResponse = {
  count: DUMMY_STOREFRONTS.length,
  storefronts: DUMMY_STOREFRONTS,
};