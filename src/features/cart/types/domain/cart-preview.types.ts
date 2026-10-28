import type { Product } from "@/features/product/types/domain/product.types";

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  selectedColor: Product["colors"][number] | null;
}

export interface CartSnapshot {
  items: CartItem[];
  currency: string;
  shippingFee: number;
}

export interface CartTotals {
  quantity: number;
  originalSubtotal: number;
  discount: number;
  subtotal: number;
  shipping: number;
  total: number;
}

export type CartStep = "cart" | "review" | "payment";

export interface CartState extends CartSnapshot {
  step: CartStep;
  notice: string;
  removedItem: { item: CartItem; index: number } | null;
}

export type CartAction =
  | { type: "quantity"; id: string; quantity: number }
  | { type: "remove"; id: string }
  | { type: "undo-remove" }
  | { type: "continue" }
  | { type: "back" }
  | { type: "approve" }
  | { type: "cancel-order" };
