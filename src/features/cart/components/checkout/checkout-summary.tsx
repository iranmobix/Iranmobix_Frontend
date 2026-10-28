"use client";

import { useId, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import CheckoutDialog from "./checkout-dialog";
import { Button } from "@/components/ui/button";
import type {
  CheckoutAddress,
  CheckoutCoupon,
  CheckoutPaymentMethod,
  CheckoutTotals,
} from "../../types/domain/checkout.types";
import { formatCheckoutMoney } from "../../utils/cart.utils";

const paymentButtonLabels: Record<CheckoutPaymentMethod, string> = {
  online: "پرداخت",
  wallet: "پرداخت",
  "bank-transfer": "بارگذاری رسید پرداخت",
  "foreign-transfer": "پرداخت حواله ارزی",
};

// Both the sidebar and invoice render the same calculated totals.
const PriceBreakdown = ({ totals }: { totals: CheckoutTotals }) => {
  const rows = [
    {
      label: `مجموع قیمت کالاها (${totals.quantity.toLocaleString("fa-IR")} عدد)`,
      value: totals.goodsIrr,
    },
    { label: "هزینه ارسال و بسته‌بندی", value: totals.packingIrr },
    { label: "هزینه ارسال خارجی", value: totals.internationalShippingIrr },
    { label: "هزینه ارسال داخلی", value: totals.domesticShippingIrr },
  ];
  return (
    <dl className="space-y-5 text-xs leading-6 text-neutral-800 sm:text-sm">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-wrap items-center justify-between gap-2 px-5"
        >
          <dt>{row.label}</dt>
          <dd>
            <bdi>{formatCheckoutMoney(row.value)}</bdi>
          </dd>
        </div>
      ))}
      {totals.discountIrr > 0 && (
        <div className="flex flex-wrap justify-between gap-2 px-5 text-primary-600">
          <dt>تخفیف</dt>
          <dd>
            <bdi>{formatCheckoutMoney(totals.discountIrr)}</bdi>
          </dd>
        </div>
      )}
      <div className="flex flex-wrap justify-between gap-2 bg-primary-100/70 px-5 py-3">
        <dt>قیمت با تخفیف</dt>
        <dd>
          <bdi>{formatCheckoutMoney(totals.totalIrr)}</bdi>
        </dd>
      </div>
      <div className="flex flex-wrap justify-between gap-2 px-5 text-neutral-1000">
        <dt>قیمت نهایی</dt>
        <dd className="flex flex-wrap items-center gap-2 font-medium">
          {totals.discountIrr > 0 && (
            <del className="text-xs font-normal text-neutral-600">
              <bdi>{formatCheckoutMoney(totals.totalBeforeDiscountIrr)}</bdi>
            </del>
          )}
          <bdi>{formatCheckoutMoney(totals.totalIrr)}</bdi>
        </dd>
      </div>
    </dl>
  );
};

type CheckoutSummaryProps = {
  totals: CheckoutTotals;
  address: CheckoutAddress | null;
  validityDays: number;
  canPay: boolean;
  paymentMethod: CheckoutPaymentMethod | null;
  coupon: CheckoutCoupon | null;
  couponError: string;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  onPay: () => void;
  onCancelOrder: () => void;
};

const CheckoutSummary = ({
  totals,
  address,
  validityDays,
  canPay,
  paymentMethod,
  coupon,
  couponError,
  onApplyCoupon,
  onRemoveCoupon,
  onPay,
  onCancelOrder,
}: CheckoutSummaryProps) => {
  const id = useId();
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [code, setCode] = useState("");
  const applyCoupon = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApplyCoupon(code);
  };

  return (
    <aside
      aria-label="جزئیات پرداخت و تخفیف"
      className="space-y-6 lg:sticky lg:top-6"
    >
      <section
        aria-labelledby={`${id}-summary`}
        className="overflow-hidden rounded-lg bg-white py-6"
      >
        <div className="mb-8 flex items-center justify-between gap-3 px-5">
          <h2
            id={`${id}-summary`}
            className="text-body-md font-medium text-neutral-1000"
          >
            جزئیات پرداخت
          </h2>
          <span className="text-xs text-red-500">
            {validityDays.toLocaleString("fa-IR")} روز اعتبار
          </span>
        </div>
        <PriceBreakdown totals={totals} />
        <div className="mt-7 space-y-3 px-5">
          <Button
            type="button"
            disabled={!canPay}
            onClick={onPay}
            className="w-full disabled:bg-neutral-400 disabled:text-white"
          >
            {paymentButtonLabels[paymentMethod ?? "online"]}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setInvoiceOpen(true)}
            className="w-full rounded-md text-sm"
          >
            مشاهده پیش‌فاکتور
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancelOrder}
            className="w-full text-sm text-red-500 hover:text-red-600"
          >
            لغو سفارش
          </Button>
        </div>
      </section>

      <section
        aria-labelledby={`${id}-coupon-label`}
        className="rounded-lg bg-white p-5"
      >
        <h2 id={`${id}-coupon-label`} className="mb-4 text-sm text-neutral-900">
          کد تخفیف دارید؟
        </h2>
        {coupon ? (
          <div className="flex items-center justify-between gap-3 rounded-md bg-primary-50 p-3 text-sm text-primary-700">
            <bdi>{coupon.code}</bdi>
            <button
              type="button"
              onClick={onRemoveCoupon}
              aria-label="حذف کد تخفیف"
              className="rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <form onSubmit={applyCoupon} className="flex gap-2">
            <input
              aria-labelledby={`${id}-coupon-label`}
              aria-describedby={couponError ? `${id}-coupon-error` : undefined}
              aria-invalid={Boolean(couponError)}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
              maxLength={40}
              dir="ltr"
              className="h-11 min-w-0 flex-1 rounded-md border border-neutral-300 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            />
            <Button type="submit" className="px-4">
              اعمال
            </Button>
          </form>
        )}
        {couponError && (
          <p
            id={`${id}-coupon-error`}
            role="alert"
            className="mt-3 text-xs text-red-500"
          >
            {couponError}
          </p>
        )}
      </section>

      {invoiceOpen && (
        <CheckoutDialog
          title="پیش‌فاکتور"
          onDismiss={() => setInvoiceOpen(false)}
        >
          <PriceBreakdown totals={totals} />
          <p className="p-5 text-sm leading-7 text-neutral-700">
            {address
              ? `آدرس تحویل: ${address.description}`
              : "آدرس تحویل انتخاب نشده است."}
          </p>
          <p className="px-5 pb-5 text-xs text-neutral-600">
            پیش‌نمایش آزمایشی؛ این سند فاکتور پرداخت‌شده نیست.
          </p>
        </CheckoutDialog>
      )}
    </aside>
  );
};

export default CheckoutSummary;
