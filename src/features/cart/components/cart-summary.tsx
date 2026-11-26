import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCartMoney } from "../utils/cart.utils";
import type {
  CartDataIssue,
  CartPaymentDetails,
  ServerCartItem,
} from "../types/domain/cart.types";
import { getCartFieldNote } from "../utils/cart-data-issues";

export type CartSummaryProps = {
  idPrefix?: string;
  items?: ReadonlyArray<Pick<ServerCartItem, "shippingMethod">>;
  paymentDetails?: CartPaymentDetails;
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

const hasPositiveAmount = (value: string | number | null | undefined) =>
  value != null &&
  /^\d+(?:\.\d+)?$/.test(String(value)) &&
  /[1-9]/.test(String(value));

const money = (value: string | number | null, currency: string) =>
  value === null || value === ""
    ? "از بک نمی‌آید"
    : formatCartMoney(value, currency === "TOMAN" ? "تومان" : currency);

function SummaryPrice({
  toman,
  cny,
}: {
  toman: string | number | null;
  cny?: string | null;
}) {
  return (
    <span className="inline-flex flex-wrap items-baseline justify-end gap-1">
      <bdi>{money(toman, "TOMAN")}</bdi>
      {cny != null && (
        <>
          <span>≈</span>
          <bdi dir="ltr">{"¥" + formatCartMoney(cny, "").trim()}</bdi>
        </>
      )}
    </span>
  );
}

const CartSummary = ({
  idPrefix = "cart",
  items = [],
  totals,
  currency,
  onContinue,
  disabled = false,
  isSubmitting = false,
  unavailableReason,
  dataIssues,
  paymentDetails,
}: CartSummaryProps) => {
  const requiresExpressQuote = items.some(
    (item) => item.shippingMethod === "air_express",
  );
  const hasOtherShipping = items.some(
    (item) =>
      Boolean(item.shippingMethod) && item.shippingMethod !== "air_express",
  );
  const isExpressOnly = requiresExpressQuote && !hasOtherShipping;
  const savings = paymentDetails
    ? paymentDetails.discountToman
    : totals.discount;
  const showSavings =
    hasPositiveAmount(savings) &&
    (paymentDetails || !getCartFieldNote(dataIssues, "discount_total"));
  const quantityLabel = Number.isSafeInteger(totals.quantity)
    ? " (" + totals.quantity.toLocaleString("fa-IR") + " کالا)"
    : "";
  const costs =
    paymentDetails && !isExpressOnly
      ? [
          ["حمل و نقل بین‌الملل", paymentDetails.internationalTransitToman],
          ["بیمه", paymentDetails.insuranceToman],
          ["ترخیص", paymentDetails.clearanceToman],
          ...(hasPositiveAmount(paymentDetails.servicesToman)
            ? [["خدمات ایران‌موبیکس", paymentDetails.servicesToman]]
            : []),
        ]
      : [];
  return (
    <aside
      dir="rtl"
      aria-labelledby={idPrefix + "-payment-title"}
      className="h-fit overflow-hidden rounded-lg bg-white"
    >
      <h2
        id={idPrefix + "-payment-title"}
        className="text-mobile-h6 lg:text-desktop-h6 text-neutral-1000 px-4 pt-8 pb-8"
      >
        جزئیات پرداخت
      </h2>
      <dl className="text-mobile-body-s lg:text-desktop-body-s text-neutral-800">
        <div className="flex items-baseline justify-between gap-4 px-4 py-4">
          <dt className="min-w-0 leading-relaxed">
            مجموع قیمت کالاها{quantityLabel}
          </dt>
          <dd className="text-mobile-label-m lg:text-desktop-label-m shrink-0">
            {paymentDetails ? (
              <SummaryPrice
                toman={
                  paymentDetails.chinaTotalToman ??
                  paymentDetails.iranTotalToman
                }
                cny={paymentDetails.chinaTotalCny}
              />
            ) : (
              <bdi>
                {getCartFieldNote(dataIssues, "subtotal") ||
                  money(totals.originalSubtotal, currency)}
              </bdi>
            )}
          </dd>
        </div>
        {costs.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 px-4 py-4"
          >
            <dt className="min-w-0 leading-relaxed">{label}</dt>
            <dd className="text-mobile-label-m lg:text-desktop-label-m shrink-0">
              <bdi>{money(value, "TOMAN")}</bdi>
            </dd>
          </div>
        ))}
        {showSavings && (
          <div className="bg-primary-50 text-primary-900 flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="min-w-0 leading-relaxed">سود شما از خرید</dt>
            <dd className="text-mobile-label-m lg:text-desktop-label-m shrink-0">
              <bdi>{money(savings, paymentDetails ? "TOMAN" : currency)}</bdi>
            </dd>
          </div>
        )}
        {!isExpressOnly && (
          <div className="flex items-baseline justify-between gap-4 px-4 pt-7 pb-6 text-neutral-900">
            <dt className="text-mobile-body-m lg:text-desktop-body-m leading-relaxed">
              مجموع سبد خرید
            </dt>
            <dd className="text-mobile-h6 lg:text-desktop-h6 shrink-0">
              <bdi>
                {getCartFieldNote(dataIssues, "final_total") ||
                  money(totals.total, currency)}
              </bdi>
            </dd>
          </div>
        )}
      </dl>
      <div className="space-y-4 px-4 pt-4 pb-7">
        {requiresExpressQuote && (
          <p className="text-mobile-caption lg:text-desktop-caption text-secondary-600 flex items-start gap-1.5 pt-6 pb-4 leading-6">
            <Info size={14} aria-hidden="true" className="mt-1 shrink-0" />
            <span>
              هزینه حمل و نقل بین‌الملل، بیمه و ترخیص محصولاتی که با روش حمل
              هوایی اکسپرس انتخاب شده‌اند، توسط کارشناسان جداگانه استعلام
              می‌شود.
            </span>
          </p>
        )}
        <Button
          type="button"
          onClick={onContinue}
          disabled={
            disabled || isSubmitting || !onContinue || totals.quantity === 0
          }
          aria-busy={isSubmitting}
          aria-describedby={
            unavailableReason ? idPrefix + "-checkout-unavailable" : undefined
          }
          className="text-mobile-label-l lg:text-desktop-label-l disabled:bg-primary-700 h-12 w-full rounded-lg px-4 text-white!"
        >
          {isSubmitting ? "در حال ثبت اولیه…" : "ثبت اولیه"}
        </Button>
        {unavailableReason && (
          <p
            id={idPrefix + "-checkout-unavailable"}
            className="text-mobile-caption lg:text-desktop-caption text-secondary-600 leading-6"
          >
            {unavailableReason}
          </p>
        )}
        <p className="text-mobile-caption lg:text-desktop-caption text-secondary-600 flex items-start gap-1.5 leading-6">
          <Info size={14} aria-hidden="true" className="mt-1 shrink-0" />
          <span>
            پس از ثبت اولیه سفارش و تأیید کارشناسان، قیمت نهایی قابل پرداخت و
            ادامهٔ روند نهایی کردن سفارش به شما اطلاع‌رسانی خواهد شد.
          </span>
        </p>
      </div>
    </aside>
  );
};
export default CartSummary;
