import { CHECKOUT_BANK_ACCOUNT } from "../constants/cart.constants";
import type { CheckoutConfiguration } from "../types/domain/checkout.types";

// Approved-checkout preview data only. These fees, wallet funds and coupon are not authoritative.
export const checkoutMock: CheckoutConfiguration = {
  bankAccount: { ...CHECKOUT_BANK_ACCOUNT, isMock: true },
  addresses: [
    {
      id: "mock-office",
      label: "محل کارم",
      description: "اصفهان، خیابان شریف اصفهانی، کوچهٔ ۲۷، پلاک ۲۲",
      deliveryFeeIrr: 3000000,
    },
    {
      id: "mock-home",
      label: "خونه",
      description: "اصفهان، خیابان شریف اصفهانی، کوچهٔ ۲۷، پلاک ۱۶۹",
      deliveryFeeIrr: 2500000,
    },
  ],
  defaultAddressId: "mock-home",
  walletBalanceIrr: 250000,
  packingFeeIrr: 5000000,
  internationalShippingIrr: 35000000,
  newAddressDeliveryFeeIrr: 2500000,
  validityDays: 2,
  coupon: { code: "MOBIX10", percent: 10, maxDiscountIrr: 10000000 },
};
