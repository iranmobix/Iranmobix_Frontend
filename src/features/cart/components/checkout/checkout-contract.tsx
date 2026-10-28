"use client";
import { Button } from "@/components/ui/button";
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
  const { openDocument, loading, error } = useCheckoutDocument();
  return (
    <section className="rounded-lg bg-white p-3 text-[10px] leading-6 sm:p-5 sm:text-xs sm:leading-7">
      <Button
        type="button"
        variant="ghost"
        onClick={() => void openDocument(contract?.pdfUrl ?? null)}
        disabled={loading || !contract?.pdfUrl}
        className="sm:text-label-lg h-auto min-h-0 px-0 py-0 text-[10px] sm:h-11 sm:px-6 sm:py-0"
      >
        {loading
          ? "در حال دریافت قرارداد…"
          : contract?.title || "مطالعه پیش‌قرارداد"}
      </Button>
      <label className="flex items-center gap-2 text-[10px] font-medium sm:text-xs">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled || !contract || !contract.pdfUrl}
          className="accent-primary-500 size-3.5 sm:size-4"
        />
        با تمامی موارد قرارداد موافقم.
      </label>
      {!contract?.pdfUrl && (
        <p className="text-neutral-700">فایل قرارداد از بک دریافت نشده است.</p>
      )}
      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}
    </section>
  );
}
