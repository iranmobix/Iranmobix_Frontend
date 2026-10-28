export type CartShippingMethod =
  | "sea_china_iran"
  | "sea_china_dubai"
  | "ground_china_iran"
  | "air_express"
  | "commercial_air_iran"
  | "commercial_air_dubai";
import type { ProductSource } from "../../../product/types/domain/product.types";

export type CartDataIssue = { path: string; status: "missing" | "empty" | "invalid" };

/** Cart product snapshot; currency amounts retain the exact backend decimal strings. */
export interface CartProduct {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  shortDescription: string;
  image: string;
  source: ProductSource;
  colors: unknown[];
  brand: unknown;
  seller: unknown;
  price: {
    amount: string;
    currency: string;
    amountIrr: string;
    amountCny: string | null;
    hasDiscount: boolean;
    originalAmount: string | null;
    discountAmount: string | null;
    discountPercentage: number | null;
  };
  guarantee: { available: boolean; type: string | null; label: string | null };
  inIranMobixInventory: boolean;
  officialUrl: string;
  marketable: boolean;
}
export interface CartSelectedOptions {
  color: unknown;
  guarantee: unknown;
  attributes: Array<{ name: string; value: string }>;
}
export interface CartAvailability {
  marketable: boolean;
  availableQuantity: number | null;
  isAvailable: boolean;
}
export interface CartPricing {
  currency: string | null;
  basePriceIrr: string | null;
  unitPriceIrr: string | null;
  unitDiscountAmountIrr: string | null;
  finalUnitPriceIrr: string | null;
  totalDiscountAmountIrr: string | null;
  finalTotalPriceIrr: string | null;
  pricedAt: string;
  basePrice: string;
  unitPrice: string;
  isAvailable: boolean;
  finalUnitPrice: string;
  finalTotalPrice: string;
  availableQuantity: number | null;
  effectiveDiscount: unknown;
  colorPriceIncrease: string;
  unitDiscountAmount: string;
  totalDiscountAmount: string;
  guaranteePriceIncrease: string;
  attributesPriceIncrease: string;
  inventoryTrackingEnabled: boolean;
}
export interface ServerCartItem {
  dataIssues?: CartDataIssue[];
  displayId?: string;
  id: string;
  catalogId: string;
  source: string;
  currency: string;
  product: CartProduct;
  selectedOptions: CartSelectedOptions;
  selectedColor: { name: string; value: string | null } | null;
  quantity: number;
  availability: CartAvailability;
  pricing: CartPricing;
  issues: string[];
  updatedAt: string;
}
export interface ServerCart {
  dataIssues?: CartDataIssue[];
  owner: { type: string; userId: number | null };
  currency: string;
  itemCount: number;
  totalQuantity: number;
  subtotal: string;
  discountTotal: string;
  finalTotal: string;
  checkoutReady: boolean;
  issues: string[];
  items: ServerCartItem[];
  relatedProducts: unknown[];
}
export interface GuestCartSession {
  token: string;
  header: "X-Guest-Cart-Token";
  expiresAt: number;
}
export interface CartMergeResult {
  transferredItems: number;
  combinedItems: number;
  issues: string[];
  cart: ServerCart;
}
export type CartDataSource = "api" | "mock";
