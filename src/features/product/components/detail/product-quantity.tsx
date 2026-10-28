"use client";

import Image from "next/image";
import { useId } from "react";

import plus1 from "../../assets/plus1.svg";
import minus from "../../assets/minus.svg";

type ProductQuantityProps = {
  value: number;
  onChange: (value: number) => void;
  maximum: number;
  disabled: boolean;
  stock: number | null;
};

const ProductQuantity = ({
  value: displayedQuantity,
  onChange,
  maximum: maximumQuantity,
  disabled: isDisabled,
  stock,
}: ProductQuantityProps) => {
  const inputId = useId();
  const stockId = useId();
  const showStock = stock !== null && stock > 0;

  const changeQuantity = (direction: number) => {
    if (isDisabled) return;

    onChange(
      Math.min(Math.max(displayedQuantity + direction, 1), maximumQuantity),
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs leading-5 text-neutral-900">
        تعداد
      </label>

      <div className="flex h-10 items-center gap-1">
        <button
          type="button"
          onClick={() => changeQuantity(1)}
          disabled={isDisabled || displayedQuantity >= maximumQuantity}
          aria-label="افزایش تعداد"
          className="flex h-10 w-6 shrink-0 items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5945b0] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Image src={plus1} alt="" width={20} height={20} />
        </button>

        <input
          id={inputId}
          aria-describedby={showStock ? stockId : undefined}
          placeholder="تعداد را وارد کنید"
          type="number"
          inputMode="numeric"
          min={isDisabled ? 0 : 1}
          max={maximumQuantity}
          step={1}
          value={displayedQuantity}
          disabled={isDisabled}
          onChange={(event) => {
            const value = event.target.valueAsNumber;

            if (
              Number.isSafeInteger(value) &&
              value >= 1 &&
              value <= maximumQuantity
            ) {
              onChange(value);
            }
          }}
          className="h-10 w-full min-w-0 rounded-md border border-[#dedbd5] bg-white px-3 text-center text-xs text-neutral-700 outline-none [appearance:textfield] focus-visible:ring-2 focus-visible:ring-[#5945b0] disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => changeQuantity(-1)}
          disabled={isDisabled || displayedQuantity <= 1}
          aria-label="کاهش تعداد"
          className="flex h-10 w-6 shrink-0 items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5945b0] disabled:cursor-not-allowed disabled:opacity-40"
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
