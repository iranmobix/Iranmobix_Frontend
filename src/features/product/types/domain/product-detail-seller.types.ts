import type { ProductSeller } from "./product.types";

export interface ProductDetailSeller extends ProductSeller {
  location: string | null;
  logo: string | null;
  rating: number | null;
  market: unknown;
  services: unknown;
  trust: ProductSellerTrust;
  companyOverview: ProductSellerCompanyOverview | null;
}

// Trust score is separate from a customer star rating.
export interface ProductSellerTrust {
  score: number;
  level: string;
  label: string;
  verified: boolean;
  trusted: boolean;
}

// These values are display text in the current API, including units and ranges.
// The mapper normalizes missing fields to null; it must not invent parsed values.
export interface ProductSellerCompanyOverview {
  yearFounded: string | null;
  floorspace: string | null;
  responseTime: string | null;
  onTimeDispatchRate: string | null;
  onlineRevenue: string | null;
  employees: string | null;
  mainMarkets: string | null;
  serviceQualityControl: string | null;
}
