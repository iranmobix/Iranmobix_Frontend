import type { CartSnapshot } from "../types/domain/cart-preview.types";
import type {
  CheckoutAddress,
  CheckoutConfiguration,
  CheckoutCoupon,
  CheckoutPaymentMethod,
  CheckoutTotals,
} from "../types/domain/checkout.types";

import { requireRialAmount as requireMoney } from "../utils/cart.utils";

export function calculateCheckoutTotals(
  cart: CartSnapshot,
  configuration: CheckoutConfiguration,
  address: CheckoutAddress | null,
  coupon: CheckoutCoupon | null,
): CheckoutTotals {
  let quantity = 0;
  let goodsIrr = 0;
  for (const item of cart.items) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1)
      throw new Error("تعداد کالا معتبر نیست.");
    quantity += item.quantity;
    // amountIrr is already the final rial unit price. Do not reapply the source discount.
    goodsIrr += requireMoney(item.product.price.amountIrr) * item.quantity;
  }
  requireMoney(goodsIrr);
  requireMoney(quantity);
  const hasItems = cart.items.length > 0;
  const packingIrr = hasItems ? requireMoney(configuration.packingFeeIrr) : 0;
  const internationalShippingIrr = hasItems
    ? requireMoney(configuration.internationalShippingIrr)
    : 0;
  const domesticShippingIrr =
    hasItems && address ? requireMoney(address.deliveryFeeIrr) : 0;
  const totalBeforeDiscountIrr = requireMoney(
    goodsIrr + packingIrr + internationalShippingIrr + domesticShippingIrr,
  );
  if (
    coupon &&
    (!Number.isInteger(coupon.percent) ||
      coupon.percent < 0 ||
      coupon.percent > 100)
  ) {
    throw new Error("درصد تخفیف معتبر نیست.");
  }
  // Divide before multiplying to keep percentage arithmetic within safe integer bounds.
  const percentageDiscount = coupon
    ? Math.floor(goodsIrr / 100) * coupon.percent +
      Math.floor(((goodsIrr % 100) * coupon.percent) / 100)
    : 0;
  const discountIrr = coupon
    ? Math.min(
        goodsIrr,
        percentageDiscount,
        requireMoney(coupon.maxDiscountIrr),
      )
    : 0;
  return {
    quantity,
    goodsIrr,
    packingIrr,
    internationalShippingIrr,
    domesticShippingIrr,
    discountIrr,
    totalBeforeDiscountIrr,
    totalIrr: totalBeforeDiscountIrr - discountIrr,
  };
}

export function resolveCheckoutCoupon(
  code: string,
  configuration: CheckoutConfiguration,
): CheckoutCoupon | null {
  const normalized = code.trim().toUpperCase();
  return normalized && normalized === configuration.coupon?.code.toUpperCase()
    ? configuration.coupon
    : null;
}

export function canPayCheckout(
  totals: CheckoutTotals,
  address: CheckoutAddress | null,
  method: CheckoutPaymentMethod | null,
  walletBalanceIrr: number,
): boolean {
  return (
    totals.quantity > 0 &&
    address !== null &&
    method !== null &&
    (method !== "wallet" || walletBalanceIrr >= totals.totalIrr)
  );
}
