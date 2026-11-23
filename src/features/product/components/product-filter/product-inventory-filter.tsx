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
        aria-label="موجود در انبار ایران موبیکس"
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300 motion-reduce:transition-none ${
          value ? "bg-primary-500" : "bg-neutral-500"
        }`}
      >
        <span
          className={`absolute top-[3px] left-[3px] size-[18px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-200 motion-reduce:transition-none ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default ProductInventoryFilter;
