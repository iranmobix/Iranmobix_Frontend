"use client";
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
}: {
  data: CheckoutPayment;
  method: CheckoutPaymentMethod | null;
  canPay?: boolean;
  isSubmitting?: boolean;
  onPay?: () => void;
  coupon?: ReactNode;
}) {
  const document = useCheckoutDocument();
  const proformaUrl = data.proforma.available ? data.proforma.url : null;
  const money = (value: string | null) =>
    formatCartMoney(
      value,
      data.currency === "IRR"
        ? "ریال"
        : (data.currency ?? "(واحد از بک مشخص نشده)"),
    );
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-6 lg:block lg:space-y-4">
      <section className="order-2 rounded-lg bg-white py-4 sm:py-6 lg:order-none">
        <h2 className="mb-3 px-3 text-xs font-medium sm:mb-6 sm:px-5 sm:text-sm">
          جزئیات پرداخت
        </h2>
        <dl className="space-y-3 text-[10px] leading-5 sm:space-y-4 sm:text-xs sm:leading-6">
          {data.rows.map((row) => (
            <div
              key={row.key}
              className="flex justify-between gap-4 px-3 sm:px-5"
            >
              <dt>{row.label}</dt>
              <dd>
                <bdi>{money(row.amount)}</bdi>
              </dd>
            </div>
          ))}
          <div className="bg-primary-100 flex justify-between gap-4 px-3 py-2 font-medium sm:px-5 sm:py-3">
            <dt>مبلغ نهایی</dt>
            <dd>
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
        <div className="mt-4 space-y-3 px-3 sm:mt-6 sm:px-5">
          <Button
            type="button"
            disabled={!canPay || isSubmitting || !onPay}
            onClick={onPay}
            aria-busy={isSubmitting}
            className="w-full"
          >
            {isSubmitting
              ? "در حال ثبت پرداخت…"
              : method === "bank-transfer"
                ? "بارگذاری رسید پرداخت"
                : method === "foreign-transfer"
                  ? "پرداخت حواله ارزی"
                  : "پرداخت"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={!proformaUrl || document.loading}
            onClick={() => void document.openDocument(proformaUrl)}
            aria-busy={document.loading}
            className="w-full"
          >
            {document.loading
              ? "در حال دریافت پیش‌فاکتور…"
              : "مشاهده پیش‌فاکتور"}
          </Button>
          <p className="text-xs leading-6 text-neutral-700">
            {proformaUrl
              ? "پیش‌فاکتور آمادهٔ دریافت است."
              : data.proforma.message || "پیش‌فاکتور از بک دریافت نشده است."}
          </p>
          {document.error && (
            <p role="alert" className="text-xs text-red-500">
              {document.error}
            </p>
          )}
        </div>
      </section>
      {coupon && <div className="order-1 lg:order-none">{coupon}</div>}
    </aside>
  );
}
