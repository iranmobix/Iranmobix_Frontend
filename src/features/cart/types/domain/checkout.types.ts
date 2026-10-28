export type CheckoutPaymentMethod =
  "online" | "wallet" | "bank-transfer" | "foreign-transfer";

export interface CheckoutAddress {
  id: string;
  label: string;
  description: string;
  deliveryFeeIrr: number;
}

export interface CheckoutCoupon {
  code: string;
  percent: number;
  maxDiscountIrr: number;
}

export interface CheckoutBankAccount {
  holderName: string;
  cardNumber: string;
  iban: string;
  isMock?: boolean;
  index?: number;
  bankName?: string;
  amount?: string;
  currency?: string;
}

export interface CheckoutConfiguration {
  bankAccount?: CheckoutBankAccount | null;
  addresses: readonly CheckoutAddress[];
  defaultAddressId: string | null;
  walletBalanceIrr: number;
  packingFeeIrr: number;
  internationalShippingIrr: number;
  newAddressDeliveryFeeIrr: number;
  validityDays: number;
  coupon: CheckoutCoupon | null;
}

export interface CheckoutTotals {
  quantity: number;
  goodsIrr: number;
  packingIrr: number;
  internationalShippingIrr: number;
  domesticShippingIrr: number;
  discountIrr: number;
  totalBeforeDiscountIrr: number;
  totalIrr: number;
}

export interface CheckoutPaymentSelection {
  addressId: string;
  method: CheckoutPaymentMethod;
  couponCode: string | null;
}

export type CheckoutAddressInput = Pick<
  CheckoutAddress,
  "label" | "description"
>;
