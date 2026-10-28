import type { PanelCompanyInfo } from "./user-panel.types";
export interface CustomerProfileApi {
  account_type?: "real" | "legal" | "حقیقی" | "حقوقی" | string | null;
  first_name?: string | null;
  last_name?: string | null;
  national_code?: string | null;
  birth_date?: string | null;
  mobile?: string | null;
  email?: string | null;
  profile_photo?: string | null;
  company_name?: string | null;
  manager_name?: string | null;
  manager_mobile?: string | null;
  economic_code?: string | null;
  company_address?: string | null;
  company_postal_code?: string | null;
  company_phone?: string | null;
  access?: string;
  refresh?: string;
}

export interface CustomerProfilePatch {
  account_type?: "real" | "legal";
  first_name?: string;
  last_name?: string;
  national_code?: string;
  birth_day?: number;
  birth_month?: number;
  birth_year?: number;
  is_foreign?: boolean;
  foreign_document?: string;
  profile_photo_path?: string;
  mobile?: string;
  email?: string;
  company_name?: string;
  manager_name?: string;
  manager_mobile?: string;
  economic_code?: string;
  company_address?: string;
  company_postal_code?: string;
  company_phone?: string;
}

// Mock transport shape only; replace with the agreed backend contract when available.
export interface UserPanelAccountApi {
  id: number;
  account_type: "individual" | "legal";
  is_foreign_national: boolean;
  first_name: string;
  last_name: string;
  national_code: string;
  birth_date: string;
  company?: PanelCompanyInfo | null;
  identity_document?: { name: string; dataUrl: string } | null;
  email: string | null;
  mobile: string | null;
  avatar_url: string | null;
  identity_verified: boolean;
  addresses: Array<{
    id: string;
    title: string;
    province: string;
    city: string;
    street: string;
    no?: string;
    unit?: string;
    postal_code: string;
    receiver_name: string;
    receiver_mobile: string;
  }>;
}
