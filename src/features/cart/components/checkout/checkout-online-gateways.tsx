"use client";
import { Button } from "@/components/ui/button";
import type { OnlineGateway } from "../../types/domain/online-payment.types";
export default function CheckoutOnlineGateways({
  items,
  value,
  onChange,
  pending,
  error,
  disabled,
  onRetry,
}: {
  items: OnlineGateway[];
  value: string | null;
  onChange: (code: string) => void;
  pending: boolean;
  error: boolean;
  disabled: boolean;
  onRetry: () => void;
}) {
  return (
    <section className="space-y-2 rounded-lg bg-white p-2.5 text-[10px] leading-5 sm:space-y-3 sm:p-5 sm:text-xs sm:leading-6">
      <h2 className="font-medium">انتخاب درگاه پرداخت</h2>
      {pending && <p role="status">در حال دریافت درگاه‌ها…</p>}
      {error && (
        <div role="alert">
          دریافت درگاه‌ها ناموفق بود.
          <Button
            type="button"
            variant="ghost"
            onClick={onRetry}
            disabled={pending}
          >
            تلاش مجدد
          </Button>
        </div>
      )}
      {!pending && !error && !items.some((g) => g.enabled && g.selectable) && (
        <p>درگاه فعال از بک دریافت نشده است.</p>
      )}
      {items.map((g) => (
        <label
          key={g.code}
          className="border-primary-100 flex cursor-pointer items-start gap-2 rounded border p-2 sm:p-3"
        >
          <input
            type="radio"
            name="online-gateway"
            value={g.code}
            checked={g.code === value && g.enabled && g.selectable}
            disabled={disabled || !g.enabled || !g.selectable}
            onChange={() => onChange(g.code)}
            className="accent-primary-500 mt-1"
          />
          <span>
            {g.title}
            {g.isSandbox && (
              <span className="mr-2 text-amber-700">آزمایشی</span>
            )}
            {g.reason && (
              <span className="block text-neutral-700">{g.reason}</span>
            )}
          </span>
        </label>
      ))}
    </section>
  );
}
