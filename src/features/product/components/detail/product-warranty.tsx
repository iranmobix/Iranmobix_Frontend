"use client";

import { useId } from "react";
import Image from "next/image";

import down from "../../assets/down.svg";
import type { ProductDetail } from "../../types/domain/product-detail.types";

type ProductWarrantyProps = {
  product: ProductDetail;
  value: string;
  onChange: (value: string) => void;
};

const ProductWarranty = ({
  product,
  value,
  onChange,
}: ProductWarrantyProps) => {
  const selectId = useId();
  const guarantees = product.guarantees;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-xs leading-5 text-neutral-900">
        گارانتی
      </label>

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={guarantees.length === 0}
          className="h-10 w-full appearance-none rounded-md border border-[#dedbd5] bg-white pl-10 pr-3 text-xs text-neutral-600 outline-none focus-visible:ring-2 focus-visible:ring-[#5945b0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" disabled>
            {guarantees.length > 0 ? "نوع گارانتی را انتخاب کنید..." : "—"}
          </option>

          {guarantees.map((guarantee) => (
            <option key={guarantee.id} value={guarantee.id}>
              {guarantee.name}
            </option>
          ))}
        </select>

        <Image
          src={down}
          alt=""
          width={16}
          height={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  );
};

export default ProductWarranty;
