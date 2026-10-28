import type { CheckoutPaymentResponse } from "../types/api/checkout-payment-api.types";
import type { CheckoutPayment } from "../types/domain/checkout-payment.types";
import type { CheckoutPaymentMethod } from "../types/domain/checkout.types";
const methods: Record<string, CheckoutPaymentMethod> = {
  online: "online",
  wallet: "wallet",
  offline: "bank-transfer",
  hawala: "foreign-transfer",
};
export function mapCheckoutPayment(
  dto: CheckoutPaymentResponse,
  trackingCode = "",
): CheckoutPayment {
  if (!("order" in dto)) {
    const p = dto.pricing;
    return {
      contract: dto.contract
        ? {
            required: dto.contract.required,
            accepted: dto.contract.accepted,
            templateId: dto.contract.template_id,
            title: dto.contract.title,
            pdfUrl: dto.contract.pdf_url,
          }
        : null,
      orderId: null,
      trackingCode,
      status: dto.payment_window?.status ?? null,
      message:
        dto.payment_window?.message ??
        "وضعیت تأیید کارشناس و مجوز پرداخت در پاسخ جدید بک موجود نیست.",
      canContinue:
        dto.payment_window?.status === "approved" &&
        dto.payment_window.can_continue_payment,
      expiresAt: dto.payment_window?.expires_at ?? null,
      addresses: [],
      selectedAddressId: null,
      options: (dto.payment_methods ?? []).map((o) => ({
        code: o.code,
        method: methods[o.code] ?? null,
        title: o.title,
        enabled: o.enabled,
        reason: o.reason,
        description: null,
        balanceToman: o.code === "wallet" ? dto.wallet.balance_toman : null,
        bankAccount: null,
        gateways: [],
      })),
      bankAccounts: (dto.offline_payment_destinations ?? []).map((a) => ({
        index: a.index,
        holderName: a.account_owner,
        cardNumber: a.card_number,
        iban: a.sheba_number,
        bankName: a.bank_name,
        amount: a.amount,
        currency: a.currency,
      })),
      currency: p.currency ?? null,
      total: p.final_amount,
      quantity: p.item_count,
      wallet: {
        balance: dto.wallet.balance,
        shortage: dto.wallet.shortage,
        currency: dto.wallet.currency,
        balanceToman: dto.wallet.balance_toman,
        shortageToman: dto.wallet.shortage_toman,
        status: dto.wallet.status,
      },
      rows: [
        {
          key: "items_total",
          label: "مجموع قیمت کالاها",
          amount: p.items_total,
        },
        {
          key: "shipping_packaging_amount",
          label: "هزینه ارسال و بسته‌بندی",
          amount: p.shipping_packaging_amount,
        },
        {
          key: "domestic_shipping_amount",
          label: "هزینه ارسال داخلی",
          amount: p.domestic_shipping_amount,
        },
        {
          key: "discounted_price",
          label: "قیمت با تخفیف",
          amount: p.discounted_price,
        },
      ],
      pricingIssue: p.currency
        ? null
        : "واحد مبلغ‌های قیمت‌گذاری در پاسخ بک مشخص نشده است.",
      proforma: {
        available:
          dto.proforma_invoice.pdf_url !== null &&
          dto.proforma_invoice.pdf_status !== "missing",
        url: dto.proforma_invoice.pdf_url,
        message:
          dto.proforma_invoice.pdf_status === "missing"
            ? "پیش‌فاکتور هنوز بارگذاری نشده است."
            : "وضعیت پیش‌فاکتور: " + dto.proforma_invoice.pdf_status,
      },
    };
  }
  const p = dto.pricing;
  const fields = [
    ["products_total", "مجموع قیمت کالاها"],
    ["product_discount_amount", "تخفیف کالاها"],
    ["common_discount_amount", "تخفیف عمومی"],
    ["coupon_discount_amount", "تخفیف کد"],
    ["shipping_packaging_amount", "هزینه ارسال و بسته‌بندی"],
    ["domestic_shipping_amount", "هزینه ارسال داخلی"],
    ["price_after_discount", "قیمت کالاها پس از تخفیف"],
  ] as const;
  // Exact decimal arithmetic is only a diagnostic; never replace the backend payable amount.
  const amounts = [
    p.products_total,
    p.product_discount_amount,
    p.common_discount_amount,
    p.coupon_discount_amount,
    p.delivery_amount,
    p.final_amount,
  ];
  const scale = Math.max(...amounts.map((v) => v.split(".")[1]?.length ?? 0));
  const units = (v: string) => {
    const [a, b = ""] = v.split(".");
    return BigInt(a + b.padEnd(scale, "0"));
  };
  const expected =
    units(p.products_total) -
    units(p.product_discount_amount) -
    units(p.common_discount_amount) -
    units(p.coupon_discount_amount) +
    units(p.delivery_amount);
  return {
    contract: null,
    orderId: dto.order.id,
    trackingCode: dto.order.tracking_code,
    status: dto.order.expert_pricing_status,
    message: dto.order.expert_payment_message,
    canContinue:
      dto.order.expert_pricing_status === "approved" &&
      dto.order.can_continue_payment &&
      dto.order.workflow.can_continue_payment &&
      dto.payment_options.payment_window.can_continue_payment &&
      !dto.order.workflow.is_terminal,
    expiresAt:
      dto.payment_options.payment_window.expires_at ??
      dto.order.expert_price_expires_at,
    addresses: dto.addresses.map((a) => ({
      id: String(a.id),
      label:
        a.display_title ||
        a.address_title ||
        a.title ||
        "عنوان آدرس از بک دریافت نشده",
      description:
        a.display_address || a.address || "متن آدرس از بک دریافت نشده",
    })),
    selectedAddressId:
      dto.selected_address_id === null ? null : String(dto.selected_address_id),
    bankAccounts: dto.payment_options.available_payment_methods.flatMap((o) =>
      o.offline_payment_info?.available
        ? [
            {
              holderName: o.offline_payment_info.owner_name,
              cardNumber: o.offline_payment_info.card_number,
              iban: o.offline_payment_info.sheba_number,
              bankName: o.offline_payment_info.bank_name,
            },
          ]
        : [],
    ),
    options: dto.payment_options.available_payment_methods.map((o) => ({
      code: o.code,
      method: methods[o.code] ?? null,
      title: o.title,
      enabled: o.enabled && o.base_enabled,
      reason: o.reason,
      description: o.receipt_upload_hint ?? null,
      balanceToman: o.balance_toman ?? null,
      bankAccount: o.offline_payment_info?.available
        ? {
            holderName: o.offline_payment_info.owner_name,
            cardNumber: o.offline_payment_info.card_number,
            iban: o.offline_payment_info.sheba_number,
          }
        : null,
      gateways: (o.gateways ?? []).map((g) => ({
        code: g.code,
        title: g.title,
        enabled: g.enabled && g.selectable,
        isSandbox: g.sandbox,
      })),
    })),
    currency: p.currency,
    total: p.final_amount,
    quantity: p.total_quantity,
    rows: fields.map(([key, label]) => ({ key, label, amount: p[key] })),
    pricingIssue:
      expected !== units(p.final_amount)
        ? "جمع ردیف‌های هزینه و تخفیف با مبلغ نهایی بک یکسان نیست؛ مبلغ نهایی نمایش‌داده‌شده از بک دریافت شده است."
        : null,
    proforma: {
      available: dto.proforma_invoice.available,
      url: dto.proforma_invoice.url,
      message: dto.proforma_invoice.message,
    },
  };
}

/** A coupon updates server pricing and wallet sufficiency, preserving the checkout form and phase. */
export function applyCheckoutCouponPreview(
  current: CheckoutPayment,
  preview: CheckoutPayment,
): CheckoutPayment {
  return {
    ...current,
    currency: preview.currency,
    total: preview.total,
    rows: preview.rows,
    pricingIssue: preview.pricingIssue,
    wallet: preview.wallet,
  };
}
