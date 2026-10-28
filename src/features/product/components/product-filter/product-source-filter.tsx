"use client";

import type { ProductSourceFilterOption } from "../../types/domain";
import Image from "next/image";
import arrow from "../../assets/arrow.svg";
import { toggleFilterValue } from "../../utils";

type ProductSourceFilterProps = {
  sources: ProductSourceFilterOption[];
  value: string[];
  onChange: (sources: string[]) => void;

  isOpen: boolean;
  onToggle: () => void;
};

const ProductSourceFilter = ({
  sources,
  value,
  onChange,
  isOpen,
  onToggle,
}: ProductSourceFilterProps) => {
  const handleChange = (source: string) => {
    onChange(toggleFilterValue(value, source));
  };

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="باز کردن سایت مرجع"
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between"
      >
        <span className="text-label-md text-neutral-900">سایت مرجع</span>

        <span
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <Image src={arrow} alt="" width={16} height={16} />
        </span>
      </button>

      {isOpen && (
        <div className="pb-3">
          {sources.map((source) => {
            const isSelected = value.includes(source.value);

            return (
              <label
                key={source.value}
                className="flex cursor-pointer items-center gap-2 py-1.5"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleChange(source.value)}
                />

                <span className="text-sm">{source.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductSourceFilter;
