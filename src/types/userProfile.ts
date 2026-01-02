import { LucideIconName } from "@/components/AppIcon";

export interface UserProfileData {
  id?: string | number;
  name?: string;
  business_name?: string;
  email: string;
  phone?: string;
  country?: string;
  state?: string;
  address?: string;
  referral_code?: string;
  referred_by?: string | null;
  target_view?: string;
  profile_pic_url?: string; //just added
}

export interface Tab {
  id: string;
  label: string;
  icon: LucideIconName;
  count?: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIconName;
  color: string;
  action?: () => void;
  badge?: number;
}
