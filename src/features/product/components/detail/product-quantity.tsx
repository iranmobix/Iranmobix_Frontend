"use client";

import Image from "next/image";
import { useId, useState } from "react";

import plus1 from "../../assets/plus1.svg";
import minus from "../../assets/minus.svg";

type ProductQuantityProps = {
  value: number;
  onChange: (value: number) => void;
  onEditingChange?: (editing: boolean) => void;
  maximum: number;
  disabled: boolean;
  stock: number | null;
};

const ProductQuantity = ({
  value: displayedQuantity,
  onChange,
  onEditingChange,
  maximum: maximumQuantity,
  disabled: isDisabled,
  stock,
}: ProductQuantityProps) => {
  const [draft, setDraft] = useState<{ source: number; text: string } | null>(
    null,
  );
  const inputText =
    draft?.source === displayedQuantity
      ? draft.text
      : String(displayedQuantity);
  const inputId = useId();
  const stockId = useId();
  const showStock = stock !== null && stock > 0;

  const changeQuantity = (direction: number) => {
    if (isDisabled) return;
    setDraft(null);
    onEditingChange?.(false);

    onChange(
      Math.min(Math.max(displayedQuantity + direction, 1), maximumQuantity),
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="lg:text-desktop-label-m lg:text-neutral-1000 text-xs leading-5 text-neutral-900"
      >
        تعداد
      </label>

      <div className="flex h-10 items-center gap-1">
        <button
          type="button"
          onClick={() => changeQuantity(1)}
          disabled={isDisabled || displayedQuantity >= maximumQuantity}
          aria-label="افزایش تعداد"
          className="flex h-10 w-6 shrink-0 items-center justify-center rounded focus-visible:ring-2 focus-visible:ring-[#5945b0] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Image src={plus1} alt="" width={20} height={20} />
        </button>

        <input
          id={inputId}
          aria-describedby={showStock ? stockId : undefined}
          placeholder="تعداد را وارد کنید"
          type="text"
          role="spinbutton"
          inputMode="numeric"
          aria-valuemin={isDisabled ? 0 : 1}
          aria-valuemax={maximumQuantity}
          aria-valuenow={
            inputText && Number(inputText) >= 1 ? displayedQuantity : undefined
          }
          value={inputText}
          onFocus={(event) => event.currentTarget.select()}
          onClick={(event) => event.currentTarget.select()}
          disabled={isDisabled}
          onChange={(event) => {
            const text = event.target.value
              .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
              .replace(/[٠-٩]/g, (digit) =>
                String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
              );
            if (!/^\d*$/.test(text)) return;
            const value = text === "" ? null : Number(text);
            const valid =
              value !== null &&
              Number.isSafeInteger(value) &&
              value >= 1 &&
              value <= maximumQuantity;
            setDraft({ source: valid ? value : displayedQuantity, text });
            onEditingChange?.(!valid);
            if (valid) onChange(value);
          }}
          onBlur={() => {
            if (inputText && Number.isSafeInteger(Number(inputText)))
              onChange(
                Math.min(Math.max(Number(inputText), 1), maximumQuantity),
              );
            setDraft(null);
            onEditingChange?.(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault();
              changeQuantity(event.key === "ArrowUp" ? 1 : -1);
            }
          }}
          className="h-10 w-full min-w-0 [appearance:textfield] rounded-md border border-[#dedbd5] bg-white px-3 text-center text-xs text-neutral-700 outline-none focus-visible:ring-2 focus-visible:ring-[#5945b0] disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => changeQuantity(-1)}
          disabled={isDisabled || displayedQuantity <= 1}
          aria-label="کاهش تعداد"
          className="flex h-10 w-6 shrink-0 items-center justify-center rounded focus-visible:ring-2 focus-visible:ring-[#5945b0] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Image src={minus} alt="" width={20} height={20} />
        </button>
      </div>

      {showStock && (
        <span id={stockId} className="text-xs leading-5 text-[#b29429]">
          موجودی: {stock.toLocaleString("fa-IR")}
        </span>
      )}
    </div>
  );
};

export default ProductQuantity;
