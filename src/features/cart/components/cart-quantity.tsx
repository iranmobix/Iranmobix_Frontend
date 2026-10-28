"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import {
  normalizeQuantityDigits,
  isValidCartQuantity,
} from "../utils/cart.utils";

type CartQuantityProps = {
  value: number;
  min: number;
  max: number;
  productTitle: string;
  onChange?: (value: number) => void;
  disabled?: boolean;
  describedBy?: string;
  compactMobile?: boolean;
};

const CartQuantity = ({
  value,
  min,
  max,
  productTitle,
  onChange,
  disabled = false,
  describedBy,
  compactMobile = false,
}: CartQuantityProps) => {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState("");

  const parseQuantity = (input: string): number | null => {
    const normalized = normalizeQuantityDigits(input);
    const next = /^\d+$/.test(normalized) ? Number(normalized) : NaN;
    return isValidCartQuantity({ minQuantity: min, maxQuantity: max }, next)
      ? next
      : null;
  };

  const commit = () => {
    if (draft === null || disabled || !onChange) return;
    const next = parseQuantity(draft);
    if (next === null) {
      setError(
        `تعداد باید بین ${min.toLocaleString("fa-IR")} و ${max.toLocaleString("fa-IR")} باشد؛ مقدار قبلی حفظ شد.`,
      );
    } else {
      if (next !== value) onChange(next);
      setError("");
    }
    setDraft(null);
  };

  const changeBy = (offset: number) => {
    if (disabled || !onChange) return;
    setDraft(null);
    setError("");
    onChange?.(Math.min(max, Math.max(min, value + offset)));
  };

  return (
    <div className="max-w-56">
      <div
        dir="ltr"
        role="group"
        aria-label={`تعداد ${productTitle}`}
        className="flex items-center gap-1"
      >
        <button
          type="button"
          onClick={() => changeBy(-1)}
          disabled={disabled || !onChange || value <= min}
          aria-label={`کاهش تعداد ${productTitle}`}
          className={`text-primary-500 focus-visible:ring-primary-300 flex items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none disabled:opacity-30 ${compactMobile ? "size-6 sm:size-8" : "size-8"}`}
        >
          <Minus
            size={16}
            aria-hidden="true"
            className={compactMobile ? "size-3.5 sm:size-4" : undefined}
          />
        </button>
        <input
          aria-label={`تعداد ${productTitle}`}
          aria-describedby={error ? id : describedBy}
          readOnly={disabled || !onChange}
          aria-invalid={Boolean(error)}
          inputMode="numeric"
          autoComplete="off"
          value={draft ?? (Number.isFinite(value) ? value.toLocaleString("fa-IR", { useGrouping: false }) : "")}
          placeholder={Number.isFinite(value) ? undefined : "—"}
          onChange={(event) => {
            setDraft(event.target.value);
            setError("");
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
            if (event.key === "Escape") {
              setDraft(null);
              setError("");
            }
          }}
          className={`focus-visible:ring-primary-300 rounded-md border border-neutral-300 bg-white px-1 text-center tabular-nums focus-visible:ring-2 focus-visible:outline-none ${compactMobile ? "h-6 w-9 text-[10px] sm:h-8 sm:w-10 sm:text-xs" : "h-8 w-10 text-xs"}`}
        />
        <button
          type="button"
          onClick={() => changeBy(1)}
          disabled={disabled || !onChange || value >= max}
          aria-label={`افزایش تعداد ${productTitle}`}
          className={`text-primary-500 focus-visible:ring-primary-300 flex items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none disabled:opacity-30 ${compactMobile ? "size-6 sm:size-8" : "size-8"}`}
        >
          <Plus
            size={16}
            aria-hidden="true"
            className={compactMobile ? "size-3.5 sm:size-4" : undefined}
          />
        </button>
      </div>
      {error && (
        <p id={id} role="alert" className="mt-2 text-xs leading-5 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default CartQuantity;
