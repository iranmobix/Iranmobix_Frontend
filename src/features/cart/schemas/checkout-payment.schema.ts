import { z } from "zod";
const money = z.string().regex(/^\d+(\.\d+)?$/);
const windowSchema = z
  .object({
    status: z.string(),
    can_continue_payment: z.boolean(),
    message: z.string(),
    expires_at: z.string().nullable(),
    remaining_seconds: z.number(),
    payment_submit_endpoint: z.string().optional(),
  })
  .passthrough();
const gateway = z.object({
  code: z.string(),
  title: z.string(),
  provider: z.string(),
  description: z.string(),
  logo_url: z.string(),
  is_default: z.boolean(),
  sandbox: z.boolean(),
  currency: z.string(),
  enabled: z.boolean(),
  selectable: z.boolean(),
  reason: z.string().nullable(),
});
const method = z
  .object({
    code: z.string(),
    title: z.string(),
    enabled: z.boolean(),
    base_enabled: z.boolean(),
    reason: z.string().nullable(),
    next_action: z.string(),
    required_fields: z.array(z.string()),
    required_after_submit: z.array(z.string()),
    balance_toman: money.optional(),
    required_toman: money.optional(),
    shortage_toman: money.optional(),
    charge_wallet_url: z.string().optional(),
    profile_url: z.string().optional(),
    redirect_url: z.string().optional(),
    requires_receipt: z.boolean().optional(),
    receipt_upload_hint: z.string().optional(),
    receipt_upload_endpoint: z.string().optional(),
    offline_payment_info: z
      .object({
        available: z.boolean(),
        id: z.number(),
        title: z.string(),
        owner_name: z.string(),
        bank_name: z.string(),
        sheba_number: z.string(),
        card_number: z.string(),
        accepted_file_types: z.array(z.string()),
        max_file_size_mb: z.number(),
      })
      .nullable()
      .optional(),
    gateways: z.array(gateway).optional(),
    auto_select_gateway: z.boolean().optional(),
    selected_gateway: gateway.nullable().optional(),
    hawala_settings_endpoint: z.string().optional(),
    hawala_request_endpoint: z.string().optional(),
    is_open: z.boolean().optional(),
    window_start: z.string().optional(),
    window_end: z.string().optional(),
  })
  .passthrough();
