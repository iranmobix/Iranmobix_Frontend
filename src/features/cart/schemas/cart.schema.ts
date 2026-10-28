import type {
  CartSessionApiResponse,
  CartApiResponse,
  CartMergeApiResponse,
  CartProductApi,
  CartSelectedOptionsApi,
  CartAvailabilityApi,
  CartPricingApi,
} from "../types/api/cart-api.types";
import type {
  SubmitOrderPayload,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveCartItemInput,
} from "../types/api/cart-payload.types";
import { z } from "zod";
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const amount = z.string().regex(/^\d+(\.\d+)?$/);
export const cartSessionSchema = z.object({
  token: z.string().min(1),
  header: z.literal("X-Guest-Cart-Token"),
  expires_in: z.number().int().positive(),
  expires_at: z.string().datetime({ offset: true }),
}) satisfies z.ZodType<CartSessionApiResponse>;
const cartProductSchema = z.object({
  id: count,
  slug: z.string(),
  title: z.string(),
  short_title: z.string(),
  short_description: z.string(),
  image: z.string().nullable(),
  source: z.object({ name: z.string(), label: z.string(), url: z.string() }),
  colors: z.array(z.unknown()),
  brand: z.unknown(),
  seller: z.unknown(),
  price: z.object({
    amount,
    currency: z.string().min(1),
    amount_irr: amount,
    amount_cny: amount.optional(),
    has_discount: z.boolean(),
    original_amount: amount.nullable(),
    discount_amount: amount.nullable(),
    discount_percentage: z.number().min(0).max(100).nullable(),
  }),
  guarantee: z.object({
    available: z.boolean(),
    type: z.string().nullable(),
    label: z.string().nullable(),
  }),
  in_iranmobix_inventory: z.boolean(),
  official_url: z.string(),
  marketable: z.boolean(),
}) satisfies z.ZodType<CartProductApi>;
const cartSelectedOptionsSchema = z.object({
  color: z.unknown(),
  guarantee: z.unknown(),
  attributes: z.array(z.object({ name: z.string(), value: z.string() })),
}) satisfies z.ZodType<CartSelectedOptionsApi>;
const cartAvailabilitySchema = z.object({
  marketable: z.boolean(),
  available_quantity: count.nullable(),
  is_available: z.boolean(),
}) satisfies z.ZodType<CartAvailabilityApi>;
const cartPricingSchema = z.object({
  currency: z.string().min(1).optional(),
  base_price_irr: amount.optional(),
  unit_price_irr: amount.optional(),
  unit_discount_amount_irr: amount.optional(),
  final_unit_price_irr: amount.optional(),
  total_discount_amount_irr: amount.optional(),
  final_total_price_irr: amount.optional(),
  priced_at: z.string().datetime({ offset: true }),
  base_price: amount,
  unit_price: amount,
  is_available: z.boolean(),
  final_unit_price: amount,
  final_total_price: amount,
  available_quantity: count.nullable(),
  effective_discount: z.unknown(),
  color_price_increase: amount,
  unit_discount_amount: amount,
  total_discount_amount: amount,
  guarantee_price_increase: amount,
  attributes_price_increase: amount,
  inventory_tracking_enabled: z.boolean(),
}) satisfies z.ZodType<CartPricingApi>;

export const cartResponseSchema = z.object({
  owner: z.object({ type: z.string(), user_id: count.nullable() }),
  currency: z.string().min(1),
  item_count: count,
  total_quantity: count,
  subtotal: amount,
  discount_total: amount,
  final_total: amount,
  checkout_ready: z.boolean(),
  issues: z.array(z.string()),
  items: z
    .array(
      z.object({
        id: count,
        catalog_id: z.string(),
        source: z.string(),
        product: cartProductSchema,
        selected_options: cartSelectedOptionsSchema,
        quantity: count,
        availability: cartAvailabilitySchema,
        pricing: cartPricingSchema,
        issues: z.array(z.string()),
        updated_at: z.string().datetime({ offset: true }),
      }),
    )
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
      "Duplicate cart row IDs",
    ),
  related_products: z.array(z.unknown()).optional(),
}) satisfies z.ZodType<CartApiResponse>;
export const cartMergeSchema = z.object({
  transferred_items: count,
  combined_items: count,
  issues: z.array(z.string()),
  cart: cartResponseSchema,
}) satisfies z.ZodType<CartMergeApiResponse>;
export const addToCartSchema = z.object({
  slug: z.string().trim().min(1),
  payload: z.object({
    color: z.string().optional(),
    guarantee: z.string().optional(),
    quantity: count.positive(),
    number: count.positive().optional(),
    selected_attributes: z
      .array(
        z.object({
          category_attribute: count,
          category_value: count,
          value: z.string(),
        }),
      )
      .optional(),
    sku_attributes: z.record(z.string(), z.string()).optional(),
  }),
}) satisfies z.ZodType<AddToCartInput>;

export const removeCartItemSchema = z.object({
  itemId: z.string().regex(/^[1-9]\d*$/),
}) satisfies z.ZodType<RemoveCartItemInput>;
export const updateCartItemSchema = removeCartItemSchema.extend({
  payload: z.object({ quantity: count.positive() }),
}) satisfies z.ZodType<UpdateCartItemInput>;

export const submitOrderSchema = z.object({
  idempotency_key: z.string().min(1),
  shipping_method: z.enum([
    "sea_china_iran",
    "sea_china_dubai",
    "ground_china_iran",
    "air_express",
    "commercial_air_iran",
    "commercial_air_dubai",
  ]),
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1),
        quantity: count.positive(),
        color: z.string().trim().min(1).nullable(),
        guarantee: z.string().trim().min(1).nullable(),
        price: z.object({
          unit_price_irr: amount,
          total_discount_amount_irr: amount,
          final_total_price_irr: amount,
        }),
      }),
    )
    .min(1),
}) satisfies z.ZodType<SubmitOrderPayload>;

export const submitOrderResponseSchema = z
  .object({
    order_id: z.number().int().positive(),
    tracking_code: z.string().min(1),
    initial_amount_irr: z.string().regex(/^\d+(\.\d+)?$/),
    expert_pricing_status: z.string(),
    assigned_sales_expert: z
      .object({ id: z.number(), name: z.string() })
      .nullable(),
    idempotent_replay: z.boolean(),
    next_action: z.object({
      type: z.string(),
      message: z.string(),
      tracking_code: z.string(),
      public_tracking_endpoint: z.string(),
    }),
  })
  .refine(
    (value) => value.tracking_code === value.next_action.tracking_code,
    "کد پیگیری پاسخ ثبت سفارش یکسان نیست.",
  );
