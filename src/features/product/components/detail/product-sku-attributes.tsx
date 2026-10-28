"use client";
import { useId } from "react";
import { ChevronDown } from "lucide-react";
import {
  getProductSkuValues,
  isProductColorAttribute,
} from "../../utils/product-sku-selection";
import type { ProductPriceAttribute } from "../../types/domain/product-detail-price.types";

type Props = {
  attributes: readonly ProductPriceAttribute[];
  value: Readonly<Record<string, string>>;
  onChange: (name: string, value: string) => void;
  disabled?: boolean;
};

export default function ProductSkuAttributes({
  attributes,
  value,
  onChange,
  disabled,
}: Props) {
  const id = useId();
  if (!attributes.length) return null;
  return (
    <fieldset disabled={disabled} className="grid min-w-0 grid-cols-1 gap-3">
      <legend className="sr-only">ویژگی‌های قابل انتخاب محصول</legend>
      {attributes.map((attribute, index) => {
        const selectId = id + "-" + index;
        const options = getProductSkuValues(attribute);
        const selected = Object.prototype.hasOwnProperty.call(
          value,
          attribute.name,
        )
          ? value[attribute.name]
          : "";
        return (
          <div
            key={attribute.name + ":" + index}
            className="flex min-w-0 flex-col gap-1.5"
          >
            <label
              htmlFor={selectId}
              className="text-xs leading-5 text-neutral-900"
            >
              {isProductColorAttribute(attribute)
                ? "رنگ"
                : attribute.name || "ویژگی محصول"}
            </label>
            <div className="relative">
              <select
                id={selectId}
                value={selected}
                onChange={(event) =>
                  onChange(attribute.name, event.target.value)
                }
                disabled={!attribute.name.trim() || options.length === 0}
                required
                className="h-10 w-full appearance-none rounded-md border border-[#dedbd5] bg-white pl-9 pr-3 text-xs text-neutral-700 outline-none focus-visible:ring-2 focus-visible:ring-[#5945b0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  {options.length
                    ? "انتخاب کنید…"
                    : "گزینه‌ای از بک دریافت نشده است"}
                </option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}