const legacyCheckoutPaymentSchema = z.object({
  order: z
    .object({
      id: z.number().int().positive(),
      order_code: z.string(),
      tracking_code: z.string().min(1),
      order_kind: z.string(),
      payment_method: z.string(),
      payment_type: z.number(),
      payment_status: z.number(),
      payment_status_label: z.string(),
      delivery_status: z.number(),
      order_status: z.number(),
      order_status_label: z.string(),
      current_status: z
        .object({
          id: z.number(),
          code: z.string(),
          title: z.string(),
          description: z.string(),
          sequence: z.number(),
          color: z.string(),
          icon: z.string(),
          is_terminal: z.boolean(),
          is_canceled: z.boolean(),
          is_returned: z.boolean(),
        })
        .nullable(),
      refund: z.unknown(),
      workflow: z
        .object({
          current_status: z.string(),
          available_transitions: z.array(
            z.object({ code: z.string(), title: z.string() }),
          ),
          can_continue_payment: z.boolean(),
          can_cancel: z.boolean(),
          can_request_refund: z.boolean(),
          refund_status: z.string().nullable(),
          is_terminal: z.boolean(),
          next_action: z.string(),
        })
        .passthrough(),
      expert_pricing_status: z.string(),
      expert_final_amount: money.nullable(),
      expert_note: z.string(),
      expert_approved_at: z.string().nullable(),
      expert_price_expires_at: z.string().nullable(),
      can_continue_payment: z.boolean(),
      expert_payment_message: z.string(),
      expert_payment_window: windowSchema,
      order_final_amount: money,
      order_discount_amount: money,
      order_copan_discount_amount: money,
      order_common_discount_amount: money,
      order_total_products_discount_amount: money,
      online_payment_expires_at: z.string().nullable(),
      can_cancel_unpaid_online: z.boolean(),
      created_at: z.string(),
      updated_at: z.string(),
      items: z.array(
        z.object({
          id: z.number(),
          product: z.number().nullable(),
          scraped_product: z.number().nullable(),
          catalog_id: z.string(),
          product_name: z.string(),
          number: z.number(),
          final_product_price: money,
          final_total_price: money,
          color: z.number().nullable(),
          color_name: z.string().nullable(),
          guarantee: z.number().nullable(),
          guarantee_name: z.string().nullable(),
          attributes: z.array(z.unknown()),
        }),
      ),
    })
    .passthrough(),
  payment_options: z.object({
    order_id: z.number(),
    tracking_code: z.string(),
    payment_submit_endpoint: z.string(),
    final_amount: z.union([money, z.number().nonnegative()]),
    current_payment_method: z.string(),
    current_payment_status: z.number(),
    payment_window: windowSchema,
    available_payment_methods: z.array(method),
  }),
  wallet: z
    .object({
      id: z.number(),
      balance: money,
      gateway_threshold: z.number(),
      created_at: z.string(),
      updated_at: z.string(),
      recent_transactions: z.array(z.unknown()),
    })
    .nullable(),
  addresses: z.array(
    z
      .object({
        id: z.number(),
        title: z.string().optional(),
        address_title: z.string().optional(),
        display_title: z.string().optional(),
        display_address: z.string().optional(),
        address: z.string().optional(),
      })
      .passthrough(),
  ),
  selected_address_id: z.number().nullable(),
  pricing: z
    .object({
      currency: z.string(),
      item_count: z.number(),
      total_quantity: z.number(),
      items_total: money,
      cart_items_total: money,
      products_total: money,
      product_discount_amount: money,
      common_discount_amount: money,
      coupon_discount_amount: money,
      shipping_packaging_amount: money,
      domestic_shipping_amount: money,
      delivery_amount: money,
      price_after_discount: money,
      final_amount: money,
      approved_order_amount: money,
      display: z.record(z.string(), z.string()),
      coupon: z.object({
        applied: z.boolean(),
        code: z.string(),
        coupon: z.unknown(),
        discount_amount: money,
        message: z.string(),
      }),
    })
    .passthrough(),
  proforma_invoice: z.object({
    available: z.boolean(),
    url: z.string().nullable(),
    uploaded_at: z.string().nullable(),
    message: z.string(),
  }),
  invoice: z.unknown(),
  invoice_endpoint: z.string(),
  invoice_available: z.boolean(),
  payment_page_url: z.string(),
  cancel_order_endpoint: z.string(),
  online_payment_session_endpoint: z.string().optional(),
});

const compactCheckoutPaymentSchema = z.object({
  contract: z
    .object({
      required: z.boolean(),
      accepted: z.boolean(),
      template_id: z.number().int().nullable(),
      title: z.string(),
      pdf_url: z.string().nullable(),
    })
    .optional(),
  payment_window: windowSchema.optional(),
  payment_methods: z
    .array(
      z.object({
        code: z.string(),
        title: z.string(),
        enabled: z.boolean(),
        reason: z.string().nullable(),
      }),
    )
    .optional(),
  offline_payment_destinations: z
    .array(
      z.object({
        index: z.number().int().nonnegative(),
        amount: money,
        bank_name: z.string(),
        card_number: z.string(),
        sheba_number: z.string(),
        account_owner: z.string(),
        currency: z.string(),
      }),
    )
    .optional(),
  wallet: z.object({
    balance: money.optional(),
    shortage: money.optional(),
    currency: z.string().optional(),
    balance_toman: money,
    shortage_toman: money,
    status: z.string(),
  }),
  proforma_invoice: z.object({
    pdf_url: z.string().nullable(),
    pdf_status: z.string(),
  }),
  pricing: z.object({
    currency: z.string().optional(),
    items_total: money,
    item_count: z.number().int().nonnegative(),
    shipping_packaging_amount: money,
    domestic_shipping_amount: money,
    discounted_price: money,
    final_amount: money,
  }),
});
export const checkoutPaymentSchema = z.union([
  legacyCheckoutPaymentSchema,
  compactCheckoutPaymentSchema,
]);
