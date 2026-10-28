import type { ProductSourceApi } from "../../../product/types/api/product-source-api.types";

export interface CartSessionApiResponse {
  token: string;
  header: "X-Guest-Cart-Token";
  expires_in: number;
  expires_at: string;
}
export interface CartProductApi {
  id: number;
  slug: string;
  title: string;
  short_title: string;
  short_description: string;
  image: string | null;
  source: ProductSourceApi;
  // Only empty/null examples are supplied for these nested values.
  colors: unknown[];
  brand: unknown;
  seller: unknown;
  price: {
    amount: string;
    currency: string;
    amount_irr: string;
    amount_cny?: string;
    has_discount: boolean;
    original_amount: string | null;
    discount_amount: string | null;
    discount_percentage: number | null;
  };
  guarantee: { available: boolean; type: string | null; label: string | null };
  in_iranmobix_inventory: boolean;
  official_url: string;
  marketable: boolean;
}
export interface CartSelectedOptionsApi {
  color: unknown;
  guarantee: unknown;
  attributes: Array<{ name: string; value: string }>;
}
export interface CartAvailabilityApi {
  marketable: boolean;
  available_quantity: number | null;
  is_available: boolean;
}
export interface CartPricingApi {
  currency?: string;
  base_price_irr?: string;
  unit_price_irr?: string;
  unit_discount_amount_irr?: string;
  final_unit_price_irr?: string;
  total_discount_amount_irr?: string;
  final_total_price_irr?: string;
  priced_at: string;
  base_price: string;
  unit_price: string;
  is_available: boolean;
  final_unit_price: string;
  final_total_price: string;
  available_quantity: number | null;
  effective_discount: unknown;
  color_price_increase: string;
  unit_discount_amount: string;
  total_discount_amount: string;
  guarantee_price_increase: string;
  attributes_price_increase: string;
  inventory_tracking_enabled: boolean;
}
export interface CartItemApi {
  id: number;
  catalog_id: string;
  source: string;
  product: CartProductApi;
  selected_options: CartSelectedOptionsApi;
  quantity: number;
  availability: CartAvailabilityApi;
  pricing: CartPricingApi;
  issues: string[];
  updated_at: string;
}
export interface CartApiResponse {
  owner: { type: string; user_id: number | null };
  currency: string;
  item_count: number;
  total_quantity: number;
  subtotal: string;
  discount_total: string;
  final_total: string;
  checkout_ready: boolean;
  issues: string[];
  items: CartItemApi[];
  /** Present in GET; omitted in the earlier merge example. Item shape still unknown. */
  related_products?: unknown[];
}
export interface CartMergeApiResponse {
  transferred_items: number;
  combined_items: number;
  issues: string[];
  cart: CartApiResponse;
}

export type SubmitOrderResponse = import("zod").z.infer<
  typeof import("../../schemas/cart.schema").submitOrderResponseSchema
>;
