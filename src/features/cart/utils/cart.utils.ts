import type { CartMergeResult } from "../types/domain/cart.types";
import type {
  CartItem,
  CartSnapshot,
  CartTotals,
} from "../types/domain/cart-preview.types";

const getScale = (currency: string) =>
  10 **
  (new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).resolvedOptions().maximumFractionDigits ?? 2);

export function toMinorUnits(amount: number | null, currency: string): number {
  if (amount === null) throw new Error("قیمت کالا دریافت نشده است.");
  const minor = Math.round(amount * getScale(currency));
  if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(minor)) {
    throw new Error("قیمت کالا معتبر نیست.");
  }
  return minor;
}

export const formatCartMoney = (
  amount: number | string | null,
  currency: string,
) => {
  if (amount === null) return "—";
  if (typeof amount === "string") {
    if (!/^\d+(\.\d+)?$/.test(amount)) return "—";
    const [whole, fraction] = amount.split(".");
    return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${fraction ? "." + fraction : ""} ${currency === "CNY" ? "یوان" : currency}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
};

export const normalizeQuantityDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[,٬\s]/g, "");

export const isValidCartQuantity = (
  item: Pick<CartItem, "minQuantity" | "maxQuantity">,
  quantity: number,
) =>
  Number.isSafeInteger(quantity) &&
  quantity >= item.minQuantity &&
  quantity <= item.maxQuantity;

export function getCartItemTotals(item: CartItem) {
  const { amount, originalAmount, currency } = item.product.price;
  const unit = toMinorUnits(amount, currency);
  const originalUnit =
    item.product.price.hasDiscount && originalAmount !== null
      ? Math.max(unit, toMinorUnits(originalAmount, currency))
      : unit;
  const scale = getScale(currency);
  const subtotal = unit * item.quantity;
  const originalSubtotal = originalUnit * item.quantity;
  if (
    !Number.isSafeInteger(subtotal) ||
    !Number.isSafeInteger(originalSubtotal)
  ) {
    throw new Error("مبلغ سبد از محدودهٔ مجاز بیشتر است.");
  }
  return {
    subtotal: subtotal / scale,
    originalSubtotal: originalSubtotal / scale,
    discountPercentage:
      originalUnit > unit
        ? Math.round(((originalUnit - unit) / originalUnit) * 100)
        : 0,
  };
}

export function getCartTotals(cart: CartSnapshot): CartTotals {
  const scale = getScale(cart.currency);
  let subtotal = 0;
  let originalSubtotal = 0;
  let quantity = 0;
  for (const item of cart.items) {
    if (item.product.price.currency !== cart.currency) {
      throw new Error("ارز کالاهای سبد باید یکسان باشد.");
    }
    const totals = getCartItemTotals(item);
    subtotal += toMinorUnits(totals.subtotal, cart.currency);
    originalSubtotal += toMinorUnits(totals.originalSubtotal, cart.currency);
    quantity += item.quantity;
  }
  const shipping = cart.items.length
    ? toMinorUnits(cart.shippingFee, cart.currency)
    : 0;
  if (
    ![subtotal, originalSubtotal, subtotal + shipping, quantity].every(
      Number.isSafeInteger,
    )
  ) {
    throw new Error("مبلغ یا تعداد سبد از محدودهٔ مجاز بیشتر است.");
  }
  return {
    quantity,
    originalSubtotal: originalSubtotal / scale,
    discount: (originalSubtotal - subtotal) / scale,
    subtotal: subtotal / scale,
    shipping: shipping / scale,
    total: (subtotal + shipping) / scale,
  };
}

/** Use the same definition of an incomplete merge for session cleanup and UI. */
export function getCartMergeIssues(result: CartMergeResult): string[] {
  return [
    ...result.issues,
    ...result.cart.issues,
    ...result.cart.items.flatMap((item) => item.issues),
  ];
}

export const requireRialAmount = (amount: number | null): number => {
  if (amount === null || !Number.isSafeInteger(amount) || amount < 0)
    throw new Error("مبلغ ریالی معتبر نیست.");
  return amount;
};
const tomanFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 1,
});
export const formatCheckoutMoney = (amountIrr: number) =>
  `${tomanFormatter.format(requireRialAmount(amountIrr) / 10)} تومان`;
