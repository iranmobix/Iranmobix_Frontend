import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCartMoney } from "../utils/cart.utils";
import type { CartDataIssue } from "../types/domain/cart.types";
import { getCartFieldNote } from "../utils/cart-data-issues";

type CartSummaryProps = {
  dataIssues?: CartDataIssue[];
  totals: {
    quantity: number;
    originalSubtotal: number | string;
    discount: number | string;
    shipping: number | string | null;
    total: number | string;
  };
  currency: string;
  onContinue?: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  unavailableReason?: string;
};

const CartSummary = ({
  totals,
  currency,
  onContinue,
  disabled = false,
  isSubmitting = false,
  unavailableReason,
  dataIssues,
}: CartSummaryProps) => (
  <aside
    aria-labelledby="cart-payment-title"
    className="h-fit overflow-hidden rounded-md bg-white lg:sticky lg:top-6"
  >
    <h2
      id="cart-payment-title"
      className="px-3 pb-5 pt-5 text-sm font-medium text-neutral-1000"
    >
      جزئیات پرداخت
    </h2>
    <dl className="space-y-4 text-[11px] text-neutral-700">
      <div className="flex items-center justify-between gap-3 px-3">
        <dt>
          مجموع قیمت کالاها ({Number.isFinite(totals.quantity) ? totals.quantity.toLocaleString("fa-IR") : "از بک نمی‌آید"} کالا)
        </dt>
        <dd className="shrink-0">
          <bdi>{getCartFieldNote(dataIssues,"subtotal") || formatCartMoney(totals.originalSubtotal, currency)}</bdi>
        </dd>
      </div>
      <div className="flex items-center justify-between gap-3 bg-primary-100 px-3 py-2 text-primary-800">
        <dt>سود شما از خرید</dt>
        <dd className="shrink-0">
          <bdi>{getCartFieldNote(dataIssues,"discount_total") || formatCartMoney(totals.discount, currency)}</bdi>
        </dd>
      </div>
      <div className="flex items-center justify-between gap-3 px-3 font-medium text-neutral-1000">
        <dt>مجموع سبد خرید</dt>
        <dd className="shrink-0">
          <bdi>{getCartFieldNote(dataIssues,"final_total") || formatCartMoney(totals.total, currency)}</bdi>
        </dd>
      </div>
    </dl>
    <div className="space-y-6 px-3 pb-4 pt-3">
      <p className="flex items-start gap-1 text-[10px] leading-5 text-[#9f8429]">
        <Info size={12} aria-hidden="true" className="mt-1 shrink-0" />
        مبالغ سبد خرید به {currency === "CNY" ? "یوان" : currency || "ارز نامشخص (از بک دریافت نشده)"} نمایش داده
        می‌شوند.
      </p>
      <div className="space-y-2">
        <Button
          type="button"
          onClick={onContinue}
          disabled={
            disabled || isSubmitting || !onContinue || totals.quantity === 0
          }
          aria-busy={isSubmitting}
          aria-describedby={
            unavailableReason ? "cart-checkout-unavailable" : undefined
          }
          className="h-8 w-full px-3 text-xs disabled:bg-primary-700"
        >
          {isSubmitting ? "در حال ثبت اولیه…" : "ثبت اولیه"}
        </Button>
        {unavailableReason && (
          <p
            id="cart-checkout-unavailable"
            className="text-[10px] leading-5 text-amber-800"
          >
            {unavailableReason}
          </p>
        )}
        <p className="flex items-start gap-1 text-[10px] leading-5 text-[#9f8429]">
          <Info size={12} aria-hidden="true" className="mt-1 shrink-0" />
          پس از ثبت اولیه سفارش و تأیید کارشناسان، قیمت نهایی قابل پرداخت و
          ادامهٔ روند نهایی کردن سفارش به شما اطلاع‌رسانی خواهد شد.
        </p>
      </div>
    </div>
  </aside>
);
export default CartSummary;
