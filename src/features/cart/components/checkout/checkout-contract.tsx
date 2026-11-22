"use client";

import { useId } from "react";
import type { CheckoutPayment } from "../../types/domain/checkout-payment.types";
import { useCheckoutDocument } from "../../hooks/use-checkout-document";

export default function CheckoutContract({
  contract,
  accepted,
  onChange,
  disabled,
}: {
  contract: CheckoutPayment["contract"];
  accepted: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
}) {
  const checkboxId = useId();
  const { openDocument, loading, error } = useCheckoutDocument();

  return (
    <section
      dir="rtl"
      className="space-y-2 rounded-lg bg-white px-3 py-3 sm:px-4 sm:py-3.5"
    >
      <div className="flex items-start gap-2">
        <input
          id={checkboxId}
          type="checkbox"
          aria-label="با تمامی موارد قرارداد موافقم."
          checked={accepted}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled || !contract?.pdfUrl}
          className="accent-primary-500 focus-visible:ring-primary-300 mt-1 size-3.5 shrink-0 cursor-pointer rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        />
        <p className="text-mobile-body-s lg:text-desktop-body-s text-neutral-1000 leading-5">
          <label htmlFor={checkboxId} className="cursor-pointer">
            با تمامی موارد{" "}
          </label>
          <button
            type="button"
            onClick={() => void openDocument(contract?.pdfUrl ?? null)}
            disabled={loading || !contract?.pdfUrl}
            aria-busy={loading}
            className="text-primary-500 focus-visible:ring-primary-300 decoration-primary-300 inline rounded-sm underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "در حال دریافت…" : "قرارداد"}
          </button>
          <label htmlFor={checkboxId} className="cursor-pointer">
            {" "}
            موافقم.
          </label>
        </p>
      </div>
      <p className="text-mobile-caption lg:text-desktop-caption text-secondary-600 leading-5">
        قرارداد رسمی جهت امضا و ثبت نهایی سفارش، پس از پرداخت در اختیار شما قرار
        می‌گیرد.
      </p>
      {!contract?.pdfUrl && (
        <p className="text-mobile-caption lg:text-desktop-caption leading-5 text-neutral-700">
          قرارداد در حال حاضر در دسترس نیست.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="text-mobile-caption lg:text-desktop-caption text-error leading-5"
        >
          {error}
        </p>
      )}
    </section>
  );
}
