"use client";

type ProductInventoryFilterProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

const ProductInventoryFilter = ({
  value,
  onChange,
}: ProductInventoryFilterProps) => {
  return (
    <div className="flex min-h-12 items-center justify-between border-b border-gray-200">
      <span className="text-label-md text-neutral-900">
        موجود در انبار ایران موبیکس
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            value ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

export default ProductInventoryFilter;
