import type { User } from "@/features/auth/types/user.types";

export interface PanelAddress {
  id: string;
  title: string;
  province: string;
  provinceId?: number;
  city: string;
  cityId?: number;
  street: string;
  no?: string;
  unit?: string;
  postalCode: string;
  receiverName: string;
  receiverMobile: string;
}

export interface PanelCompanyInfo {
  name: string;
  registrationNumber: string;
  nationalId: string;
  economicCode: string;
  address: string;
  phone: string;
  mobile: string;
  email: string;
}

export interface PanelPersonalInfo {
  accountType: "individual" | "legal";
  isForeignNational: boolean;
  firstName: string;
  lastName: string;
  nationalCode: string;
  birthDate: string;
  company?: PanelCompanyInfo | null;
  identityDocument?: { name: string; dataUrl: string } | null;
}

export interface UserPanelAccount
  extends Pick<User, "id" | "email" | "mobile">, PanelPersonalInfo {
  avatarUrl: string | null;
  identityVerified: boolean;
  addresses: PanelAddress[];
  profileSource?: "backend" | "mock";
  backendMissingFields?: string[];
}

export type PanelEditor =
  | { type: "personal" }
  | { type: "mobile" }
  | { type: "email" }
  | { type: "address"; address?: PanelAddress }
  | { type: "delete-address"; address: PanelAddress };

export type PanelAccountChange =
  | { type: "personal"; value: PanelPersonalInfo }
  | { type: "mobile"; value: string }
  | { type: "email"; value: string }
  | { type: "avatar"; value: File }
  | { type: "address"; value: PanelAddress }
  | { type: "delete-address"; id: string };

export type PanelSection =
  | "account"
  | "orders"
  | "payments"
  | "wallet"
  | "tickets"
  | "comments"
  | "favorites";
