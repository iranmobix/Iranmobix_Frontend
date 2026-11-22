export type AddToCartShippingMethod =
  "ground" | "sea" | "air_express" | "commercial_air";

export interface AddToCartPayload {
  color?: string;
  guarantee?: string;
  quantity?: number;
  shipping_method?: AddToCartShippingMethod;
  /** Backward-compatible alias used only when quantity is omitted. */
  number?: number;
  selected_attributes?: Array<{
    category_attribute: number;
    category_value: number;
    value: string;
  }>;
  sku_attributes?: Record<string, string>;
}
export interface AddToCartInput {
  slug: string;
  payload: AddToCartPayload;
}

export interface UpdateCartItemInput {
  itemId: string;
  payload: { quantity: number };
}
export interface RemoveCartItemInput {
  itemId: string;
}

export interface SubmitOrderPayload {
  item_ids: number[];
}
