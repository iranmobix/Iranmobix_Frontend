"use client";

import { checkoutAddressSchema } from "../schemas/checkout.schema";
import { useState } from "react";
import type { CartSnapshot } from "../types/domain/cart-preview.types";
import type {
  CheckoutAddressInput,
  CheckoutConfiguration,
  CheckoutPaymentMethod,
  CheckoutPaymentSelection,
} from "../types/domain/checkout.types";
import {
  calculateCheckoutTotals,
  canPayCheckout,
  resolveCheckoutCoupon,
} from "../services/checkout.service";

export function useCheckout(
  cart: CartSnapshot,
  configuration: CheckoutConfiguration,
  onPaymentRequested?: (selection: CheckoutPaymentSelection) => void,
) {
  const [addresses, setAddresses] = useState([...configuration.addresses]);
  const [selectedAddressId, setSelectedAddressId] = useState(
    configuration.defaultAddressId,
  );
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [notice, setNotice] = useState("");
  const address =
    addresses.find((entry) => entry.id === selectedAddressId) ?? null;
  const coupon = couponCode
    ? resolveCheckoutCoupon(couponCode, configuration)
    : null;
  const totals = calculateCheckoutTotals(cart, configuration, address, coupon);
  const canPay = canPayCheckout(
    totals,
    address,
    paymentMethod,
    configuration.walletBalanceIrr,
  );

  return {
    addresses,
    selectedAddressId,
    address,
    paymentMethod,
    coupon,
    couponError,
    notice,
    totals,
    canPay,
    selectAddress: (id: string) => {
      setSelectedAddressId(id);
      setNotice("");
    },
    selectPaymentMethod: (method: CheckoutPaymentMethod) => {
      setPaymentMethod(method);
      setNotice("");
    },
    addAddress: (input: CheckoutAddressInput): boolean => {
      const parsed = checkoutAddressSchema.safeParse(input);
      if (!parsed.success) return false;
      const id = crypto.randomUUID();
      setAddresses((previous) => [
        ...previous,
        {
          id,
          ...parsed.data,
          deliveryFeeIrr: configuration.newAddressDeliveryFeeIrr,
        },
      ]);
      setSelectedAddressId(id);
      setNotice("آدرس جدید انتخاب شد.");
      return true;
    },
    applyCoupon: (code: string) => {
      const nextCoupon = resolveCheckoutCoupon(code, configuration);
      if (!nextCoupon) {
        setCouponError(
          code.trim() ? "کد تخفیف معتبر نیست." : "کد تخفیف را وارد کنید.",
        );
        return;
      }
      setCouponCode(nextCoupon.code);
      setCouponError("");
      setNotice("کد تخفیف اعمال شد.");
    },
    removeCoupon: () => {
      setCouponCode(null);
      setCouponError("");
      setNotice("کد تخفیف حذف شد.");
    },
    requestPayment: () => {
      if (!canPay || !address || !paymentMethod) return;
      if (onPaymentRequested)
        onPaymentRequested({
          addressId: address.id,
          method: paymentMethod,
          couponCode: coupon?.code ?? null,
        });
      else
        setNotice(
          "روش پرداخت انتخاب شد. در این پیش‌نمایش تراکنشی انجام نمی‌شود.",
        );
    },
    requestWalletTopUp: () =>
      setNotice("شارژ کیف پول در این پیش‌نمایش انجام نمی‌شود."),
  };
}
