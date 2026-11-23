"use client";

import { ProductSellerTypeApi } from "../../types/api";
import { ProductSellerTypeFilterOption } from "../../types/domain";
import Image from "next/image";
import ProductFilterCheckbox from "./product-filter-checkbox";
import arrow from "../../assets/arrow.svg";
import verifiedBadge from "../../assets/seller-verified.svg";
import selectedBadge from "../../assets/seller-selected.svg";
import iranmobixLogo from "@/features/header/assets/logo.svg";
const sellerPresentation = {
verified: { label: "رسمی (تأیید شده)", icon: verifiedBadge },
trusted: { label: "منتخب", icon: selectedBadge },
iranmobix: { label: "ایران موبیکس", icon: iranmobixLogo },
};
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
                <ProductFilterCheckbox
                  checked={isSelected}
                  onChange={() => handleChange(sellerType.value)}
                />

                <span className="text-desktop-body-s text-neutral-900">{sellerPresentation[sellerType.value].label}</span>
<Image src={sellerPresentation[sellerType.value].icon} alt="" width={20} height={20} className="h-5 w-5 shrink-0 object-contain" aria-hidden="true" />
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
