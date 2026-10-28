"use client";
import { useState, type FormEvent } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
function couponErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data;
    const field = body?.error?.fields?.coupon_code ?? body?.coupon_code;
    const message = Array.isArray(field)
      ? field.find((value) => typeof value === "string")
      : field;
    if (typeof message === "string") return message;
    const detail = body?.error?.message ?? body?.detail;
    if (typeof detail === "string") return detail;
    if ([400, 404, 422].includes(error.response?.status ?? 0))
      return "کد تخفیف معتبر نیست.";
  }
  return "بررسی کد تخفیف ناموفق بود؛ دوباره تلاش کنید.";
}
export default function CheckoutCoupon({
  applied,
  onApply,
  disabled,
  pending = false,
  error,
}: {
  applied: string;
  onApply: (code: string) => void;
  disabled: boolean;
  pending?: boolean;
  error?: unknown;
}) {
  const [draft, setDraft] = useState(applied);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!disabled && draft.trim()) onApply(draft.trim());
  };
  return (
    <section className="rounded-lg bg-white p-2.5 text-[10px] leading-5 sm:p-5 sm:text-xs sm:leading-6">
      <h2 className="mb-2 text-[11px] font-medium sm:text-xs">
        کد تخفیف دارید؟
      </h2>
      <form onSubmit={submit} className="flex gap-2">
        <input
          aria-label="کد تخفیف"
          aria-invalid={Boolean(error)}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={disabled}
          className="h-8 min-w-0 flex-1 rounded border border-neutral-300 px-2 text-xs sm:h-11"
        />
        <Button
          type="submit"
          disabled={disabled || !draft.trim()}
          className="sm:text-label-lg h-8 px-3 text-[10px] sm:h-11 sm:px-6"
        >
          {pending ? "در حال بررسی…" : "اعمال"}
        </Button>
      </form>
      {Boolean(error) && (
        <p role="alert" className="mt-2 text-red-500">
          {couponErrorMessage(error)}
        </p>
      )}
      {applied && (
        <div className="mt-2 flex items-center gap-2">
          <span>کد اعمال‌شده:</span>
          <bdi>{applied}</bdi>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onApply("")}
            disabled={disabled}
          >
            حذف کد
          </Button>
        </div>
      )}
    </section>
  );
}
