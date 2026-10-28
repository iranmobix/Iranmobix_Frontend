"use client";

import Image from "next/image";
import { useId } from "react";

import down from "../../assets/down.svg";
import type { ProductDetail } from "../../types/domain/product-detail.types";

type ProductColorProps = {
  product: ProductDetail;
  value: string;
  onChange: (value: string) => void;
};

const ProductColor = ({ product, value, onChange }: ProductColorProps) => {
  const selectId = useId();
  const colors = product.colors;

  const selectedColor =
    colors.find((color) => String(color.id) === value) ?? colors[0] ?? null;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={selectId} className="text-xs leading-5 text-neutral-900">
        رنگ
      </label>

      <div className="relative">
        <select
          id={selectId}
          value={selectedColor ? String(selectedColor.id) : ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={colors.length === 0}
          className="h-10 w-full appearance-none rounded-md border border-[#dedbd5] bg-white pl-10 pr-10 text-xs text-neutral-600 outline-none focus-visible:ring-2 focus-visible:ring-[#5945b0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {colors.length === 0 ? (
            <option value="">—</option>
          ) : (
            colors.map((color) => (
              <option key={color.id} value={String(color.id)}>
                {color.name}
              </option>
            ))
          )}
        </select>

        {selectedColor && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-[#d9d3ca]"
            style={{ backgroundColor: selectedColor.value }}
          />
        )}

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

export default ProductColor;
