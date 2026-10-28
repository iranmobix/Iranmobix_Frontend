"use client";

import { ProductSellerTypeApi } from "../../types/api";
import { ProductSellerTypeFilterOption } from "../../types/domain";
import Image from "next/image";
import arrow from "../../assets/arrow.svg";
import { toggleFilterValue } from "../../utils";

type ProductSellerTypeFilterProps = {
  sellerTypes: ProductSellerTypeFilterOption[];
  value: ProductSellerTypeApi[];
  onChange: (sellerTypes: ProductSellerTypeApi[]) => void;

  isOpen: boolean;
  onToggle: () => void;
};

const ProductSellerTypeFilter = ({
  sellerTypes,
  value,
  onChange,
  isOpen,
  onToggle,
}: ProductSellerTypeFilterProps) => {
  const handleChange = (sellerType: ProductSellerTypeApi) => {
    onChange(toggleFilterValue(value, sellerType));
  };

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="باز کردن نوع فروشنده"
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between"
      >
        <span className="text-label-md text-neutral-900">نوع فروشنده</span>

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
          {sellerTypes.map((sellerType) => {
            const isSelected = value.includes(sellerType.value);

            return (
              <label
                key={sellerType.value}
                className="flex cursor-pointer items-center gap-2 py-1.5"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleChange(sellerType.value)}
                />

                <span className="text-sm">{sellerType.label}</span>
              </label>
            );
          })}

          {sellerTypes.length === 0 && (
            <p className="py-2 text-sm text-gray-500">
              نوع فروشنده‌ای پیدا نشد.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSellerTypeFilter;
