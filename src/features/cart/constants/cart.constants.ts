import type { CartSnapshot } from "../types/domain/cart-preview.types";

export const EMPTY_CART_SNAPSHOT: CartSnapshot = {
  items: [],
  currency: "CNY",
  shippingFee: 0,
};

// Static bank-card details explicitly requested for the checkout design.
export const CHECKOUT_BANK_ACCOUNT: import("../types/domain/checkout.types").CheckoutBankAccount =
  {
    holderName: "متین نریمانی بانک فلان",
    cardNumber: "6219861945469566",
    iban: "IR211234567891012345678912",
  };
