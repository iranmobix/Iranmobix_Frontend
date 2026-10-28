"use client";
import { useId } from "react";
import type { CartShippingMethod } from "../types/domain/cart.types";
const methods: ReadonlyArray<{
  value: CartShippingMethod;
  label: string;
  description?: string;
}> = [
  { value: "air_express", label: "هوایی اکسپرس" },
  { value: "commercial_air_iran", label: "هوایی تجاری (تحویل در ایران)" },
  { value: "commercial_air_dubai", label: "هوایی تجاری (تحویل در دبی)" },
  { value: "sea_china_iran", label: "دریایی چین به ایران" },
  { value: "sea_china_dubai", label: "دریایی چین به دبی" },
  { value: "ground_china_iran", label: "زمینی چین به ایران" },
];
export default function CartShippingMethods({
  value,
  onChange,
  disabled,
}: {
  value: CartShippingMethod | null;
  onChange: (value: CartShippingMethod) => void;
  disabled: boolean;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="rounded-lg bg-white p-2.5 sm:p-5">
      <h2
        id={id}
        className="mb-2 text-[11px] font-medium text-neutral-900 sm:mb-4 sm:text-xs"
      >
        انتخاب روش ارسال
      </h2>
      <fieldset disabled={disabled} className="space-y-1.5 sm:space-y-2">
        <legend className="sr-only">روش ارسال سفارش</legend>
        {methods.map((method) => (
          <label
            key={method.value}
            className={
              "focus-within:ring-primary-300 block cursor-pointer rounded-md border px-2 py-1.5 text-[10px] focus-within:ring-2 sm:px-3 sm:py-2 sm:text-[11px] " +
              (value === method.value
                ? "border-primary-500"
                : "border-primary-100")
            }
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name={id}
                value={method.value}
                checked={value === method.value}
                onChange={() => onChange(method.value)}
                className="accent-primary-500 size-3 sm:size-3.5"
              />
              {method.label}
            </span>
            {method.description && (
              <span className="mt-2 block pr-5 text-[11px] text-neutral-600">
                {method.description}
              </span>
            )}
          </label>
        ))}
      </fieldset>
    </section>
  );
}
