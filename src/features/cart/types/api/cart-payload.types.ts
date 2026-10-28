export interface AddToCartPayload {
  color?: string;
  guarantee?: string;
  quantity: number;
  /** Separate backend field: never automatically copied from quantity. */
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

export interface SubmitOrderItemPayload {
  slug: string;
  quantity: number;
  color: string | null;
  guarantee: string | null;
  price: {
    unit_price_irr: string;
    total_discount_amount_irr: string;
    final_total_price_irr: string;
  };
}

export interface SubmitOrderPayload {
  idempotency_key: string;
  shipping_method: import("../domain/cart.types").CartShippingMethod;
  items: SubmitOrderItemPayload[];
}
