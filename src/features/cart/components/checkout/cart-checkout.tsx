"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CheckoutDialog from "./checkout-dialog";
import CheckoutBankDetails from "./checkout-bank-details";
import type { CartSnapshot } from "../../types/domain/cart-preview.types";
import type {
  CheckoutConfiguration,
  CheckoutPaymentSelection,
} from "../../types/domain/checkout.types";
import { useCheckout } from "../../hooks/use-checkout";
import CheckoutAddresses from "./checkout-addresses";
import CheckoutPaymentMethods from "./checkout-payment-methods";
import CheckoutSummary from "./checkout-summary";

type CartCheckoutProps = {
  cart: CartSnapshot;
  configuration: CheckoutConfiguration;
  onCancelOrder: () => void;
  onPaymentRequested?: (selection: CheckoutPaymentSelection) => void;
};

const CartCheckout = ({
  cart,
  configuration,
  onPaymentRequested,
  onCancelOrder,
}: CartCheckoutProps) => {
  const [modal, setModal] = useState<"bank" | "cancel" | null>(null);
  const checkout = useCheckout(cart, configuration, onPaymentRequested);
  return (
    <div className="space-y-4">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_410px]">
        <div className="min-w-0 space-y-6">
          <CheckoutAddresses
            addresses={checkout.addresses}
            selectedId={checkout.selectedAddressId}
            onSelect={checkout.selectAddress}
            onAdd={checkout.addAddress}
          />
          <CheckoutPaymentMethods
            value={checkout.paymentMethod}
            walletBalanceIrr={configuration.walletBalanceIrr}
            totalIrr={checkout.totals.totalIrr}
            onChange={checkout.selectPaymentMethod}
            onWalletTopUp={checkout.requestWalletTopUp}
            onBankDetails={() => setModal("bank")}
          />
        </div>
        <CheckoutSummary
          totals={checkout.totals}
          address={checkout.address}
          validityDays={configuration.validityDays}
          canPay={checkout.canPay}
          paymentMethod={checkout.paymentMethod}
          coupon={checkout.coupon}
          couponError={checkout.couponError}
          onApplyCoupon={checkout.applyCoupon}
          onRemoveCoupon={checkout.removeCoupon}
          onPay={checkout.requestPayment}
          onCancelOrder={() => setModal("cancel")}
        />
      </div>
      {modal === "bank" && (
        <CheckoutBankDetails
          account={configuration.bankAccount ?? null}
          onDismiss={() => setModal(null)}
        />
      )}
      {modal === "cancel" && (
        <CheckoutDialog
          title="از لغو این سفارش اطمینان دارید؟"
          onDismiss={() => setModal(null)}
        >
          <div className="flex justify-center gap-3 px-5 pb-7">
            <Button type="button" onClick={() => setModal(null)}>
              خیر
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="border-red-400 text-red-500 hover:border-red-500 hover:text-red-600"
              onClick={() => {
                setModal(null);
                onCancelOrder();
              }}
            >
              بله
            </Button>
          </div>
        </CheckoutDialog>
      )}
      <p
        role="status"
        aria-live="polite"
        className={
          checkout.notice
            ? "rounded-lg bg-white p-4 text-sm leading-7 text-primary-700"
            : "sr-only"
        }
      >
        {checkout.notice}
      </p>
    </div>
  );
};

export default CartCheckout;
