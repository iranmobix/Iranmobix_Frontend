"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import type { ProductBrandFilterOption } from "../../types/domain";
import arrow from "../../assets/arrow.svg";
import { toggleFilterValue } from "../../utils";

type ProductBrandFilterProps = {
  brands: ProductBrandFilterOption[];
  value: number[];
  onChange: (brands: number[]) => void;
  isOpen: boolean;
  onToggle: () => void;
};

const normalizeSearchText = (text: string) =>
  text
    .trim()
    .toLocaleLowerCase("fa-IR")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ");

const ProductBrandFilter = ({
  brands,
  value,
  onChange,
  isOpen,
  onToggle,
}: ProductBrandFilterProps) => {
  const [search, setSearch] = useState("");

  const filteredBrands = useMemo(() => {
    const normalizedQuery = normalizeSearchText(search);

    if (!normalizedQuery) return brands;

    return brands.filter((brand) =>
      normalizeSearchText(brand.name).includes(normalizedQuery),
    );
  }, [brands, search]);

  const handleChange = (brandId: number) => {
    onChange(toggleFilterValue(value, brandId));
  };

  return (
    <div dir="rtl" className="border-b border-gray-200">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="باز کردن برند"
        onClick={onToggle}
        className="flex min-h-12 w-full items-center justify-between"
      >
        <span className="text-label-md text-neutral-900">برند</span>

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
          <div className="relative mb-2">
            <Search
              aria-hidden="true"
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجوی برندها"
              aria-label="جستجوی برندها"
              className="h-10 w-full rounded-lg border border-gray-200 pl-3 pr-9 text-sm outline-none focus:border-gray-400"
            />
          </div>

          <div aria-live="polite">
            {filteredBrands.map((brand) => {
              const isSelected = value.includes(brand.id);

              return (
                <label
                  key={brand.id}
                  className="flex cursor-pointer items-center gap-2 py-1.5"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleChange(brand.id)}
                  />

                  <span className="text-sm">{brand.name}</span>
                </label>
              );
            })}

            {filteredBrands.length === 0 && (
              <p className="py-2 text-sm text-gray-500">برندی پیدا نشد.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductBrandFilter;
