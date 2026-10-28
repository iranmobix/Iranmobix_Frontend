import type { CalculatingType, ShippingMethod } from "./calculating.types";

export type CalculatingApiPayload =
  | {
      calculation_basis: "cbm";
      cbm: string;
      carton_count: number;
      actual_weight_kg: string;
      shipping_mode: ShippingMethod;
      item_value: string;
      cargo_category: string;
      has_battery: boolean;
      has_magnet: boolean;
      is_brand: boolean;
    }
  | {
      calculation_basis: "dimensions";
      length_cm: string;
      width_cm: string;
      height_cm: string;
      carton_count: number;
      actual_weight_kg: string;
      shipping_mode: ShippingMethod;
      item_value: string;
      cargo_category: string;
      has_battery: boolean;
      has_magnet: boolean;
      is_brand: boolean;
    };

export type CalculatingApiResponse = {
  calculation_basis: CalculatingType;
  volumetric_weight_kg: string;
  actual_weight_kg: string;
  carton_price_irt: string | null;
  domestic_shipping_irt: string | null;
  purchase_service_percentage: string;
  purchase_service_fee_irt: string | null;
  total_irt: string | null;
  status?: "calculated" | "quote_required";
  requires_expert_review?: boolean;
  message?: string;
  total_cbm?: string;
};
