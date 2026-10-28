"use client";

import Image from "next/image";
import type { ProductColorFilterOption } from "../../types/domain";
import arrow from "../../assets/arrow.svg";
import { toggleFilterValue } from "../../utils";

type ProductColorFilterProps = {
  colors: ProductColorFilterOption[];
  value: number[];
  onChange: (colors: number[]) => void;
  isOpen: boolean;
  onToggle: () => void;
};

const ProductColorFilter = ({
  colors,
  value,
  onChange,
  isOpen,
  onToggle,
}: ProductColorFilterProps) => {
  const handleChange = (colorId: number) => {
    onChange(toggleFilterValue(value, colorId));
  };

  return (
    <div dir="rtl" className="border-b border-gray-200">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="باز کردن رنگ"
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between"
      >
        <span className="text-label-md text-neutral-900">رنگ</span>

        <span
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <Image src={arrow} alt="" width={16} height={16} />
        </span>
      </button>

      {isOpen && (
        <div className="pb-4">
          {colors.length > 0 ? (
            <div className="grid grid-cols-4 gap-x-3 gap-y-4">
              {colors.map((color) => {
                const isSelected = value.includes(color.id);

                return (
                  <label
                    key={color.id}
                    className="group flex min-w-0 cursor-pointer flex-col items-center gap-2 text-center"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleChange(color.id)}
                      className="peer sr-only"
                    />

                    <span
                      aria-hidden="true"
                      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full
    border border-black/10 transition-all
    group-hover:scale-105
    peer-focus-visible:outline peer-focus-visible:outline-2
    peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#5542b5]
    ${
      isSelected
        ? "ring-2 ring-primary-500 ring-offset-2"
        : "ring-2 ring-neutral-200 ring-offset-2"
    }`}
                      style={{ backgroundColor: color.value }}
                    >
                      {isSelected && (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                      )}
                    </span>

                    <span
                      title={color.name}
                      className={`w-full truncate text-xs ${
                        isSelected
                          ? "font-semibold text-[#5542b5]"
                          : "text-neutral-700"
                      }`}
                    >
                      {color.name}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="py-2 text-sm text-gray-500">رنگی پیدا نشد.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductColorFilter;
