"use client";

import type {
  ProductGuaranteeType,
  ProductGuaranteeFilterOption,
} from "../../types/domain";

type ProductGuaranteeFilterProps = {
  guarantees: ProductGuaranteeFilterOption[];
  value: ProductGuaranteeType[];
  onChange: (guarantees: ProductGuaranteeType[]) => void;
};

const ProductGuaranteeFilter = ({
  guarantees,
  value,
  onChange,
}: ProductGuaranteeFilterProps) => {
  const guarantee = guarantees[0];

  if (!guarantee) {
    return null;
  }

  const isSelected = value.includes(guarantee.value);

  const handleChange = () => {
    if (isSelected) {
      onChange([]);
      return;
    }

    onChange([guarantee.value]);
  };

  return (
    <div className="flex min-h-12 items-center justify-between border-b border-gray-200">
      <span className="text-label-md text-neutral-900">گارانتی</span>

      <button
        type="button"
        role="switch"
        aria-checked={isSelected}
        onClick={handleChange}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          isSelected ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            isSelected ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

export default ProductGuaranteeFilter;
