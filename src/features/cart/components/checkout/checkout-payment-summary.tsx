"use client";
import { X } from "lucide-react";
import { useCheckoutDocument } from "../../hooks/use-checkout-document";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { CheckoutPayment } from "../../types/domain/checkout-payment.types";
import type { CheckoutPaymentMethod } from "../../types/domain/checkout.types";
import { formatCartMoney } from "../../utils/cart.utils";
export default function CheckoutPaymentSummary({
  data,
  method,
  canPay = false,
  isSubmitting = false,
  onPay,
  coupon,
  remainingSeconds = null,
  onCancel,
}: {
  data: CheckoutPayment;
  method: CheckoutPaymentMethod | null;
  canPay?: boolean;
  isSubmitting?: boolean;
  onPay?: () => void;
  coupon?: ReactNode;
  remainingSeconds?: number | null;
  onCancel?: () => void;
}) {
  const document = useCheckoutDocument();
  const proformaUrl = data.proforma.available ? data.proforma.url : null;
  const money = (value: string | null) =>
    formatCartMoney(
      value,
      data.currency === "IRR"
        ? "ریال"
        : data.currency === "TOMAN"
          ? "تومان"
          : (data.currency ?? "(واحد از بک مشخص نشده)"),
    );
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-6 lg:block lg:space-y-4">
      <section className="order-2 rounded-lg bg-white py-6 sm:py-8 lg:order-none">
        <div className="mb-10 flex items-center justify-between gap-3 px-4">
          <h2 className="text-mobile-h6 lg:text-desktop-h6 text-neutral-1000">
            جزئیات پرداخت
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={!onCancel || isSubmitting}
            className="text-mobile-caption lg:text-desktop-caption text-error inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={14} aria-hidden="true" />
            لغو سفارش
          </button>
        </div>
        <dl className="text-mobile-body-s lg:text-desktop-body-s space-y-6 leading-6 text-neutral-800">
          {data.rows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-x-3 px-4 text-right leading-5"
              dir="rtl"
            >
              <dt className="text-mobile-body-s lg:text-desktop-body-s min-w-0 leading-5 text-neutral-800">
                {row.key === "items_total"
                  ? "مجموع قیمت کالاها (" +
                    data.quantity.toLocaleString("fa-IR") +
                    " کالا)"
                  : row.label}
              </dt>
              <dd
                className="text-mobile-label-m lg:text-desktop-label-m flex items-center justify-end gap-1 text-left leading-5 whitespace-nowrap text-neutral-800"
                dir="rtl"
              >
                <bdi>
                  {money(row.amount).replace(
                    /\d/g,
                    (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)],
                  )}
                </bdi>
                {row.key === "items_total" && data.goodsPriceCny && (
                  <>
                    <span aria-hidden="true">≈</span>
                    <bdi dir="ltr">
                      ¥{formatCartMoney(data.goodsPriceCny, "").trim()}
                    </bdi>
                  </>
                )}
              </dd>
            </div>
          ))}
          {data.savings && /[1-9]/.test(data.savings.amount) && (
            <div className="bg-primary-100 text-primary-800 flex items-center justify-between gap-3 px-4 py-2">
              <dt className="text-mobile-body-s lg:text-desktop-body-s text-primary-800">
                سود شما از خرید
              </dt>
              <dd className="text-mobile-label-m lg:text-desktop-label-m text-primary-800 leading-6">
                <bdi>
                  {money(data.savings.amount)} ≈ ¥
                  {formatCartMoney(data.savings.cny, "").trim()}
                </bdi>
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 px-4 pt-1 text-neutral-900">
            <dt className="text-mobile-label-l lg:text-desktop-label-l text-neutral-900">
              قیمت نهایی
            </dt>
            <dd className="text-mobile-label-l lg:text-desktop-label-l leading-6 text-neutral-900">
              <bdi>{money(data.total)}</bdi>
            </dd>
          </div>
        </dl>
        {data.pricingIssue && (
          <p
            role="status"
            className="px-3 pt-3 text-[10px] leading-5 text-amber-700 sm:px-5 sm:pt-4 sm:text-xs sm:leading-6"
          >
            {data.pricingIssue}
          </p>
        )}
        <div className="mt-4 space-y-4 px-3 sm:mt-6 sm:px-5">
          <Button
            type="button"
            variant="secondary"
            disabled={!proformaUrl || document.loading}
            onClick={() => void document.openDocument(proformaUrl)}
            aria-busy={document.loading}
            className="text-mobile-label-l lg:text-desktop-label-l border-primary-500 text-primary-700! h-11 w-full rounded-lg"
          >
            {document.loading
              ? "در حال دریافت پیش‌فاکتور…"
              : "مشاهده پیش‌فاکتور"}
          </Button>
          <Button
            type="button"
            disabled={!canPay || isSubmitting || !onPay}
            onClick={onPay}
            aria-busy={isSubmitting}
            className="text-mobile-label-l lg:text-desktop-label-l h-11 w-full rounded-lg text-white! disabled:bg-neutral-500 disabled:opacity-100"
          >
            {isSubmitting
              ? "در حال ثبت پرداخت…"
              : method === "bank-transfer"
                ? "بارگذاری رسید پرداخت"
                : method === "foreign-transfer"
                  ? "پرداخت حواله ارزی"
                  : "پرداخت"}
          </Button>
          {remainingSeconds != null && (
            <p className="text-mobile-body-s lg:text-desktop-body-s flex items-center justify-center gap-4 leading-6 text-neutral-800">
              <span>مهلت پرداخت</span>
              <bdi
                dir="ltr"
                role="timer"
                aria-label="زمان باقی‌مانده پرداخت"
                className="text-secondary-600 tabular-nums"
              >
                {[
                  Math.floor(Math.max(0, remainingSeconds) / 3600),
                  Math.floor(Math.max(0, remainingSeconds) / 60) % 60,
                  Math.floor(Math.max(0, remainingSeconds)) % 60,
                ]
                  .map((value) =>
                    value.toLocaleString("fa-IR", {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    }),
                  )
                  .join(" : ")}
              </bdi>
            </p>
          )}
          {!proformaUrl && data.proforma.message && (
            <p className="text-mobile-caption lg:text-desktop-caption leading-6 text-neutral-700">
              {data.proforma.message}
            </p>
          )}
          {document.error && (
            <p
              role="alert"
              className="text-mobile-caption lg:text-desktop-caption text-error leading-6"
            >
              {document.error}
            </p>
          )}
        </div>
      </section>
      {coupon && <div className="order-1 lg:order-none">{coupon}</div>}
    </aside>
  );
}
