"use client";
import { useId, useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { ProductDetail } from "../../types/domain/product-detail.types";

type ProductSpecificationsProps = {
  product: ProductDetail;
};

const ProductSpecifications = ({ product }: ProductSpecificationsProps) => {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const specifications = Object.entries(product.translatedSpecifications);

  return (
    <section className="flex h-auto flex-col gap-3 rounded-md bg-white px-3 py-4 lg:h-screen lg:gap-4 lg:px-4 lg:py-10">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-medium text-neutral-1000 lg:text-body-lg-medium">
          مشخصات محصول
        </h2>
        {specifications.length > 4 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={id}
            className="flex items-center gap-0.5 rounded text-[10px] text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-300 lg:hidden"
          >
            {expanded ? "مشاهده کمتر" : "مشاهده بیشتر"}
            <ChevronLeft size={12} />
          </button>
        )}
      </div>

      <div
        id={id}
        className="flex flex-1 flex-col gap-0 lg:gap-6 lg:overflow-y-auto"
      >
        {specifications.length === 0 && (
          <p className="text-sm text-neutral-500">—</p>
        )}
        {specifications.map(([key, value], index) => (
          <div
            key={key}
            className={`${!expanded && index >= 4 ? "hidden lg:grid" : "grid"} grid-cols-[30%_10%_60%] items-start border-b border-neutral-200 last:border-b-0 lg:border-b-0`}
          >
            {/* Key */}
            <span className="py-3 text-right text-[11px] text-neutral-600 lg:py-4 lg:text-body-md">
              {key}
            </span>

            {/* Gap */}
            <div />

            {/* Value */}
            <span className="min-w-0 break-words py-3 text-center text-[11px] text-neutral-900 lg:border-b lg:border-neutral-200 lg:py-4 lg:text-right lg:text-body-md">
              {value?.trim() || "—"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductSpecifications;
